import { z } from "zod";
import type { NonEmptyString } from "../global";
import { dateStringSchema } from "../date/dateSchema";
import { Mador } from "../mador/mador";
import { PERSONAL_NUMBER_PATTERN } from "./authConsts";
import type { SignUpPayload } from "./authPayloads";
import {
	AuthResponseStatus,
	SignUpResponseStatus,
	type SignUpErrorResponse,
	type SignUpResultType,
	type SignUpSuccessResponse,
	type SsoSigninResultType,
	type UserResponse,
} from "./authResponses";
import type { Name, JWTToken, PersonalNumber, SSOToken } from "./authTypes";

export type AppJwtClaims = {
	personalNumber: PersonalNumber;
};

export type SSODataType = {
	fname: string;
	lname: string;
	pn: string;
};

export type SsoClaims = Omit<SSODataType, "pn"> & {
	pn: PersonalNumber;
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

export const nonEmptyStringSchema = z
	.string()
	.trim()
	.min(1)
	.transform((value: string) => value as NonEmptyString) satisfies z.ZodType<NonEmptyString>;

const madorValues = Object.values(Mador) as [Mador, ...Mador[]];
export const madorSchema = z.enum(madorValues) satisfies z.ZodType<Mador>;

export const appJwtClaimsSchema = z.object({
	personalNumber: personalNumberSchema,
}) satisfies z.ZodType<AppJwtClaims>;

export const ssoDataSchema = z.object({
	fname: z.string(),
	lname: z.string(),
	pn: z.string(),
}) satisfies z.ZodType<SSODataType>;

export const ssoClaimsSchema = ssoDataSchema.extend({
	pn: personalNumberSchema,
}) satisfies z.ZodType<SsoClaims>;

export const signUpPayloadSchema = z.object({
	ssoToken: ssoTokenSchema,
	user: z.object({
		firstName: NameSchema,
		lastName: NameSchema,
		mador: madorSchema,
		meshekDescription: z.union([nonEmptyStringSchema, z.null()]),
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
}) satisfies z.ZodType<UserResponse>;

const authErrorStatusSchema = z.enum([
	AuthResponseStatus.BadToken,
	AuthResponseStatus.ExpiredToken,
	AuthResponseStatus.NotApproved,
	AuthResponseStatus.ServerError,
]);

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
		error: z.discriminatedUnion("status", [
			z.object({
				status: z.literal(AuthResponseStatus.NotFound),
				firstName: NameSchema,
				lastName: NameSchema,
				personalNumber: personalNumberSchema,
			}),
			z.object({
				status: authErrorStatusSchema,
			}),
		]),
	}),
]) satisfies z.ZodType<SsoSigninResultType>;

export const signUpSuccessResponseSchema = z.object({
	status: z.literal(SignUpResponseStatus.Created),
}) satisfies z.ZodType<SignUpSuccessResponse>;

export const signUpErrorResponseSchema = z.object({
	status: z.enum([
		SignUpResponseStatus.InvalidInput,
		SignUpResponseStatus.InvalidPersonalNumber,
		SignUpResponseStatus.AlreadyExists,
		SignUpResponseStatus.PendingApproval,
		SignUpResponseStatus.ServerError,
	]),
}) satisfies z.ZodType<SignUpErrorResponse>;

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
