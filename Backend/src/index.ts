import { Router } from "express";
import { authRouter } from "./auth/routes/auth";

export const mainRouter = Router();

mainRouter.use("/auth", authRouter);
