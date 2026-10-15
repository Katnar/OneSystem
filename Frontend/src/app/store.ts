import { configureStore } from "@reduxjs/toolkit";
import { authTokenStorage, createAuthListenerMiddleware, initialAuthState } from "../features/auth";
import { rootReducer } from "./rootReducer";

export function createAppStore(preloadedState?: Partial<ReturnType<typeof rootReducer>>) {
	const authListener = createAuthListenerMiddleware();

	return configureStore({
		reducer: rootReducer,
		preloadedState: {
			auth: { ...initialAuthState, token: authTokenStorage.get() },
			...preloadedState,
		},
		middleware: getDefaultMiddleware => getDefaultMiddleware().prepend(authListener.middleware),
		devTools: import.meta.env.DEV,
	});
}

export const store = createAppStore();
export type AppStore = typeof store;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
