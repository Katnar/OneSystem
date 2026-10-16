import { Router } from "express";
import { signUpEndpoint, ssoSigninEndpoint } from "./authEndpoints";
import { authenticate } from "./authMiddleware";
import { currentUserEndpoint } from "./currentUserEndpoint";

export const authRouter = Router();
authRouter.get("/me", authenticate, currentUserEndpoint);
authRouter.get("/sso_signin", ssoSigninEndpoint);
authRouter.post("/signup", signUpEndpoint);
