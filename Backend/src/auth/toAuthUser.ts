import type { PersonalNumber, User } from "../../../sharedFiles/auth/authTypes";
import type { AsSent, DateString, NonEmptyString } from "../../../sharedFiles/global";
import type { Mador } from "../../../sharedFiles/mador";
import type { UserRecord } from "../models/user";

type UserRecordWithLegacyFields = UserRecord & {
	meshek_description?: string | null;
	signIn_date?: Date | string | null;
};

function coerceStoredDate(value: Date | string | null | undefined): Date {
	if (value instanceof Date) {
		return value;
	}

	if (typeof value === "string") {
		const parsed = new Date(value);
		if (!Number.isNaN(parsed.getTime())) {
			return parsed;
		}
	}

	return new Date(0);
}

export function toAuthUser(user: UserRecordWithLegacyFields): User {
	const meshekDescription = user.meshekDescription ?? user.meshek_description ?? null;

	return {
		personalNumber: user.personalNumber as PersonalNumber,
		firstName: user.firstName as NonEmptyString,
		lastName: user.lastName as NonEmptyString,
		mador: user.mador as Mador,
		meshekDescription: meshekDescription ? (meshekDescription as NonEmptyString) : null,
		approvalStatus: user.approvalStatus,
		signUpDate: coerceStoredDate(user.signUpDate ?? user.signIn_date),
	};
}

export function toSentAuthUser(user: User): AsSent<User> {
	return {
		...user,
		signUpDate: user.signUpDate.toISOString() as DateString,
	};
}
