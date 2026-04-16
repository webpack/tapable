/*
	MIT License http://www.opensource.org/licenses/mit-license.php
*/
"use strict";

const { AsyncSeriesHook, AsyncParallelHook } = require("../../lib");
const { createBench, runBench, runIfMain } = require("../helpers");

function callAsyncPromisified(hook, value) {
	return new Promise((resolve) => {
		hook.callAsync(value, resolve);
	});
}

async function main() {
	const bench = createBench();

	// Series: baseline vs interceptors.
	const seriesBaseline = new AsyncSeriesHook(["a"]);
	for (let i = 0; i < 5; i++) seriesBaseline.tap(`p-${i}`, () => {});
	seriesBaseline.callAsync(1, () => {});
	bench.add("AsyncSeriesHook#callAsync (5 sync taps, no interceptors)", () =>
		callAsyncPromisified(seriesBaseline, 1)
	);

	const seriesCall = new AsyncSeriesHook(["a"]);
	seriesCall.intercept({ call: () => {} });
	for (let i = 0; i < 5; i++) seriesCall.tap(`p-${i}`, () => {});
	seriesCall.callAsync(1, () => {});
	bench.add("AsyncSeriesHook#callAsync (5 sync taps, call interceptor)", () =>
		callAsyncPromisified(seriesCall, 1)
	);

	const seriesTap = new AsyncSeriesHook(["a"]);
	seriesTap.intercept({ tap: () => {} });
	for (let i = 0; i < 5; i++) seriesTap.tap(`p-${i}`, () => {});
	seriesTap.callAsync(1, () => {});
	bench.add("AsyncSeriesHook#callAsync (5 sync taps, tap interceptor)", () =>
		callAsyncPromisified(seriesTap, 1)
	);

	// Parallel: baseline vs interceptors.
	const parallelBaseline = new AsyncParallelHook(["a"]);
	for (let i = 0; i < 5; i++)
		parallelBaseline.tapAsync(`p-${i}`, (_a, cb) => cb());
	parallelBaseline.callAsync(1, () => {});
	bench.add("AsyncParallelHook#callAsync (5 async taps, no interceptors)", () =>
		callAsyncPromisified(parallelBaseline, 1)
	);

	const parallelAll = new AsyncParallelHook(["a"]);
	parallelAll.intercept({ call: () => {}, tap: () => {} });
	for (let i = 0; i < 5; i++) parallelAll.tapAsync(`p-${i}`, (_a, cb) => cb());
	parallelAll.callAsync(1, () => {});
	bench.add(
		"AsyncParallelHook#callAsync (5 async taps, call + tap interceptor)",
		() => callAsyncPromisified(parallelAll, 1)
	);

	await runBench(bench);
}

module.exports = main;
runIfMain(module, main);
