import {
	AuthStatus,
	SignUpStatus,
	type SignUpResultType,
	type SsoSigninResultType,
} from "@onesystem/shared/auth/authResponses";
import { usersModel } from "../models/user";
import jwt from "jsonwebtoken";
import type { Request, Response } from "express";
import { JWT_LIFETIME_HOURS } from "@onesystem/shared/auth/authConsts";
import {
	type FirstName,
	type JWTToken,
	type LastName,
	type SSOToken,
	type User,
	UserApprovalStatus,
} from "@onesystem/shared/auth/authTypes";
import type { Result } from "@onesystem/shared/global";
import { z } from "zod";

import {
	firstNameSchema,
	lastNameSchema,
	signUpPayloadSchema,
	ssoClaimsSchema,
	ssoDataSchema,
	type SSODataType,
} from "@onesystem/shared/auth/authSchemas";
import { toAuthUserResponse } from "./toAuthUser";
import { env } from "../env";

const SSO_AUTHENTICATION_ERROR = "שגיאה בהזדהות של החוגר";

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

function toNullableFirstName(value: string | undefined): FirstName | null {
	if (!value?.trim()) {
		return null;
	}

	const parsedName = firstNameSchema.safeParse(value);
	return parsedName.success ? parsedName.data : null;
}

function toNullableLastName(value: string | undefined): LastName | null {
	if (!value?.trim()) {
		return null;
	}

	const parsedName = lastNameSchema.safeParse(value);
	return parsedName.success ? parsedName.data : null;
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
		const firstName = toNullableFirstName(fname);
		const lastName = toNullableLastName(lname);

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

		const authUser = user as User;

		const tokenPayload = {
			personalNumber: authUser.personalNumber,
		};

		const appJwt = jwt.sign(tokenPayload, env.ONESYSTEM_SECRET_KEY_JWT, {
			expiresIn: `${JWT_LIFETIME_HOURS}h`,
		}) as JWTToken;

		res.json({
			ok: true,
			result: { jwt: appJwt, user: toAuthUserResponse(authUser) },
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
				error: { status: SignUpStatus.InvalidInput },
			});
			return;
		}

		const { ssoToken, user } = parsedPayload.data;

		const verifiedSsoToken = verifySsoToken(ssoToken);
		if (!verifiedSsoToken.ok) {
			res.status(400).json({
				ok: false,
				error: { status: SignUpStatus.InvalidInput },
			});
			return;
		}

		const claims = ssoClaimsSchema.safeParse(verifiedSsoToken.result);
		if (!claims.success) {
			res.status(400).json({
				ok: false,
				error: { status: SignUpStatus.InvalidPersonalNumber },
			});
			return;
		}

		const { pn } = claims.data;
		const existing = await usersModel.findOne({ personalNumber: pn });
		if (existing) {
			res.status(400).json({
				ok: false,
				error: {
					status:
						existing.approvalStatus === UserApprovalStatus.APPROVED
							? SignUpStatus.AlreadyExists
							: SignUpStatus.PendingApproval,
				},
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
				error: {
					status:
						duplicateUser?.approvalStatus === UserApprovalStatus.PENDING
							? SignUpStatus.PendingApproval
							: SignUpStatus.AlreadyExists,
				},
			});
			return;
		}

		res.json({ ok: true, result: { status: SignUpStatus.Created } });
	} catch (error) {
		console.error("Failed to complete signup:", error);
		res.status(500).json({ ok: false, error: { status: SignUpStatus.ServerError } });
	}
}
