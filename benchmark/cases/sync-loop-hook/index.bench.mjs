/*
 * sync-loop-hook
 *
 * SyncLoopHook re-runs the tap chain while any tap returns a non-undefined
 * value. The case covers:
 *   - single-pass (every tap returns undefined on the first run)
 *   - multi-pass (each tap asks for N reloops before settling)
 */

import tapable from "../../../lib/index.js";

const { SyncLoopHook } = tapable;

function makeHook(numTaps, reloops) {
	const hook = new SyncLoopHook(["state"]);
	for (let i = 0; i < numTaps; i++) {
		const idx = i;
		hook.tap(`plugin-${idx}`, (state) => {
			if (state.counts[idx] < reloops) {
				state.counts[idx]++;
				return true;
			}
			return undefined;
		});
	}
	return hook;
}

function resetState(state) {
	for (let i = 0; i < state.counts.length; i++) state.counts[i] = 0;
}

const INNER_ITERATIONS = 500;

/**
 * @param {import('tinybench').Bench} bench
 */
export default function register(bench) {
	for (const [n, reloops] of [
		[3, 0],
		[10, 0],
		[3, 2]
	]) {
		const hook = makeHook(n, reloops);
		const state = { counts: Array.from({ length: n }, () => 0) };
		bench.add(`sync-loop-hook: ${n} taps, ${reloops} reloops`, () => {
			for (let i = 0; i < INNER_ITERATIONS; i++) {
				resetState(state);
				hook.call(state);
			}
		});
	}
}
