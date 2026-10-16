import type { JWTToken } from "@onesystem/shared/auth/authTypes";

const AUTH_TOKEN_KEY = "onesystem.authToken";
let lastPersistedToken: JWTToken | null = null;
let hasStorageWriteFailed = false;

function writeToken(token: JWTToken | null) {
	try {
		if (token === null) localStorage.removeItem(AUTH_TOKEN_KEY);
		else localStorage.setItem(AUTH_TOKEN_KEY, token);
		lastPersistedToken = token;
		hasStorageWriteFailed = false;
	} catch {
		// The Redux session must still work when browser storage cannot be changed.
		hasStorageWriteFailed = true;
	}
}

export const authTokenStorage = {
	get(inMemoryToken: JWTToken | null = null): JWTToken | null {
		try {
			const storedToken = (localStorage.getItem(AUTH_TOKEN_KEY) as JWTToken | null) || null;
			// A failed write must not revive the old persisted session. A newer external value still wins.
			if (hasStorageWriteFailed && storedToken === lastPersistedToken) return inMemoryToken;
			lastPersistedToken = storedToken;
			hasStorageWriteFailed = false;
			return storedToken;
		} catch {
			return inMemoryToken;
		}
	},
	set(token: JWTToken) {
		writeToken(token);
	},
	clear() {
		writeToken(null);
	},
	subscribe(onTokenChange: (token: JWTToken | null) => void) {
		const handleStorageChange = (event: StorageEvent) => {
			if (event.key !== AUTH_TOKEN_KEY && event.key !== null) return;

			try {
				if (event.storageArea !== localStorage) return;
				// Read the latest value: another tab may have written again since this event was queued.
				lastPersistedToken = (localStorage.getItem(AUTH_TOKEN_KEY) as JWTToken | null) || null;
				hasStorageWriteFailed = false;
				onTokenChange(lastPersistedToken);
			} catch {
				// Keep the in-memory session when browser storage becomes unavailable.
			}
		};

		window.addEventListener("storage", handleStorageChange);
		return () => window.removeEventListener("storage", handleStorageChange);
	},
};
