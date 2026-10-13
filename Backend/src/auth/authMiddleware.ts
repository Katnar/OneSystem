import express from "express";
import jwt from "jsonwebtoken";

import { SSO_SIGNIN_ERROR_MESSAGES, type SsoSigninResultType } from "@onesystem/shared/auth/authResponses";
import { type User, UserApprovalStatus } from "@onesystem/shared/auth/authTypes";
import { authenticatedUserJwtPayloadSchema, type AuthenticatedUserJwtPayload } from "./authSchemas";
import { usersModel } from "../models/user";
import { env } from "../env";

const SSO_BAD_TOKEN_MESSAGE = SSO_SIGNIN_ERROR_MESSAGES[0];
const SSO_EXPIRED_TOKEN_MESSAGE = SSO_SIGNIN_ERROR_MESSAGES[1];
const SSO_NOT_APPROVED_MESSAGE = SSO_SIGNIN_ERROR_MESSAGES[2];
const SSO_SERVER_ERROR_MESSAGE = SSO_SIGNIN_ERROR_MESSAGES[3];

export type Locals = {
	user: User;
};

export const authenticate = async (
	req: express.Request,
	res: express.Response<Extract<SsoSigninResultType, { ok: false }>, Locals>,
	next: express.NextFunction
) => {
	const authHeader = req.headers.authorization;
	if (!authHeader?.startsWith("Bearer ")) {
		return res.status(401).json({ ok: false, error: SSO_BAD_TOKEN_MESSAGE });
	}

	const [, token] = authHeader.split(" ");
	if (!token) {
		return res.status(401).json({ ok: false, error: SSO_BAD_TOKEN_MESSAGE });
	}

	let decoded: AuthenticatedUserJwtPayload;
	try {
		const parsedPayload = authenticatedUserJwtPayloadSchema.safeParse(
			jwt.verify(token, env.ONESYSTEM_SECRET_KEY_JWT)
		);
		if (!parsedPayload.success) {
			return res.status(401).json({ ok: false, error: SSO_BAD_TOKEN_MESSAGE });
		}

		decoded = parsedPayload.data;
	} catch (err) {
		const error = err instanceof jwt.TokenExpiredError ? SSO_EXPIRED_TOKEN_MESSAGE : SSO_BAD_TOKEN_MESSAGE;
		return res.status(401).json({ ok: false, error });
	}

	let user;
	try {
		user = await usersModel.findOne({ personalNumber: decoded.personalNumber });
	} catch (error) {
		console.error("Failed to authenticate user:", error);
		return res.status(500).json({ ok: false, error: SSO_SERVER_ERROR_MESSAGE });
	}

	if (!user || user.approvalStatus !== UserApprovalStatus.APPROVED) {
		return res.status(401).json({ ok: false, error: SSO_NOT_APPROVED_MESSAGE });
	}

	res.locals.user = user.toObject();
	return next();
};
