import express from "express";
import jwt from "jsonwebtoken";

import { AuthResponseStatus, type User, RoleKey, UserApprovalStatus } from "../../../../sharedFiles/auth/authTypes";
import { usersModel } from "../../models/user";
import { rolesModel } from "../../models/role";

import { appJwtClaimsSchema } from "../validation/authSchemas";
import { toAuthUser } from "../validation/toAuthUser";

export interface Locals {
	user: User;
}

export const authenticate = async (req: express.Request, res: express.Response<unknown, Locals>, next: express.NextFunction) => {
	const authHeader = req.headers.authorization;
	if (!authHeader?.startsWith("Bearer ")) {
		return res.status(401).json({ status: AuthResponseStatus.BadToken });
	}

	const [, token] = authHeader.split(" ");
	if (!token) {
		return res.status(401).json({ status: AuthResponseStatus.BadToken });
	}

	const secret = process.env.ONESYSTEM_SECRET_KEY_JWT;
	if (!secret) {
		return res.status(500).json({ status: AuthResponseStatus.ServerError });
	}

	try {
		const decoded = appJwtClaimsSchema.parse(jwt.verify(token, secret));

		const user = await usersModel.findById(decoded.id);

		if (!user || user.approvalStatus !== UserApprovalStatus.APPROVED) {
			return res.status(401).json({ status: AuthResponseStatus.NotApproved });
		}

		res.locals.user = toAuthUser(user.toObject());
		return next();
	} catch (err) {
		const status =
			err instanceof jwt.TokenExpiredError ? AuthResponseStatus.ExpiredToken : AuthResponseStatus.BadToken;
		return res.status(401).json({ status });
	}
};

export const requireAdmin = async (_req: express.Request, res: express.Response<unknown, Locals>, next: express.NextFunction) => {
	const user = res.locals.user;

	if (!user || !await rolesModel.exists({ _id: user.role, key: RoleKey.ADMIN })) {
		return res.status(403).json({ success: false, error: "אין לך הרשאה לבצע פעולה זו" });
	}

	return next();
};
