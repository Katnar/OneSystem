import { BrandedString, NonEmptyArray, NonEmptyString, Result, SomeOrDefault } from "./global"
import { MeshekMador } from "./mador"

export type MeshekID = BrandedString<"meshek id">

export type MeshekBaseFields = {
    meshekName: NonEmptyString,
    mador: MeshekMador
}

export type Meshek = { _id: MeshekID } & MeshekBaseFields
// GET {api}/meshek
export type GetMesheksResponse = Result<
    {mesheks: SomeOrDefault<NonEmptyArray<Meshek>, "נראה שאין שווקים זמינים במערכת">}, NonEmptyString
> 