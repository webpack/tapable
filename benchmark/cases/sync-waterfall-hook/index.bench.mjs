/*
 * sync-waterfall-hook
 *
 * SyncWaterfallHook threads a value through each tap. Covers three shapes
 * that hit different branches of the generated code:
 *   - every tap returns a new value (value is overwritten on each step)
 *   - every tap returns undefined (initial value threaded through)
 *   - mixed returns
 */

import tapable from "../../../lib/index.js";

const { SyncWaterfallHook } = tapable;

function makeHook(numTaps, returning) {
	const hook = new SyncWaterfallHook(["value"]);
	for (let i = 0; i < numTaps; i++) {
		hook.tap(`plugin-${i}`, returning ? (v) => v + 1 : () => undefined);
	}
	hook.call(0);
	return hook;
}

const INNER_ITERATIONS = 1500;

/**
 * @param {import('tinybench').Bench} bench
 */
export default function register(bench) {
	for (const n of [1, 5, 20, 50]) {
		const hook = makeHook(n, true);
		bench.add(`sync-waterfall-hook: ${n} taps, all return`, () => {
			for (let i = 0; i < INNER_ITERATIONS; i++) {
				hook.call(0);
			}
		});
	}

	for (const n of [5, 20]) {
		const hook = makeHook(n, false);
		bench.add(`sync-waterfall-hook: ${n} taps, all undefined`, () => {
			for (let i = 0; i < INNER_ITERATIONS; i++) {
				hook.call(0);
			}
		});
	}

	const mixed = new SyncWaterfallHook(["value"]);
	for (let i = 0; i < 10; i++) {
		mixed.tap(`plugin-${i}`, i % 2 === 0 ? (v) => v + 1 : () => undefined);
	}
	mixed.call(0);
	bench.add("sync-waterfall-hook: 10 taps, mixed return", () => {
		for (let i = 0; i < INNER_ITERATIONS; i++) {
			mixed.call(0);
		}
	});
}
