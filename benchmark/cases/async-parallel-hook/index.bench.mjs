/*
 * async-parallel-hook
 *
 * AsyncParallelHook fires every tap at once and waits for all of them
 * to finish. Touches the generated parallel loop / counter structure.
 */

import tapable from "../../../lib/index.js";

const { AsyncParallelHook } = tapable;

function makeHook(numTaps, kind) {
	const hook = new AsyncParallelHook(["a"]);
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

function runBatch(hook) {
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

/**
 * @param {import('tinybench').Bench} bench
 */
export default function register(bench) {
	for (const n of [1, 5, 20]) {
		const hook = makeHook(n, "sync");
		bench.add(`async-parallel-hook: ${n} sync taps`, () => runBatch(hook));
	}

	for (const n of [5, 20]) {
		const hook = makeHook(n, "async");
		bench.add(`async-parallel-hook: ${n} async taps`, () => runBatch(hook));
	}

	{
		const hook = makeHook(5, "promise");
		bench.add("async-parallel-hook: 5 promise taps", () => runBatch(hook));
	}
}
