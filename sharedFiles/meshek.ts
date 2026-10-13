import type { NonEmptyArray } from "./general/Arrays/nonEmptyArray";
import type { BrandedString } from "./general/Strings/brandedString";
import type { NonEmptyString } from "./general/Strings/nonEmptyString";
import type { APIResult, SomeOrDefault } from "./global";
import type { MeshekMador } from "./mador/mador";

// ----------------------- BASIC TYPES ------------------------------------

export type MeshekID = BrandedString<"meshek id">;

export type MeshekBaseFields = {
	meshekName: NonEmptyString;
	mador: MeshekMador;
};

export type Meshek = { _id: MeshekID } & MeshekBaseFields;

// ---------------------- WIRE TYPES --------------------------------------

// GET {api}/{meshekMador}/meshek
export type GetMesheksResponse<M extends MeshekMador> = APIResult<
	{ mesheks: SomeOrDefault<NonEmptyArray<Meshek & { mador: M }>, "נראה שאין שווקים זמינים במערכת"> },
	NonEmptyString
>;
