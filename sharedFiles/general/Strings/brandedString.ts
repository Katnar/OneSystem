import { AssertOnly } from "../../global";
import { NonEmptyString } from "./nonEmptyString";

export type BrandedString<UniqueTypeId extends NonEmptyString> = AssertOnly<string, UniqueTypeId>;
