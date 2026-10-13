import axios from "axios";
import {
	SIGN_UP_ERROR_MESSAGES,
	SSO_SIGNIN_ERROR_MESSAGES,
	type SsoSigninResultType,
	type SignUpResultType,
} from "@onesystem/shared/auth/authResponses";
import type { SignUpPayload } from "@onesystem/shared/auth/authPayloads";
import type { SSOToken } from "@onesystem/shared/auth/authTypes";
import { signUpResultSchema, ssoSigninResultSchema } from "@onesystem/shared/auth/authSchemas";
import { setAuthToken } from "../store/AuthStorage";

const API_BASE_URL = import.meta.env.VITE_API_URL;
const SSO_SERVER_ERROR_MESSAGE = SSO_SIGNIN_ERROR_MESSAGES[3];
const SIGN_UP_SERVER_ERROR_MESSAGE = SIGN_UP_ERROR_MESSAGES[4];

const api = axios.create({
	baseURL: API_BASE_URL,
	validateStatus: () => true,
});

export async function ssoSignIn(ssoToken: SSOToken): Promise<SsoSigninResultType> {
	const response = await api.get<unknown>("/auth/sso_signin", {
		headers: {
			Authorization: `Bearer ${ssoToken}`,
		},
	});

	const parsedResult = ssoSigninResultSchema.safeParse(response.data);
	const result: SsoSigninResultType = parsedResult.success
		? parsedResult.data
		: { ok: false, error: SSO_SERVER_ERROR_MESSAGE };
	if (result.ok) {
		setAuthToken(result.result.jwt);
	}

	return result;
}

export async function signUp(payload: SignUpPayload): Promise<SignUpResultType> {
	const response = await api.post<unknown>("/auth/signup", payload);
	const parsedResult = signUpResultSchema.safeParse(response.data);
	return parsedResult.success ? parsedResult.data : { ok: false, error: SIGN_UP_SERVER_ERROR_MESSAGE };
}
