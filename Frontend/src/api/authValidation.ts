import { z } from "zod";
import { PERSONAL_NUMBER_PATTERN } from "../../../sharedFiles/auth/authConsts";
import { AuthResponseStatus, type PersonalNumber } from "../../../sharedFiles/auth/authTypes";

export const personalNumberSchema = z
	.string()
	.regex(PERSONAL_NUMBER_PATTERN)
	.transform(value => value as PersonalNumber);

export const userSchema = z.object({
	personalNumber: personalNumberSchema,
	firstName: z.string(),
	lastName: z.string(),
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
