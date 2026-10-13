import { z } from "zod";
import { personalNumberSchema } from "../../../sharedFiles/auth/authSchemas";
import type { PersonalNumber } from "../../../sharedFiles/auth/authTypes";

export * from "../../../sharedFiles/auth/authSchemas";

export type AppJwtClaims = {
	personalNumber: PersonalNumber;
};

export const appJwtClaimsSchema = z.object({
	personalNumber: personalNumberSchema,
}) satisfies z.ZodType<AppJwtClaims>;
