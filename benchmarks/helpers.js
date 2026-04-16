/*
	MIT License http://www.opensource.org/licenses/mit-license.php
*/
"use strict";

const { Bench } = require("tinybench");
const { withCodSpeed } = require("@codspeed/tinybench-plugin");

/**
 * Create a new tinybench Bench, wrapped with CodSpeed instrumentation
 * when running under the CodSpeed runner. When running locally the
 * plugin is a no-op and regular tinybench output is produced.
 *
 * @param {import("tinybench").BenchOptions} [options]
 * @returns {Bench}
 */
function createBench(options) {
	return withCodSpeed(
		new Bench({
			// Keep runs short by default - CodSpeed uses its own measurement
			// strategy, and locally we only need enough iterations for a
			// stable signal.
			time: 500,
			warmupTime: 100,
			...options
		})
	);
}

/**
 * Run a bench and print a result table when executed locally.
 *
 * @param {Bench} bench
 */
async function runBench(bench) {
	await bench.run();
	// Only print a table for local runs. Under CodSpeed the output is
	// collected by the runner and the table would be noisy.
	if (!process.env.CODSPEED) {
		// eslint-disable-next-line no-console
		console.table(bench.table());
	}
}

module.exports = { createBench, runBench };
