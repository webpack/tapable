/*
 * async-series-hook
 *
 * AsyncSeriesHook under its three tap flavors:
 *   - sync taps  (`hook.tap`)         -> generated code falls through
 *   - async taps (`hook.tapAsync`)    -> callback continuations
 *   - promise taps (`hook.tapPromise`) -> .then() continuations
 *
 * A batch of callAsync / promise invocations runs per iteration so the
 * measured body dominates the tinybench scheduler overhead.
 */

import tapable from "../../../lib/index.js";

const { AsyncSeriesHook } = tapable;

function makeHook(numTaps, kind) {
	const hook = new AsyncSeriesHook(["a"]);
	for (let i = 0; i < numTaps; i++) {
		const name = `plugin-${i}`;
		if (kind === "sync") {
			hook.tap(name, () => {});
		} else if (kind === "async") {
			hook.tapAsync(name, (_a, cb) => cb());
		} else if (kind === "promise") {
			hook.tapPromise(name, () => Promise.resolve());
		}
	}
	hook.callAsync(1, () => {});
	return hook;
}

const INNER_ITERATIONS = 200;

function runCallbackBatch(hook) {
	return new Promise((resolve, reject) => {
		let remaining = INNER_ITERATIONS;
		const done = (err) => {
			if (err) return reject(err);
			if (--remaining === 0) return resolve();
		};
		for (let i = 0; i < INNER_ITERATIONS; i++) {
			hook.callAsync(1, done);
		}
	});
}

async function runPromiseBatch(hook) {
	for (let i = 0; i < INNER_ITERATIONS; i++) {
		await hook.promise(1);
	}
}

/**
 * @param {import('tinybench').Bench} bench
 */
export default function register(bench) {
	for (const n of [1, 5, 20]) {
		const hook = makeHook(n, "sync");
		bench.add(`async-series-hook: callAsync, ${n} sync taps`, () =>
			runCallbackBatch(hook)
		);
	}

	for (const n of [5, 20]) {
		const hook = makeHook(n, "async");
		bench.add(`async-series-hook: callAsync, ${n} async taps`, () =>
			runCallbackBatch(hook)
		);
	}

	{
		const hook = makeHook(5, "promise");
		bench.add("async-series-hook: callAsync, 5 promise taps", () =>
			runCallbackBatch(hook)
		);
	}

	{
		const hook = makeHook(5, "sync");
		bench.add("async-series-hook: promise, 5 sync taps", () =>
			runPromiseBatch(hook)
		);
	}

	{
		const hook = makeHook(5, "async");
		bench.add("async-series-hook: promise, 5 async taps", () =>
			runPromiseBatch(hook)
		);
	}
}
