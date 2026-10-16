import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import type { AuthUserResponse } from "@onesystem/shared/auth/authResponses";
import type { Result } from "@onesystem/shared/global";
import { createApiClient } from "../../api/apiClient";
import type { RootState } from "../../app/store";
import { unexpectedError } from "../../error-handling/unexpectedError";
import { sessionRestored } from "./authSlice";

export const restoreSession = createAsyncThunk<void, void, { state: RootState }>(
	"auth/restoreSession",
	async (_, { getState, dispatch, signal }) => {
		const sessionAtStart = getState().auth;
		if (!sessionAtStart.token || sessionAtStart.user) return;
		try {
			const apiClient = createApiClient({ getState, dispatch });
			const { data: userResult } = await apiClient.get<Result<AuthUserResponse, string>>("/auth/me", { signal });
			if (signal.aborted || getState().auth.sessionVersion !== sessionAtStart.sessionVersion) return;
			if (!userResult.ok) throw new Error(userResult.error);
			dispatch(sessionRestored({ jwt: sessionAtStart.token, user: userResult.result }));
		} catch (error) {
			if (!axios.isCancel(error)) unexpectedError(error);
			throw error;
		}
	}
);
