import { defineConfig } from "eslint/config";
import config from "eslint-config-webpack";

export default defineConfig([
	{
		extends: [config],
		rules: {
			"no-new-func": "off"
		}
	},
	{
		languageOptions: {
			parserOptions: {
				ecmaVersion: 2018
			}
		},
		files: ["lib/__tests__/**/*.js"]
	}
]);
