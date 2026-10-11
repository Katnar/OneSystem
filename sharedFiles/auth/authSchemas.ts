import { PERSONAL_NUMBER_PATTERN } from "./authConsts";
import type { PersonalNumber } from "./authTypes";

export type AppJwtClaims = {
	personalNumber: PersonalNumber;
};

type PersonalNumberSchemaTools<PersonalNumberSchema> = {
	string(): {
		regex(pattern: RegExp): {
			transform(mapper: (value: string) => PersonalNumber): PersonalNumberSchema;
		};
	};
};

type AppJwtClaimsSchemaTools<PersonalNumberSchema, AppJwtClaimsSchema> = {
	object(shape: { personalNumber: PersonalNumberSchema }): AppJwtClaimsSchema;
};

// Apply shared brands only after runtime validation succeeds.
export function createPersonalNumberSchema<PersonalNumberSchema>(
	zod: PersonalNumberSchemaTools<PersonalNumberSchema>
): PersonalNumberSchema {
	return zod
		.string()
		.regex(PERSONAL_NUMBER_PATTERN)
		.transform(value => value as PersonalNumber);
}

export function createAppJwtClaimsSchema<PersonalNumberSchema, AppJwtClaimsSchema>(
	zod: AppJwtClaimsSchemaTools<PersonalNumberSchema, AppJwtClaimsSchema>,
	personalNumberSchema: PersonalNumberSchema
): AppJwtClaimsSchema {
	return zod.object({
		personalNumber: personalNumberSchema,
	});
}
