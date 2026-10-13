import { z } from "zod";
import type { SignUpPayload } from "../../../sharedFiles/auth/authPayloads";
import {
	firstNameSchema,
	lastNameSchema,
	madorSchema,
	personalNumberSchema,
	roleSchema,
} from "../../../sharedFiles/auth/authSchemas";
import type { PersonalNumber, SSOToken } from "../../../sharedFiles/auth/authTypes";
import { nonEmptyStringSchema } from "../../../sharedFiles/general/Strings/nonEmptyString";

export * from "../../../sharedFiles/auth/authSchemas";

export type AuthenticatedUserJwtPayload = {
	personalNumber: PersonalNumber;
};

export const authenticatedUserJwtPayloadSchema = z.object({
	personalNumber: personalNumberSchema,
}) satisfies z.ZodType<AuthenticatedUserJwtPayload>;

export type RawSsoTokenPayload = {
	fname: string;
	lname: string;
	pn: string;
};

export type VerifiedSsoTokenPayload = Omit<RawSsoTokenPayload, "pn"> & {
	pn: PersonalNumber;
};

export const rawSsoTokenPayloadSchema = z.object({
	fname: z.string(),
	lname: z.string(),
	pn: z.string(),
}) satisfies z.ZodType<RawSsoTokenPayload>;

export const verifiedSsoTokenPayloadSchema = rawSsoTokenPayloadSchema.extend({
	pn: personalNumberSchema,
}) satisfies z.ZodType<VerifiedSsoTokenPayload>;

export const ssoTokenSchema = z
	.string()
	.refine(value => value.trim().length > 0)
	.transform(value => value as SSOToken) satisfies z.ZodType<SSOToken>;

export const signUpPayloadSchema = z.object({
	ssoToken: ssoTokenSchema,
	user: z.object({
		firstName: firstNameSchema,
		lastName: lastNameSchema,
		mador: madorSchema,
		meshekDescription: z.union([nonEmptyStringSchema, z.null()]),
		role: roleSchema,
	}),
}) satisfies z.ZodType<SignUpPayload>;
