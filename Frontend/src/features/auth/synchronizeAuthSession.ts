import type { Store } from "@reduxjs/toolkit";
import type { RootState } from "../../app/store";
import { sessionSynchronized } from "./authSlice";
import { authTokenStorage } from "./authTokenStorage";

// Storage events can arrive after an HTTP response. Reconcile before using that response.
export function synchronizeAuthSession(store: Pick<Store<RootState>, "getState" | "dispatch">) {
	const currentSession = store.getState().auth;
	const storedToken = authTokenStorage.get(currentSession.token);
	if (storedToken !== currentSession.token) store.dispatch(sessionSynchronized(storedToken));
	return store.getState().auth;
}
