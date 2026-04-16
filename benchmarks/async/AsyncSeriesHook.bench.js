/*
	MIT License http://www.opensource.org/licenses/mit-license.php
*/
"use strict";

const { AsyncSeriesHook } = require("../../lib");
const { createBench, runBench, runIfMain } = require("../helpers");

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

function callAsyncPromisified(hook, value) {
	return new Promise((resolve) => {
		hook.callAsync(value, resolve);
	});
}

async function main() {
	const bench = createBench();

	for (const n of [1, 5, 20]) {
		const hook = makeHook(n, "sync");
		bench.add(`AsyncSeriesHook#callAsync (${n} sync taps)`, () =>
			callAsyncPromisified(hook, 1)
		);
	}

	for (const n of [5, 20]) {
		const hook = makeHook(n, "async");
		bench.add(`AsyncSeriesHook#callAsync (${n} async taps)`, () =>
			callAsyncPromisified(hook, 1)
		);
	}

	for (const n of [5]) {
		const hook = makeHook(n, "promise");
		bench.add(`AsyncSeriesHook#callAsync (${n} promise taps)`, () =>
			callAsyncPromisified(hook, 1)
		);
	}

	// .promise() flavor.
	const promiseHook = makeHook(5, "sync");
	bench.add("AsyncSeriesHook#promise (5 sync taps)", () =>
		promiseHook.promise(1)
	);

	const promiseAsyncHook = makeHook(5, "async");
	bench.add("AsyncSeriesHook#promise (5 async taps)", () =>
		promiseAsyncHook.promise(1)
	);

	await runBench(bench);
}

module.exports = main;
runIfMain(module, main);
