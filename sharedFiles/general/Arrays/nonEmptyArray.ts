import { Result, unwrap } from "../../global";

// doesnt use the AssertOnly type so it will also identify any array which isnt empty as a NonEmptyArray at compile time
export type NonEmptyArray<T> = [T, ...T[]];

export function tryIntoNonEmptyArr<T>(arr: T[]): Result<NonEmptyArray<T>, TypeError> {
	if (arr.length === 0) {
		return { ok: false, error: new TypeError("Type assertion failure! Expected non empty array!") };
	}
	return { ok: true, result: arr as NonEmptyArray<T> };
}
export function assertNotEmptyArr<T>(arr: T[]): asserts arr is NonEmptyArray<T> {
	unwrap(tryIntoNonEmptyArr(arr));
}
