import { DateString } from "../general/Date/dateSchema";
import type { Result } from "../global";
import type { FirstName, JWTToken, LastName, PersonalNumber, User } from "./authTypes";

const SERVER_ERROR_MESSAGE = "שגיאת שרת. נסה שוב מאוחר יותר.";

export const SSO_SIGNIN_REQUIRES_SIGN_UP_MESSAGE = "משתמש לא נמצא. יש להירשם למערכת";

export const SSO_SIGNIN_ERROR_MESSAGES = {
	BAD_TOKEN: "קישור ההתחברות אינו תקין",
	EXPIRED_TOKEN: "פג תוקף קישור ההתחברות",
	NOT_APPROVED: "המשתמש טרם אושר",
	SERVER_ERROR: SERVER_ERROR_MESSAGE,
} as const;
export type SsoSigninErrorMessage = (typeof SSO_SIGNIN_ERROR_MESSAGES)[keyof typeof SSO_SIGNIN_ERROR_MESSAGES];

export const SIGN_UP_SUCCESS_MESSAGE = "משתמש נוצר בהצלחה";

export const SIGN_UP_ERROR_MESSAGES = {
	EXPIRED_TOKEN: SSO_SIGNIN_ERROR_MESSAGES.EXPIRED_TOKEN,
	INVALID_INPUT: "קלט לא תקין",
	INVALID_PERSONAL_NUMBER: "מספר אישי לא תקין",
	ALREADY_EXISTS: "משתמש כבר קיים",
	PENDING_APPROVAL: "משתמש ממתין לאישור",
	SERVER_ERROR: SERVER_ERROR_MESSAGE,
} as const;
export type SignUpErrorResponse = (typeof SIGN_UP_ERROR_MESSAGES)[keyof typeof SIGN_UP_ERROR_MESSAGES];

export type AuthUserResponse = Omit<User, "signUpDate"> & {
	signUpDate: DateString;
};

export type SsoSigninRequiresSignUpResponse = {
	message: typeof SSO_SIGNIN_REQUIRES_SIGN_UP_MESSAGE;
	firstName: FirstName;
	lastName: LastName;
	personalNumber: PersonalNumber;
};

export type SsoSigninSuccessResponse = { jwt: JWTToken; user: AuthUserResponse };

// GET {api}/auth/sso_signin
export type SsoSigninResultType = Result<
	SsoSigninSuccessResponse,
	SsoSigninRequiresSignUpResponse | SsoSigninErrorMessage
>;

// POST {api}/auth/signup
export type SignUpSuccessResponse = {
	message: typeof SIGN_UP_SUCCESS_MESSAGE;
	user: AuthUserResponse;
};
export type SignUpResultType = Result<SignUpSuccessResponse, SignUpErrorResponse>;
