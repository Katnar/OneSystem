import jwt from "jsonwebtoken";
import type { Result } from "@onesystem/shared/global";
import { SSO_SIGNIN_ERROR_MESSAGES, type SsoSigninErrorMessage } from "@onesystem/shared/auth/authResponses";
import type { SSOToken } from "@onesystem/shared/auth/authTypes";
import { env } from "../env";
import { rawSsoTokenPayloadSchema, type RawSsoTokenPayload } from "./authSchemas";

export function verifySsoToken(token: SSOToken): Result<RawSsoTokenPayload, SsoSigninErrorMessage> {
	try {
		const parsedPayload = rawSsoTokenPayloadSchema.safeParse(jwt.verify(token, env.SSO_DECRYPT_KEY_JWT));
		return parsedPayload.success
			? { ok: true, result: parsedPayload.data }
			: { ok: false, error: SSO_SIGNIN_ERROR_MESSAGES.BAD_TOKEN };
	} catch (error) {
		return {
			ok: false,
			error:
				error instanceof jwt.TokenExpiredError
					? SSO_SIGNIN_ERROR_MESSAGES.EXPIRED_TOKEN
					: SSO_SIGNIN_ERROR_MESSAGES.BAD_TOKEN,
		};
	}
}
