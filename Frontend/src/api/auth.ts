import axios from "axios";
import type { SsoSigninResultType, SignUpResultType } from "../../../sharedFiles/auth/authResponses";
import type { SignUpPayload } from "../../../sharedFiles/auth/authPayloads";
import type { SSOToken } from "../../../sharedFiles/auth/authTypes";
import { setAuthToken } from "../store/AuthStorage";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
	baseURL: API_BASE_URL,
	validateStatus: () => true,
});

export async function ssoSignIn(ssoToken: SSOToken): Promise<SsoSigninResultType> {
	const response = await api.get<SsoSigninResultType>("/auth/sso_signin", {
		headers: {
			Authorization: `Bearer ${ssoToken}`,
		},
	});

	const result = response.data;
	if (result.ok) {
		setAuthToken(result.result.jwt);
	}

	return result;
}

export async function signUp(payload: SignUpPayload): Promise<SignUpResultType> {
	const response = await api.post<SignUpResultType>("/auth/signup", payload);
	return response.data;
}
