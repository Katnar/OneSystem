import type { User, UserResponse } from "../../../sharedFiles/auth/authTypes";
import type { DateString } from "../../../sharedFiles/global";
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

export function toAuthUserResponse(user: User): UserResponse {
	return {
		...user,
		signUpDate: user.signUpDate.toISOString() as DateString,
	};
}
