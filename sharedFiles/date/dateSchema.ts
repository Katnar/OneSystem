import { z } from "zod";
import type { DateString } from "../global";

export const dateStringSchema = z
	.string()
	.refine(value => {
		const date = new Date(value);
		return !Number.isNaN(date.getTime()) && date.toISOString() === value;
	})
	.transform(value => value as DateString) satisfies z.ZodType<DateString>;
