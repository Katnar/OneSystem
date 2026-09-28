import {
	AuthStatus,
	type SignUpResultType,
	type SsoSigninResultType,
} from "../../../../sharedFiles/auth/authResponses";
import { usersModel } from "../../models/user";
import jwt from "jsonwebtoken";
import type { Request, Response } from "express";
import { JWT_LIFETIME_HOURS } from "../../../../sharedFiles/auth/authConsts";
import { UserApprovalStatus } from "../../../../sharedFiles/auth/authTypes";

import { signUpPayloadSchema, ssoClaimsSchema } from "../validation/authSchemas";
import { toAuthUser } from "../validation/toAuthUser";

function verifySsoToken(token: string): unknown {
	try {
		return jwt.verify(token, process.env.SSO_DECRYPT_KEY_JWT as string);
	} catch {
		return null;
	}
}

function getRequiredEnv(name: string): string | null {
	const value = process.env[name];
	return value && value.trim() !== "" ? value : null;
}

export const ssoSigninEndpoint = async (req: Request, res: Response<SsoSigninResultType>): Promise<void> => {
	const authHeader = req.headers.authorization;

	if (!authHeader?.startsWith("Bearer ")) {
		res.status(401).json({ status: AuthStatus.BadToken });
		return;
	}

	const ssoToken = authHeader.split(" ")[1];
	if (ssoToken === undefined) {
		res.status(401).json({ status: AuthStatus.BadToken });
		return;
	}
	const claims = ssoClaimsSchema.safeParse(verifySsoToken(ssoToken));

	if (!claims.success) {
		res.status(401).json({ status: AuthStatus.BadToken });
		return;
	}

	const { fname: lastName = "", lname: firstName = "", pn } = claims.data;

	const user = await usersModel.findOne({ personalNumber: pn }).lean();

	if (!user) {
		res.status(404).json({
			status: AuthStatus.NotFound,
			firstName,
			lastName,
			personalNumber: pn,
		});
		return;
	}

	if (user.approvalStatus !== UserApprovalStatus.APPROVED) {
		res.status(401).json({ status: AuthStatus.NotApproved });
		return;
	}

	const authUser = toAuthUser(user);

	await usersModel.findByIdAndUpdate(user._id, {
		signIn_date: new Date(),
	});

	const tokenPayload = {
		id: user._id,
		personalNumber: authUser.personalNumber,
	};

	const appJwtSecret = getRequiredEnv("ONESYSTEM_SECRET_KEY_JWT");
	if (!appJwtSecret) {
		console.error("Missing required env var ONESYSTEM_SECRET_KEY_JWT");
		res.status(500).json({ status: AuthStatus.ServerError });
		return;
	}

	const appJwt = jwt.sign(tokenPayload, appJwtSecret, {
		expiresIn: `${JWT_LIFETIME_HOURS}h`,
	});

	res.json({
		status: AuthStatus.Ok,
		jwt: appJwt,
		user: authUser,
	});
};

export async function signUpEndpoint(req: Request<unknown, unknown, unknown>, res: Response<SignUpResultType>) {
	try {
		const parsedPayload = signUpPayloadSchema.safeParse(req.body);
		if (!parsedPayload.success) {
			res.status(400).json({
				success: false,
				error: "קלט לא תקין",
			});
			return;
		}

		const { ssoToken, user } = parsedPayload.data;

		const data = verifySsoToken(ssoToken);
		if (!data) {
			res.status(400).json({ success: false, error: "קלט לא תקין" });
			return;
		}

		const claims = ssoClaimsSchema.safeParse(data);
		if (!claims.success) {
			res.status(400).json({
				success: false,
				error: "מספר אישי לא תקין",
			});
			return;
		}

		const { pn } = claims.data;
		const existing = await usersModel.findOne({ personalNumber: pn });
		if (existing) {
			res.status(400).json({
				success: false,
				error:
					existing.approvalStatus === UserApprovalStatus.APPROVED ? "משתמש כבר קיים" : "משתמש ממתין לאישור",
			});
			return;
		}

		const createdUser = new usersModel({
			personalNumber: pn,
			firstName: user.firstName,
			lastName: user.lastName,
			mador: user.mador,
			meshek_description: user.meshek_description,
		});

		await createdUser.save();

		res.json({ success: true, result: {} });
	} catch {
		res.status(400).json({ success: false, error: "קלט לא תקין" });
	}
}
