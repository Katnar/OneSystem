import { z } from "zod";
import { Mador } from "../mador/mador";
import { PERSONAL_NUMBER_PATTERN } from "./authConsts";
import { Role, type FirstName, type JWTToken, type LastName, type PersonalNumber } from "./authTypes";

export const personalNumberSchema = z
	.string()
	.regex(PERSONAL_NUMBER_PATTERN)
	.transform(value => value as PersonalNumber) satisfies z.ZodType<PersonalNumber>;

export const jwtTokenSchema = z
	.string()
	.min(1)
	.transform(value => value as JWTToken) satisfies z.ZodType<JWTToken>;

const baseNameSchema = z.string().trim().min(2).max(32);


export const firstNameSchema = baseNameSchema.transform(value => value as FirstName) satisfies z.ZodType<FirstName>;

export const lastNameSchema = baseNameSchema.transform(value => value as LastName) satisfies z.ZodType<LastName>;

const madorValues = Object.values(Mador) as [Mador, ...Mador[]];
export const madorSchema = z.enum(madorValues) satisfies z.ZodType<Mador>;

const roleValues = Object.values(Role) as [Role, ...Role[]];
export const roleSchema = z.enum(roleValues) satisfies z.ZodType<Role>;
