import type { ContractNumber } from "./contracts";
import type { FileID } from "./file";
import type { NonEmptyArray } from "./general/Arrays/nonEmptyArray";
import type { MoneyILS } from "./general/NumberStrings/numberStrings";
import type { BrandedString } from "./general/Strings/brandedString";
import type { NonEmptyString } from "./general/Strings/nonEmptyString";
import type { APIResult, AsWireType, SomeOrDefault } from "./global";
import type { MeshekID } from "./meshek";
import type { SupplyArea } from "./supplier";

export const OrderType = {
	TIME_AND_MATERIAL_MARAM: "זו״ח מר״מ",
	TIME_AND_MATERIAL_NON_MARAM: "זו״ח לא מר״מ",
	GLOBAL: "גלובלי",
} as const;
export type OrderType = (typeof OrderType)[keyof typeof OrderType];

export type OrderNumber = BrandedString<"order number">;

export type Order = {
	orderNumber: OrderNumber;
	area: SupplyArea;
	meshek: MeshekID;
	startDate: Date;
	endDate: Date;
	location: NonEmptyString;
	vehicleType: NonEmptyString;
	orderValueInclVat: MoneyILS;
	lastUpdate: Date;
	balance: MoneyILS;
	contractNumber: ContractNumber;
	previousOrder: OrderNumber | null;
	orderOutput: FileID | null;
	canBeUsed: MoneyILS;
	multiYearBudget: MoneyILS;
} & (
	| {
			type: (typeof OrderType)["GLOBAL"];
			lastReceiptDate: Date;
			lastReceiptAmount: MoneyILS;
			payedMonth: Date;
	  }
	| {
			type: (typeof OrderType)["TIME_AND_MATERIAL_MARAM"];
			description: NonEmptyString;
			maramAverage: MoneyILS;
	  }
	| {
			type: (typeof OrderType)["TIME_AND_MATERIAL_NON_MARAM"];
			balance791: MoneyILS;
	  }
);

// ---------------------- WIRE TYPES --------------------------------------
// GET {api}/{mador}/order/{contractNumber}
export type GetOrdersByContractResponse<C extends ContractNumber> = APIResult<
	{ orders: SomeOrDefault<NonEmptyArray<Order & { contract: C }>, "לא קיימות הזמנות תחת ההתקשרות"> },
	NonEmptyString
>;

// POST {api}/{mador}/order/{contractNumber}
export type AddNewOrderPayload = AsWireType<{
	order: Omit<Order, "lastUpdate" | "orderOutput" | "contractNumber"> & {
		previousOrder: SomeOrDefault<OrderNumber, null>;
	};
}>;
export type AddNewOrderResponse = APIResult<{ added: Order; message: "הזמנה נוספה בהצלחה" }, NonEmptyString>;

// PATCH {api}/{mador}/order/{orderNumber}
export type EditOrderPayload = AsWireType<{
	patch: Partial<
		Omit<Order, "lastUpdate" | "orderOutput" | "orderNumber" | "contractNumber"> & {
			previousOrder: SomeOrDefault<OrderNumber, null>;
		}
	>;
}>;
export type EditOrderResponse = APIResult<{ edited: Order; message: "פרטי ההזמנה עודכנו בהצלחה" }, NonEmptyString>;
// POST {api}/{mador}/order/{orderNumber}/orderOutput
export type AddOrderOutputPayload = AsWireType<{}>;
export type AddOrderOutputResponse = APIResult<
	{ added: Order; message: "הקובץ התווסף בהצלחה" },
	"לא ניתן היה להוסיף את הקובץ. יש לנסות שוב"
>;
