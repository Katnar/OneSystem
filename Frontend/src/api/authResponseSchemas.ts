import { z } from "zod";

import { Mador } from "../../../sharedFiles/mador";
import type { DateString, NonEmptyString } from "../../../sharedFiles/global";
import type { SignUpResultType, SsoSigninResultType } from "../../../sharedFiles/auth/authResponses";
import {
	createFirstNameSchema,
	createLastNameSchema,
	createPersonalNumberSchema,
} from "../../../sharedFiles/auth/authSchemas";
import {
	AuthResponseStatus,
	type FirstName,
	type JWTToken,
	type LastName,
	type PersonalNumber,
	type UserResponse,
} from "../../../sharedFiles/auth/authTypes";

const jwtTokenSchema = z
	.string()
	.min(1)
	.transform(value => value as JWTToken) satisfies z.ZodType<JWTToken>;

const personalNumberSchema = createPersonalNumberSchema<z.ZodType<PersonalNumber>>(z);
const firstNameSchema = createFirstNameSchema<z.ZodType<FirstName>>(z);
const lastNameSchema = createLastNameSchema<z.ZodType<LastName>>(z);

const nonEmptyStringSchema = z
	.string()
	.trim()
	.min(1)
	.transform(value => value as NonEmptyString) satisfies z.ZodType<NonEmptyString>;

const dateStringSchema = z
	.string()
	.refine(value => {
		const date = new Date(value);
		return !Number.isNaN(date.getTime()) && date.toISOString() === value;
	})
	.transform(value => value as DateString) satisfies z.ZodType<DateString>;

const madorValues = Object.values(Mador) as [Mador, ...Mador[]];
const madorSchema = z.enum(madorValues) satisfies z.ZodType<Mador>;

const userResponseSchema = z.object({
	personalNumber: personalNumberSchema,
	firstName: firstNameSchema,
	lastName: lastNameSchema,
	mador: madorSchema,
	meshekDescription: z.union([nonEmptyStringSchema, z.null()]),
	approvalStatus: z.boolean(),
	signUpDate: dateStringSchema,
}) satisfies z.ZodType<UserResponse>;

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
				firstName: z.union([firstNameSchema, z.null()]),
				lastName: z.union([lastNameSchema, z.null()]),
				personalNumber: personalNumberSchema,
			}),
			z.object({
				status: z.enum([
					AuthResponseStatus.BadToken,
					AuthResponseStatus.ExpiredToken,
					AuthResponseStatus.NotApproved,
					AuthResponseStatus.ServerError,
				]),
			}),
		]),
	}),
]) satisfies z.ZodType<SsoSigninResultType>;

export const signUpResultSchema = z.discriminatedUnion("ok", [
	z.object({
		ok: z.literal(true),
		result: z.literal("משתמש נוצר בהצלחה"),
	}),
	z.object({
		ok: z.literal(false),
		error: z.enum([
			"קלט לא תקין",
			"מספר אישי לא תקין",
			"משתמש כבר קיים",
			"משתמש ממתין לאישור",
			"שגיאת שרת. נסה שוב מאוחר יותר.",
		]),
	}),
]) satisfies z.ZodType<SignUpResultType>;
