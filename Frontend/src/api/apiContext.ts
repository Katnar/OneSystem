import type { AxiosRequestConfig } from "axios";
import { createContext, useContext } from "react";
import type { SomeOrDefault } from "@onesystem/shared/global";
import type { URL } from "./apiClient";

export type Resource<T> =
	| { isLoading: true }
	| { isLoading: false; data: T; error?: never }
	| { isLoading: false; error: unknown; data?: never; retry: () => void };
export type NonClashingResult<T> = SomeOrDefault<T, "בקשה זהה כבר בתהליך">;

export type APIContext = {
	get: <T>(url: URL, config?: AxiosRequestConfig) => Resource<T>;
	delete: <T>(url: URL, config?: AxiosRequestConfig) => Promise<NonClashingResult<T>>;
	post: <P, R>(url: URL, body: P, config?: AxiosRequestConfig) => Promise<NonClashingResult<R>>;
	patch: <P, R>(url: URL, body: P, config?: AxiosRequestConfig) => Promise<NonClashingResult<R>>;
};

export const APIContext = createContext<APIContext | undefined>(undefined);

export function useAPI() {
	const context = useContext(APIContext);
	if (!context) {
		throw new Error("useAPI must be used within an APIContextProvider");
	}
	return context;
}
