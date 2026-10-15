import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthUserResponse, SsoSigninSuccessResponse } from "@onesystem/shared/auth/authResponses";
import type { JWTToken } from "@onesystem/shared/auth/authTypes";
import type { RootState } from "../../app/store";

export interface AuthState {
	token: JWTToken | null;
	user: AuthUserResponse | null;
}

export const initialAuthState: AuthState = {
	token: null,
	user: null,
};

const authSlice = createSlice({
	name: "auth",
	initialState: initialAuthState,
	reducers: {
		sessionReceived: (state, { payload }: PayloadAction<SsoSigninSuccessResponse>) => {
			state.token = payload.jwt;
			// Repeated API responses must not trigger another render for an unchanged profile.
			if (JSON.stringify(state.user) !== JSON.stringify(payload.user)) {
				state.user = payload.user;
			}
		},
		// A new state object invalidates pending sign-ins, even when already signed out.
		sessionCleared: () => ({ ...initialAuthState }),
		sessionSynchronized: (state, { payload }: PayloadAction<JWTToken | null>) => {
			if (payload === null || state.token !== payload) {
				return { token: payload, user: null };
			}
		},
	},
});

export const { sessionReceived, sessionCleared, sessionSynchronized } = authSlice.actions;
export const selectAuthToken = (state: RootState) => state.auth.token;
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.token !== null;
export default authSlice.reducer;
