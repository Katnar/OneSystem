import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const currentDirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	resolve: {
		alias: {
			"@onesystem/shared": resolve(currentDirname, "../sharedFiles"),
		},
	},
	server: {
		fs: {
			allow: [".."],
		},
	},
});
