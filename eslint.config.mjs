import { defineConfig } from "eslint/config";
import config from "eslint-config-webpack";

export default defineConfig([
	{
		ignores: [".changeset/", "types/"]
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
		// README code samples use `Function` and `Array<...>` to mirror the
		// public `tapable.d.ts` types. Disable the strict TypeScript rules
		// for README — they only activate when `typescript` is a direct
		// devDependency (added for type generation in `lib/`).
		files: ["**/*.md/*"],
		rules: {
			"@typescript-eslint/no-unsafe-function-type": "off",
			"@typescript-eslint/array-type": "off"
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
			"n/no-process-exit": "off",
			// Benchmark files predate strict JSDoc rules and use loose JSDoc.
			// The strict rules only activate when `typescript` is a direct
			// devDependency (added for type generation in `lib/`).
			"jsdoc/require-jsdoc": "off",
			"jsdoc/require-param-description": "off",
			"jsdoc/require-returns-description": "off",
			"jsdoc/no-restricted-syntax": "off",
			"jsdoc/reject-function-type": "off",
			"jsdoc/type-formatting": "off",
			"jsdoc/tag-lines": "off"
		}
	}
]);
