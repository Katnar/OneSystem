import express from "express";
import jwt from "jsonwebtoken";

import { type User, UserApprovalStatus } from "@onesystem/shared/auth/authTypes";
import { authenticatedUserJwtPayloadSchema, type AuthenticatedUserJwtPayload } from "./authSchemas";
import { usersModel } from "../models/user";
import { env } from "../env";

export type Locals = {
	user: User;
};

function httpError(status: number): Error & { status: number } {
	return Object.assign(new Error("Invalid request"), { status });
}

export const authenticate = async (
	req: express.Request,
	res: express.Response<unknown, Locals>,
	next: express.NextFunction
) => {
	const authHeader = req.headers.authorization;
	if (!authHeader?.startsWith("Bearer ")) {
		return next(httpError(401));
	}

	const [, token] = authHeader.split(" ");
	if (!token) {
		return next(httpError(401));
	}

	let decoded: AuthenticatedUserJwtPayload;
	try {
		const parsedPayload = authenticatedUserJwtPayloadSchema.safeParse(
			jwt.verify(token, env.ONESYSTEM_SECRET_KEY_JWT)
		);
		if (!parsedPayload.success) {
			return next(httpError(401));
		}

		decoded = parsedPayload.data;
	} catch {
		return next(httpError(401));
	}

	let user;
	try {
		user = await usersModel.findOne({ personalNumber: decoded.personalNumber });
	} catch (error) {
		return next(error);
	}

	if (!user || user.approvalStatus !== UserApprovalStatus.APPROVED) {
		return next(httpError(401));
	}

	res.locals.user = user.toObject();
	return next();
};
