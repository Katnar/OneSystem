declare const brandSymbol: unique symbol;
export type AssertOnly<T, UniqueTypeId extends string> = T & {
	readonly [brandSymbol]: UniqueTypeId;
};

export type BrandedString<UniqueTypeId extends string> = AssertOnly<string, UniqueTypeId>;

export type BrandedNumber<UniqueTypeId extends string> = AssertOnly<number, UniqueTypeId>;
