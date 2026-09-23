import "dotenv/config";
import dns from "node:dns";
import type { Server } from "node:http";
import express, { type ErrorRequestHandler } from "express";
import cors from "cors";
import morgan from "morgan";
import mongoose from "mongoose";
import { z } from "zod";
import { mainRouter } from "./index";
const config = z.object({
	PORT: z.coerce.number().int().min(0).max(65535).default(3000),
	MAX_FILE_SIZE_MB: z.coerce.number().positive().default(10),
}).parse(process.env);

export const app = express();

app.use(cors());
app.use(morgan((tokens, req, res) => [
	`[${new Date().toLocaleString("en-IL", { timeZone: "Asia/Jerusalem" })}]`,
	tokens.method(req, res),
	req.url?.split("?")[0],
	"- Status:", tokens.status(req, res),
	"- Time:", tokens["response-time"](req, res), "ms",
].join(" ")));

app.use(express.json({ limit: `${config.MAX_FILE_SIZE_MB}mb` }));
app.use(express.urlencoded({ extended: true, limit: `${config.MAX_FILE_SIZE_MB}mb` }));
app.use(mainRouter);

app.use((_req, res) => {
	res.status(404).json({ error: "Route not found!" });
});

const errorHandler: ErrorRequestHandler = (err: unknown, _req, res, next): void => {
	if (res.headersSent) {
		next(err);
		return;
	}
	const status = z.object({ status: z.number().int().min(400).max(499) }).safeParse(err);
	if (status.success) {
		res.status(status.data.status).json({ error: "Invalid request" });
		return;
	}
	console.error("Unhandled error:", err instanceof Error ? err.message : "Unknown error");
	res.status(500).json({ error: "שגיאת שרת. נסה שוב מאוחר יותר." });
};
app.use(errorHandler);

export async function startServer(): Promise<Server> {
	const mongoUrl = process.env.MONGO_URL?.trim();
	if (!mongoUrl) {
		throw new Error("MONGO_URL is required. Set it in Backend/.env before starting the server.");
	}
	if (process.env.IS_DEBUGGING_WINDOWS === "true") {
		dns.setServers(["8.8.8.8", "1.1.1.1"]);
	}

	try {
		await mongoose.connect(mongoUrl, { serverSelectionTimeoutMS: 10000 });
		return await new Promise<Server>((resolve, reject) => {
			const server = app.listen(config.PORT);
			server.once("error", reject);
			server.once("listening", () => {
				server.off("error", reject);
				const address = server.address();
				if (address && typeof address !== "string") {
					console.log(`Server listening on http://localhost:${address.port}`);
				}
				resolve(server);
			});
		});
	} catch (error) {
		await mongoose.disconnect();
		throw error;
	}
}

if (require.main === module) {
	startServer().catch((error: unknown) => {
		console.error("Failed to start server:", error instanceof Error ? error.message : "Unknown error");
	});
}
