/*
 * async-series-loop-hook
 *
 * AsyncSeriesLoopHook is the async cousin of SyncLoopHook - re-runs the
 * tap chain while any tap signals "loop again" (non-undefined value).
 * Covers 0 reloops (single pass) and a small multi-pass case.
 */

import tapable from "../../../lib/index.js";

const { AsyncSeriesLoopHook } = tapable;

function makeHook(numTaps, reloops) {
	const hook = new AsyncSeriesLoopHook(["state"]);
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
	hook.callAsync(
		{ counts: Array.from({ length: numTaps }, () => reloops) },
		() => {}
	);
	return hook;
}

function resetState(state) {
	for (let i = 0; i < state.counts.length; i++) state.counts[i] = 0;
}

const INNER_ITERATIONS = 100;

function runBatch(hook, state) {
	return new Promise((resolve, reject) => {
		let remaining = INNER_ITERATIONS;
		const next = (err) => {
			if (err) return reject(err);
			resetState(state);
			if (--remaining === 0) return resolve();
			hook.callAsync(state, next);
		};
		resetState(state);
		hook.callAsync(state, next);
	});
}

/**
 * @param {import('tinybench').Bench} bench
 */
export default function register(bench) {
	for (const [n, reloops] of [
		[3, 0],
		[3, 2],
		[10, 0]
	]) {
		const hook = makeHook(n, reloops);
		const state = { counts: Array.from({ length: n }, () => 0) };
		bench.add(`async-series-loop-hook: ${n} taps, ${reloops} reloops`, () =>
			runBatch(hook, state)
		);
	}
}
