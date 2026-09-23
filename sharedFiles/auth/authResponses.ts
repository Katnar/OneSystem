import { AuthResponseStatus, type PersonalNumber, type User } from "./authTypes";
export { AuthResponseStatus as AuthStatus } from "./authTypes";
export type SsoSigninResultType = {
	status: typeof AuthResponseStatus[keyof typeof AuthResponseStatus];
	jwt?: string; user?: User; firstName?: string; lastName?: string; personalNumber?: PersonalNumber;
};
export type SignUpResultType = { success: boolean; error?: string; result?: Record<string, never> };
