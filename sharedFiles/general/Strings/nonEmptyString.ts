import { z } from "zod";
import { Result, unwrap } from "../../global";
// does'nt use the AssertOnly type so it will also identify any string written which is'nt empty as a NonEmptyString at compile time
export type NonEmptyString = `${any}${string}`;
export const nonEmptyStringSchema = z
	.string()
	.trim()
	.min(1)
	.transform((value: string) => value as NonEmptyString) satisfies z.ZodType<NonEmptyString>;
export function tryIntoNonEmptyString(s: string): Result<NonEmptyString, TypeError> {
	if (s.length === 0) {
		{
			return { ok: false, error: new TypeError("Type assertion failure! Expected non empty string!") };
		}
	}
	return { ok: true, result: s as NonEmptyString };
}
export function assertNotEmptyString(s: string): asserts s is NonEmptyString {
	unwrap(tryIntoNonEmptyString(s));
}
