import type { BrandedString, DateString, NonEmptyString } from "../global";
import type { Mador } from "../mador";

export const UserApprovalStatus = { APPROVED: true, PENDING: false } as const;
export type UserApprovalStatus = (typeof UserApprovalStatus)[keyof typeof UserApprovalStatus];

export const AuthResponseStatus = {
	Ok: "ok",
	BadToken: "bad_token",
	ExpiredToken: "expired_token",
	NotFound: "not_found",
	NotApproved: "not_approved",
	ServerError: "server_error",
} as const;
export type AuthResponseStatus = (typeof AuthResponseStatus)[keyof typeof AuthResponseStatus];

export type PersonalNumber = BrandedString<"personal number">;
export type JWTToken = BrandedString<"jwt token">;
export type SSOToken = BrandedString<"sso token">;
export type FirstName = BrandedString<"first name">;
export type LastName = BrandedString<"last name">;

export type User = {
	personalNumber: PersonalNumber;
	firstName: FirstName;
	lastName: LastName;
	mador: Mador;
	meshekDescription: NonEmptyString | null;
	approvalStatus: UserApprovalStatus;
	signUpDate: Date;
};

export type UserResponse = Omit<User, "signUpDate"> & {
	signUpDate: DateString;
};
