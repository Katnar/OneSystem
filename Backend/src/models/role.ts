import { Schema, model, type InferSchemaType } from "mongoose";
import { COLLECTION_NAMES } from "../../collectionsConsts";

export const RoleSchema = new Schema(
	{
		key: { type: String, required: true, unique: true, trim: true },
		name: { type: String, required: true, trim: true },
	},
	{ collection: COLLECTION_NAMES.ROLES_COLLECTION_NAME }
);

export type RoleRecord = InferSchemaType<typeof RoleSchema>;
export const rolesModel = model("Role", RoleSchema);
