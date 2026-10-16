import { createSlice, isAnyOf } from "@reduxjs/toolkit";
import type { RootState } from "../../../app/store";
import { sessionCleared, sessionExpired, sessionReceived, sessionSynchronized } from "../authSlice";
import { ssoSignin } from "./ssoSignin";

const initialState: { activeRequestId: string | null } = { activeRequestId: null };

const ssoSlice = createSlice({
	name: "sso",
	initialState,
	reducers: {},
	extraReducers: builder => {
		builder
			.addCase(ssoSignin.pending, (state, action) => {
				state.activeRequestId = action.meta.requestId;
			})
			.addMatcher(ssoSignin.settled, (state, action) => {
				if (state.activeRequestId === action.meta.requestId) state.activeRequestId = null;
			})
			.addMatcher(
				isAnyOf(sessionCleared, sessionExpired, sessionReceived, sessionSynchronized),
				() => initialState
			);
	},
});

export const ssoReducer = ssoSlice.reducer;
export const selectIsSigningIn = (state: RootState) => state.sso.activeRequestId !== null;
