import { BrandedString, PhoneNumber } from "./global"


export const SupplyArea = ["מרכז", "דרום", "צפון", "ארצי"] as const; 
export type SupplyArea = typeof SupplyArea[keyof typeof SupplyArea];
export type SupplierBaseFields = {
    name: string,
    phoneNumber: PhoneNumber,
    contact_name: string,
    areas: SupplyArea[]
}
export type SupplierID = BrandedString<"supplier id">
export type Supplier = SupplierBaseFields & { _id: SupplierID }