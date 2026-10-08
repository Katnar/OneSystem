import js from "@eslint/js";
import prettierRecommended from "eslint-plugin-prettier/recommended";
import tseslint from "typescript-eslint";

export default [
	{
		ignores: ["dist/**", "node_modules/**", "*.cjs", "eslint.config.mjs"],
	},
	js.configs.recommended,
	...tseslint.configs.recommended,
	prettierRecommended,
	{
		files: ["**/*.ts"],
		languageOptions: {
			ecmaVersion: "latest",
			sourceType: "module",
			globals: {
				Buffer: "readonly",
				console: "readonly",
				module: "readonly",
				process: "readonly",
				require: "readonly",
			},
		},
		rules: {
			"@typescript-eslint/no-explicit-any": "warn",
		},
	},
];
