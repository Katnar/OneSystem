import type { Request, Response } from "express";
import { Role, UserApprovalStatus, type PersonalNumber, type User } from "@onesystem/shared/auth/authTypes";
import { personalNumberSchema, userSchema } from "@onesystem/shared/auth/authSchemas";
import {
	editUserPayloadSchema,
	type ApproveUserResponse,
	type DeleteUserResponse,
	type EditUserResponse,
	type GetUsersResponse,
} from "@onesystem/shared/users";
import type { Locals } from "../auth/authMiddleware";
import { toAuthUserResponse } from "../auth/toAuthUser";
import { usersModel, type UserRecord } from "./userModel";
import { canManageUser, requiresUserReapproval } from "./userPermissions";

type TargetParams = { personalNumber: PersonalNumber };

function httpError(status: number): Error & { status: number } {
	return Object.assign(new Error("Invalid users request"), { status });
}

function parsePersonalNumber(value: unknown): PersonalNumber {
	const parsed = personalNumberSchema.safeParse(value);
	if (!parsed.success) {
		throw httpError(400);
	}
	return parsed.data;
}

async function loadManagedUser(actor: User, personalNumber: PersonalNumber) {
	const target = await usersModel.findOne({ personalNumber }).lean();

	if (!target) {
		throw httpError(404);
	}
	if (!canManageUser(actor, target)) {
		throw httpError(403);
	}

	return target;
}

function buildUserSnapshotFilter(target: UserRecord) {
	return { ...target };
}

function serializeUser(user: UserRecord) {
	// Parsing strips MongoDB fields before the existing serializer runs.
	return toAuthUserResponse(userSchema.parse(user));
}

async function listUsers(actor: User, approvalStatus: boolean, res: Response<GetUsersResponse, Locals>): Promise<void> {
	const filter =
		actor.role === Role.SYSTEM_ADMIN
			? { approvalStatus }
			: {
					approvalStatus,
					mador: actor.mador,
					role: { $ne: Role.SYSTEM_ADMIN },
				};

	const users = await usersModel.find(filter).lean();

	res.json({
		ok: true,
		result: users.map(serializeUser),
	});
}

export async function getPendingUsersEndpoint(_req: Request, res: Response<GetUsersResponse, Locals>): Promise<void> {
	await listUsers(res.locals.user, UserApprovalStatus.PENDING, res);
}

export async function getApprovedUsersEndpoint(_req: Request, res: Response<GetUsersResponse, Locals>): Promise<void> {
	await listUsers(res.locals.user, UserApprovalStatus.APPROVED, res);
}

export async function editUserEndpoint(
	req: Request<TargetParams, EditUserResponse, unknown>,
	res: Response<EditUserResponse, Locals>
): Promise<void> {
	const personalNumber = parsePersonalNumber(req.params.personalNumber);
	const parsedBody = editUserPayloadSchema.safeParse(req.body);

	if (!parsedBody.success) {
		throw httpError(400);
	}

	const actor = res.locals.user;
	const target = await loadManagedUser(actor, personalNumber);
	const body = parsedBody.data;

	const approvalStatus = requiresUserReapproval(actor, target, body)
		? UserApprovalStatus.PENDING
		: target.approvalStatus;

	const candidate = userSchema.safeParse({
		...target,
		...body,
		approvalStatus,
	});

	if (!candidate.success) {
		throw httpError(400);
	}

	const updated = await usersModel
		.findOneAndUpdate(
			buildUserSnapshotFilter(target),
			{
				$set: {
					role: body.role,
					mador: body.mador,
					meshekDescription: body.meshekDescription,
					approvalStatus,
				},
			},
			{ new: true, runValidators: true }
		)
		.lean();

	if (!updated) {
		throw httpError(409);
	}

	res.json({
		ok: true,
		result: serializeUser(updated),
	});
}

export async function approveUserEndpoint(
	req: Request<TargetParams, ApproveUserResponse, unknown>,
	res: Response<ApproveUserResponse, Locals>
): Promise<void> {
	const personalNumber = parsePersonalNumber(req.params.personalNumber);
	const target = await loadManagedUser(res.locals.user, personalNumber);

	if (target.approvalStatus !== UserApprovalStatus.PENDING) {
		throw httpError(409);
	}

	const candidate = userSchema.safeParse({
		...target,
		approvalStatus: UserApprovalStatus.APPROVED,
	});

	if (!candidate.success) {
		throw httpError(400);
	}

	const updated = await usersModel
		.findOneAndUpdate(
			buildUserSnapshotFilter(target),
			{ $set: { approvalStatus: UserApprovalStatus.APPROVED } },
			{ new: true, runValidators: true }
		)
		.lean();

	if (!updated) {
		throw httpError(409);
	}

	res.json({
		ok: true,
		result: serializeUser(updated),
	});
}

export async function deleteUserEndpoint(
	req: Request<TargetParams, DeleteUserResponse, unknown>,
	res: Response<DeleteUserResponse, Locals>
): Promise<void> {
	const personalNumber = parsePersonalNumber(req.params.personalNumber);
	const target = await loadManagedUser(res.locals.user, personalNumber);

	const deleted = await usersModel.findOneAndDelete(buildUserSnapshotFilter(target)).lean();

	if (!deleted) {
		throw httpError(409);
	}

	res.json({
		ok: true,
		result: { personalNumber: deleted.personalNumber },
	});
}
