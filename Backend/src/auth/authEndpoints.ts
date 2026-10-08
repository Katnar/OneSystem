import { AuthStatus, type SignUpResultType, type SsoSigninResultType } from "../../../sharedFiles/auth/authResponses";
import { usersModel } from "../models/user";
import jwt from "jsonwebtoken";
import type { Request, Response } from "express";
import { JWT_LIFETIME_HOURS } from "../../../sharedFiles/auth/authConsts";
import { type JWTToken, type SSOToken, UserApprovalStatus } from "../../../sharedFiles/auth/authTypes";
import type { NonEmptyString } from "../../../sharedFiles/global";
import { z } from "zod";

import { nonEmptyStringSchema, signUpPayloadSchema, ssoClaimsSchema } from "./authSchemas";
import { toAuthUser, toSentAuthUser } from "./toAuthUser";
import { env } from "../env";

const SIGN_UP_SERVER_ERROR = "שגיאת שרת. נסה שוב מאוחר יותר.";
const SIGN_UP_SUCCESS = "משתמש נוצר בהצלחה";

type SsoTokenVerificationResult = { ok: true; payload: unknown } | { ok: false; status: typeof AuthStatus.BadToken };

function verifySsoToken(token: SSOToken): SsoTokenVerificationResult {
	try {
		return { ok: true, payload: jwt.verify(token, env.SSO_DECRYPT_KEY_JWT) };
	} catch {
		return { ok: false, status: AuthStatus.BadToken };
	}
}

function isDuplicateKeyError(error: unknown): boolean {
	return z.object({ code: z.literal(11000) }).safeParse(error).success;
}

function toOptionalNonEmptyString(value: string | undefined): NonEmptyString | "" {
	return value && value.trim() !== "" ? nonEmptyStringSchema.parse(value) : "";
}

type EmptyRequestParts = Record<string, never>;

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
			res.status(401).json({ ok: false, error: { status: verifiedSsoToken.status } });
			return;
		}

		const claims = ssoClaimsSchema.safeParse(verifiedSsoToken.payload);

		if (!claims.success) {
			res.status(401).json({ ok: false, error: { status: AuthStatus.BadToken } });
			return;
		}

		const { fname, lname, pn } = claims.data;
		const lastName = toOptionalNonEmptyString(fname);
		const firstName = toOptionalNonEmptyString(lname);

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

		const claims = ssoClaimsSchema.safeParse(verifiedSsoToken.payload);
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
