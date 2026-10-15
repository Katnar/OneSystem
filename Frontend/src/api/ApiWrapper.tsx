import axios, { type AxiosRequestConfig } from "axios";
import { useEffect, useState } from "react";
import { unexpectedError } from "../error-handling/unexpectedError";
import { apiClient, onUnauthorized, type URL } from "./apiClient";
import { APIContext, type GetOptions, type NonClashingResult, type Resource } from "./apiContext";

type DispatchKey = `${"GET" | "DELETE" | "POST" | "PATCH"} ${URL}`;

export function APIContextProvider({ children }: { children: React.ReactNode }) {
	const [dispatched] = useState<Map<DispatchKey, object | undefined>>(new Map());
	const [cached, setCached] = useState<Map<DispatchKey, unknown>>(new Map());

	useEffect(() => {
		return onUnauthorized(() => setCached(new Map()));
	}, []);

	const tryDispatch = async (key: DispatchKey, fn: () => Promise<void>, scope?: object) => {
		if (!dispatched.has(key) || dispatched.get(key) !== scope) {
			dispatched.set(key, scope);
			try {
				await fn();
			} catch (error) {
				if (!axios.isCancel(error)) unexpectedError(error);
				return false;
			} finally {
				// An older request must not release its replacement's pending marker.
				if (dispatched.get(key) === scope) dispatched.delete(key);
			}
			return true;
		}
		return false;
	};

	const get = <T,>(url: URL, config?: AxiosRequestConfig, options?: GetOptions<T>): Resource<T> => {
		const key: DispatchKey = `GET ${url}`;
		tryDispatch(
			key,
			async () => {
				const response = await apiClient.get<T>(url, config);
				options?.onResponse?.(response.data);
				setCached(prev => {
					if (JSON.stringify(prev.get(key) ?? {}) === JSON.stringify(response.data)) {
						return prev;
					}
					return new Map(prev).set(key, response.data);
				});
			},
			options?.requestScope
		);
		return cached.has(key) ? { isLoading: false, data: cached.get(key) as T } : { isLoading: true };
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
				respData = (await apiClient.delete<T>(url, config)).data;
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
				respData = (await apiClient.post<R>(url, body, config)).data;
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
				respData = (await apiClient.patch<R>(url, body, config)).data;
			})
		) {
			return { some: true, value: respData! };
		}
		return { some: false, value: "בקשה זהה כבר בתהליך" };
	};

	return <APIContext.Provider value={{ get, delete: deleteFunc, post, patch }}>{children}</APIContext.Provider>;
}
