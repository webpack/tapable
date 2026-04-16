/*
	MIT License http://www.opensource.org/licenses/mit-license.php
*/
"use strict";

const { AsyncParallelHook } = require("../../lib");
const { createBench, runBench, runIfMain } = require("../helpers");

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

function callAsyncPromisified(hook, value) {
	return new Promise((resolve) => {
		hook.callAsync(value, resolve);
	});
}

async function main() {
	const bench = createBench();

	for (const n of [1, 5, 20]) {
		const hook = makeHook(n, "sync");
		bench.add(`AsyncParallelHook#callAsync (${n} sync taps)`, () =>
			callAsyncPromisified(hook, 1)
		);
	}

	for (const n of [5, 20]) {
		const hook = makeHook(n, "async");
		bench.add(`AsyncParallelHook#callAsync (${n} async taps)`, () =>
			callAsyncPromisified(hook, 1)
		);
	}

	for (const n of [5]) {
		const hook = makeHook(n, "promise");
		bench.add(`AsyncParallelHook#callAsync (${n} promise taps)`, () =>
			callAsyncPromisified(hook, 1)
		);
	}

	await runBench(bench);
}

module.exports = main;
runIfMain(module, main);
