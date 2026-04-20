/*
 * interceptors-sync
 *
 * Measures how interceptors slow down the SyncHook `.call()` path. The
 * baseline no-interceptor run is included so delta is visible.
 */

import tapable from "../../../lib/index.js";

const { SyncHook } = tapable;

function makeHook(numTaps, interceptors) {
	const hook = new SyncHook(["a"]);
	for (const i of interceptors) hook.intercept(i);
	for (let i = 0; i < numTaps; i++) {
		hook.tap(`plugin-${i}`, () => {});
	}
	hook.call(1);
	return hook;
}

const INNER_ITERATIONS = 1500;

/**
 * @param {import('tinybench').Bench} bench
 */
export default function register(bench) {
	const baseline = makeHook(5, []);
	bench.add("interceptors-sync: 5 taps, no interceptors", () => {
		for (let i = 0; i < INNER_ITERATIONS; i++) baseline.call(1);
	});

	const call = makeHook(5, [{ call: () => {} }]);
	bench.add("interceptors-sync: 5 taps, call interceptor", () => {
		for (let i = 0; i < INNER_ITERATIONS; i++) call.call(1);
	});

	const tap = makeHook(5, [{ tap: () => {} }]);
	bench.add("interceptors-sync: 5 taps, tap interceptor", () => {
		for (let i = 0; i < INNER_ITERATIONS; i++) tap.call(1);
	});

	const combined = makeHook(5, [{ call: () => {}, tap: () => {} }]);
	bench.add("interceptors-sync: 5 taps, call + tap interceptor", () => {
		for (let i = 0; i < INNER_ITERATIONS; i++) combined.call(1);
	});

	const many = makeHook(5, [
		{ call: () => {} },
		{ tap: () => {} },
		{ call: () => {} }
	]);
	bench.add("interceptors-sync: 5 taps, 3 interceptors", () => {
		for (let i = 0; i < INNER_ITERATIONS; i++) many.call(1);
	});

	// Register interceptor runs at tap time only.
	bench.add(
		"interceptors-sync: register interceptor + 10 tap registrations",
		() => {
			const h = new SyncHook(["a"]);
			h.intercept({ register: (t) => t });
			for (let i = 0; i < 10; i++) h.tap(`p-${i}`, () => {});
		}
	);
}
