import { ContractStatus, type Contract } from "../contracts";
import type { DateString } from "../general/Date/dateSchema";
import type { MoneyILS } from "../general/NumberStrings/numberStrings";
import { divideOrNull, finiteOrNull, type FormulaInput, type Months, type Percent } from "./common";
import { calcElapsedOrderMonths } from "./dates";

export type ContractFormulaInput = FormulaInput<Pick<Contract, "agreementValueExclVat" | "usedAmountExclVat">>;

export const VatMultiplier = 1.18;

export const ActiveContractStatuses: readonly ContractStatus[] = [
	ContractStatus.ACTIVE,
	ContractStatus.BUDGET_LOW,
	ContractStatus.NEAR_EXPIRY,
];

export const RiskContractStatuses: readonly ContractStatus[] = [
	ContractStatus.BUDGET_LOW,
	ContractStatus.NEAR_EXPIRY,
	ContractStatus.STOPPED,
];

export const RenewalContractStatuses: readonly ContractStatus[] = [
	ContractStatus.RENEWAL_STARTED,
	ContractStatus.LESSONS_LEARNED,
	ContractStatus.KICKOFF,
	ContractStatus.PRICING,
	ContractStatus.RECOMMENDATIONS,
	ContractStatus.MANHAR,
	ContractStatus.MANHAR_COMMENTS,
	ContractStatus.BLM,
	ContractStatus.RENEWAL_TENDER,
	ContractStatus.SUPPLIER_QUESTIONS,
	ContractStatus.THRESHOLD_REQUIREMENTS,
	ContractStatus.WINNER_SELECTION,
	ContractStatus.AGREEMENT_OPENING,
];

export function calcAvailableBalanceExclVat({
	agreementValueExclVat,
	usedAmountExclVat,
}: ContractFormulaInput): MoneyILS | null {
	return agreementValueExclVat === null || usedAmountExclVat === null
		? null
		: finiteOrNull<MoneyILS>(agreementValueExclVat - usedAmountExclVat);
}

export function calcContractPercentUsage({
	agreementValueExclVat,
	usedAmountExclVat,
}: ContractFormulaInput): Percent | null {
	const ratio = divideOrNull(usedAmountExclVat, agreementValueExclVat);
	return ratio === null ? null : finiteOrNull<Percent>(ratio * 100);
}

export function calcAgreementBalanceInclVat(availableBalanceExclVat: MoneyILS | null): MoneyILS | null {
	return availableBalanceExclVat === null ? null : finiteOrNull<MoneyILS>(availableBalanceExclVat * VatMultiplier);
}

export function isActiveContractStatus(status: ContractStatus): boolean {
	return ActiveContractStatuses.includes(status);
}

export function isRiskContractStatus(status: ContractStatus): boolean {
	return RiskContractStatuses.includes(status);
}

export function isRenewalContractStatus(status: ContractStatus): boolean {
	return RenewalContractStatuses.includes(status);
}

export function countActiveContractsForSupplier(
	contracts: readonly Pick<Contract, "supplier" | "status">[],
	supplier: Contract["supplier"]
): number {
	return contracts.filter(contract => contract.supplier === supplier && isActiveContractStatus(contract.status))
		.length;
}

export function isContractUsageAtLeast(contract: ContractFormulaInput, threshold: Percent): boolean {
	const usage = calcContractPercentUsage(contract);
	return usage !== null && Number.isFinite(threshold) && usage >= threshold;
}

export function isContractEndingWithinMonths(
	endDate: DateString | null,
	months: Months,
	currentDate: DateString = new Date().toISOString() as DateString
): boolean {
	const monthDistance = calcElapsedOrderMonths(currentDate, endDate);
	return monthDistance !== null && Number.isFinite(months) && monthDistance >= 0 && monthDistance <= months;
}
