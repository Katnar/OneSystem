import type { User } from "@onesystem/shared-files/auth/authTypes";
import type { AsSent, DateString } from "@onesystem/shared-files/global";
import type { UserRecord } from "../models/user";
import { madorSchema, nonEmptyStringSchema, personalNumberSchema } from "./authSchemas";

type UserRecordWithLegacyFields = UserRecord & {
	meshek_description?: string | null;
	signIn_date?: Date | string | null;
	_id?: unknown;
};

function hasObjectIdTimestamp(value: unknown): value is { getTimestamp: () => Date } {
	return (
		typeof value === "object" &&
		value !== null &&
		"getTimestamp" in value &&
		typeof (value as { getTimestamp?: unknown }).getTimestamp === "function"
	);
}

function coerceStoredDate(value: Date | string | null | undefined, objectId: unknown): Date {
	if (value instanceof Date) {
		return value;
	}

	if (typeof value === "string") {
		const parsed = new Date(value);
		if (!Number.isNaN(parsed.getTime())) {
			return parsed;
		}
	}

	if (hasObjectIdTimestamp(objectId)) {
		return objectId.getTimestamp();
	}

	return new Date(0);
}

export function toAuthUser(user: UserRecordWithLegacyFields): User {
	const meshekDescription = user.meshekDescription ?? user.meshek_description ?? null;

	return {
		personalNumber: personalNumberSchema.parse(user.personalNumber),
		firstName: nonEmptyStringSchema.parse(user.firstName),
		lastName: nonEmptyStringSchema.parse(user.lastName),
		mador: madorSchema.parse(user.mador),
		meshekDescription: meshekDescription ? nonEmptyStringSchema.parse(meshekDescription) : null,
		approvalStatus: user.approvalStatus,
		signUpDate: coerceStoredDate(user.signUpDate ?? user.signIn_date, user._id),
	};
}

export function toSentAuthUser(user: User): AsSent<User> {
	return {
		...user,
		signUpDate: user.signUpDate.toISOString() as DateString,
	};
}
