import { z } from "zod";
import type { NonEmptyString } from "@onesystem/shared-files/global";
import { Mador } from "@onesystem/shared-files/mador";
import type { PersonalNumber } from "@onesystem/shared-files/auth/authTypes";
import { PERSONAL_NUMBER_PATTERN } from "@onesystem/shared-files/auth/authConsts";

// Apply the shared brands only after runtime validation succeeds.
export const personalNumberSchema = z
	.string()
	.regex(PERSONAL_NUMBER_PATTERN)
	.transform(value => value as PersonalNumber);

export const nonEmptyStringSchema = z
	.string()
	.trim()
	.min(1)
	.transform(value => value as NonEmptyString);

const madorValues = Object.values(Mador) as [Mador, ...Mador[]];
export const madorSchema = z.enum(madorValues);

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
		firstName: z
			.string()
			.trim()
			.min(2)
			.max(32)
			.transform(value => value as NonEmptyString),
		lastName: z
			.string()
			.trim()
			.min(2)
			.max(32)
			.transform(value => value as NonEmptyString),
		mador: madorSchema,
		meshekDescription: z.union([nonEmptyStringSchema, z.null()]),
	}),
});
