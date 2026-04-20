/*
 * async-parallel-bail-hook
 *
 * AsyncParallelBailHook races taps in parallel but bails (with the
 * lowest-index result) as soon as any tap produces a non-undefined value.
 */

import tapable from "../../../lib/index.js";

const { AsyncParallelBailHook } = tapable;

function makeHook(numTaps, kind, bailAt) {
	const hook = new AsyncParallelBailHook(["a"]);
	for (let i = 0; i < numTaps; i++) {
		const idx = i;
		const name = `plugin-${idx}`;
		if (kind === "sync") {
			hook.tap(name, (v) => (idx === bailAt ? v : undefined));
		} else {
			hook.tapAsync(name, (v, cb) => cb(null, idx === bailAt ? v : undefined));
		}
	}
	hook.callAsync(1, () => {});
	return hook;
}

const INNER_ITERATIONS = 100;

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
	{
		const hook = makeHook(10, "sync", -1);
		bench.add("async-parallel-bail-hook: 10 sync taps, no bail", () =>
			runBatch(hook)
		);
	}
	{
		const hook = makeHook(10, "sync", 4);
		bench.add("async-parallel-bail-hook: 10 sync taps, bail mid", () =>
			runBatch(hook)
		);
	}
	{
		const hook = makeHook(5, "async", -1);
		bench.add("async-parallel-bail-hook: 5 async taps, no bail", () =>
			runBatch(hook)
		);
	}
	{
		const hook = makeHook(5, "async", 2);
		bench.add("async-parallel-bail-hook: 5 async taps, bail mid", () =>
			runBatch(hook)
		);
	}
}
