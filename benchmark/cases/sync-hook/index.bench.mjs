/*
 * sync-hook
 *
 * Steady-state `.call()` cost for SyncHook at varying tap counts. Each
 * bench body loops over the hook many times so the measurement captures
 * the generated call-path rather than the tinybench harness overhead.
 */

import tapable from "../../../lib/index.js";

const { SyncHook } = tapable;

function makeHook(numTaps, argNames = ["a", "b"]) {
	const hook = new SyncHook(argNames);
	for (let i = 0; i < numTaps; i++) {
		hook.tap(`plugin-${i}`, () => {});
	}
	// Force compilation so the benchmark measures the steady-state call path.
	hook.call(...argNames.map((_, i) => i));
	return hook;
}

const INNER_ITERATIONS = 2000;

/**
 * @param {import('tinybench').Bench} bench
 */
export default function register(bench) {
	for (const n of [0, 1, 5, 10, 20, 50]) {
		const hook = makeHook(n);
		bench.add(`sync-hook: call with ${n} taps`, () => {
			for (let i = 0; i < INNER_ITERATIONS; i++) {
				hook.call(1, 2);
			}
		});
	}

	// Argument-count variations with a fixed 5-tap chain.
	for (const argCount of [0, 1, 3, 5]) {
		const args = Array.from({ length: argCount }, (_, i) => `a${i}`);
		const hook = makeHook(5, args);
		const callArgs = args.map((_, i) => i);
		bench.add(`sync-hook: call 5 taps / ${argCount} args`, () => {
			for (let i = 0; i < INNER_ITERATIONS; i++) {
				hook.call(...callArgs);
			}
		});
	}
}
