import { combineReducers } from "@reduxjs/toolkit";
import { authReducer } from "../features/auth";
import { ssoReducer } from "../features/auth/sso/ssoSlice";

export const rootReducer = combineReducers({
	auth: authReducer,
	sso: ssoReducer,
});
