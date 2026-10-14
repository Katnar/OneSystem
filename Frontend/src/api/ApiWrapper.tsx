import axios, { AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";
import { createContext, useContext, useState } from "react";
import { SomeOrDefault } from "../../../sharedFiles/global";
import { BrandedString } from "@onesystem/shared/general/Strings/brandedString";
import { unexpectedError } from "../error-handling/unexpectedError";

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
// this wont be guaranteed to call a rerender but thats fine 
let clearEntireCache = () => {console.info("attempted to clear cache before it's initialized");};

const api = axios.create({
	baseURL: API_URL,
});

api.interceptors.response.use(undefined, error => {
	const response = error.response;
	if (response.status === 401) {
		clearEntireCache();
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
export type NonClashingResult<T> = SomeOrDefault<T, "בקשה זהה כבר בתהליך">;
export type APIContext = {
	get: <T>(url: URL, config?: AxiosRequestConfig) => Resource<T>;
	delete: <T>(url: URL, config?: AxiosRequestConfig) => Promise<NonClashingResult<T>>;
	post: <P, R>(url: URL, body: P, config?: AxiosRequestConfig) => Promise<NonClashingResult<R>>;
	patch: <P, R>(url: URL, body: P, config?: AxiosRequestConfig) => Promise<NonClashingResult<R>>;
};

type DispatchKey = `${"GET" | "DELETE" | "POST" | "PATCH"} ${URL}`;

const APIContext = createContext<APIContext>({} as APIContext);

export function APIContextProvider({ children }: { children: React.ReactNode }) {
	const [dispatched] = useState<Set<DispatchKey>>(new Set());
	const [cached, setCached] = useState<Map<DispatchKey, any>>(new Map());

	clearEntireCache = () => {
		setCached(new Map());
	};
	
	const tryDispatch = async (key: DispatchKey, fn: () => Promise<void>) => {
		if (!dispatched.has(key)) {
			dispatched.add(key);
			try {
				await fn();
			} catch (error) {
				unexpectedError(error);
			} finally {
				dispatched.delete(key);
			}
			return true;
		}
		return false;
	};

	const get: <T>(url: URL, config?: AxiosRequestConfig) => Resource<T> = <T,>(
		url: URL,
		config?: AxiosRequestConfig
	) => {
		const key: DispatchKey = `GET ${url}`;
		tryDispatch(key, async () => {
			const response = await api.get<T>(url, config);
			setCached(prev => {
				if (JSON.stringify(prev.get(key) ?? {}) === JSON.stringify(response.data)) {
					return prev;
				}
				return new Map(prev).set(key, response.data);
			});
		});
		return cached.has(key) ? { isLoading: false, data: cached.get(key) } : { isLoading: true };
	};
	// delete is a reserved word
	const deleteFunc: <T>(url: URL, config?: AxiosRequestConfig) => Promise<NonClashingResult<T>> = async <T,>(
		url: URL,
		config?: AxiosRequestConfig
	) => {
		const key: DispatchKey = `DELETE ${url}`;
		let respData: T;
		if (
			await tryDispatch(key, async () => {
				respData = (await api.delete<T>(url, config)).data;
			})
		) {
			return { some: true, value: respData! };
		}
		return { some: false, value: "בקשה זהה כבר בתהליך" };
	};

	const post: <P, R>(url: URL, body: P, config?: AxiosRequestConfig) => Promise<NonClashingResult<R>> = async <P, R>(
		url: URL,
		body: P,
		config?: AxiosRequestConfig
	) => {
		const key: DispatchKey = `POST ${url}`;
		let respData: R;
		if (
			await tryDispatch(key, async () => {
				respData = (await api.post<R>(url, body, config)).data;
			})
		) {
			return { some: true, value: respData! };
		}
		return { some: false, value: "בקשה זהה כבר בתהליך" };
	};

	const patch: <P, R>(url: URL, body: P, config?: AxiosRequestConfig) => Promise<NonClashingResult<R>> = async <P, R>(
		url: URL,
		body: P,
		config?: AxiosRequestConfig
	) => {
		const key: DispatchKey = `PATCH ${url}`;
		let respData: R;
		if (
			await tryDispatch(key, async () => {
				respData = (await api.patch<R>(url, body, config)).data;
			})
		) {
			return { some: true, value: respData! };
		}
		return { some: false, value: "בקשה זהה כבר בתהליך" };
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
