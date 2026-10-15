// @vitest-environment jsdom
import { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { act, StrictMode, useEffect } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Provider } from "react-redux";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { SsoSigninSuccessResponse } from "@onesystem/shared/auth/authResponses";
import type { JWTToken, SSOToken } from "@onesystem/shared/auth/authTypes";
import { API_URL, APIContextProvider, useAPI } from "../../api";
import { apiClient } from "../../api/apiClient";
import { store } from "../../app/store";
import { unexpectedError } from "../../error-handling/unexpectedError";
import { sessionCleared, sessionReceived } from "../auth";
import { useSso } from "./useSso";

vi.mock("../../error-handling/unexpectedError", () => ({ unexpectedError: vi.fn() }));

const session = {
	jwt: "test-jwt",
	user: {
		personalNumber: "1234567",
		firstName: "Test",
		lastName: "User",
		mador: "צוות פיתוח",
		meshekDescription: null,
		approvalStatus: true,
		signUpDate: "2026-10-15T00:00:00.000Z",
		role: "מנהל מערכת",
	},
} as SsoSigninSuccessResponse;
const ssoToken = "sso-token" as SSOToken;
const originalAdapter = apiClient.defaults.adapter;

let root: Root;
let api: ReturnType<typeof useAPI>;
let sso: ReturnType<typeof useSso>;
let requests: {
	config: InternalAxiosRequestConfig;
	respond: (data: unknown, status?: number) => void;
}[];

function Probe() {
	const sharedApi = useAPI();
	const ssoApi = useSso();
	useEffect(() => {
		api = sharedApi;
		sso = ssoApi;
	});
	return null;
}

beforeEach(async () => {
	vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
	vi.mocked(unexpectedError).mockClear();
	localStorage.clear();
	store.dispatch(sessionCleared());
	requests = [];
	apiClient.defaults.adapter = config =>
		new Promise((resolve, reject) => {
			requests.push({
				config,
				respond: (data, status = 200) => {
					const response = { config, data, status, statusText: "", headers: {} };
					if (status >= 400) {
						reject(
							new AxiosError("Request failed", AxiosError.ERR_BAD_REQUEST, config, undefined, response)
						);
					} else {
						resolve(response);
					}
				},
			});
		});
	root = createRoot(document.createElement("div"));
	await act(async () => {
		root.render(
			<StrictMode>
				<Provider store={store}>
					<APIContextProvider>
						<Probe />
					</APIContextProvider>
				</Provider>
			</StrictMode>
		);
	});
});

afterEach(async () => {
	await act(async () => root.unmount());
	apiClient.defaults.adapter = originalAdapter;
	vi.unstubAllGlobals();
});

async function respond(index: number, data: unknown, status = 200) {
	await act(async () => requests[index].respond(data, status));
}

it("publishes SSO success, caches the result, and authenticates subsequent requests", async () => {
	expect(sso.ssoSignin(ssoToken)).toEqual({ isLoading: true });
	expect(requests[0].config.url).toBe(`${API_URL}/auth/sso_signin`);
	expect(requests[0].config.headers.Authorization).toBe(`Bearer ${ssoToken}`);

	const result = { ok: true, result: session };
	await respond(0, result);
	expect(store.getState().auth).toEqual({ token: session.jwt, user: session.user });
	expect(localStorage.getItem("onesystem.authToken")).toBe(session.jwt);
	expect(sso.ssoSignin(ssoToken)).toEqual({ isLoading: false, data: result });

	api.get(`${API_URL}/users/pending`);
	expect(requests.at(-1)?.config.headers.Authorization).toBe(`Bearer ${session.jwt}`);
});

it("does not publish SSO sessions from the shared API alone", async () => {
	api.get(`${API_URL}/auth/sso_signin`, { skipAuth: true });
	await respond(0, { ok: true, result: session });
	expect(store.getState().auth.token).toBeNull();
});

it("returns expected SSO failures without clearing the current session", async () => {
	store.dispatch(sessionReceived(session));
	sso.ssoSignin(ssoToken);
	const result = { ok: false, error: "Invalid SSO token" };
	await respond(0, result, 401);

	expect(store.getState().auth.token).toBe(session.jwt);
	expect(localStorage.getItem("onesystem.authToken")).toBe(session.jwt);
	expect(sso.ssoSignin(ssoToken)).toEqual({ isLoading: false, data: result });
	expect(unexpectedError).not.toHaveBeenCalled();
});

it("ignores a sign-in completed after logout without unblocking a pending replacement", async () => {
	sso.ssoSignin(ssoToken);
	store.dispatch(sessionCleared());
	sso.ssoSignin("replacement-token" as SSOToken);
	expect(requests).toHaveLength(2);

	await respond(0, { ok: true, result: session });
	expect(store.getState().auth.token).toBeNull();
	expect(localStorage.getItem("onesystem.authToken")).toBeNull();
	expect(sso.ssoSignin("replacement-token" as SSOToken)).toEqual({ isLoading: true });
	expect(requests).toHaveLength(2);
	expect(unexpectedError).not.toHaveBeenCalled();

	const replacement = { ...session, jwt: "replacement-jwt" as JWTToken };
	await respond(1, { ok: true, result: replacement });
	expect(store.getState().auth.token).toBe(replacement.jwt);
});

it("does not overwrite a newer session with a pending sign-in", async () => {
	sso.ssoSignin(ssoToken);
	const replacement = { ...session, jwt: "replacement-jwt" as JWTToken };
	store.dispatch(sessionReceived(replacement));
	await respond(0, { ok: true, result: session });

	expect(store.getState().auth.token).toBe(replacement.jwt);
	expect(sso.ssoSignin(ssoToken)).toEqual({ isLoading: true });
	expect(unexpectedError).not.toHaveBeenCalled();
});

it("clears auth and the shared cache after a protected 401", async () => {
	store.dispatch(sessionReceived(session));
	api.get(`${API_URL}/users/pending`);
	await respond(0, [session.user]);

	const pending = api.delete(`${API_URL}/users/pending`);
	const result = { ok: false, error: "Unauthorized" };
	await respond(1, result, 401);
	expect(await pending).toEqual({ some: true, value: result });
	expect(store.getState().auth.token).toBeNull();
	expect(localStorage.getItem("onesystem.authToken")).toBeNull();
	expect(api.get(`${API_URL}/users/pending`)).toEqual({ isLoading: true });
});

it("submits signup through the wrapper without attaching the current JWT", async () => {
	store.dispatch(sessionReceived(session));
	const body = { ssoToken, user: session.user };
	const pending = sso.signUp(body);
	expect(requests[0].config.url).toBe(`${API_URL}/auth/signup`);
	expect(requests[0].config.method).toBe("post");
	expect(JSON.parse(requests[0].config.data)).toEqual(body);
	expect(requests[0].config.headers.Authorization).toBeUndefined();

	const result = { ok: false, error: "Invalid signup" };
	await respond(0, result, 401);
	expect(await pending).toEqual({ some: true, value: result });
	expect(store.getState().auth.token).toBe(session.jwt);
});
