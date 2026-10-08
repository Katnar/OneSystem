import { BrandedString } from "../general/Strings/brandedString";
import { NonEmptyString } from "../general/Strings/nonEmptyString";
import type { Mador } from "../mador/mador";

export const UserApprovalStatus = { APPROVED: true, PENDING: false } as const;
export type UserApprovalStatus = (typeof UserApprovalStatus)[keyof typeof UserApprovalStatus];

export const Role = {
	SYSTEM_ADMIN: "מנהל מערכת",
	BUDGET_MANAGER: "מנהל תקציב",
	SECTION_HEAD: "ראש מדור",
	CONTRACT_MANAGER: "מנהל חוזה",
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export type PersonalNumber = BrandedString<"personal number">;
export type JWTToken = BrandedString<"jwt token">;
export type SSOToken = BrandedString<"sso token">;
export type Name = BrandedString<"name">;
export type LastName = Name;
export type FirstName = Name;

export type User = {
	personalNumber: PersonalNumber;
	firstName: FirstName;
	lastName: LastName;
	mador: Mador;
	meshekDescription: NonEmptyString | null;
	approvalStatus: UserApprovalStatus;
	signUpDate: Date;
	role: Role;
};
