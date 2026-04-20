/*
 * sync-bail-hook
 *
 * Measures SyncBailHook.call() with taps that either bail early (returning
 * a value) or pass through (returning undefined). Bail position changes
 * how many taps run per call, so it directly exercises the conditional
 * structure of the generated code.
 */

import tapable from "../../../lib/index.js";

const { SyncBailHook } = tapable;

function makeHook(numTaps, bailAt) {
	const hook = new SyncBailHook(["value"]);
	for (let i = 0; i < numTaps; i++) {
		const idx = i;
		hook.tap(`plugin-${idx}`, (v) => (idx === bailAt ? v : undefined));
	}
	hook.call(1);
	return hook;
}

const INNER_ITERATIONS = 1500;

/**
 * @param {import('tinybench').Bench} bench
 */
export default function register(bench) {
	// Full chain walk - no tap bails.
	for (const n of [1, 5, 10, 20]) {
		const hook = makeHook(n, -1);
		bench.add(`sync-bail-hook: ${n} taps, no bail`, () => {
			for (let i = 0; i < INNER_ITERATIONS; i++) {
				hook.call(1);
			}
		});
	}

	// Bail at start / middle / end of a 10-tap chain.
	for (const pos of [0, 4, 9]) {
		const hook = makeHook(10, pos);
		bench.add(`sync-bail-hook: 10 taps, bail at index ${pos}`, () => {
			for (let i = 0; i < INNER_ITERATIONS; i++) {
				hook.call(1);
			}
		});
	}
}
