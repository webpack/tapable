/*
 * async-series-waterfall-hook
 *
 * AsyncSeriesWaterfallHook threads a value through a chain of taps where
 * each tap can be sync, callback-async, or promise-async.
 */

import tapable from "../../../lib/index.js";

const { AsyncSeriesWaterfallHook } = tapable;

function makeHook(numTaps, kind) {
	const hook = new AsyncSeriesWaterfallHook(["value"]);
	for (let i = 0; i < numTaps; i++) {
		const name = `plugin-${i}`;
		if (kind === "sync") {
			hook.tap(name, (v) => v + 1);
		} else if (kind === "async") {
			hook.tapAsync(name, (v, cb) => cb(null, v + 1));
		} else if (kind === "promise") {
			hook.tapPromise(name, (v) => Promise.resolve(v + 1));
		}
	}
	hook.callAsync(0, () => {});
	return hook;
}

const INNER_ITERATIONS = 200;

function runBatch(hook) {
	return new Promise((resolve, reject) => {
		let remaining = INNER_ITERATIONS;
		const done = (err) => {
			if (err) return reject(err);
			if (--remaining === 0) return resolve();
		};
		for (let i = 0; i < INNER_ITERATIONS; i++) {
			hook.callAsync(0, done);
		}
	});
}

/**
 * @param {import('tinybench').Bench} bench
 */
export default function register(bench) {
	for (const n of [1, 5, 20]) {
		const hook = makeHook(n, "sync");
		bench.add(`async-series-waterfall-hook: ${n} sync taps`, () =>
			runBatch(hook)
		);
	}

	{
		const hook = makeHook(5, "async");
		bench.add("async-series-waterfall-hook: 5 async taps", () =>
			runBatch(hook)
		);
	}

	{
		const hook = makeHook(5, "promise");
		bench.add("async-series-waterfall-hook: 5 promise taps", () =>
			runBatch(hook)
		);
	}
}
