import { createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";
import type { AppDispatch, AppStore, RootState } from "../../app/store";
import { sessionCleared, sessionExpired, sessionReceived, sessionSynchronized } from "./authSlice";
import { authTokenStorage } from "./authTokenStorage";
import { restoreSession } from "./restoreSession";

export function startAuthStorageSync(store: Pick<AppStore, "dispatch" | "getState">) {
	if (store.getState().auth.token) {
		void store.dispatch(restoreSession());
	}
	// Storage synchronization must not write back and overwrite a newer session in another tab.
	return authTokenStorage.subscribe(token => {
		if (token !== null && token === store.getState().auth.token) return;
		store.dispatch(sessionSynchronized(token));
	});
}

export function createAuthListenerMiddleware() {
	const listener = createListenerMiddleware();
	const startListening = listener.startListening.withTypes<RootState, AppDispatch>();

	startListening({
		actionCreator: sessionSynchronized,
		effect: (_, listenerApi) => {
			void listenerApi.dispatch(restoreSession());
		},
	});

	startListening({
		actionCreator: sessionReceived,
		effect: ({ payload }) => {
			authTokenStorage.set(payload.jwt);
		},
	});
	startListening({
		matcher: isAnyOf(sessionCleared, sessionExpired),
		effect: () => {
			authTokenStorage.clear();
		},
	});

	return listener;
}
