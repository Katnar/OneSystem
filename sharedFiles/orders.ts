import { ContractNumber } from "./contracts";
import { FileID } from "./file";
import { BrandedString, MoneyILS, NonEmptyString } from "./global";
import { MeshekID } from "./meshek";
import { SupplyArea } from "./supplier";


export const OrderType = {
    TIME_AND_MATERIAL_MARAM: 'זו״ח מר״מ',
    TIME_AND_MATERIAL_NON_MARAM: 'זו״ח לא מר״מ',
    GLOBAL: "גלובלי"
} as const;
export type OrderType = typeof OrderType[keyof typeof OrderType];

export type OrderNumber = BrandedString<"order number">;

export type Order = {
    orderNumber: OrderNumber,
    area: SupplyArea,
    meshek: MeshekID,
    startDate: Date,
    endDate: Date,
    location: NonEmptyString,
    vehicleType: NonEmptyString,
    orderValueInclVat: MoneyILS,
    lastUpdate: Date,
    balance: MoneyILS,
    balance791: MoneyILS,
    contractNumber: ContractNumber,
    previousOrder: OrderNumber | null,
    orderOutput: FileID | null,
    canBeUsed: MoneyILS,
    multiYearBudget: MoneyILS,
} & (
    {
        type: typeof OrderType["GLOBAL"],
        lastReceiptDate: Date,
        lastReceiptAmount: MoneyILS,
        payedMonth: Date,
    } | {
        type: typeof OrderType["TIME_AND_MATERIAL_MARAM"],
        description: NonEmptyString,
        maramAverage: MoneyILS,
    } | {
        type: typeof OrderType["TIME_AND_MATERIAL_NON_MARAM"],
    }
)