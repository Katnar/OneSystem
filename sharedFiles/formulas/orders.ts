import type { DateString } from "../general/Date/dateSchema";
import type { MoneyILS } from "../general/NumberStrings/numberStrings";
import { OrderType, type Order } from "../orders";
import { divideOrNull, finiteOrNull, type FormulaInput, type Months, type Percent } from "./common";
import { calcElapsedOrderMonths, calcOrderCalculationDate } from "./dates";

type GlobalOrder = Extract<Order, { type: typeof OrderType.GLOBAL }>;

export type OrderUsageFormulaInput = FormulaInput<Pick<Order, "orderValueInclVat" | "balance">>;
export type OrderMonthlyAverageFormulaInput = OrderUsageFormulaInput &
	FormulaInput<Pick<Order, "startDate" | "endDate">>;
export type TimeAndMaterialOrderBreathingLengthFormulaInput = Pick<OrderUsageFormulaInput, "balance"> & {
	monthlyAverage: MoneyILS | null;
};
export type GlobalOrderBreathingLengthFormulaInput = FormulaInput<Pick<GlobalOrder, "balance" | "lastReceiptAmount">>;
export type OrderBreathingLengthFormulaInput =
	| (Pick<GlobalOrder, "type"> & GlobalOrderBreathingLengthFormulaInput)
	| (Pick<Exclude<Order, GlobalOrder>, "type"> & OrderMonthlyAverageFormulaInput);

export function calcUsedOrderAmount({ orderValueInclVat, balance }: OrderUsageFormulaInput): MoneyILS | null {
	return orderValueInclVat === null || balance === null
		? null
		: (finiteOrNull(orderValueInclVat - balance) as MoneyILS | null);
}

export function calcOrderPercentUsage(order: OrderUsageFormulaInput): Percent | null {
	const ratio = divideOrNull(calcUsedOrderAmount(order), order.orderValueInclVat);
	return ratio === null ? null : (finiteOrNull(ratio * 100) as Percent | null);
}

export function calcMonthlyAverage(
	order: OrderMonthlyAverageFormulaInput,
	currentDate: Date | DateString = new Date()
): MoneyILS | null {
	const calculationDate = calcOrderCalculationDate(currentDate, order.endDate);
	const elapsedMonths = calcElapsedOrderMonths(order.startDate, calculationDate);
	return divideOrNull(calcUsedOrderAmount(order), elapsedMonths) as MoneyILS | null;
}

export function calcTimeAndMaterialOrderBreathingLength({
	balance,
	monthlyAverage,
}: TimeAndMaterialOrderBreathingLengthFormulaInput): Months | null {
	return divideOrNull(balance, monthlyAverage) as Months | null;
}

export function calcGlobalOrderBreathingLength({
	balance,
	lastReceiptAmount,
}: GlobalOrderBreathingLengthFormulaInput): Months | null {
	return divideOrNull(balance, lastReceiptAmount) as Months | null;
}

export function calcOrderBreathingLength(
	order: OrderBreathingLengthFormulaInput,
	currentDate: Date | DateString = new Date()
): Months | null {
	if (order.type === OrderType.GLOBAL) {
		return calcGlobalOrderBreathingLength(order);
	}
	return calcTimeAndMaterialOrderBreathingLength({
		balance: order.balance,
		monthlyAverage: calcMonthlyAverage(order, currentDate),
	});
}
