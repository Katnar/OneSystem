import { BrandedString, Mador, NonEmptyArray, NonEmptyString, Result, SomeOrDefault } from "./global"

export const {BUDGETS: Budget, ...MeshekMador} = Mador; 
export type MeshekMador = typeof MeshekMador[keyof typeof MeshekMador]
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