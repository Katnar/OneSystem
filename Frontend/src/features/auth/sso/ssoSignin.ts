import { createAsyncThunk } from "@reduxjs/toolkit";
import type { AxiosInstance } from "axios";
import { SSO_SIGNIN_ERROR_MESSAGES, type SsoSigninResultType } from "@onesystem/shared/auth/authResponses";
import type { SSOToken } from "@onesystem/shared/auth/authTypes";
import type { RootState } from "../../../app/store";
import { sessionExpired, sessionReceived } from "../authSlice";
import { synchronizeAuthSession } from "../synchronizeAuthSession";

export const ssoSignin = createAsyncThunk<SsoSigninResultType, SSOToken, { state: RootState; extra: AxiosInstance }>(
	"sso/signin",
	async (ssoToken, { dispatch, getState, extra: apiClient, requestId, signal }) => {
		const { data: signInResult } = await apiClient.get<SsoSigninResultType>("/auth/sso_signin", {
			skipAuth: true,
			headers: { Authorization: `Bearer ${ssoToken}` },
			signal,
		});
		synchronizeAuthSession({ getState, dispatch });
		// Session changes reset the active request; loading the current user's profile does not.
		if (getState().sso.activeRequestId !== requestId || signal.aborted) {
			throw new DOMException("Sign-in superseded or session changed", "AbortError");
		}
		if (signInResult.ok) dispatch(sessionReceived(signInResult.result));
		else if (signInResult.error === SSO_SIGNIN_ERROR_MESSAGES.EXPIRED_TOKEN) {
			dispatch(sessionExpired(ssoToken));
		}
		return signInResult;
	}
);
