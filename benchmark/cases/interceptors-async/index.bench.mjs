/*
 * interceptors-async
 *
 * Interceptor overhead on the async hooks. Covers both AsyncSeriesHook
 * (serialized, one-tap-at-a-time) and AsyncParallelHook (fan-out).
 */

import tapable from "../../../lib/index.js";

const { AsyncSeriesHook, AsyncParallelHook } = tapable;

function runBatch(hook, iterations) {
	return new Promise((resolve, reject) => {
		let remaining = iterations;
		const done = (err) => {
			if (err) return reject(err);
			if (--remaining === 0) return resolve();
		};
		for (let i = 0; i < iterations; i++) {
			hook.callAsync(1, done);
		}
	});
}

const INNER_ITERATIONS = 200;

/**
 * @param {import('tinybench').Bench} bench
 */
export default function register(bench) {
	// --- AsyncSeriesHook ---
	const seriesBaseline = new AsyncSeriesHook(["a"]);
	for (let i = 0; i < 5; i++) seriesBaseline.tap(`p-${i}`, () => {});
	seriesBaseline.callAsync(1, () => {});
	bench.add("interceptors-async: series, 5 sync taps, no interceptors", () =>
		runBatch(seriesBaseline, INNER_ITERATIONS)
	);

	const seriesCall = new AsyncSeriesHook(["a"]);
	seriesCall.intercept({ call: () => {} });
	for (let i = 0; i < 5; i++) seriesCall.tap(`p-${i}`, () => {});
	seriesCall.callAsync(1, () => {});
	bench.add("interceptors-async: series, 5 sync taps, call interceptor", () =>
		runBatch(seriesCall, INNER_ITERATIONS)
	);

	const seriesTap = new AsyncSeriesHook(["a"]);
	seriesTap.intercept({ tap: () => {} });
	for (let i = 0; i < 5; i++) seriesTap.tap(`p-${i}`, () => {});
	seriesTap.callAsync(1, () => {});
	bench.add("interceptors-async: series, 5 sync taps, tap interceptor", () =>
		runBatch(seriesTap, INNER_ITERATIONS)
	);

	// --- AsyncParallelHook ---
	const parallelBaseline = new AsyncParallelHook(["a"]);
	for (let i = 0; i < 5; i++) {
		parallelBaseline.tapAsync(`p-${i}`, (_a, cb) => cb());
	}
	parallelBaseline.callAsync(1, () => {});
	bench.add("interceptors-async: parallel, 5 async taps, no interceptors", () =>
		runBatch(parallelBaseline, INNER_ITERATIONS)
	);

	const parallelAll = new AsyncParallelHook(["a"]);
	parallelAll.intercept({ call: () => {}, tap: () => {} });
	for (let i = 0; i < 5; i++) parallelAll.tapAsync(`p-${i}`, (_a, cb) => cb());
	parallelAll.callAsync(1, () => {});
	bench.add(
		"interceptors-async: parallel, 5 async taps, call + tap interceptor",
		() => runBatch(parallelAll, INNER_ITERATIONS)
	);
}
