import { Schema, model, type InferSchemaType } from "mongoose";

export const UserSchema = new Schema(
	{
		personalNumber: {
			type: String,
			match: /^(?:[A-Za-z]\d{7}|\d{7})$/,
			required: true,
			unique: true,
		},
		firstName: { type: String, minlength: 2, maxLength: 32, required: true },
		lastName: { type: String, minlength: 2, maxLength: 32, required: true },
		mador: { type: String, required: true },
		meshek_description: { type: String },
		approvalStatus: { type: Boolean, default: false },
		signIn_date: { type: Date, default: Date.now },
	},
	{
		collection: "users",
		timestamps: { createdAt: false, updatedAt: "last_update" } as const,
	}
);

export type UserRecord = InferSchemaType<typeof UserSchema>;

export const usersModel = model("User", UserSchema);

export default usersModel;
