import { z } from "zod";
import type { PersonalNumber, RoleID } from "../../../../sharedFiles/auth/authTypes";
import { PERSONAL_NUMBER_PATTERN, ROLE_ID_PATTERN } from "../../../../sharedFiles/auth/authConsts";

// Apply the shared brands only after runtime validation succeeds.
export const personalNumberSchema = z.string().regex(PERSONAL_NUMBER_PATTERN)
	.transform(value => value as PersonalNumber);

export const roleIdSchema = z.string().regex(ROLE_ID_PATTERN).transform(value => value.toLowerCase() as RoleID);

export const ssoClaimsSchema = z.object({
	fname: z.string().optional(),
	lname: z.string().optional(),
	pn: personalNumberSchema,
});

export const appJwtClaimsSchema = z.object({
	id: z.string().regex(/^[a-fA-F0-9]{24}$/),
	personalNumber: personalNumberSchema,
});

export const signUpPayloadSchema = z.object({
	ssoToken: z.string().refine(value => value.trim().length > 0),
	user: z.object({
		firstName: z.string().trim().min(2).max(32),
		lastName: z.string().trim().min(2).max(32),
		role: roleIdSchema,
		mador: z.string().trim().min(1),
		meshek_description: z.string().optional(),
	}),
});
