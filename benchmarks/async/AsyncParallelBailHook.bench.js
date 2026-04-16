/*
	MIT License http://www.opensource.org/licenses/mit-license.php
*/
"use strict";

const { AsyncParallelBailHook } = require("../../lib");
const { createBench, runBench, runIfMain } = require("../helpers");

function makeHook(numTaps, kind, bailAt = -1) {
	const hook = new AsyncParallelBailHook(["a"]);
	for (let i = 0; i < numTaps; i++) {
		const idx = i;
		const name = `plugin-${idx}`;
		if (kind === "sync") {
			hook.tap(name, (v) => (idx === bailAt ? v : undefined));
		} else if (kind === "async") {
			hook.tapAsync(name, (v, cb) => cb(null, idx === bailAt ? v : undefined));
		}
	}
	hook.callAsync(1, () => {});
	return hook;
}

function callAsyncPromisified(hook, value) {
	return new Promise((resolve) => {
		hook.callAsync(value, resolve);
	});
}

async function main() {
	const bench = createBench();

	const noBail = makeHook(10, "sync", -1);
	bench.add("AsyncParallelBailHook#callAsync (10 sync taps, no bail)", () =>
		callAsyncPromisified(noBail, 1)
	);

	const bailMid = makeHook(10, "sync", 4);
	bench.add("AsyncParallelBailHook#callAsync (10 sync taps, bail mid)", () =>
		callAsyncPromisified(bailMid, 1)
	);

	const asyncNoBail = makeHook(5, "async", -1);
	bench.add("AsyncParallelBailHook#callAsync (5 async taps, no bail)", () =>
		callAsyncPromisified(asyncNoBail, 1)
	);

	const asyncBail = makeHook(5, "async", 2);
	bench.add("AsyncParallelBailHook#callAsync (5 async taps, bail mid)", () =>
		callAsyncPromisified(asyncBail, 1)
	);

	await runBench(bench);
}

module.exports = main;
runIfMain(module, main);
