import { Router, type ErrorRequestHandler } from "express";
import { z } from "zod";
import { hasPermission } from "@onesystem/shared/auth/permissions";
import { USERS_ERROR_MESSAGES, type UsersErrorMessages } from "@onesystem/shared/users";
import { authenticate } from "../auth/authMiddleware";
import { manageUsersPermission } from "./userPermissions";
import {
	approveUserEndpoint,
	deleteUserEndpoint,
	editUserEndpoint,
	getApprovedUsersEndpoint,
	getPendingUsersEndpoint,
} from "./usersEndpoints";

export const usersRouter = Router();

usersRouter.use(authenticate);

usersRouter.use((_req, res, next) => {
	if (!hasPermission(manageUsersPermission, res.locals.user)) {
		res.status(403).json({
			ok: false,
			error: USERS_ERROR_MESSAGES.FORBIDDEN,
		});
		return;
	}

	next();
});

usersRouter.get("/pending", getPendingUsersEndpoint);
usersRouter.get("/approved", getApprovedUsersEndpoint);
usersRouter.post("/:personalNumber/approve", approveUserEndpoint);
usersRouter.delete("/:personalNumber", deleteUserEndpoint);
usersRouter.patch("/:personalNumber", editUserEndpoint);

const errorCodes: Record<number, UsersErrorMessages> = {
	400: USERS_ERROR_MESSAGES.INVALID_INPUT,
	401: USERS_ERROR_MESSAGES.UNAUTHORIZED,
	403: USERS_ERROR_MESSAGES.FORBIDDEN,
	404: USERS_ERROR_MESSAGES.NOT_FOUND,
	409: USERS_ERROR_MESSAGES.CONFLICT,
};

const usersErrorHandler: ErrorRequestHandler = (error: unknown, _req, res, next): void => {
	if (res.headersSent) {
		next(error);
		return;
	}

	const parsed = z
		.object({
			status: z.number().int(),
		})
		.safeParse(error);

	const code = parsed.success ? errorCodes[parsed.data.status] : undefined;

	if (parsed.success && code) {
		res.status(parsed.data.status).json({
			ok: false,
			error: code,
		});
		return;
	}

	console.error("User management failed:", error instanceof Error ? error.message : "Unknown error");

	res.status(500).json({
		ok: false,
		error: USERS_ERROR_MESSAGES.SERVER_ERROR,
	});
};

usersRouter.use(usersErrorHandler);
