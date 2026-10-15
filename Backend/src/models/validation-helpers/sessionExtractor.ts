import mongoose, { ClientSession, Query } from "mongoose";

export type ValidatorContext = mongoose.Document | Query<unknown, unknown>;

export function getValidatorSession(context: ValidatorContext): ClientSession | undefined {
	if (context instanceof mongoose.Document) {
		return context.$session() ?? undefined;
	}
	const options = context.getOptions();
	return options.session ?? undefined;
}
