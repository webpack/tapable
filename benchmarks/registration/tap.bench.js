/*
	MIT License http://www.opensource.org/licenses/mit-license.php
*/
"use strict";

const { SyncHook, AsyncSeriesHook } = require("../../lib");
const { createBench, runBench, runIfMain } = require("../helpers");

async function main() {
	const bench = createBench();

	bench.add("SyncHook#tap (10 taps, string options)", () => {
		const hook = new SyncHook(["a"]);
		for (let i = 0; i < 10; i++) {
			hook.tap(`p-${i}`, () => {});
		}
	});

	bench.add("SyncHook#tap (10 taps, object options)", () => {
		const hook = new SyncHook(["a"]);
		for (let i = 0; i < 10; i++) {
			hook.tap({ name: `p-${i}` }, () => {});
		}
	});

	bench.add("SyncHook#tap (10 taps, stages)", () => {
		const hook = new SyncHook(["a"]);
		for (let i = 0; i < 10; i++) {
			hook.tap({ name: `p-${i}`, stage: i % 3 }, () => {});
		}
	});

	bench.add("SyncHook#tap (10 taps, alternating before)", () => {
		const hook = new SyncHook(["a"]);
		hook.tap("first", () => {});
		for (let i = 0; i < 9; i++) {
			hook.tap({ name: `p-${i}`, before: "first" }, () => {});
		}
	});

	bench.add("AsyncSeriesHook#tapAsync (10 taps, string options)", () => {
		const hook = new AsyncSeriesHook(["a"]);
		for (let i = 0; i < 10; i++) {
			hook.tapAsync(`p-${i}`, (_a, cb) => cb());
		}
	});

	bench.add("AsyncSeriesHook#tapPromise (10 taps, string options)", () => {
		const hook = new AsyncSeriesHook(["a"]);
		for (let i = 0; i < 10; i++) {
			hook.tapPromise(`p-${i}`, () => Promise.resolve());
		}
	});

	await runBench(bench);
}

module.exports = main;
runIfMain(module, main);
