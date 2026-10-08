import type { AsSent, NonEmptyString, Result } from "../global";
import { AuthResponseStatus, type PersonalNumber, type User } from "./authTypes";

export { AuthResponseStatus as AuthStatus } from "./authTypes";

// GET {api}/auth/sso_signin
export type SsoSigninResultType = Result<
	{ jwt: string; user: AsSent<User> },
	| {
			status: typeof AuthResponseStatus.NotFound;
			firstName: NonEmptyString | "";
			lastName: NonEmptyString | "";
			personalNumber: PersonalNumber;
	  }
	| {
			status: Exclude<AuthResponseStatus, typeof AuthResponseStatus.Ok | typeof AuthResponseStatus.NotFound>;
	  }
>;

// POST {api}/auth/signup
export type SignUpResultType = Result<
	Record<string, never>,
	| "קלט לא תקין"
	| "מספר אישי לא תקין"
	| "משתמש כבר קיים"
	| "משתמש ממתין לאישור"
	| "שגיאת שרת. נסה שוב מאוחר יותר."
>;
