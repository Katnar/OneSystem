import { z } from "zod";
import type { SignUpPayload } from "../../../sharedFiles/auth/authPayloads";
import {
	firstNameSchema,
	lastNameSchema,
	personalNumberSchema,
	hasValidUserManagementFields,
	userManagementFieldsSchema,
} from "../../../sharedFiles/auth/authSchemas";
import type { PersonalNumber, SSOToken } from "../../../sharedFiles/auth/authTypes";

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
	user: userManagementFieldsSchema
		.extend({
			firstName: firstNameSchema,
			lastName: lastNameSchema,
		})
		.refine(hasValidUserManagementFields, {
			message: "Invalid role, mador, or meshekDescription combination",
			path: ["role"],
		}),
}) satisfies z.ZodType<SignUpPayload>;
