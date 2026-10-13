import type { User } from "@onesystem/shared/auth/authTypes";
import type { AuthUserResponse } from "@onesystem/shared/auth/authResponses";
import type { DateString } from "@onesystem/shared/general/Date/dateSchema";
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
		role: user.role,
	};
}

export function toAuthUserResponse(user: User): AuthUserResponse {
	return {
		...user,
		signUpDate: user.signUpDate.toISOString() as DateString,
	};
}
