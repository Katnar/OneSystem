module.exports = {
	"*.{js,cjs,mjs,jsx,ts,tsx,json,css,scss,md,yml,yaml}": "prettier --config .prettierrc --write",

	".prettierrc": "prettier --config .prettierrc --write",

	"Frontend/**/*.{ts,tsx}":
		"node Frontend/node_modules/eslint/bin/eslint.js --config Frontend/eslint.config.js --max-warnings=-1",

	"Backend/**/*.ts":
		"node Backend/node_modules/eslint/bin/eslint.js --config Backend/eslint.config.mjs --max-warnings=-1",

	"sharedFiles/**/*.ts":
		"node Backend/node_modules/eslint/bin/eslint.js --config sharedFiles/eslint.config.mjs --max-warnings=-1",
};
