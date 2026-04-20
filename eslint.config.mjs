import { defineConfig } from "eslint/config";
import config from "eslint-config-webpack";

export default defineConfig([
	{
		ignores: [".changeset/"]
	},
	{
		extends: [config],
		rules: {
			"no-new-func": "off"
		}
	},
	{
		files: ["test/**/*"],
		languageOptions: {
			parserOptions: {
				ecmaVersion: 2018
			}
		}
	},
	{
		files: ["benchmark/**/*"],
		languageOptions: {
			parserOptions: {
				ecmaVersion: 2022
			}
		},
		rules: {
			"no-console": "off",
			"import/namespace": "off",
			"n/hashbang": "off",
			"n/no-unsupported-features/es-syntax": "off",
			"n/no-unsupported-features/node-builtins": "off",
			"n/no-process-exit": "off"
		}
	}
]);
