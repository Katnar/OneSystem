import type { BrandedNumber } from "../general/NumberStrings/numberStrings";
import type { AsWireType } from "../global";

export type Percent = BrandedNumber<"percent">;
export type Months = BrandedNumber<"months">;

// Accept domain records, API records, and explicitly missing inputs.
export type FormulaInput<T> = { [K in keyof T]: T[K] | AsWireType<T[K]> | null };

export function finiteOrNull(value: number): number | null {
	return Number.isFinite(value) ? value : null;
}

export function divideOrNull(numerator: number | null, denominator: number | null): number | null {
	if (numerator === null || denominator === null || !Number.isFinite(denominator) || denominator <= 0) {
		return null;
	}
	return finiteOrNull(numerator / denominator);
}
