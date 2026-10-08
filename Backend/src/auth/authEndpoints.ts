import { AuthStatus, type SignUpResultType, type SsoSigninResultType } from "../../../sharedFiles/auth/authResponses";
import { usersModel } from "../models/user";
import jwt from "jsonwebtoken";
import type { Request, Response } from "express";
import { JWT_LIFETIME_HOURS } from "../../../sharedFiles/auth/authConsts";
import { type JWTToken, type SSOToken, UserApprovalStatus } from "../../../sharedFiles/auth/authTypes";
import type { NonEmptyString, Result } from "../../../sharedFiles/global";
import { z } from "zod";

import { nonEmptyStringSchema, signUpPayloadSchema, ssoClaimsSchema, ssoDataSchema } from "./authSchemas";
import type { SSODataType } from "./authSchemas";
import { toAuthUser, toSentAuthUser } from "./toAuthUser";
import { env } from "../env";

const SSO_AUTHENTICATION_ERROR = "שגיאה בהזדהות של החוגר";
const SIGN_UP_SERVER_ERROR = "שגיאת שרת. נסה שוב מאוחר יותר.";
const SIGN_UP_SUCCESS = "משתמש נוצר בהצלחה";

type SsoTokenVerificationResult = Result<SSODataType, typeof SSO_AUTHENTICATION_ERROR>;

function verifySsoToken(token: SSOToken): SsoTokenVerificationResult {
	try {
		const parsedPayload = ssoDataSchema.safeParse(jwt.verify(token, env.SSO_DECRYPT_KEY_JWT));
		if (!parsedPayload.success) {
			return { ok: false, error: SSO_AUTHENTICATION_ERROR };
		}

		return { ok: true, result: parsedPayload.data };
	} catch {
		return { ok: false, error: SSO_AUTHENTICATION_ERROR };
	}
}

function isDuplicateKeyError(error: unknown): boolean {
	return z.object({ code: z.literal(11000) }).safeParse(error).success;
}

function toOptionalNonEmptyString(value: string | undefined): NonEmptyString | "" {
	return value && value.trim() !== "" ? nonEmptyStringSchema.parse(value) : "";
}

// Express uses `{}` for route slots that are intentionally empty.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type EmptyRequestParts = {};

export const ssoSigninEndpoint = async (
	req: Request<EmptyRequestParts, SsoSigninResultType, unknown, EmptyRequestParts>,
	res: Response<SsoSigninResultType>
): Promise<void> => {
	try {
		const authHeader = req.headers.authorization;

		if (!authHeader?.startsWith("Bearer ")) {
			res.status(401).json({ ok: false, error: { status: AuthStatus.BadToken } });
			return;
		}

		const ssoToken = authHeader.split(" ")[1] as SSOToken | undefined;
		if (!ssoToken) {
			res.status(401).json({ ok: false, error: { status: AuthStatus.BadToken } });
			return;
		}

		const verifiedSsoToken = verifySsoToken(ssoToken);
		if (!verifiedSsoToken.ok) {
			res.status(401).json({ ok: false, error: { status: AuthStatus.BadToken } });
			return;
		}

		const claims = ssoClaimsSchema.safeParse(verifiedSsoToken.result);

		if (!claims.success) {
			res.status(401).json({ ok: false, error: { status: AuthStatus.BadToken } });
			return;
		}

		const { fname, lname, pn } = claims.data;
		const firstName = toOptionalNonEmptyString(fname);
		const lastName = toOptionalNonEmptyString(lname);

		const user = await usersModel.findOne({ personalNumber: pn }).lean();

		if (!user) {
			res.status(404).json({
				ok: false,
				error: { status: AuthStatus.NotFound, firstName, lastName, personalNumber: pn },
			});
			return;
		}

		if (user.approvalStatus !== UserApprovalStatus.APPROVED) {
			res.status(401).json({ ok: false, error: { status: AuthStatus.NotApproved } });
			return;
		}

		const authUser = toAuthUser(user);

		const tokenPayload = {
			personalNumber: authUser.personalNumber,
		};

		const appJwt = jwt.sign(tokenPayload, env.ONESYSTEM_SECRET_KEY_JWT, {
			expiresIn: `${JWT_LIFETIME_HOURS}h`,
		}) as JWTToken;

		res.json({
			ok: true,
			result: { jwt: appJwt, user: toSentAuthUser(authUser) },
		});
	} catch (error) {
		console.error("Failed to complete SSO sign-in:", error);
		res.status(500).json({ ok: false, error: { status: AuthStatus.ServerError } });
	}
};

export async function signUpEndpoint(
	req: Request<EmptyRequestParts, SignUpResultType, unknown, EmptyRequestParts>,
	res: Response<SignUpResultType>
) {
	try {
		const parsedPayload = signUpPayloadSchema.safeParse(req.body);
		if (!parsedPayload.success) {
			res.status(400).json({
				ok: false,
				error: "קלט לא תקין",
			});
			return;
		}

		const { ssoToken, user } = parsedPayload.data;

		const verifiedSsoToken = verifySsoToken(ssoToken);
		if (!verifiedSsoToken.ok) {
			res.status(400).json({
				ok: false,
				error: "קלט לא תקין",
			});
			return;
		}

		const claims = ssoClaimsSchema.safeParse(verifiedSsoToken.result);
		if (!claims.success) {
			res.status(400).json({
				ok: false,
				error: "מספר אישי לא תקין",
			});
			return;
		}

		const { pn } = claims.data;
		const existing = await usersModel.findOne({ personalNumber: pn });
		if (existing) {
			res.status(400).json({
				ok: false,
				error:
					existing.approvalStatus === UserApprovalStatus.APPROVED ? "משתמש כבר קיים" : "משתמש ממתין לאישור",
			});
			return;
		}

		const createdUser = new usersModel({
			personalNumber: pn,
			firstName: user.firstName,
			lastName: user.lastName,
			mador: user.mador,
			meshekDescription: user.meshekDescription,
		});

		try {
			await createdUser.save();
		} catch (error) {
			if (!isDuplicateKeyError(error)) {
				throw error;
			}

			const duplicateUser = await usersModel.findOne({ personalNumber: pn });
			res.status(400).json({
				ok: false,
				error:
					duplicateUser?.approvalStatus === UserApprovalStatus.PENDING
						? "משתמש ממתין לאישור"
						: "משתמש כבר קיים",
			});
			return;
		}

		res.json({ ok: true, result: SIGN_UP_SUCCESS });
	} catch (error) {
		console.error("Failed to complete signup:", error);
		res.status(500).json({ ok: false, error: SIGN_UP_SERVER_ERROR });
	}
}
