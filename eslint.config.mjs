import { defineConfig } from "eslint/config";
import config from "eslint-config-webpack";

export default defineConfig([
	{
		extends: [config],
		rules: {
			"no-new-func": "off",
			"n/prefer-node-protocol": "off"
		}
	}
]);
