import { configureStore } from "@reduxjs/toolkit";
import { createApiClient } from "../api/apiClient";
import { authTokenStorage, createAuthListenerMiddleware, initialAuthState } from "../features/auth";
import { rootReducer } from "./rootReducer";

export function createAppStore(preloadedState?: Partial<RootState>) {
	const authListener = createAuthListenerMiddleware();
	const apiClient = createApiClient();

	return configureStore({
		reducer: rootReducer,
		preloadedState: {
			auth: { ...initialAuthState, token: authTokenStorage.get() },
			...preloadedState,
		},
		middleware: getDefaultMiddleware =>
			getDefaultMiddleware({ thunk: { extraArgument: apiClient } }).prepend(authListener.middleware),
		devTools: import.meta.env.DEV,
	});
}

export const store = createAppStore();
export type AppStore = typeof store;
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = AppStore["dispatch"];
