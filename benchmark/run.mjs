#!/usr/bin/env node
/*
 * Benchmark entry point for tapable.
 *
 * Discovers every directory under ./cases/ that contains an `index.bench.mjs`
 * file, calls its default-exported `register(bench, ctx)` function to
 * populate tinybench tasks, then runs them all.
 *
 * The bench is wrapped with a local `withCodSpeed()` bridge (ported from
 * enhanced-resolve / webpack) so the same entry point works for:
 *   - local development (`npm run benchmark`) -> wall-clock measurements
 *     printed to the terminal; the wrapper detects that CodSpeed is not
 *     active and returns the bench untouched
 *   - CI under CodSpeedHQ/action -> the wrapper switches to instrumentation
 *     mode automatically and results are uploaded to codspeed.io
 *
 * See ./README.md for the layout of individual cases.
 */

import fs from "fs/promises";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { Bench, hrtimeNow } from "tinybench";
import { withCodSpeed } from "./with-codspeed.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const casesPath = path.join(__dirname, "cases");

/**
 * Filter expression from CLI or env (e.g. `npm run benchmark -- sync`).
 * A case is included if its directory name contains this substring. Empty
 * means "include everything".
 */
const filter = process.env.BENCH_FILTER || process.argv[2] || "";

const bench = withCodSpeed(
	new Bench({
		name: "tapable",
		now: hrtimeNow,
		throws: true,
		warmup: true,
		warmupIterations: 5,
		// Kept deliberately low: each task's body already loops over many
		// hook calls, and we want wall-clock runs to finish in a few
		// seconds. CodSpeed's simulation mode ignores this and instruments
		// exactly one iteration per task.
		iterations: 20
	})
);

const caseDirs = (await fs.readdir(casesPath, { withFileTypes: true }))
	.filter((entry) => entry.isDirectory())
	.map((entry) => entry.name)
	.filter((name) => !filter || name.includes(filter))
	.sort();

if (caseDirs.length === 0) {
	console.error(
		filter
			? `No benchmark cases matched filter "${filter}"`
			: "No benchmark cases found"
	);
	process.exit(1);
}

for (const caseName of caseDirs) {
	const benchFile = path.join(casesPath, caseName, "index.bench.mjs");
	try {
		await fs.access(benchFile);
	} catch {
		console.warn(`[skip] ${caseName}: no index.bench.mjs`);
		continue;
	}
	const mod = await import(pathToFileURL(benchFile).href);
	if (typeof mod.default !== "function") {
		throw new Error(
			`${caseName}/index.bench.mjs must export a default function`
		);
	}
	await mod.default(bench, {
		caseName,
		caseDir: path.join(casesPath, caseName)
	});
	console.log(`Registered: ${caseName}`);
}

console.log(`\nRunning ${bench.tasks.length} tasks...\n`);
await bench.run();

// Pretty-print results. Kept simple on purpose - CodSpeed uploads its own
// data in CI; this table is for humans running locally.
const rows = bench.tasks.map((task) => {
	const r = task.result;
	if (!r) return { name: task.name, status: "no result" };
	// tinybench v6 result shape: latency / throughput objects.
	const lat = r.latency;
	const tp = r.throughput;
	return {
		name: task.name,
		"ops/s": tp?.mean?.toFixed(2) ?? "n/a",
		"mean (ms)": lat?.mean?.toFixed(4) ?? "n/a",
		"p99 (ms)": lat?.p99?.toFixed(4) ?? "n/a",
		"rme (%)": lat?.rme?.toFixed(2) ?? "n/a",
		samples: lat?.samplesCount ?? 0
	};
});
console.log();
console.table(rows);

// Exit non-zero if any task threw, so CI picks it up.
const failed = bench.tasks.filter((t) => t.result?.error);
if (failed.length > 0) {
	console.error(`\n${failed.length} task(s) errored:`);
	for (const t of failed) {
		console.error(`  - ${t.name}: ${t.result?.error?.message}`);
	}
	process.exit(1);
}
