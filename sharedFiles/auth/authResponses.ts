import type { Result } from "../global";
import { AuthResponseStatus, type FirstName, type JWTToken, type LastName, type PersonalNumber, type UserResponse } from "./authTypes";

export { AuthResponseStatus as AuthStatus } from "./authTypes";

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
export type SignUpResultType = Result<
	"משתמש נוצר בהצלחה",
	| "קלט לא תקין"
	| "מספר אישי לא תקין"
	| "משתמש כבר קיים"
	| "משתמש ממתין לאישור"
	| "שגיאת שרת. נסה שוב מאוחר יותר."
>;
