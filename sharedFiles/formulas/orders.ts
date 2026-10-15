import type { DateString } from "../general/Date/dateSchema";
import type { MoneyILS } from "../general/NumberStrings/numberStrings";
import { OrderType, type Order } from "../orders";
import { divideOrNull, finiteOrNull, type FormulaInput, type Months, type Percent } from "./common";
import { calcElapsedOrderMonths, calcOrderCalculationDate } from "./dates";

type GlobalOrder = Extract<Order, { type: typeof OrderType.GLOBAL }>;

export type OrderUsageFormulaInput = FormulaInput<Pick<Order, "orderValueInclVat" | "balance">>;
export type OrderMonthlyAverageFormulaInput = OrderUsageFormulaInput &
	FormulaInput<Pick<Order, "startDate" | "endDate">>;
export type TimeAndMaterialOrderBreathingLengthFormulaInput = Pick<OrderUsageFormulaInput, "balance"> &
	FormulaInput<{ monthlyAverage: MoneyILS }>;
export type GlobalOrderBreathingLengthFormulaInput = FormulaInput<Pick<GlobalOrder, "balance" | "lastReceiptAmount">>;
export type OrderBreathingLengthFormulaInput =
	| (Pick<GlobalOrder, "type"> & GlobalOrderBreathingLengthFormulaInput)
	| (Pick<Exclude<Order, GlobalOrder>, "type"> & OrderMonthlyAverageFormulaInput);

export function calcUsedOrderAmount({ orderValueInclVat, balance }: OrderUsageFormulaInput): MoneyILS | null {
	return typeof orderValueInclVat !== "number" || typeof balance !== "number"
		? null
		: finiteOrNull<MoneyILS>(orderValueInclVat - balance);
}

export function calcOrderPercentUsage(order: OrderUsageFormulaInput): Percent | null {
	const ratio = divideOrNull(calcUsedOrderAmount(order), order.orderValueInclVat);
	return ratio === null ? null : finiteOrNull<Percent>(ratio * 100);
}

export function calcMonthlyAverage(
	order: OrderMonthlyAverageFormulaInput,
	currentDate: DateString = new Date().toISOString() as DateString
): MoneyILS | null {
	const calculationDate = calcOrderCalculationDate(currentDate, order.endDate);
	const elapsedMonths = calcElapsedOrderMonths(order.startDate, calculationDate);
	return divideOrNull<MoneyILS>(calcUsedOrderAmount(order), elapsedMonths);
}

export function calcTimeAndMaterialOrderBreathingLength({
	balance,
	monthlyAverage,
}: TimeAndMaterialOrderBreathingLengthFormulaInput): Months | null {
	return divideOrNull<Months>(balance, monthlyAverage);
}

export function calcGlobalOrderBreathingLength({
	balance,
	lastReceiptAmount,
}: GlobalOrderBreathingLengthFormulaInput): Months | null {
	return divideOrNull<Months>(balance, lastReceiptAmount);
}

export function calcOrderBreathingLength(
	order: OrderBreathingLengthFormulaInput,
	currentDate: DateString = new Date().toISOString() as DateString
): Months | null {
	if (order.type === OrderType.GLOBAL) {
		return calcGlobalOrderBreathingLength(order);
	}
	return calcTimeAndMaterialOrderBreathingLength({
		balance: order.balance,
		monthlyAverage: calcMonthlyAverage(order, currentDate),
	});
}
