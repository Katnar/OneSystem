import { BrandedString, Mador, NonEmptyString, Result } from "./global"

export const {BUDGETS: Budget, ...MeshekMador} = Mador; 
export type MeshekMador = typeof MeshekMador[keyof typeof MeshekMador]
export type MeshekID = BrandedString<"meshek id">

export type MeshekBaseFields = {
    meshekName: NonEmptyString,
    mador: MeshekMador
}

export type Meshek = { _id: MeshekID } & MeshekBaseFields

export type GetMesheksResponse = Result<{mesheks: Meshek[]}, NonEmptyString> // GET {api}/meshek