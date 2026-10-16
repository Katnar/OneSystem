import { combineReducers } from "@reduxjs/toolkit";
import { authReducer } from "../features/auth";
import { ssoReducer } from "../features/auth/sso/ssoSlice";

// Register each feature's reducer here; store and hook types update automatically.
export const rootReducer = combineReducers({
	auth: authReducer,
	sso: ssoReducer,
});
