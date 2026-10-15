import type { BrandedNumber } from "../general/NumberStrings/numberStrings";
import type { NonEmptyString } from "../general/Strings/nonEmptyString";
import type { AsWireType } from "../global";

export type Percent = BrandedNumber<"percent">;
export type Months = BrandedNumber<"months">;

// Accept API records and explicitly missing inputs.
export type FormulaInput<T> = { [K in keyof T]: AsWireType<T[K]> | null };

export function finiteOrNull<T extends number>(value: number): T | null {
	return Number.isFinite(value) ? (value as T) : null;
}

export function divideOrNull<T extends number>(
	numerator: AsWireType<number | BrandedNumber<NonEmptyString>> | null,
	denominator: AsWireType<number | BrandedNumber<NonEmptyString>> | null
): T | null {
	// AsWireType maps branded numbers as objects; narrow their runtime values before arithmetic.
	if (
		typeof numerator !== "number" ||
		typeof denominator !== "number" ||
		!Number.isFinite(denominator) ||
		denominator <= 0
	) {
		return null;
	}
	return finiteOrNull<T>(numerator / denominator);
}
