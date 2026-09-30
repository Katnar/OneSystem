export const Mador = {
	ENGINEERING_AND_ENERGY: 'צמ"ה ואנרגיה',
	VEHICLE_AND_TRANSPORT: 'רכב והובלה',
	BUDGETS: 'תקציבים'
} as const;

export type Mador = typeof Mador[keyof typeof Mador];

const {BUDGETS, ...meshekMadors} = Mador; 
export const MeshekMador = meshekMadors;
export type MeshekMador = typeof MeshekMador[keyof typeof MeshekMador]