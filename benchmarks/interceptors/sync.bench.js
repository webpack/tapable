/*
	MIT License http://www.opensource.org/licenses/mit-license.php
*/
"use strict";

const { SyncHook } = require("../../lib");
const { createBench, runBench, runIfMain } = require("../helpers");

function makeHook(numTaps, interceptors) {
	const hook = new SyncHook(["a"]);
	for (const i of interceptors) hook.intercept(i);
	for (let i = 0; i < numTaps; i++) {
		hook.tap(`plugin-${i}`, () => {});
	}
	hook.call(1);
	return hook;
}

async function main() {
	const bench = createBench();

	// Baseline.
	const baseline = makeHook(5, []);
	bench.add("SyncHook#call (5 taps, no interceptors)", () => {
		baseline.call(1);
	});

	// Individual interceptor kinds.
	const callOnly = makeHook(5, [{ call: () => {} }]);
	bench.add("SyncHook#call (5 taps, call interceptor)", () => {
		callOnly.call(1);
	});

	const tapOnly = makeHook(5, [{ tap: () => {} }]);
	bench.add("SyncHook#call (5 taps, tap interceptor)", () => {
		tapOnly.call(1);
	});

	// All hook-time interceptor kinds combined.
	const combined = makeHook(5, [
		{
			call: () => {},
			tap: () => {}
		}
	]);
	bench.add("SyncHook#call (5 taps, call + tap interceptors)", () => {
		combined.call(1);
	});

	// Multiple interceptors layered.
	const many = makeHook(5, [
		{ call: () => {} },
		{ tap: () => {} },
		{ call: () => {} }
	]);
	bench.add("SyncHook#call (5 taps, 3 interceptors)", () => {
		many.call(1);
	});

	// Register interceptor (only runs at tap time).
	bench.add("SyncHook#tap with register interceptor (10 taps)", () => {
		const hook = new SyncHook(["a"]);
		hook.intercept({ register: (tap) => tap });
		for (let i = 0; i < 10; i++) {
			hook.tap(`p-${i}`, () => {});
		}
	});

	// Late interceptor add: must reset compilation.
	bench.add("SyncHook#intercept re-register (10 taps)", () => {
		const hook = new SyncHook(["a"]);
		for (let i = 0; i < 10; i++) hook.tap(`p-${i}`, () => {});
		hook.call(1);
		hook.intercept({ register: (tap) => tap });
		hook.call(1);
	});

	await runBench(bench);
}

module.exports = main;
runIfMain(module, main);
