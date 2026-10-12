import { z } from "zod";
<<<<<<<< HEAD:sharedFiles/general/Date/dateSchema.ts
import { BrandedString } from "../Strings/brandedString";
export type DateString = BrandedString<"date string">;
========
import type { DateString } from "../../global";

>>>>>>>> edcdf50 (FUCK YOU):sharedFiles/general/date/dateSchema.ts
export const dateStringSchema = z
	.string()
	.refine(value => {
		const date = new Date(value);
		return !Number.isNaN(date.getTime()) && date.toISOString() === value;
	})
	.transform(value => value as DateString) satisfies z.ZodType<DateString>;
