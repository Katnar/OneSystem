import axios, { AxiosError, CanceledError, type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import type { BrandedString } from "@onesystem/shared/general/Strings/brandedString";
import type { Result } from "@onesystem/shared/global";
import type { Store } from "@reduxjs/toolkit";
import type { RootState } from "../app/store";
import { sessionExpired } from "../features/auth/authSlice";
import { synchronizeAuthSession } from "../features/auth/synchronizeAuthSession";

type HostUrl = BrandedString<"host url">;

export const API_URL = import.meta.env.VITE_API_HOST as HostUrl;
export type URL = `${HostUrl}/${string}`;

declare module "axios" {
	export interface AxiosRequestConfig {
		skipAuth?: boolean;
	}
}

export function createApiClient(store?: Pick<Store<RootState>, "getState" | "dispatch">): AxiosInstance {
	const apiClient = axios.create({ baseURL: API_URL });
	const sessionVersionByRequest = new WeakMap<InternalAxiosRequestConfig, number>();
	const checkResponseSession = (config: InternalAxiosRequestConfig | undefined, status?: number) => {
		if (!store || !config || config.skipAuth) return;
		const requestSessionVersion = sessionVersionByRequest.get(config);
		if (requestSessionVersion === undefined) return;

		const currentSession = synchronizeAuthSession(store);
		if (requestSessionVersion !== currentSession.sessionVersion) {
			throw new CanceledError("Request session changed");
		}
		if (status === 401) {
			store.dispatch(sessionExpired());
			throw new CanceledError("Session expired");
		}
	};

	apiClient.interceptors.request.use(config => {
		if (store && !config.skipAuth) {
			const session = synchronizeAuthSession(store);
			if (!session.token) throw new AxiosError("Authentication required", "ERR_AUTH_REQUIRED", config);
			sessionVersionByRequest.set(config, session.sessionVersion);
			config.headers.Authorization = `Bearer ${session.token}`;
		}
		return config;
	});

	apiClient.interceptors.response.use(
		response => {
			checkResponseSession(response.config, response.status);
			return response;
		},
		(error: unknown) => {
			if (!axios.isAxiosError<Result<unknown, unknown>>(error)) return Promise.reject(error);
			const response = error.response;
			checkResponseSession(error.config, response?.status);
			// Expected API failures remain Result values; unexpected transport failures reject lol.
			return response?.data?.ok === false ? Promise.resolve(response) : Promise.reject(error);
		}
	);

	return apiClient;
}
