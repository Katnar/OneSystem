import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthUserResponse, SsoSigninSuccessResponse } from "@onesystem/shared/auth/authResponses";
import type { JWTToken, SSOToken } from "@onesystem/shared/auth/authTypes";
import type { RootState } from "../../app/store";

interface AuthState {
	token: JWTToken | null;
	user: AuthUserResponse | null;
	// Changes on login/logout, including reusing the same JWT; profile hydration keeps it stable.
	sessionVersion: number;
}

export const initialAuthState: AuthState = {
	token: null,
	user: null,
	sessionVersion: 0,
};

const clearSession = (state: AuthState): AuthState => ({
	...initialAuthState,
	sessionVersion: state.sessionVersion + 1,
});

const authSlice = createSlice({
	name: "auth",
	initialState: initialAuthState,
	reducers: {
		sessionReceived: (state, { payload }: PayloadAction<SsoSigninSuccessResponse>) => {
			state.token = payload.jwt;
			state.user = payload.user;
			state.sessionVersion += 1;
		},
		sessionRestored: (state, { payload }: PayloadAction<SsoSigninSuccessResponse>) => {
			if (state.token === payload.jwt) state.user = payload.user;
		},
		sessionCleared: clearSession,
		sessionExpired: {
			prepare: (expiredSsoToken?: SSOToken) => ({ payload: expiredSsoToken }),
			reducer: clearSession,
		},
		sessionSynchronized: (state, { payload }: PayloadAction<JWTToken | null>) => {
			if (payload === null || state.token !== payload) {
				return { ...clearSession(state), token: payload };
			}
		},
	},
});

export const { sessionReceived, sessionRestored, sessionCleared, sessionExpired, sessionSynchronized } =
	authSlice.actions;
export const selectAuthToken = (state: RootState) => state.auth.token;
export const selectCurrentUser = (state: RootState) => state.auth.user;
export default authSlice.reducer;
