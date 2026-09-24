import { BrandedString, Mador } from "./global"

export const {Budget, ...MeshekMador} = Mador; 
export type MeshekMador = typeof MeshekMador[keyof typeof MeshekMador]
export type MeshekID = BrandedString<"meshek id">

export type MeshekBaseFields = {
    meshekName: string,
    mador: MeshekMador
}

export type Meshek = { _id: MeshekID } & MeshekBaseFields

