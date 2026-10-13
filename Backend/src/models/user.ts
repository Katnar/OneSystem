import { Schema, model } from "mongoose";
import type { z } from "zod";
import { userSchema } from "@onesystem/shared/auth/authSchemas";
import { UserApprovalStatus } from "@onesystem/shared/auth/authTypes";
import { COLLECTION_NAMES } from "../../collectionsConsts";

export type UserRecord = z.infer<typeof userSchema>;

export const UserSchema = new Schema<UserRecord>(
	{
		personalNumber: {
			type: String,
			required: true,
			unique: true,
		},
		firstName: { type: String, required: true },
		lastName: { type: String, required: true },
		mador: { type: String, required: true },
		meshekDescription: { type: String, default: null },
		approvalStatus: { type: Boolean, default: UserApprovalStatus.PENDING },
		signUpDate: { type: Date, default: Date.now },
		role: { type: String, required: true },
	},
	{
		_id: false,
		collection: COLLECTION_NAMES.USERS_COLLECTION_NAME,
		timestamps: { createdAt: false, updatedAt: "last_update" } as const,
	}
);

UserSchema.pre("validate", function () {
	this.set(userSchema.parse(this.toObject()));
});

export const usersModel = model<UserRecord>("User", UserSchema);

export default usersModel;
