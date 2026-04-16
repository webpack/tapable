/*
	MIT License http://www.opensource.org/licenses/mit-license.php
*/
"use strict";

const { AsyncSeriesWaterfallHook } = require("../../lib");
const { createBench, runBench, runIfMain } = require("../helpers");

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

function callAsyncPromisified(hook, value) {
	return new Promise((resolve) => {
		hook.callAsync(value, resolve);
	});
}

async function main() {
	const bench = createBench();

	for (const n of [1, 5, 20]) {
		const hook = makeHook(n, "sync");
		bench.add(`AsyncSeriesWaterfallHook#callAsync (${n} sync taps)`, () =>
			callAsyncPromisified(hook, 0)
		);
	}

	for (const n of [5]) {
		const hook = makeHook(n, "async");
		bench.add(`AsyncSeriesWaterfallHook#callAsync (${n} async taps)`, () =>
			callAsyncPromisified(hook, 0)
		);
	}

	for (const n of [5]) {
		const hook = makeHook(n, "promise");
		bench.add(`AsyncSeriesWaterfallHook#callAsync (${n} promise taps)`, () =>
			callAsyncPromisified(hook, 0)
		);
	}

	await runBench(bench);
}

module.exports = main;
runIfMain(module, main);
