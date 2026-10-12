import { z } from "zod";
import type { NonEmptyString } from "../../global";
export const nonEmptyStringSchema = z
	.string()
	.trim()
	.min(1)
	.transform((value: string) => value as NonEmptyString) satisfies z.ZodType<NonEmptyString>;
