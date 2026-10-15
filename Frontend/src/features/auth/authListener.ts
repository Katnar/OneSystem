import { createListenerMiddleware, type Dispatch } from "@reduxjs/toolkit";
import { sessionCleared, sessionReceived, sessionSynchronized } from "./authSlice";
import { authTokenStorage } from "./authTokenStorage";

export function startAuthStorageSync(dispatch: Dispatch) {
	// Storage synchronization must not write back and overwrite a newer session in another tab.
	return authTokenStorage.subscribe(token => dispatch(sessionSynchronized(token)));
}

export function createAuthListenerMiddleware() {
	const listener = createListenerMiddleware();

	listener.startListening({
		actionCreator: sessionReceived,
		effect: ({ payload }) => {
			authTokenStorage.set(payload.jwt);
		},
	});
	listener.startListening({
		actionCreator: sessionCleared,
		effect: () => {
			authTokenStorage.clear();
		},
	});

	return listener;
}
