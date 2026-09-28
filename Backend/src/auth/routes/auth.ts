import { Router } from "express";
import { rolesEndpoint, signUpEndpoint, ssoSigninEndpoint } from "../controllers/authenticationController";

export const authRouter = Router();
authRouter.get("/sso_signin", ssoSigninEndpoint);
authRouter.post("/signup", signUpEndpoint);
authRouter.get("/roles", rolesEndpoint);
// Mock units until the organization controller exists.
authRouter.get("/units/:level", (_req, res) => { res.json({ units: [] }); });
