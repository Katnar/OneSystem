declare const brandSymbol: unique symbol;
export type AssertOnly<T, UniqueTypeId> = T & {
	readonly [brandSymbol]: UniqueTypeId;
};

export type BrandedString<UniqueTypeId extends string> = AssertOnly<string, UniqueTypeId>;

export type BrandedNumber<UniqueTypeId extends string> = AssertOnly<number, UniqueTypeId>;

export type Year = BrandedNumber<"year"> 

export type PhoneNumber = BrandedString<"phone number">

export const Mador = {
	ENGINEERING_AND_ENERGY: 'צמ"ה ואנרגיה',
	VEHICLE_AND_TRANSPORT: 'רכב והובלה',
	BUDGETS: 'תקציבים'
} as const;

export type Mador = typeof Mador[keyof typeof Mador];

export type Ok<T> = { ok: true; result: T };
export type Err<D> = { ok: false; error: D };
// this type forces you to check if ok before you can access the data, you should use this type extensively
export type Result<T, D> = Ok<T> | Err<D>;

export function unwrap<T, D>(res: Result<T, D>): T {
	if (!res.ok) {
		throw new Error(`unwrapping failure! ${res.error}`);
	}
	return res.result;
}