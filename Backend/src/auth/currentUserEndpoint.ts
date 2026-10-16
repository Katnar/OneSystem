import type { Request, Response } from "express";
import type { Result } from "@onesystem/shared/global";
import type { AuthUserResponse } from "@onesystem/shared/auth/authResponses";
import type { Locals } from "./authMiddleware";
import { toAuthUserResponse } from "./toAuthUser";

export function currentUserEndpoint(_req: Request, res: Response<Result<AuthUserResponse, string>, Locals>): void {
	res.json({ ok: true, result: toAuthUserResponse(res.locals.user) });
}
