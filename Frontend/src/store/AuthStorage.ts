import type { JWTToken } from "../../../sharedFiles/auth/authTypes";
import type { Result } from "../../../sharedFiles/global";

const AUTH_TOKEN_STORAGE_KEY = "onesystem.authToken";
const MISSING_AUTH_TOKEN_ERROR = "יש להתחבר על מנת להמשיך";

export const getAuthToken = (): Result<JWTToken, typeof MISSING_AUTH_TOKEN_ERROR> => {
	const token = window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
	if (!token) {
		return { ok: false, error: MISSING_AUTH_TOKEN_ERROR };
	}

	return { ok: true, result: token as JWTToken };
};

export const setAuthToken = (token: JWTToken): void => {
	window.localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
};

export const clearSignInInfo = (): void => {
	window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
};
