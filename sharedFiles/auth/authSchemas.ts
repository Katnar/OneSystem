import { PERSONAL_NUMBER_PATTERN } from "./authConsts";
import type { FirstName, LastName, PersonalNumber } from "./authTypes";

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

type NameSchemaTools<NameSchema, Name> = {
	string(): {
		trim(): {
			min(length: number): {
				max(length: number): {
					transform(mapper: (value: string) => Name): NameSchema;
				};
			};
		};
	};
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

export function createFirstNameSchema<FirstNameSchema>(
	zod: NameSchemaTools<FirstNameSchema, FirstName>
): FirstNameSchema {
	return zod
		.string()
		.trim()
		.min(2)
		.max(32)
		.transform(value => value as FirstName);
}

export function createLastNameSchema<LastNameSchema>(
	zod: NameSchemaTools<LastNameSchema, LastName>
): LastNameSchema {
	return zod
		.string()
		.trim()
		.min(2)
		.max(32)
		.transform(value => value as LastName);
}
