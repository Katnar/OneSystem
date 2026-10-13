import type { NonEmptyArray } from "./general/Arrays/nonEmptyArray";
import type { PhoneNumber } from "./general/NumberStrings/numberStrings";
import type { BrandedString } from "./general/Strings/brandedString";
import type { NonEmptyString } from "./general/Strings/nonEmptyString";
import type { APIResult, AsWireType, SomeOrDefault } from "./global";

// ----------------------------------------- BASIC TYPES ----------------------------------------------------------

export const SupplyArea = {
	CENTER: "מרכז",
	SOUTH: "דרום",
	NORTH: "צפון",
	NATIONWIDE: "ארצי",
} as const;

export type SupplyArea = (typeof SupplyArea)[keyof typeof SupplyArea];
export type SupplierBaseFields = {
	name: NonEmptyString;
	phoneNumber: PhoneNumber | null;
	contact_name: NonEmptyString | null;
	areas: NonEmptyArray<SupplyArea> | null;
};
export type SupplierID = BrandedString<"supplier id">;
export type Supplier = SupplierBaseFields & { _id: SupplierID };

// ----------------------------------------- WIRE TYPES ----------------------------------------------------------

// POST {api}/supplier
export type AddNewSupplierPayload = AsWireType<{
	supplier: Omit<SupplierBaseFields, "areas"> & { areas: SupplyArea[] };
}>;
export type AddNewSupplierResponse = APIResult<
	{ added: Supplier; message: "הספק נוסף בהצלחה" },
	"יש להזין שם ספק" | "ספק בשם זה כבר קיים" | "לא ניתן היה להוסיף את הספק. יש לנסות שוב"
>;
// GET {api}/supplier
export type GetAllSuppliersResponse = APIResult<
	{ suppliers: SomeOrDefault<NonEmptyArray<Supplier>, "נראה שעוד לא נוספו ספקים למערכת"> },
	NonEmptyString
>;

// PATCH {api}/supplier/:id
export type EditSupplierPayload = AsWireType<{ patch: Partial<AddNewSupplierPayload["supplier"]> }>;
export type EditSupplierResponse = APIResult<
	{
		patched: Supplier;
		message: "פרטי הספק עודכנו בהצלחה";
	},
	"לא ניתן היה לעדכן את הספק. יש לנסות שוב" | "הספק המבוקש לא נמצא" | "יש להזין שם ספק" | "ספק בשם זה כבר קיים"
>;

// DELETE {api}/supplier/:id
export type DeleteSupplierResponse = APIResult<
	"הספק נמחק בהצלחה",
	| "לא ניתן למחוק את הספק משום שהוא מקושר להתקשרות אחת או יותר. יש לעדכן תחילה את ההתקשרויות המקושרות"
	| "הספק המבוקש לא נמצא"
	| "לא ניתן היה למחוק את הספק. יש לנסות שוב"
>;
