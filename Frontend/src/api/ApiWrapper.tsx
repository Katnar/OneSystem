import axios, { AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";
import { createContext, useContext, useState } from "react";
import { Result } from "../../../sharedFiles/global";
import { BrandedString } from "@onesystem/shared/general/Strings/brandedString";

type HostUrl = BrandedString<"host url">;

export const API_URL = import.meta.env.VITE_API_HOST as HostUrl;

// this makes it so URLS must start with `${API_URL}/`
export type URL = `${HostUrl}/${string}`;

declare module "axios" {
	export interface AxiosRequestConfig {
		skipAuth?: boolean;
	}
	export interface InternalAxiosRequestConfig {
		skipAuth?: boolean;
	}
}

const api = axios.create({
	baseURL: API_URL,
});

api.interceptors.response.use(undefined, error => {
	const response = error.response;
	if (response.status === 401) {
		alert("TODO: IMPLEMENT LOGOUT ON 401");
	}
	// if the response is in an expected structure like Result, return the response, else throw
	return response?.data?.success === false ? Promise.resolve(response) : Promise.reject(error);
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
	if (!config.skipAuth) {
		alert("TODO: IMPLEMENT TOKEN RETRIEVAL FROM LOCAL STORAGE");
		const token = "CHANGE ME TO THE REAL TOKEN";

		if (token) {
			config.headers = config.headers || {};
			config.headers.Authorization = `Bearer ${token}`;
		}
	}

	return config;
});

export type Resource<T> = { isLoading: true } | { isLoading: false; data: T };
export type APIContext = {
	get: <T>(url: URL, config?: AxiosRequestConfig) => Resource<T>;
	delete: <T>(url: URL, config?: AxiosRequestConfig) => Promise<Result<T, "בקשה זהה כבר בתהליך">>;
	post: <P, R>(url: URL, body: P, config?: AxiosRequestConfig) => Promise<Result<R, "בקשה זהה כבר בתהליך">>;
	patch: <P, R>(url: URL, body: P, config?: AxiosRequestConfig) => Promise<Result<R, "בקשה זהה כבר בתהליך">>;
};

type DispatchKey = `${"GET" | "DELETE" | "POST" | "PATCH"} ${URL}`;

const APIContext = createContext<APIContext>({} as APIContext);

export function APIContextProvider({ children }: { children: React.ReactNode }) {
	const [dispatched] = useState<Set<DispatchKey>>(new Set());
	const [cached, setCached] = useState<Map<DispatchKey, any>>(new Map());

	const get: <T>(url: URL, config?: AxiosRequestConfig) => Resource<T> = <T,>(
		url: URL,
		config?: AxiosRequestConfig
	) => {
		const key: DispatchKey = `GET ${url}`;
		(async () => {
			if (!dispatched.has(key)) {
				dispatched.add(key);
				try {
					const response = await api.get<T>(url, config);
					setCached(prev => new Map(prev).set(key, response.data));
				} finally {
					dispatched.delete(key);
				}
			}
		})();
		return cached.has(key) ? { isLoading: false, data: cached.get(key) } : { isLoading: true };
	};
	// delete is a reserved word
	const deleteFunc: <T>(url: URL, config?: AxiosRequestConfig) => Promise<Result<T, "בקשה זהה כבר בתהליך">> = async <
		T,
	>(
		url: URL,
		config?: AxiosRequestConfig
	) => {
		const key: DispatchKey = `DELETE ${url}`;
		if (!dispatched.has(key)) {
			dispatched.add(key);
			try {
				const resp = await api.delete<T>(url, config);
				dispatched.delete(key);
				return { ok: true, result: resp.data };
			} finally {
				dispatched.delete(key);
			}
		}
		return { ok: false, error: "בקשה זהה כבר בתהליך" };
	};
	const post: <P, R>(
		url: URL,
		body: P,
		config?: AxiosRequestConfig
	) => Promise<Result<R, "בקשה זהה כבר בתהליך">> = async <P, R>(url: URL, body: P, config?: AxiosRequestConfig) => {
		const key: DispatchKey = `POST ${url}`;
		if (!dispatched.has(key)) {
			dispatched.add(key);
			try {
				const resp = await api.post<R>(url, body, config);
				dispatched.delete(key);
				return { ok: true, result: resp.data };
			} finally {
				dispatched.delete(key);
			}
		}
		return { ok: false, error: "בקשה זהה כבר בתהליך" };
	};
	const patch: <P, R>(
		url: URL,
		body: P,
		config?: AxiosRequestConfig
	) => Promise<Result<R, "בקשה זהה כבר בתהליך">> = async <P, R>(url: URL, body: P, config?: AxiosRequestConfig) => {
		const key: DispatchKey = `PATCH ${url}`;
		if (!dispatched.has(key)) {
			dispatched.add(key);
			try {
				const resp = await api.patch<R>(url, body, config);
				dispatched.delete(key);
				return { ok: true, result: resp.data };
			} finally {
				dispatched.delete(key);
			}
		}
		return { ok: false, error: "בקשה זהה כבר בתהליך" };
	};

	return <APIContext.Provider value={{ get, delete: deleteFunc, post, patch }}>{children}</APIContext.Provider>;
}

export function useAPI() {
	const context = useContext(APIContext);
	if (!context) {
		throw new Error("useAPI must be used within an APIContextProvider");
	}
	return context;
}
