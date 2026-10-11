import type { DateString, Result } from "../global";
import type { FirstName, JWTToken, LastName, PersonalNumber, User } from "./authTypes";

export const AuthResponseStatus = {
	Ok: "ok",
	BadToken: "bad_token",
	ExpiredToken: "expired_token",
	NotFound: "not_found",
	NotApproved: "not_approved",
	ServerError: "server_error",
} as const;
export type AuthResponseStatus = (typeof AuthResponseStatus)[keyof typeof AuthResponseStatus];

export const SignUpResponseStatus = {
	Created: "created",
	InvalidInput: "invalid_input",
	InvalidPersonalNumber: "invalid_personal_number",
	AlreadyExists: "already_exists",
	PendingApproval: "pending_approval",
	ServerError: "server_error",
} as const;
export type SignUpResponseStatus = (typeof SignUpResponseStatus)[keyof typeof SignUpResponseStatus];

export const AuthStatus = AuthResponseStatus;
export type AuthStatus = AuthResponseStatus;

export const SignUpStatus = SignUpResponseStatus;
export type SignUpStatus = SignUpResponseStatus;

export const SIGN_UP_RESPONSE_LABELS = {
	[SignUpResponseStatus.Created]: "משתמש נוצר בהצלחה",
	[SignUpResponseStatus.InvalidInput]: "קלט לא תקין",
	[SignUpResponseStatus.InvalidPersonalNumber]: "מספר אישי לא תקין",
	[SignUpResponseStatus.AlreadyExists]: "משתמש כבר קיים",
	[SignUpResponseStatus.PendingApproval]: "משתמש ממתין לאישור",
	[SignUpResponseStatus.ServerError]: "שגיאת שרת. נסה שוב מאוחר יותר.",
} satisfies Record<SignUpResponseStatus, string>;

export type UserResponse = Omit<User, "signUpDate"> & {
	signUpDate: DateString;
};

// GET {api}/auth/sso_signin
export type SsoSigninResultType = Result<
	{ jwt: JWTToken; user: UserResponse },
	| {
			status: typeof AuthResponseStatus.NotFound;
			firstName: FirstName | null;
			lastName: LastName | null;
			personalNumber: PersonalNumber;
	  }
	| {
			status: Exclude<AuthResponseStatus, typeof AuthResponseStatus.Ok | typeof AuthResponseStatus.NotFound>;
	  }
>;

// POST {api}/auth/signup
export type SignUpSuccessResponse = { status: typeof SignUpResponseStatus.Created };
export type SignUpErrorResponse = { status: Exclude<SignUpResponseStatus, typeof SignUpResponseStatus.Created> };
export type SignUpResultType = Result<SignUpSuccessResponse, SignUpErrorResponse>;
