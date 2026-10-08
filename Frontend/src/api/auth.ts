import axios from "axios";
import type { SsoSigninResultType, SignUpResultType } from "@onesystem/shared-files/auth/authResponses";
import type { SignUpPayload } from "@onesystem/shared-files/auth/authPayloads";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
	baseURL: API_BASE_URL,
	validateStatus: () => true,
});

export async function ssoSignIn(ssoToken: string): Promise<SsoSigninResultType> {
	const response = await api.get<SsoSigninResultType>("/auth/sso_signin", {
		headers: {
			Authorization: `Bearer ${ssoToken}`,
		},
	});

	return response.data;
}

export async function signUp(payload: SignUpPayload): Promise<SignUpResultType> {
	const response = await api.post<SignUpResultType>("/auth/signup", payload);
	return response.data;
}
