import { Mador } from "./global"



export const {Budget, ...MeshekMador} = Mador; 
export type MeshekMador = typeof MeshekMador[keyof typeof MeshekMador]