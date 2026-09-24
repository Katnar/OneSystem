declare const brandSymbol: unique symbol;
export type AssertOnly<T, UniqueTypeId> = T & {
	readonly [brandSymbol]: UniqueTypeId;
};

export type BrandedString<UniqueTypeId extends string> = AssertOnly<string, UniqueTypeId>;

export type BrandedNumber<UniqueTypeId extends string> = AssertOnly<number, UniqueTypeId>;

export type Year = BrandedNumber<"year"> 

export const Mador = {
	TsamaAndEnergy: 'צמ"ה ואנרגיה',
	VehiclesAndTransport: 'רכב והובלה',
	Budget: 'תקציבים'
} as const;

export type Mador = typeof Mador[keyof typeof Mador];