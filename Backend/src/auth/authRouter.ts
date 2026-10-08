import { Router } from "express";
import { signUpEndpoint, ssoSigninEndpoint } from "./authEndpoints";

export const authRouter = Router();
authRouter.get("/sso_signin", ssoSigninEndpoint);
authRouter.post("/signup", signUpEndpoint);
