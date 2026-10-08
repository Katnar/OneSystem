import { z } from "zod";
import type { NonEmptyString } from "../../../sharedFiles/global";
import { Mador } from "../../../sharedFiles/mador";
import type { PersonalNumber, SSOToken } from "../../../sharedFiles/auth/authTypes";
import { PERSONAL_NUMBER_PATTERN } from "../../../sharedFiles/auth/authConsts";
import type { SignUpPayload } from "../../../sharedFiles/auth/authPayloads";

export type SSODataType = {
	fname?: string;
	lname?: string;
	pn: string;
};

type SsoClaims = Omit<SSODataType, "pn"> & {
	pn: PersonalNumber;
};

// Apply the shared brands only after runtime validation succeeds.
export const personalNumberSchema = z
	.string()
	.regex(PERSONAL_NUMBER_PATTERN)
	.transform(value => value as PersonalNumber) satisfies z.ZodType<PersonalNumber>;

export const nonEmptyStringSchema = z
	.string()
	.trim()
	.min(1)
	.transform(value => value as NonEmptyString) satisfies z.ZodType<NonEmptyString>;

const madorValues = Object.values(Mador) as [Mador, ...Mador[]];
export const madorSchema = z.enum(madorValues) satisfies z.ZodType<Mador>;

export const ssoDataSchema = z.object({
	fname: z.string().optional(),
	lname: z.string().optional(),
	pn: z.string(),
}) satisfies z.ZodType<SSODataType>;

export const ssoClaimsSchema = ssoDataSchema.extend({
	pn: personalNumberSchema,
}) satisfies z.ZodType<SsoClaims>;

export const signUpPayloadSchema = z.object({
	ssoToken: z
		.string()
		.refine(value => value.trim().length > 0)
		.transform(value => value as SSOToken),
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
}) satisfies z.ZodType<SignUpPayload>;
