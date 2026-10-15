import { CanceledError } from "axios";
import type { SignUpPayload } from "@onesystem/shared/auth/authPayloads";
import type { SignUpResultType, SsoSigninResultType } from "@onesystem/shared/auth/authResponses";
import type { SSOToken } from "@onesystem/shared/auth/authTypes";
import { API_URL, useAPI } from "../../api";
import { useAppStore } from "../../app/hooks";
import { sessionReceived } from "../auth";

export function useSso() {
	const api = useAPI();
	const store = useAppStore();

	const ssoSignin = (ssoToken: SSOToken) => {
		const session = store.getState().auth;
		return api.get<SsoSigninResultType>(
			`${API_URL}/auth/sso_signin`,
			{ skipAuth: true, headers: { Authorization: `Bearer ${ssoToken}` } },
			{
				requestScope: session,
				onResponse: result => {
					// A logout or replacement session must invalidate a pending sign-in.
					if (session !== store.getState().auth) {
						throw new CanceledError("Sign-in session changed");
					}
					if (result.ok) store.dispatch(sessionReceived(result.result));
				},
			}
		);
	};

	const signUp = (body: SignUpPayload) =>
		api.post<SignUpPayload, SignUpResultType>(`${API_URL}/auth/signup`, body, { skipAuth: true });

	return { ssoSignin, signUp };
}
