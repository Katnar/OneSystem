import { toast } from "react-toastify";
import type { SSOToken } from "@onesystem/shared/auth/authTypes";
import type { AppDispatch } from "../../../app/store";
import { unexpectedError } from "../../../error-handling/unexpectedError";
import { ssoSignin } from "./ssoSignin";

export function tryDevSsoSignin(dispatch: AppDispatch, expiredSsoToken?: SSOToken): boolean {
	if (!import.meta.env.DEV) return false;
	const devSsoToken = import.meta.env.VITE_DEV_MODE_SSO?.trim() as SSOToken | undefined;
	if (!devSsoToken || devSsoToken === expiredSsoToken) return false;

	void dispatch(ssoSignin(devSsoToken)).then(action => {
		if (ssoSignin.fulfilled.match(action) && !action.payload.ok) {
			const error = action.payload.error;
			toast.error(typeof error === "string" ? error : error.message);
		} else if (ssoSignin.rejected.match(action) && !action.meta.aborted) {
			unexpectedError(action.error);
		}
	});
	return true;
}
