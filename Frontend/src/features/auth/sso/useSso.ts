import { useCallback } from "react";
import type { SignUpPayload } from "@onesystem/shared/auth/authPayloads";
import { SIGN_UP_ERROR_MESSAGES, type SignUpResultType } from "@onesystem/shared/auth/authResponses";
import type { SSOToken } from "@onesystem/shared/auth/authTypes";
import { API_URL, useAPI } from "../../../api";
import { useAppDispatch, useAppSelector, useAppStore } from "../../../app/hooks";
import { sessionExpired } from "../authSlice";
import { synchronizeAuthSession } from "../synchronizeAuthSession";
import { ssoSignin } from "./ssoSignin";
import { selectIsSigningIn } from "./ssoSlice";

export function useSso() {
	const api = useAPI();
	const dispatch = useAppDispatch();
	const store = useAppStore();
	const isSigningIn = useAppSelector(selectIsSigningIn);
	// Call from an event or effect; .unwrap() returns the shared SSO Result, and .abort() cancels the attempt.
	const signIn = useCallback((ssoToken: SSOToken) => dispatch(ssoSignin(ssoToken)), [dispatch]);

	const signUp = async (body: SignUpPayload) => {
		const sessionVersionAtStart = store.getState().auth.sessionVersion;
		const result = await api.post<SignUpPayload, SignUpResultType>(`${API_URL}/auth/signup`, body, {
			skipAuth: true,
		});
		const currentSession = synchronizeAuthSession(store);
		if (currentSession.sessionVersion !== sessionVersionAtStart || store.getState().sso.activeRequestId !== null) {
			return result;
		}
		if (result.some && !result.value.ok && result.value.error === SIGN_UP_ERROR_MESSAGES.EXPIRED_TOKEN) {
			dispatch(sessionExpired(body.ssoToken));
		}
		return result;
	};

	return { ssoSignin: signIn, isSigningIn, signUp };
}
