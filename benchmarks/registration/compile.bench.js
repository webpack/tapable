/*
	MIT License http://www.opensource.org/licenses/mit-license.php
*/
"use strict";

const {
	SyncHook,
	SyncBailHook,
	SyncWaterfallHook,
	SyncLoopHook,
	AsyncSeriesHook,
	AsyncSeriesBailHook,
	AsyncSeriesWaterfallHook,
	AsyncParallelHook,
	AsyncParallelBailHook
} = require("../../lib");
const { createBench, runBench, runIfMain } = require("../helpers");

// Measures the combined cost of first registration + code compilation for
// each hook type. The first `.call()` / `.callAsync()` triggers code gen.

async function main() {
	const bench = createBench();

	bench.add("SyncHook: tap 5 + first call (compile)", () => {
		const hook = new SyncHook(["a", "b"]);
		for (let i = 0; i < 5; i++) hook.tap(`p-${i}`, () => {});
		hook.call(1, 2);
	});

	bench.add("SyncBailHook: tap 5 + first call (compile)", () => {
		const hook = new SyncBailHook(["a"]);
		for (let i = 0; i < 5; i++) hook.tap(`p-${i}`, () => undefined);
		hook.call(1);
	});

	bench.add("SyncWaterfallHook: tap 5 + first call (compile)", () => {
		const hook = new SyncWaterfallHook(["v"]);
		for (let i = 0; i < 5; i++) hook.tap(`p-${i}`, (v) => v);
		hook.call(0);
	});

	bench.add("SyncLoopHook: tap 5 + first call (compile)", () => {
		const hook = new SyncLoopHook(["s"]);
		for (let i = 0; i < 5; i++) hook.tap(`p-${i}`, () => undefined);
		hook.call({});
	});

	bench.add("AsyncSeriesHook: tap 5 + first callAsync (compile)", () => {
		const hook = new AsyncSeriesHook(["a"]);
		for (let i = 0; i < 5; i++) hook.tap(`p-${i}`, () => {});
		hook.callAsync(1, () => {});
	});

	bench.add("AsyncSeriesBailHook: tap 5 + first callAsync (compile)", () => {
		const hook = new AsyncSeriesBailHook(["a"]);
		for (let i = 0; i < 5; i++) hook.tap(`p-${i}`, () => undefined);
		hook.callAsync(1, () => {});
	});

	bench.add(
		"AsyncSeriesWaterfallHook: tap 5 + first callAsync (compile)",
		() => {
			const hook = new AsyncSeriesWaterfallHook(["v"]);
			for (let i = 0; i < 5; i++) hook.tap(`p-${i}`, (v) => v);
			hook.callAsync(0, () => {});
		}
	);

	bench.add("AsyncParallelHook: tap 5 + first callAsync (compile)", () => {
		const hook = new AsyncParallelHook(["a"]);
		for (let i = 0; i < 5; i++) hook.tapAsync(`p-${i}`, (_a, cb) => cb());
		hook.callAsync(1, () => {});
	});

	bench.add("AsyncParallelBailHook: tap 5 + first callAsync (compile)", () => {
		const hook = new AsyncParallelBailHook(["a"]);
		for (let i = 0; i < 5; i++)
			hook.tapAsync(`p-${i}`, (_a, cb) => cb(null, undefined));
		hook.callAsync(1, () => {});
	});

	await runBench(bench);
}

module.exports = main;
runIfMain(module, main);
