export { defaultTo, unwrap } from "./global";
export type { APIResult, AssertOnly, AsWireType, Default, Err, Ok, Result, Some, SomeOrDefault } from "./global";

export { assertNotEmptyArr, tryIntoNonEmptyArr } from "./general/Arrays/nonEmptyArray";
export type { NonEmptyArray } from "./general/Arrays/nonEmptyArray";

export { dateStringSchema } from "./general/Date/dateSchema";
export type { DateString } from "./general/Date/dateSchema";

export type { BrandedNumber, MoneyILS, PhoneNumber, Year } from "./general/NumberStrings/numberStrings";

export type { BrandedString } from "./general/Strings/brandedString";

export { assertNotEmptyString, nonEmptyStringSchema, tryIntoNonEmptyString } from "./general/Strings/nonEmptyString";
export type { NonEmptyString } from "./general/Strings/nonEmptyString";

export { Mador, MeshekMador } from "./mador/mador";

export { ERROR_PATH, buildErrorPath } from "./paths";

export { JWT_LIFETIME_HOURS, PERSONAL_NUMBER_PATTERN } from "./auth/authConsts";

export type { SignUpPayload } from "./auth/authPayloads";

export {
	SIGN_UP_ERROR_MESSAGES,
	SIGN_UP_SUCCESS_MESSAGE,
	SSO_SIGNIN_ERROR_MESSAGES,
	SSO_SIGNIN_REQUIRES_SIGN_UP_MESSAGE,
} from "./auth/authResponses";
export type {
	AuthUserResponse,
	SignUpErrorResponse,
	SignUpResultType,
	SignUpSuccessResponse,
	SsoSigninErrorMessage,
	SsoSigninRequiresSignUpResponse,
	SsoSigninResultType,
	SsoSigninSuccessResponse,
} from "./auth/authResponses";

export { Role, UserApprovalStatus } from "./auth/authTypes";
export type { FirstName, JWTToken, LastName, PersonalNumber, SSOToken, User } from "./auth/authTypes";

export { allowOnly, hasPermission, intersectPermissions, unitePermissions } from "./auth/permissions";
export type { Permission } from "./auth/permissions";

export {
	firstNameSchema,
	jwtTokenSchema,
	lastNameSchema,
	madorSchema,
	personalNumberSchema,
	roleSchema,
	userSchema,
} from "./auth/authSchemas";

export { editUserPayloadSchema } from "./users";
export type {
    EditUserPayload,
    UsersErrorMessages,
    GetUsersResponse,
    EditUserResponse,
    ApproveUserResponse,
    DeleteUserResponse,
} from "./users";
