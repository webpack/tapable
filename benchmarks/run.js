/*
	MIT License http://www.opensource.org/licenses/mit-license.php
*/
"use strict";

/*
 * Benchmark runner.
 *
 * Recursively discovers every `*.bench.js` file below `benchmarks/`
 * (optionally scoped to a subdirectory passed as the first CLI arg),
 * then runs them sequentially in a single Node.js process so that the
 * CodSpeed instrumentation session is shared across suites.
 *
 * Each bench file must `module.exports = async function main() { ... }`
 * and use `runIfMain(module, main)` from `helpers.js` so it can also be
 * executed stand-alone with `node benchmarks/<suite>/<name>.bench.js`.
 */

const fs = require("fs");
const path = require("path");

function findBenches(dir) {
	const results = [];
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		// Skip internal / hidden folders and node_modules.
		if (entry.name.startsWith("_") || entry.name.startsWith(".")) continue;
		if (entry.name === "node_modules") continue;
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			results.push(...findBenches(fullPath));
		} else if (entry.isFile() && entry.name.endsWith(".bench.js")) {
			results.push(fullPath);
		}
	}
	return results;
}

async function main() {
	const benchmarksDir = __dirname;
	const subdirArg = process.argv[2];
	const rootDir = subdirArg
		? path.resolve(benchmarksDir, subdirArg)
		: benchmarksDir;

	if (!fs.existsSync(rootDir)) {
		// eslint-disable-next-line no-console
		console.error(`Directory not found: ${rootDir}`);
		process.exit(1);
	}

	const files = findBenches(rootDir).sort();
	if (files.length === 0) {
		// eslint-disable-next-line no-console
		console.error(`No *.bench.js files found under ${rootDir}`);
		process.exit(1);
	}

	for (const file of files) {
		const rel = path.relative(benchmarksDir, file);
		// eslint-disable-next-line no-console
		console.log(`\n=== ${rel} ===\n`);
		// eslint-disable-next-line global-require, import/no-dynamic-require
		const mod = require(file);
		if (typeof mod !== "function") {
			throw new TypeError(
				`${rel} must export an async function as its default export`
			);
		}
		await mod();
	}
}

main().catch((err) => {
	// eslint-disable-next-line no-console
	console.error(err);
	process.exit(1);
});
