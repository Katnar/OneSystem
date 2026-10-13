import { AssertOnly } from "../../global";
import { BrandedString } from "../Strings/brandedString";
import { NonEmptyString } from "../Strings/nonEmptyString";

export type BrandedNumber<UniqueTypeId extends NonEmptyString> = AssertOnly<number, UniqueTypeId>;

export type Year = BrandedNumber<"year">;

export type PhoneNumber = BrandedString<"phone number">;

// NOTE: in general it is not a great idea to store money in floating points but JS is a stupid language that make it hard to avoid using floating points so...
export type MoneyILS = BrandedNumber<"israeli shekel">;
