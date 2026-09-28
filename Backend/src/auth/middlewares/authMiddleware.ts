import express from "express";
import jwt from "jsonwebtoken";

import { AuthResponseStatus, type User, UserApprovalStatus } from "../../../../sharedFiles/auth/authTypes";
import type { SsoSigninResultType } from "../../../../sharedFiles/auth/authResponses";
import { usersModel } from "../../models/user";

import { appJwtClaimsSchema } from "../validation/authSchemas";
import { toAuthUser } from "../validation/toAuthUser";

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
		return res.status(401).json({ ok: false, error: { status: AuthResponseStatus.BadToken } });
	}

	const [, token] = authHeader.split(" ");
	if (!token) {
		return res.status(401).json({ ok: false, error: { status: AuthResponseStatus.BadToken } });
	}

	const secret = process.env.ONESYSTEM_SECRET_KEY_JWT;
	if (!secret) {
		return res.status(500).json({ ok: false, error: { status: AuthResponseStatus.ServerError } });
	}

	let decoded: ReturnType<typeof appJwtClaimsSchema.parse>;
	try {
		decoded = appJwtClaimsSchema.parse(jwt.verify(token, secret));
	} catch (err) {
		const status =
			err instanceof jwt.TokenExpiredError ? AuthResponseStatus.ExpiredToken : AuthResponseStatus.BadToken;
		return res.status(401).json({ ok: false, error: { status } });
	}

	const user = await usersModel.findById(decoded.id);

	if (!user || user.approvalStatus !== UserApprovalStatus.APPROVED) {
		return res.status(401).json({ ok: false, error: { status: AuthResponseStatus.NotApproved } });
	}

	res.locals.user = toAuthUser(user.toObject());
	return next();
};
