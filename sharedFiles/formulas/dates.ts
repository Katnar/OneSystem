import type { DateString } from "../general/Date/dateSchema";
import { divideOrNull, type Months } from "./common";

export const AverageMonthInDays = 30;

export function calcOrderCalculationDate(
	currentDate: Date | DateString | null,
	endDate: Date | DateString | null
): DateString | null {
	if (currentDate === null || endDate === null) {
		return null;
	}
	const timestamp = Math.min(new Date(currentDate).getTime(), new Date(endDate).getTime());
	return Number.isFinite(timestamp) ? (new Date(timestamp).toISOString() as DateString) : null;
}

export function calcElapsedOrderMonths(
	startDate: Date | DateString | null,
	calculationDate: Date | DateString | null
): Months | null {
	if (startDate === null || calculationDate === null) {
		return null;
	}
	const elapsedDays = (new Date(calculationDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24);
	return divideOrNull<Months>(elapsedDays, AverageMonthInDays);
}
