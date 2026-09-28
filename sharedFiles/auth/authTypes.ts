import type { BrandedString } from "../global";
export enum RoleKey {
	ADMIN = "admin",
	
}

export const UserApprovalStatus = { APPROVED: true, PENDING: false } as const;

export const AuthResponseStatus = {
	Ok: "ok",
	BadToken: "bad_token",
	ExpiredToken: "expired_token",
	NotFound: "not_found",
	NotApproved: "not_approved",
	ServerError: "server_error",
} as const;

export type PersonalNumber = BrandedString<"personal number">;
export type RoleID = BrandedString<"role id">;
export type User = {
	personalNumber: PersonalNumber;
	firstName: string;
	lastName: string;
	role: RoleID;
	mador: string;
	meshek_description?: string;
	approvalStatus: boolean;
	signIn_date: string;
};

export type Role = {
	_id: RoleID;
	key: string;
	name: string;
};

export function roleLabel(role: Role): string {
	return role.name;
}
