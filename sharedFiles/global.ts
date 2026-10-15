import { DateString } from "./general/Date/dateSchema";
declare const brandSymbol: unique symbol;
export type AssertOnly<T, UniqueTypeId> = T & {
	readonly [brandSymbol]: UniqueTypeId;
};

type AsObjectSent<T> = {
	[K in keyof T]: AsWireType<T[K]>;
};

// Automatically turns dates to DateStrings accounting for Date | null and whatnot
export type AsWireType<T> = T extends Date ? DateString : T extends object ? AsObjectSent<T> : T;

export type Ok<T> = { ok: true; result: T };
export type Err<D> = { ok: false; error: D };
// this type forces you to check if ok before you can access the data, you should use this type extensively
export type Result<T, D> = Ok<T> | Err<D>;

export type APIResult<T, D> = Result<AsWireType<T>, AsWireType<D>>;

export function unwrap<T, D>(res: Result<T, D>): T {
	if (!res.ok) {
		throw res.error;
	}
	return res.result;
}

// yes this is technically the same as Result but it should be used for different cases where we actually expect the value to sometimes have to default
// an example usage of this type: SomeOrDefault<DataFromTheServer, "loading data...">
// a key difference between this and Result is that if T == D we dont have to check if were using a default value if we dont care
// you may think this is redundant since in 99.9% of cases you can simply infer the default value from the context of the code,
// and in most of the remaining cases a Result is more fitting since its probably an error.
// and you would be a 100% right, but im SO FUCKING TIRED of people just randomly throwing around default values without a second thought
// I dont want to continue giving the same comments on CR's about misusing ternary operators.
// so removing the choice of the default value and by thus adding more context for how it should be used feels like the best solution.
// if anyone has a problem with that, I suggest you try to go over Nimrod's PR history in Caliber and come back to me.
export type Some<T> = { some: true; value: T };
export type Default<D> = { some: false; value: D };
export type SomeOrDefault<T, D> = Some<T> | Default<D>;
export function defaultTo<T, D>(res: Result<T, any>, defaultValue: D): SomeOrDefault<T, D> {
	return { some: res.ok, value: res.ok ? res.result : defaultValue } as SomeOrDefault<T, D>;
}
