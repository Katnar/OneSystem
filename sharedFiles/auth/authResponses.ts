import { AuthResponseStatus, type User } from "./authTypes";
export { AuthResponseStatus as AuthStatus } from "./authTypes";

// GET {api}/auth/sso_signin
export type SsoSigninResultType =
	| { ok: true; result: { jwt: string; user: User } }
	| {
			ok: false;
			error:
				| ({ status: typeof AuthResponseStatus.NotFound } & Pick<
						User,
						"firstName" | "lastName" | "personalNumber"
				  >)
				| {
						status: Exclude<
							AuthResponseStatus,
							typeof AuthResponseStatus.Ok | typeof AuthResponseStatus.NotFound
						>;
				  };
	  };

// POST {api}/auth/signup
export type SignUpResultType =
	| { ok: true; result: Record<string, never> }
	| { ok: false; error: "קלט לא תקין" | "מספר אישי לא תקין" | "משתמש כבר קיים" | "משתמש ממתין לאישור" };
