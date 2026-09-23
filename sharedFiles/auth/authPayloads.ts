import type { User } from "./authTypes";
export type SignUpPayload = {
	ssoToken: string;
	user: Pick<User, "firstName" | "lastName" | "mador" | "meshek_description" | "role">;
};
