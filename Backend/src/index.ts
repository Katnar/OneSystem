import { Router } from "express";
import { authRouter } from "./auth/authRouter";

export const mainRouter = Router();

mainRouter.use("/auth", authRouter);
