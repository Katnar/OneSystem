import { BrandedString, NonEmptyArray, NonEmptyString, PhoneNumber } from "./global"

export const SupplyArea = {
    CENTER: "מרכז", 
    SOUTH: "דרום",
    NORTH: "צפון", 
    NATIONWIDE: "ארצי"
} as const; 

export type SupplyArea = typeof SupplyArea[keyof typeof SupplyArea];
export type SupplierBaseFields = {
    name: NonEmptyString,
    phoneNumber: PhoneNumber | null,
    contact_name: NonEmptyString | null,
    areas: NonEmptyArray<SupplyArea> | null
}
export type SupplierID = BrandedString<"supplier id">
export type Supplier = SupplierBaseFields & { _id: SupplierID }
