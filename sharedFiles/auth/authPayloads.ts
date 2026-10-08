import type { SSOToken, User } from "./authTypes";

export type SignUpPayload = {
	ssoToken: SSOToken;
	user: Pick<User, "firstName" | "lastName" | "mador" | "meshekDescription">;
};
