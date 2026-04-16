/*
	MIT License http://www.opensource.org/licenses/mit-license.php
*/
"use strict";

const { SyncWaterfallHook } = require("../../lib");
const { createBench, runBench, runIfMain } = require("../helpers");

function makeHook(numTaps, returning = true) {
	const hook = new SyncWaterfallHook(["value"]);
	for (let i = 0; i < numTaps; i++) {
		hook.tap(`plugin-${i}`, returning ? (v) => v + 1 : () => undefined);
	}
	hook.call(0);
	return hook;
}

async function main() {
	const bench = createBench();

	for (const n of [1, 5, 10, 20, 50]) {
		const hook = makeHook(n, true);
		bench.add(`SyncWaterfallHook#call (${n} taps, all return)`, () => {
			hook.call(0);
		});
	}

	// Taps returning undefined - initial value is passed through.
	for (const n of [5, 20]) {
		const hook = makeHook(n, false);
		bench.add(`SyncWaterfallHook#call (${n} taps, all undefined)`, () => {
			hook.call(0);
		});
	}

	// Mixed: half return, half don't.
	const mixed = new SyncWaterfallHook(["value"]);
	for (let i = 0; i < 10; i++) {
		mixed.tap(`plugin-${i}`, i % 2 === 0 ? (v) => v + 1 : () => undefined);
	}
	mixed.call(0);
	bench.add("SyncWaterfallHook#call (10 taps, mixed return)", () => {
		mixed.call(0);
	});

	await runBench(bench);
}

module.exports = main;
runIfMain(module, main);
