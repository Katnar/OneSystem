import { z } from "zod";
import { nonEmptyStringSchema } from "../general/Strings/nonEmptyString";
import { Mador } from "../mador/mador";
import { PERSONAL_NUMBER_PATTERN } from "./authConsts";
import { Role, type FirstName, type JWTToken, type LastName, type PersonalNumber, type User } from "./authTypes";

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


export const userManagementFieldsSchema = z.object({
    role: roleSchema,
    mador: madorSchema,
    meshekDescription: nonEmptyStringSchema.nullable(),
});

export function hasValidUserManagementFields(
    user: Pick<User, "role" | "mador" | "meshekDescription">
): boolean {
    const operationalMador =
        user.mador === Mador.VEHICLE_AND_TRANSPORT ||
        user.mador === Mador.ENGINEERING_AND_ENERGY;

    switch (user.role) {
        case Role.SYSTEM_ADMIN:
            return user.mador === Mador.ADMINS &&
                user.meshekDescription === null;

        case Role.BUDGET_MANAGER:
            return user.mador === Mador.BUDGETS &&
                user.meshekDescription === null;

        case Role.SECTION_HEAD:
            return (operationalMador || user.mador === Mador.BUDGETS) &&
                user.meshekDescription === null;

        case Role.CONTRACT_MANAGER:
            return operationalMador &&
                user.meshekDescription !== null;
    }
}

export const userSchema = userManagementFieldsSchema.extend({
    personalNumber: personalNumberSchema,
    firstName: firstNameSchema,
    lastName: lastNameSchema,
    approvalStatus: z.boolean(),
    signUpDate: z.date(),
}).refine(hasValidUserManagementFields, {
    message: "Invalid role, mador, or meshekDescription combination",
    path: ["role"],
}) satisfies z.ZodType<User>;
