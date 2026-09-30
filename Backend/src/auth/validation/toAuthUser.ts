import type { User } from "../../../../sharedFiles/auth/authTypes";
import type { UserRecord } from "../../models/user";
import { personalNumberSchema } from "./authSchemas";

export function toAuthUser(user: UserRecord): User {
	return {
		personalNumber: personalNumberSchema.parse(user.personalNumber),
		firstName: user.firstName,
		lastName: user.lastName,
		mador: user.mador,
		meshek_description: user.meshek_description ?? undefined,
		approvalStatus: user.approvalStatus,
		signIn_date: user.signIn_date.toISOString(),
	};
}
