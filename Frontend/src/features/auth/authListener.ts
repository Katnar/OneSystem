import { createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";
import type { AppDispatch, AppStore, RootState } from "../../app/store";
import { sessionCleared, sessionExpired, sessionReceived, sessionSynchronized } from "./authSlice";
import { authTokenStorage } from "./authTokenStorage";
import { redirectToSso } from "./sso/redirectToSso";
import { unexpectedError } from "../../error-handling/unexpectedError";
import { restoreSession } from "./restoreSession";
import { tryDevSsoSignin } from "./sso/devSso";

export function startAuthStorageSync(store: Pick<AppStore, "dispatch" | "getState">) {
	if (store.getState().auth.token) {
		void store.dispatch(restoreSession());
	} else {
		tryDevSsoSignin(store.dispatch);
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
		effect: (action, listenerApi) => {
			authTokenStorage.clear();
			if (!sessionExpired.match(action)) return;
			if (tryDevSsoSignin(listenerApi.dispatch, action.payload)) return;

			try {
				redirectToSso();
			} catch (error) {
				unexpectedError(error);
			}
		},
	});

	return listener;
}
