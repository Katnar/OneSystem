import type { BrandedString } from "../global";
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
export type User = {
	personalNumber: PersonalNumber;
	firstName: string;
	lastName: string;
	mador: string;
	meshek_description?: string;
	approvalStatus: boolean;
	signIn_date: string;
};
