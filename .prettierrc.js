"use strict";

module.exports = {
	printWidth: 80,
	useTabs: true,
	tabWidth: 2,
	arrowParens: "always",
	overrides: [
		{
			files: "*.json",
			options: {
				parser: "json",
				useTabs: false,
			},
		},
		{
			files: "*.{cts,mts,ts}",
			options: {
				parser: "typescript",
			},
		},
	],
};
