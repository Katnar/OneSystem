import axios, { type AxiosRequestConfig } from "axios";
import { useMemo, useRef, useState } from "react";
import { useAppSelector, useAppStore } from "../app/hooks";
import { unexpectedError } from "../error-handling/unexpectedError";
import { createApiClient, type URL } from "./apiClient";
import { APIContext, type NonClashingResult, type Resource } from "./apiContext";
import { createRequestKey } from "./requestKey";

type CachedResource = Exclude<Resource<unknown>, { isLoading: true }>;

export function APIContextProvider({ children }: { children: React.ReactNode }) {
	const store = useAppStore();
	const sessionVersion = useAppSelector(state => state.auth.sessionVersion);
	const cacheVersion = useRef(0);
	const [dispatched] = useState(new Set<string>());
	const [cached, setCached] = useState({
		sessionVersion,
		cacheVersion: 0,
		resources: new Map<string, CachedResource>(),
	});
	const api = useMemo(() => createApiClient(store), [store]);

	const clearEntireCache = () => {
		cacheVersion.current += 1;
		setCached({
			sessionVersion: store.getState().auth.sessionVersion,
			cacheVersion: cacheVersion.current,
			resources: new Map(),
		});
	};

	const tryDispatch = async (key: string, fn: () => Promise<void>, readCacheVersion?: number) => {
		// New sessions and reads after cache invalidation must not wait for older requests.
		const pendingKey = `${store.getState().auth.sessionVersion}:${readCacheVersion ?? "mutation"} ${key}`;
		if (!dispatched.has(pendingKey)) {
			dispatched.add(pendingKey);
			try {
				await fn();
			} catch (error) {
				if (!axios.isCancel(error) && !(axios.isAxiosError(error) && error.code === "ERR_AUTH_REQUIRED")) {
					unexpectedError(error);
				}
				throw error;
			} finally {
				dispatched.delete(pendingKey);
			}
			return true;
		}
		return false;
	};

	const get: <T>(url: URL, config?: AxiosRequestConfig) => Resource<T> = <T,>(
		url: URL,
		config?: AxiosRequestConfig
	) => {
		const key = createRequestKey(api, "GET", url, config);
		const sessionVersionAtStart = store.getState().auth.sessionVersion;
		const cacheVersionAtStart = cacheVersion.current;
		const cachedResource =
			cached.sessionVersion === sessionVersionAtStart && cached.cacheVersion === cacheVersionAtStart
				? cached.resources.get(key)
				: undefined;
		// A failed transport has a terminal state and an explicit retry; it cannot drive a render/request loop.
		if (cachedResource && "error" in cachedResource) return cachedResource as Resource<T>;

		const cacheResponse = (resource: CachedResource) => {
			setCached(prev => {
				if (
					sessionVersionAtStart !== store.getState().auth.sessionVersion ||
					cacheVersionAtStart !== cacheVersion.current
				)
					return prev;
				const resources =
					prev.sessionVersion === sessionVersionAtStart && prev.cacheVersion === cacheVersionAtStart
						? prev.resources
						: new Map<string, CachedResource>();
				const previousResource = resources.get(key);
				if (
					previousResource &&
					"data" in previousResource &&
					"data" in resource &&
					JSON.stringify(previousResource.data) === JSON.stringify(resource.data)
				)
					return prev;
				return {
					sessionVersion: sessionVersionAtStart,
					cacheVersion: cacheVersionAtStart,
					resources: new Map(resources).set(key, resource),
				};
			});
		};
		void tryDispatch(
			key,
			async () => {
				const response = await api.get<T>(url, config);
				cacheResponse({ isLoading: false, data: response.data });
			},
			cacheVersionAtStart
		).catch(error => {
			cacheResponse({ isLoading: false, error, retry: clearEntireCache });
		});
		return cachedResource ? (cachedResource as Resource<T>) : { isLoading: true };
	};
	// delete is a reserved word
	const deleteFunc: <T>(url: URL, config?: AxiosRequestConfig) => Promise<NonClashingResult<T>> = async <T,>(
		url: URL,
		config?: AxiosRequestConfig
	) => {
		const key = createRequestKey(api, "DELETE", url, config);
		let respData: T;
		if (
			await tryDispatch(key, async () => {
				respData = (await api.delete<T>(url, config)).data;
			})
		) {
			clearEntireCache();
			return { some: true, value: respData! };
		}
		return { some: false, value: "בקשה זהה כבר בתהליך" };
	};

	const post: <P, R>(url: URL, body: P, config?: AxiosRequestConfig) => Promise<NonClashingResult<R>> = async <P, R>(
		url: URL,
		body: P,
		config?: AxiosRequestConfig
	) => {
		const key = createRequestKey(api, "POST", url, config);
		let respData: R;
		if (
			await tryDispatch(key, async () => {
				respData = (await api.post<R>(url, body, config)).data;
			})
		) {
			clearEntireCache();
			return { some: true, value: respData! };
		}
		return { some: false, value: "בקשה זהה כבר בתהליך" };
	};

	const patch: <P, R>(url: URL, body: P, config?: AxiosRequestConfig) => Promise<NonClashingResult<R>> = async <P, R>(
		url: URL,
		body: P,
		config?: AxiosRequestConfig
	) => {
		const key = createRequestKey(api, "PATCH", url, config);
		let respData: R;
		if (
			await tryDispatch(key, async () => {
				respData = (await api.patch<R>(url, body, config)).data;
			})
		) {
			clearEntireCache();
			return { some: true, value: respData! };
		}
		return { some: false, value: "בקשה זהה כבר בתהליך" };
	};

	return <APIContext.Provider value={{ get, delete: deleteFunc, post, patch }}>{children}</APIContext.Provider>;
}
