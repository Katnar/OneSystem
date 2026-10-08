import { Schema, model } from "mongoose";
import { COLLECTION_NAMES } from "../../collectionsConsts";
import { type UserApprovalStatus, type PersonalNumber } from "../../../sharedFiles/auth/authTypes";
import type { NonEmptyString } from "../../../sharedFiles/global";
import { Mador, type Mador as MadorType } from "../../../sharedFiles/mador";

export type UserRecord = {
	personalNumber: PersonalNumber;
	firstName: NonEmptyString;
	lastName: NonEmptyString;
	mador: MadorType;
	meshekDescription: NonEmptyString | null;
	approvalStatus: UserApprovalStatus;
	signUpDate: Date;
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
	},
	{
		_id: false,
		collection: COLLECTION_NAMES.USERS_COLLECTION_NAME,
		timestamps: { createdAt: false, updatedAt: "last_update" } as const,
	}
);

export const usersModel = model<UserRecord>("User", UserSchema);

export default usersModel;
