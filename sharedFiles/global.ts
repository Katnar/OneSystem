declare const brandSymbol: unique symbol;
export type AssertOnly<T, UniqueTypeId> = T & {
	readonly [brandSymbol]: UniqueTypeId;
};
// doesnt use the AssertOnly type so it will also identify any string written which isnt empty as a NonEmptyString at compile time
export type NonEmptyString = `${any}${string}`;

export type BrandedString<UniqueTypeId extends NonEmptyString> = AssertOnly<string, UniqueTypeId>;

export type BrandedNumber<UniqueTypeId extends NonEmptyString> = AssertOnly<number, UniqueTypeId>;

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
	if (!res.ok) {throw res.error;}
	return res.result;
}

// doesnt use the AssertOnly type so it will also identify any array which isnt empty as a NonEmptyArray at compile time
export type NonEmptyArray<T> = [T, ...T[]]
export function tryIntoNonEmptyArr<T>(arr: T[]): Result<NonEmptyArray<T>, TypeError> {
	if (arr.length === 0) {return {ok: false, error: new TypeError("Type assertion failure! Expected non empty array!")};}
	return {ok: true, result: arr as NonEmptyArray<T>};
}
export function assertNotEmptyArr<T>(arr: T[]): asserts arr is NonEmptyArray<T> {
	unwrap(tryIntoNonEmptyArr(arr));
}

export function tryIntoNonEmptyString(s: string): Result<NonEmptyString, TypeError> {
	if (s.length === 0) {{return {ok: false, error: new TypeError("Type assertion failure! Expected non empty string!")};}}
	return { ok: true, result: s as NonEmptyString };
}
export function assertNotEmptyString(s: string): asserts s is NonEmptyString {
	unwrap(tryIntoNonEmptyString(s));
}