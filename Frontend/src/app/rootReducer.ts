import { combineReducers } from "@reduxjs/toolkit";
import { authReducer } from "../features/auth";

// Register each feature's reducer here; store and hook types update automatically.
export const rootReducer = combineReducers({
	auth: authReducer,
});
