import { z } from "zod";
import { personalNumberSchema } from "../../../sharedFiles/auth/authSchemas";
import type { PersonalNumber } from "../../../sharedFiles/auth/authTypes";

export * from "../../../sharedFiles/auth/authSchemas";

export type AuthenticatedUserJwtPayload = {
	personalNumber: PersonalNumber;
};

export const authenticatedUserJwtPayloadSchema = z.object({
	personalNumber: personalNumberSchema,
}) satisfies z.ZodType<AuthenticatedUserJwtPayload>;
