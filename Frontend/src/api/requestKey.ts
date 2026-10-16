import type { AxiosInstance, AxiosRequestConfig } from "axios";
import type { URL } from "./apiClient";

// Functions, abort signals and other non-JSON options must not collapse to the same key.
const objectIds = new WeakMap<object, number>();
let nextObjectId = 0;

export function createRequestKey(
	apiClient: AxiosInstance,
	method: string,
	url: URL,
	config?: AxiosRequestConfig
): string {
	const options = { ...config };
	delete options.params;
	delete options.paramsSerializer;
	const serializedOptions = JSON.stringify(options, (_key, value: unknown) => {
		if (value === null || (typeof value !== "object" && typeof value !== "function")) return value;
		if (Array.isArray(value)) return value;
		if (Object.getPrototypeOf(value) === Object.prototype) {
			return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)));
		}
		if (!objectIds.has(value)) objectIds.set(value, ++nextObjectId);
		return { requestOptionIdentity: objectIds.get(value) };
	});
	return `${method} ${apiClient.getUri({ ...config, url })} ${serializedOptions}`;
}
