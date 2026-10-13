import { z } from "zod";
import { nonEmptyStringSchema } from "../../../sharedFiles/general/Strings/nonEmptyString";
import { dateStringSchema } from "../../../sharedFiles/general/Date/dateSchema";
import { Mador } from "../../../sharedFiles/mador/mador";
import { PERSONAL_NUMBER_PATTERN } from "../../../sharedFiles/auth/authConsts";
import type { SignUpPayload } from "../../../sharedFiles/auth/authPayloads";
import {
	SIGN_UP_ERROR_MESSAGES,
	SIGN_UP_SUCCESS_MESSAGE,
	SSO_SIGNIN_ERROR_MESSAGES,
	SSO_SIGNIN_REQUIRES_SIGN_UP_MESSAGE,
	type SignUpErrorResponse,
	type SignUpResultType,
	type SignUpSuccessResponse,
	type SsoSigninRequiresSignUpResponse,
	type SsoSigninResultType,
	type UserResponse,
} from "../../../sharedFiles/auth/authResponses";
import {
	Role,
	type Name,
	type JWTToken,
	type PersonalNumber,
	type SSOToken,
} from "../../../sharedFiles/auth/authTypes";

export type AppJwtClaims = {
	personalNumber: PersonalNumber;
};

export type SSODataType = {
	fname: string;
	lname: string;
	pn: string;
};

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

export const appJwtClaimsSchema = z.object({
	personalNumber: personalNumberSchema,
}) satisfies z.ZodType<AppJwtClaims>;

export const ssoDataSchema = z.object({
	fname: z.string(),
	lname: z.string(),
	pn: z.string(),
}) satisfies z.ZodType<SSODataType>;

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

export const userResponseSchema = z.object({
	personalNumber: personalNumberSchema,
	firstName: NameSchema,
	lastName: NameSchema,
	mador: madorSchema,
	meshekDescription: z.union([nonEmptyStringSchema, z.null()]),
	approvalStatus: z.boolean(),
	signUpDate: dateStringSchema,
	role: roleSchema,
}) satisfies z.ZodType<UserResponse>;

const ssoSigninErrorMessageSchema = z.enum(SSO_SIGNIN_ERROR_MESSAGES);

const ssoSigninRequiresSignUpResponseSchema = z.object({
	message: z.literal(SSO_SIGNIN_REQUIRES_SIGN_UP_MESSAGE),
	firstName: NameSchema,
	lastName: NameSchema,
	personalNumber: personalNumberSchema,
}) satisfies z.ZodType<SsoSigninRequiresSignUpResponse>;

export const ssoSigninResultSchema = z.discriminatedUnion("ok", [
	z.object({
		ok: z.literal(true),
		result: z.object({
			jwt: jwtTokenSchema,
			user: userResponseSchema,
		}),
	}),
	z.object({
		ok: z.literal(false),
		error: z.union([ssoSigninRequiresSignUpResponseSchema, ssoSigninErrorMessageSchema]),
	}),
]) satisfies z.ZodType<SsoSigninResultType>;

export const signUpSuccessResponseSchema = z.literal(
	SIGN_UP_SUCCESS_MESSAGE
) satisfies z.ZodType<SignUpSuccessResponse>;

export const signUpErrorResponseSchema = z.enum(SIGN_UP_ERROR_MESSAGES) satisfies z.ZodType<SignUpErrorResponse>;

export const signUpResultSchema = z.discriminatedUnion("ok", [
	z.object({
		ok: z.literal(true),
		result: signUpSuccessResponseSchema,
	}),
	z.object({
		ok: z.literal(false),
		error: signUpErrorResponseSchema,
	}),
]) satisfies z.ZodType<SignUpResultType>;
