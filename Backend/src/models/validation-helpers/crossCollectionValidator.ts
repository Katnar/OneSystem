import { Model, QueryFilter } from "mongoose";
import { getValidatorSession, ValidatorContext } from "./sessionExtractor";

export async function crossCollectionValidator<T>(context: ValidatorContext, model: Model<T>, query: QueryFilter<T>) {
	const session = getValidatorSession(context);
	const q = model.exists(query);
	if (session) {
		q.session(session);
	}
	return Boolean(await q);
}
