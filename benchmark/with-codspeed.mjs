/*
 * CodSpeed <-> tinybench bridge for tapable benchmarks.
 *
 * Ported from the equivalent wrapper in enhanced-resolve (which in turn
 * was ported from webpack's test/BenchmarkTestCases.benchmark.mjs).
 *
 * Why not @codspeed/tinybench-plugin?
 * That package accesses tinybench Task internals (task.fn, task.fnOpts)
 * that were made private in tinybench v6, causing a TypeError in
 * simulation mode. webpack and enhanced-resolve hit the same issue and
 * use @codspeed/core directly - we follow their lead.
 *
 * Modes (via getCodspeedRunnerMode() from @codspeed/core):
 *   "disabled"   - returns the bench untouched (local runs)
 *   "simulation" - overrides bench.run/runSync for CodSpeed instrumentation
 *   "walltime"   - left untouched; tinybench's built-in timing is used
 */

import path from "path";
import { fileURLToPath } from "url";
import {
	InstrumentHooks,
	getCodspeedRunnerMode,
	setupCore,
	teardownCore
} from "@codspeed/core";

/** @typedef {import("tinybench").Bench} Bench */
/** @typedef {import("tinybench").Task} Task */
/** @typedef {() => unknown | Promise<unknown>} Fn */

const repoRoot = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	".."
);

/**
 * Capture the file that invoked bench.add() so we can build a stable URI
 * for CodSpeed to identify the benchmark.
 * @returns {string} calling file path relative to the repo root
 */
function getCallingFile() {
	const dummy = {};
	const prev = Error.prepareStackTrace;
	const prevLimit = Error.stackTraceLimit;
	Error.stackTraceLimit = 10;
	Error.prepareStackTrace = (_err, trace) => trace;
	Error.captureStackTrace(dummy, getCallingFile);
	const trace = /** @type {NodeJS.CallSite[]} */ (
		/** @type {{ stack: unknown }} */ (dummy).stack
	);
	Error.prepareStackTrace = prev;
	Error.stackTraceLimit = prevLimit;

	let file = /** @type {string} */ (trace[1].getFileName() || "");
	if (file.startsWith("file://")) file = fileURLToPath(file);
	if (!file) return "<unknown>";
	return path.relative(repoRoot, file);
}

/**
 * @typedef {{ uri: string, fn: Fn, opts: object | undefined }} TaskMeta
 * @type {WeakMap<Bench, Map<string, TaskMeta>>}
 */
const metaMap = new WeakMap();

/**
 * @param {Bench} bench
 * @returns {Map<string, TaskMeta>}
 */
function getOrCreateMeta(bench) {
	let m = metaMap.get(bench);
	if (!m) {
		m = new Map();
		metaMap.set(bench, m);
	}
	return m;
}

/**
 * Wrap a tinybench Bench so that CodSpeed simulation mode instruments each
 * task. In "disabled" and "walltime" modes the bench is returned as-is.
 *
 * @param {Bench} bench
 * @returns {Bench}
 */
export function withCodSpeed(bench) {
	const mode = getCodspeedRunnerMode();
	if (mode === "disabled" || mode === "walltime") return bench;

	// --- simulation mode ---

	const meta = getOrCreateMeta(bench);
	const rawAdd = bench.add.bind(bench);

	bench.add = (name, fn, opts) => {
		const callingFile = getCallingFile();
		const uri = `${callingFile}::${name}`;
		meta.set(name, { uri, fn, opts });
		return rawAdd(name, fn, opts);
	};

	const setup = () => {
		setupCore();
		console.log("[CodSpeed] running in simulation mode");
	};

	const teardown = () => {
		teardownCore();
		console.log(`[CodSpeed] Done running ${bench.tasks.length} benches.`);
		return bench.tasks;
	};

	/**
	 * @param {Fn} fn
	 * @param {boolean} isAsync
	 * @returns {Fn}
	 */
	const wrapFrame = (fn, isAsync) => {
		if (isAsync) {
			// eslint-disable-next-line camelcase
			return async function __codspeed_root_frame__() {
				await fn();
			};
		}
		// eslint-disable-next-line camelcase
		return function __codspeed_root_frame__() {
			fn();
		};
	};

	bench.run = async () => {
		setup();
		for (const task of bench.tasks) {
			const m = /** @type {TaskMeta} */ (meta.get(task.name));

			// Warm-up: run the body a few times to stabilise caches / JIT.
			for (let i = 0; i < bench.iterations - 1; i++) {
				await m.fn();
			}

			// Instrumented run.
			global.gc?.();
			InstrumentHooks.startBenchmark();
			await wrapFrame(m.fn, true)();
			InstrumentHooks.stopBenchmark();
			InstrumentHooks.setExecutedBenchmark(process.pid, m.uri);

			console.log(
				`[CodSpeed] ${
					InstrumentHooks.isInstrumented() ? "Measured" : "Checked"
				} ${m.uri}`
			);
		}
		return teardown();
	};

	bench.runSync = () => {
		setup();
		for (const task of bench.tasks) {
			const m = /** @type {TaskMeta} */ (meta.get(task.name));
			for (let i = 0; i < bench.iterations - 1; i++) {
				m.fn();
			}
			global.gc?.();
			InstrumentHooks.startBenchmark();
			wrapFrame(m.fn, false)();
			InstrumentHooks.stopBenchmark();
			InstrumentHooks.setExecutedBenchmark(process.pid, m.uri);
			console.log(
				`[CodSpeed] ${
					InstrumentHooks.isInstrumented() ? "Measured" : "Checked"
				} ${m.uri}`
			);
		}
		return teardown();
	};

	return bench;
}
