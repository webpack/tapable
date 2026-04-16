/*
	MIT License http://www.opensource.org/licenses/mit-license.php
*/
"use strict";

const { MultiHook, SyncHook } = require("../../lib");
const { createBench, runBench, runIfMain } = require("../helpers");

async function main() {
	const bench = createBench();

	// 3 underlying SyncHooks, each gets 5 taps via MultiHook#tap.
	const buildMulti = () =>
		new MultiHook([
			new SyncHook(["x"]),
			new SyncHook(["x"]),
			new SyncHook(["x"])
		]);

	const multi = buildMulti();
	for (let i = 0; i < 5; i++) {
		multi.tap(`plugin-${i}`, () => {});
	}
	multi.hooks[0].call(1);
	multi.hooks[1].call(1);
	multi.hooks[2].call(1);

	bench.add("MultiHook#tap (3 hooks, 10 registrations)", () => {
		const m = buildMulti();
		for (let i = 0; i < 10; i++) {
			m.tap(`p-${i}`, () => {});
		}
	});

	bench.add("MultiHook#isUsed (3 hooks, 5 taps)", () => {
		multi.isUsed();
	});

	bench.add("MultiHook#intercept (3 hooks)", () => {
		const m = buildMulti();
		for (let i = 0; i < 5; i++) m.tap(`p-${i}`, () => {});
		m.intercept({ call: () => {} });
	});

	await runBench(bench);
}

module.exports = main;
runIfMain(module, main);
