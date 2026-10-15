import type { JWTToken } from "@onesystem/shared/auth/authTypes";

const AUTH_TOKEN_KEY = "onesystem.authToken";

export const authTokenStorage = {
	get(): JWTToken | null {
		try {
			return (localStorage.getItem(AUTH_TOKEN_KEY) as JWTToken | null) || null;
		} catch {
			return null;
		}
	},
	set(token: JWTToken) {
		try {
			localStorage.setItem(AUTH_TOKEN_KEY, token);
		} catch {
			// The current session can still work when browser storage is unavailable.
		}
	},
	clear() {
		try {
			localStorage.removeItem(AUTH_TOKEN_KEY);
		} catch {
			// Clearing the in-memory session must not depend on browser storage.
		}
	},
	subscribe(onChange: (token: JWTToken | null) => void) {
		const onStorage = (event: StorageEvent) => {
			if (event.key !== AUTH_TOKEN_KEY && event.key !== null) return;

			try {
				if (event.storageArea !== localStorage) return;
				// Read the latest value: another tab may have written again since this event was queued.
				onChange((localStorage.getItem(AUTH_TOKEN_KEY) as JWTToken | null) || null);
			} catch {
				// Keep the in-memory session when browser storage becomes unavailable.
			}
		};

		window.addEventListener("storage", onStorage);
		return () => window.removeEventListener("storage", onStorage);
	},
};
