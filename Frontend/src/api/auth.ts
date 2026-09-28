import axios from "axios";
import type { SsoSigninResultType, SignUpResultType } from "../../../sharedFiles/auth/authResponses";
import type { SignUpPayload } from "../../../sharedFiles/auth/authPayloads";
import type { Role } from "../../../sharedFiles/auth/authTypes";
import { rolesResultSchema, ssoSigninResultSchema } from "./authValidation";

const API_BASE_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
	baseURL: API_BASE_URL,
	validateStatus: () => true,
});

export async function ssoSignIn(ssoToken: string): Promise<SsoSigninResultType> {
	const response = await api.get<unknown>("/auth/sso_signin", {
		headers: {
			Authorization: `Bearer ${ssoToken}`,
		},
	});

	const result = ssoSigninResultSchema.safeParse(response.data);
	if (!result.success) {
		throw new Error("Unexpected SSO response");
	}

	return result.data;
}

export async function signUp(payload: SignUpPayload): Promise<SignUpResultType> {
	const response = await api.post<SignUpResultType>("/auth/signup", payload);
	return response.data;
}

export async function getRoles(ssoToken: string): Promise<Role[]> {
	const response = await api.get<unknown>("/auth/roles", {
		headers: { Authorization: `Bearer ${ssoToken}` },
	});
	const result = rolesResultSchema.safeParse(response.data);
	if (response.status !== 200 || !result.success) {
		throw new Error("Unable to load roles");
	}
	return result.data.roles;
}
