import { z } from "zod";
import { nonEmptyStringSchema } from "../general/Strings/nonEmptyString";
import { Mador } from "../mador/mador";
import { PERSONAL_NUMBER_PATTERN } from "./authConsts";
import type { SignUpPayload } from "./authPayloads";
import { Role, type JWTToken, type Name, type PersonalNumber, type SSOToken } from "./authTypes";

export const personalNumberSchema = z
	.string()
	.regex(PERSONAL_NUMBER_PATTERN)
	.transform(value => value as PersonalNumber) satisfies z.ZodType<PersonalNumber>;

export const jwtTokenSchema = z
	.string()
	.min(1)
	.transform(value => value as JWTToken) satisfies z.ZodType<JWTToken>;

export const ssoTokenSchema = z
	.string()
	.refine(value => value.trim().length > 0)
	.transform(value => value as SSOToken) satisfies z.ZodType<SSOToken>;

export const NameSchema = z
	.string()
	.trim()
	.min(2)
	.max(32)
	.transform(value => value as Name) satisfies z.ZodType<Name>;

const madorValues = Object.values(Mador) as [Mador, ...Mador[]];
export const madorSchema = z.enum(madorValues) satisfies z.ZodType<Mador>;

const roleValues = Object.values(Role) as [Role, ...Role[]];
export const roleSchema = z.enum(roleValues) satisfies z.ZodType<Role>;

export const signUpPayloadSchema = z.object({
	ssoToken: ssoTokenSchema,
	user: z.object({
		firstName: NameSchema,
		lastName: NameSchema,
		mador: madorSchema,
		meshekDescription: z.union([nonEmptyStringSchema, z.null()]),
		role: roleSchema,
	}),
}) satisfies z.ZodType<SignUpPayload>;
