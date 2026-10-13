export { defaultTo, unwrap } from "./global";
export type { APIResult, AssertOnly, AsWireType, Default, Err, Ok, Result, Some, SomeOrDefault } from "./global";

export { assertNotEmptyString, nonEmptyStringSchema, tryIntoNonEmptyString } from "./general/Strings/nonEmptyString";
export type { NonEmptyString } from "./general/Strings/nonEmptyString";

export { dateStringSchema } from "./general/Date/dateSchema";
export type { DateString } from "./general/Date/dateSchema";

export { Mador, MeshekMador } from "./mador/mador";

export { ERROR_PATH, SIGN_IN_RAW_PATH, buildErrorPath } from "./paths";

export { JWT_LIFETIME_HOURS, PERSONAL_NUMBER_PATTERN } from "./auth/authConsts";

export type { SignUpPayload } from "./auth/authPayloads";

export {
	SIGN_UP_ERROR_MESSAGES,
	SIGN_UP_SUCCESS_MESSAGE,
	SSO_SIGNIN_ERROR_MESSAGES,
	SSO_SIGNIN_REQUIRES_SIGN_UP_MESSAGE,
} from "./auth/authResponses";
export type {
	SignUpErrorResponse,
	SignUpResultType,
	SignUpSuccessResponse,
	SsoSigninErrorMessage,
	SsoSigninRequiresSignUpResponse,
	SsoSigninResultType,
	UserResponse,
} from "./auth/authResponses";

export { Role, UserApprovalStatus } from "./auth/authTypes";
export type { FirstName, JWTToken, LastName, Name, PersonalNumber, SSOToken, User } from "./auth/authTypes";
