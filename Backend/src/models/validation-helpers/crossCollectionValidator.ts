import { Model, QueryFilter } from "mongoose";
import { getValidatorSession, ValidatorContext } from "./sessionExtractor";

export async function crossCollectionValidatorConstructor<T>(
	model: Model<T>,
	queryConstructor: (value: unknown) => QueryFilter<T>
) {
	return async function (this: ValidatorContext, value: unknown): Promise<boolean> {
		const session = getValidatorSession(this);
		const q = model.exists(queryConstructor(value));
		if (session) {
			q.session(session);
		}
		return Boolean(await q);
	};
}
