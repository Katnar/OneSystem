import { Router } from "express";
import { authRouter } from "./auth/authRouter";
import { usersRouter } from "./users/usersRouter";

export const mainRouter = Router();

mainRouter.use("/auth", authRouter);
mainRouter.use("/users/", usersRouter);
