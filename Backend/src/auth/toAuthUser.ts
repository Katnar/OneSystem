import type { User } from "../../../sharedFiles/auth/authTypes";
import type { AsSent, DateString } from "../../../sharedFiles/global";
import type { UserRecord } from "../models/user";

export function toAuthUser(user: UserRecord): User {
	return {
		personalNumber: user.personalNumber,
		firstName: user.firstName,
		lastName: user.lastName,
		mador: user.mador,
		meshekDescription: user.meshekDescription,
		approvalStatus: user.approvalStatus,
		signUpDate: user.signUpDate,
	};
}

export function toSentAuthUser(user: User): AsSent<User> {
	return {
		...user,
		signUpDate: user.signUpDate.toISOString() as DateString,
	};
}
