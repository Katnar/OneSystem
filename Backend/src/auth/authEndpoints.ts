import {
	AuthStatus,
	type SignUpResultType,
	type SsoSigninResultType,
} from "@onesystem/shared-files/auth/authResponses";
import { usersModel } from "../models/user";
import jwt from "jsonwebtoken";
import type { Request, Response } from "express";
import { JWT_LIFETIME_HOURS } from "@onesystem/shared-files/auth/authConsts";
import { UserApprovalStatus } from "@onesystem/shared-files/auth/authTypes";
import type { NonEmptyString } from "@onesystem/shared-files/global";
import { z } from "zod";

import { nonEmptyStringSchema, signUpPayloadSchema, ssoClaimsSchema } from "./authSchemas";
import { toAuthUser, toSentAuthUser } from "./toAuthUser";

const SIGN_UP_SERVER_ERROR = "שגיאת שרת. נסה שוב מאוחר יותר.";

type SsoTokenVerificationResult =
	{ ok: true; payload: unknown } | { ok: false; status: typeof AuthStatus.BadToken | typeof AuthStatus.ServerError };

function verifySsoToken(token: string): SsoTokenVerificationResult {
	const ssoSecret = getRequiredEnv("SSO_DECRYPT_KEY_JWT");
	if (!ssoSecret) {
		console.error("Missing required env var SSO_DECRYPT_KEY_JWT");
		return { ok: false, status: AuthStatus.ServerError };
	}

	try {
		return { ok: true, payload: jwt.verify(token, ssoSecret) };
	} catch {
		return { ok: false, status: AuthStatus.BadToken };
	}
}

function getRequiredEnv(name: string): string | null {
	const value = process.env[name];
	return value && value.trim() !== "" ? value : null;
}

function isDuplicateKeyError(error: unknown): boolean {
	return z.object({ code: z.literal(11000) }).safeParse(error).success;
}

function toOptionalNonEmptyString(value: string | undefined): NonEmptyString | "" {
	return value && value.trim() !== "" ? nonEmptyStringSchema.parse(value) : "";
}

export const ssoSigninEndpoint = async (req: Request, res: Response<SsoSigninResultType>): Promise<void> => {
	const authHeader = req.headers.authorization;

	if (!authHeader?.startsWith("Bearer ")) {
		res.status(401).json({ ok: false, error: { status: AuthStatus.BadToken } });
		return;
	}

	const ssoToken = authHeader.split(" ")[1];
	if (ssoToken === undefined) {
		res.status(401).json({ ok: false, error: { status: AuthStatus.BadToken } });
		return;
	}

	const verifiedSsoToken = verifySsoToken(ssoToken);
	if (!verifiedSsoToken.ok) {
		const statusCode = verifiedSsoToken.status === AuthStatus.ServerError ? 500 : 401;
		res.status(statusCode).json({ ok: false, error: { status: verifiedSsoToken.status } });
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
		id: user._id.toString(),
		personalNumber: authUser.personalNumber,
	};

	const appJwtSecret = getRequiredEnv("ONESYSTEM_SECRET_KEY_JWT");
	if (!appJwtSecret) {
		console.error("Missing required env var ONESYSTEM_SECRET_KEY_JWT");
		res.status(500).json({ ok: false, error: { status: AuthStatus.ServerError } });
		return;
	}

	const appJwt = jwt.sign(tokenPayload, appJwtSecret, {
		expiresIn: `${JWT_LIFETIME_HOURS}h`,
	});

	res.json({
		ok: true,
		result: { jwt: appJwt, user: toSentAuthUser(authUser) },
	});
};

export async function signUpEndpoint(req: Request<unknown, unknown, unknown>, res: Response<SignUpResultType>) {
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
		res.status(verifiedSsoToken.status === AuthStatus.ServerError ? 500 : 400).json({
			ok: false,
			error: verifiedSsoToken.status === AuthStatus.ServerError ? SIGN_UP_SERVER_ERROR : "קלט לא תקין",
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
			error: existing.approvalStatus === UserApprovalStatus.APPROVED ? "משתמש כבר קיים" : "משתמש ממתין לאישור",
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
				duplicateUser?.approvalStatus === UserApprovalStatus.PENDING ? "משתמש ממתין לאישור" : "משתמש כבר קיים",
		});
		return;
	}

	res.json({ ok: true, result: {} });
}
