import type { User } from "@onesystem/shared/auth/authTypes";
import type { AuthUserResponse } from "@onesystem/shared/auth/authResponses";
import type { DateString } from "@onesystem/shared/general/Date/dateSchema";

export function toAuthUserResponse(user: User): AuthUserResponse {
	return {
		...user,
		signUpDate: user.signUpDate.toISOString() as DateString,
	};
}
