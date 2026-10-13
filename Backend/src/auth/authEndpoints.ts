import {
	SIGN_UP_ERROR_MESSAGES,
	SIGN_UP_SUCCESS_MESSAGE,
	SSO_SIGNIN_ERROR_MESSAGES,
	SSO_SIGNIN_REQUIRES_SIGN_UP_MESSAGE,
	type SignUpResultType,
	type SsoSigninResultType,
} from "@onesystem/shared/auth/authResponses";
import { usersModel } from "../models/user";
import jwt from "jsonwebtoken";
import type { Request, Response } from "express";
import { JWT_LIFETIME_HOURS } from "@onesystem/shared/auth/authConsts";
import { type JWTToken, type SSOToken, UserApprovalStatus } from "@onesystem/shared/auth/authTypes";
import type { Result } from "@onesystem/shared/global";
import { z } from "zod";

import {
	firstNameSchema,
	lastNameSchema,
	rawSsoTokenPayloadSchema,
	signUpPayloadSchema,
	type RawSsoTokenPayload,
	verifiedSsoTokenPayloadSchema,
} from "./authSchemas";
import { toAuthUserResponse } from "./toAuthUser";
import { env } from "../env";

const SSO_AUTHENTICATION_ERROR = "שגיאה בהזדהות של החוגר";
const SSO_BAD_TOKEN_MESSAGE = SSO_SIGNIN_ERROR_MESSAGES[0];
const SSO_NOT_APPROVED_MESSAGE = SSO_SIGNIN_ERROR_MESSAGES[2];
const SSO_SERVER_ERROR_MESSAGE = SSO_SIGNIN_ERROR_MESSAGES[3];
const SIGN_UP_INVALID_INPUT_MESSAGE = SIGN_UP_ERROR_MESSAGES[0];
const SIGN_UP_INVALID_PERSONAL_NUMBER_MESSAGE = SIGN_UP_ERROR_MESSAGES[1];
const SIGN_UP_ALREADY_EXISTS_MESSAGE = SIGN_UP_ERROR_MESSAGES[2];
const SIGN_UP_PENDING_APPROVAL_MESSAGE = SIGN_UP_ERROR_MESSAGES[3];
const SIGN_UP_SERVER_ERROR_MESSAGE = SIGN_UP_ERROR_MESSAGES[4];

type SsoTokenVerificationResult = Result<RawSsoTokenPayload, typeof SSO_AUTHENTICATION_ERROR>;

function verifySsoToken(token: SSOToken): SsoTokenVerificationResult {
	try {
		const parsedPayload = rawSsoTokenPayloadSchema.safeParse(jwt.verify(token, env.SSO_DECRYPT_KEY_JWT));
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
			res.status(401).json({ ok: false, error: SSO_BAD_TOKEN_MESSAGE });
			return;
		}

		const ssoToken = authHeader.split(" ")[1] as SSOToken | undefined;
		if (!ssoToken) {
			res.status(401).json({ ok: false, error: SSO_BAD_TOKEN_MESSAGE });
			return;
		}

		const verifiedSsoToken = verifySsoToken(ssoToken);
		if (!verifiedSsoToken.ok) {
			res.status(401).json({ ok: false, error: SSO_BAD_TOKEN_MESSAGE });
			return;
		}

		const verifiedPayload = verifiedSsoTokenPayloadSchema.safeParse(verifiedSsoToken.result);

		if (!verifiedPayload.success) {
			res.status(401).json({ ok: false, error: SSO_BAD_TOKEN_MESSAGE });
			return;
		}

		const { fname, lname, pn } = verifiedPayload.data;
		const firstName = firstNameSchema.safeParse(fname);
		const lastName = lastNameSchema.safeParse(lname);
		if (!firstName.success || !lastName.success) {
			res.status(401).json({ ok: false, error: SSO_BAD_TOKEN_MESSAGE });
			return;
		}

		const user = await usersModel.findOne({ personalNumber: pn }).lean();

		if (!user) {
			res.status(404).json({
				ok: false,
				error: {
					message: SSO_SIGNIN_REQUIRES_SIGN_UP_MESSAGE,
					firstName: firstName.data,
					lastName: lastName.data,
					personalNumber: pn,
				},
			});
			return;
		}

		if (user.approvalStatus !== UserApprovalStatus.APPROVED) {
			res.status(401).json({ ok: false, error: SSO_NOT_APPROVED_MESSAGE });
			return;
		}

		const tokenPayload = {
			personalNumber: user.personalNumber,
		};

		const appJwt = jwt.sign(tokenPayload, env.ONESYSTEM_SECRET_KEY_JWT, {
			expiresIn: `${JWT_LIFETIME_HOURS}h`,
		}) as JWTToken;

		res.json({
			ok: true,
			result: { jwt: appJwt, user: toAuthUserResponse(user) },
		});
	} catch (error) {
		console.error("Failed to complete SSO sign-in:", error);
		res.status(500).json({ ok: false, error: SSO_SERVER_ERROR_MESSAGE });
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
				error: SIGN_UP_INVALID_INPUT_MESSAGE,
			});
			return;
		}

		const { ssoToken, user } = parsedPayload.data;

		const verifiedSsoToken = verifySsoToken(ssoToken);
		if (!verifiedSsoToken.ok) {
			res.status(400).json({
				ok: false,
				error: SIGN_UP_INVALID_INPUT_MESSAGE,
			});
			return;
		}

		const verifiedPayload = verifiedSsoTokenPayloadSchema.safeParse(verifiedSsoToken.result);
		if (!verifiedPayload.success) {
			res.status(400).json({
				ok: false,
				error: SIGN_UP_INVALID_PERSONAL_NUMBER_MESSAGE,
			});
			return;
		}

		const { pn } = verifiedPayload.data;
		const existing = await usersModel.findOne({ personalNumber: pn });
		if (existing) {
			res.status(400).json({
				ok: false,
				error:
					existing.approvalStatus === UserApprovalStatus.APPROVED
						? SIGN_UP_ALREADY_EXISTS_MESSAGE
						: SIGN_UP_PENDING_APPROVAL_MESSAGE,
			});
			return;
		}

		const createdUser = new usersModel({
			personalNumber: pn,
			firstName: user.firstName,
			lastName: user.lastName,
			mador: user.mador,
			meshekDescription: user.meshekDescription,
			role: user.role,
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
						? SIGN_UP_PENDING_APPROVAL_MESSAGE
						: SIGN_UP_ALREADY_EXISTS_MESSAGE,
			});
			return;
		}

		const authUser = createdUser.toObject();

		res.json({
			ok: true,
			result: { message: SIGN_UP_SUCCESS_MESSAGE, user: toAuthUserResponse(authUser) },
		});
	} catch (error) {
		console.error("Failed to complete signup:", error);
		res.status(500).json({ ok: false, error: SIGN_UP_SERVER_ERROR_MESSAGE });
	}
}
