import { DateString } from "../general/Date/dateSchema";
import type { Result } from "../global";
import type { Name, JWTToken, PersonalNumber, User } from "./authTypes";

const SERVER_ERROR_MESSAGE = "שגיאת שרת. נסה שוב מאוחר יותר.";

export const SSO_SIGNIN_REQUIRES_SIGN_UP_MESSAGE = "משתמש לא נמצא. יש להירשם למערכת";

export const SSO_SIGNIN_ERROR_MESSAGES = [
	"קישור ההתחברות אינו תקין",
	"פג תוקף קישור ההתחברות",
	"המשתמש טרם אושר",
	SERVER_ERROR_MESSAGE,
] as const;
export type SsoSigninErrorMessage = (typeof SSO_SIGNIN_ERROR_MESSAGES)[number];

export const SIGN_UP_SUCCESS_MESSAGE = "משתמש נוצר בהצלחה";

export const SIGN_UP_ERROR_MESSAGES = [
	"קלט לא תקין",
	"מספר אישי לא תקין",
	"משתמש כבר קיים",
	"משתמש ממתין לאישור",
	SERVER_ERROR_MESSAGE,
] as const;
export type SignUpErrorResponse = (typeof SIGN_UP_ERROR_MESSAGES)[number];

export type UserResponse = Omit<User, "signUpDate"> & {
	signUpDate: DateString;
};

export type SsoSigninRequiresSignUpResponse = {
	message: typeof SSO_SIGNIN_REQUIRES_SIGN_UP_MESSAGE;
	firstName: Name;
	lastName: Name;
	personalNumber: PersonalNumber;
};

// GET {api}/auth/sso_signin
export type SsoSigninResultType = Result<
	{ jwt: JWTToken; user: UserResponse },
	SsoSigninRequiresSignUpResponse | SsoSigninErrorMessage
>;

// POST {api}/auth/signup
export type SignUpSuccessResponse = typeof SIGN_UP_SUCCESS_MESSAGE;
export type SignUpResultType = Result<SignUpSuccessResponse, SignUpErrorResponse>;
