import type { AxiosRequestConfig } from "axios";
import { createContext, useContext } from "react";
import type { SomeOrDefault } from "@onesystem/shared/global";
import type { URL } from "./apiClient";

export type Resource<T> = { isLoading: true } | { isLoading: false; data: T };
export type NonClashingResult<T> = SomeOrDefault<T, "בקשה זהה כבר בתהליך">;

export type GetOptions<T> = {
	// A changed scope allows a new request while the old one is still pending.
	requestScope?: object;
	// Runs before caching, so features can publish state or reject a stale response.
	onResponse?: (data: T) => void;
};

export type APIContext = {
	get: <T>(url: URL, config?: AxiosRequestConfig, options?: GetOptions<T>) => Resource<T>;
	delete: <T>(url: URL, config?: AxiosRequestConfig) => Promise<NonClashingResult<T>>;
	post: <P, R>(url: URL, body: P, config?: AxiosRequestConfig) => Promise<NonClashingResult<R>>;
	patch: <P, R>(url: URL, body: P, config?: AxiosRequestConfig) => Promise<NonClashingResult<R>>;
};

export const APIContext = createContext<APIContext | undefined>(undefined);

export function useAPI() {
	const context = useContext(APIContext);
	if (!context) throw new Error("useAPI must be used within an APIContextProvider");
	return context;
}
