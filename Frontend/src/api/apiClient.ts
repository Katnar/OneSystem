import axios, { type InternalAxiosRequestConfig } from "axios";
import type { BrandedString } from "@onesystem/shared/general/Strings/brandedString";
import { store } from "../app/store";
import { selectAuthToken, sessionCleared } from "../features/auth";

type HostUrl = BrandedString<"host url">;

export const API_URL = import.meta.env.VITE_API_HOST as HostUrl;
export type URL = `${HostUrl}/${string}`;

declare module "axios" {
	export interface AxiosRequestConfig {
		skipAuth?: boolean;
	}

	export interface InternalAxiosRequestConfig {
		skipAuth?: boolean;
	}
}

const unauthorizedListeners = new Set<() => void>();

export function onUnauthorized(listener: () => void) {
	unauthorizedListeners.add(listener);
	return () => {
		unauthorizedListeners.delete(listener);
	};
}

export const apiClient = axios.create({ baseURL: API_URL });

apiClient.interceptors.request.use(
	(config: InternalAxiosRequestConfig) => {
		const token = config.skipAuth ? null : selectAuthToken(store.getState());
		if (token) config.headers.Authorization = `Bearer ${token}`;
		return config;
	},
	undefined,
	{ synchronous: true }
);

apiClient.interceptors.response.use(undefined, error => {
	const response = error.response;
	if (response?.status === 401 && !error.config?.skipAuth) {
		store.dispatch(sessionCleared());
		unauthorizedListeners.forEach(listener => listener());
	}
	// Expected API failures remain Result values; unexpected transport failures reject.
	return response?.data?.ok === false ? Promise.resolve(response) : Promise.reject(error);
});
