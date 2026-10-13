import { z } from "zod";

const requiredString = z.string().trim().min(1);

const envSchema = z.object({
	PORT: z.coerce.number().int().min(0).max(65535).default(3000),
	MONGO_URL: requiredString,
	SSO_DECRYPT_KEY_JWT: requiredString,
	ONESYSTEM_SECRET_KEY_JWT: requiredString,
	IS_DEBUGGING_WINDOWS: z
		.enum(["true", "false"])
		.default("false")
		.transform(value => value === "true"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
	const issues = parsedEnv.error.issues
		.map(issue => `${issue.path.join(".") || "environment"}: ${issue.message}`)
		.join("; ");
	throw new Error(`Invalid environment configuration: ${issues}`);
}

export const env = parsedEnv.data;
