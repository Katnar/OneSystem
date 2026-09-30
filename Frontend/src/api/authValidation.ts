import { z } from "zod";
import type { SignUpResultType, SsoSigninResultType } from "../../../sharedFiles/auth/authResponses";
import { PERSONAL_NUMBER_PATTERN } from "../../../sharedFiles/auth/authConsts";
import { AuthResponseStatus, type PersonalNumber } from "../../../sharedFiles/auth/authTypes";

export const personalNumberSchema = z
	.string()
	.regex(PERSONAL_NUMBER_PATTERN)
	.transform(value => value as PersonalNumber);

export const userSchema = z.object({
	personalNumber: personalNumberSchema,
	firstName: z.string(),
	lastName: z.string(),
	mador: z.string(),
	meshek_description: z.string().optional(),
	approvalStatus: z.boolean(),
	signIn_date: z.string(),
});

export const ssoSigninResultSchema = z.discriminatedUnion("ok", [
	z.object({
		ok: z.literal(true),
		result: z.object({ jwt: z.string(), user: userSchema }),
	}),
	z.object({
		ok: z.literal(false),
		error: z.discriminatedUnion("status", [
			z.object({
				status: z.literal(AuthResponseStatus.NotFound),
				firstName: z.string(),
				lastName: z.string(),
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
	z.object({ ok: z.literal(true), result: z.record(z.string(), z.never()) }),
	z.object({
		ok: z.literal(false),
		error: z.enum(["קלט לא תקין", "מספר אישי לא תקין", "משתמש כבר קיים", "משתמש ממתין לאישור"]),
	}),
]) satisfies z.ZodType<SignUpResultType>;
