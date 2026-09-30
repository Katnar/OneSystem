import { BrandedString, NonEmptyArray, NonEmptyString, Result, SomeOrDefault } from "./global"
import { MeshekMador } from "./mador"

export type MeshekID = BrandedString<"meshek id">

export type MeshekBaseFields = {
    meshekName: NonEmptyString,
    mador: MeshekMador
}

export type Meshek = { _id: MeshekID } & MeshekBaseFields
// GET {api}/{meshekMador}/meshek
export type GetMesheksResponse<M extends MeshekMador> = Result<
    {mesheks: SomeOrDefault<NonEmptyArray<Meshek & {mador: M}>, "נראה שאין שווקים זמינים במערכת">}, NonEmptyString
> 
