import { z } from "zod";
import type { NonEmptyString } from "../../../sharedFiles/global";
import { Mador } from "../../../sharedFiles/mador";
import type { FirstName, LastName, PersonalNumber, SSOToken } from "../../../sharedFiles/auth/authTypes";
import type { SignUpPayload } from "../../../sharedFiles/auth/authPayloads";
import {
	createPersonalNumberSchema,
	createAppJwtClaimsSchema,
	createFirstNameSchema,
	createLastNameSchema,
	type AppJwtClaims,
} from "../../../sharedFiles/auth/authSchemas";

export type SSODataType = {
	fname?: string;
	lname?: string;
	pn: string;
};

type SsoClaims = Omit<SSODataType, "pn"> & {
	pn: PersonalNumber;
};

export const personalNumberSchema = createPersonalNumberSchema<z.ZodType<PersonalNumber>>(z);

export const appJwtClaimsSchema = createAppJwtClaimsSchema<typeof personalNumberSchema, z.ZodType<AppJwtClaims>>(
	z,
	personalNumberSchema
);

export const firstNameSchema = createFirstNameSchema<z.ZodType<FirstName>>(z);

export const lastNameSchema = createLastNameSchema<z.ZodType<LastName>>(z);

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
		firstName: firstNameSchema,
		lastName: lastNameSchema,
		mador: madorSchema,
		meshekDescription: z.union([nonEmptyStringSchema, z.null()]),
	}),
}) satisfies z.ZodType<SignUpPayload>;
