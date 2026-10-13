import { Schema, model } from "mongoose";
import { COLLECTION_NAMES } from "../../collectionsConsts";
import {
	Role,
	type FirstName,
	type LastName,
	type UserApprovalStatus,
	type PersonalNumber,
	type Role as RoleType,
} from "@onesystem/shared/auth/authTypes";
import type { NonEmptyString } from "@onesystem/shared/general/Strings/nonEmptyString";
import { Mador, type Mador as MadorType } from "@onesystem/shared/mador/mador";

export type UserRecord = {
	personalNumber: PersonalNumber;
	firstName: FirstName;
	lastName: LastName;
	mador: MadorType;
	meshekDescription: NonEmptyString | null;
	approvalStatus: UserApprovalStatus;
	signUpDate: Date;
	role: RoleType;
};

export const UserSchema = new Schema<UserRecord>(
	{
		personalNumber: {
			type: String,
			match: /^(?:[A-Za-z]\d{7}|\d{7})$/,
			required: true,
			unique: true,
		},
		firstName: { type: String, minlength: 2, maxLength: 32, required: true },
		lastName: { type: String, minlength: 2, maxLength: 32, required: true },
		mador: { type: String, enum: Object.values(Mador), required: true },
		meshekDescription: { type: String, default: null },
		approvalStatus: { type: Boolean, default: false },
		signUpDate: { type: Date, default: Date.now },
		role: { type: String, enum: Object.values(Role), required: true },
	},
	{
		_id: false,
		collection: COLLECTION_NAMES.USERS_COLLECTION_NAME,
		timestamps: { createdAt: false, updatedAt: "last_update" } as const,
	}
);

export const usersModel = model<UserRecord>("User", UserSchema);

export default usersModel;
