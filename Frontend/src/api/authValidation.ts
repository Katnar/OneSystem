import { z } from "zod";
import { PERSONAL_NUMBER_PATTERN, ROLE_ID_PATTERN } from "../../../sharedFiles/auth/authConsts";
import { AuthResponseStatus, type PersonalNumber, type RoleID } from "../../../sharedFiles/auth/authTypes";

export const personalNumberSchema = z.string().regex(PERSONAL_NUMBER_PATTERN)
	.transform(value => value as PersonalNumber);
export const roleIdSchema = z.string().regex(ROLE_ID_PATTERN)
	.transform(value => value.toLowerCase() as RoleID);

export const roleSchema = z.object({
	_id: roleIdSchema,
	key: z.string(),
	name: z.string(),
});

export const userSchema = z.object({
	personalNumber: personalNumberSchema,
	firstName: z.string(),
	lastName: z.string(),
	role: roleIdSchema,
	mador: z.string(),
	meshek_description: z.string().optional(),
	approvalStatus: z.boolean(),
	signIn_date: z.string(),
});

export const ssoSigninResultSchema = z.object({
	status: z.enum(AuthResponseStatus),
	jwt: z.string().optional(),
	user: userSchema.optional(),
	firstName: z.string().optional(),
	lastName: z.string().optional(),
	personalNumber: personalNumberSchema.optional(),
});

export const rolesResultSchema = z.object({ roles: z.array(roleSchema) });
