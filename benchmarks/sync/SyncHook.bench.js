/*
	MIT License http://www.opensource.org/licenses/mit-license.php
*/
"use strict";

const { SyncHook } = require("../../lib");
const { createBench, runBench, runIfMain } = require("../helpers");

function makeHook(numTaps, args = ["a", "b"]) {
	const hook = new SyncHook(args);
	for (let i = 0; i < numTaps; i++) {
		hook.tap(`plugin-${i}`, () => {});
	}
	// Force compile so steady-state call path is measured.
	hook.call(...args.map((_, i) => i));
	return hook;
}

async function main() {
	const bench = createBench();

	for (const n of [0, 1, 3, 5, 10, 20, 50]) {
		const hook = makeHook(n);
		bench.add(`SyncHook#call (${n} taps, 2 args)`, () => {
			hook.call(1, 2);
		});
	}

	// Argument count variations (keeps 5 taps constant).
	for (const argCount of [0, 1, 3, 5]) {
		const args = Array.from({ length: argCount }, (_, i) => `a${i}`);
		const hook = makeHook(5, args);
		const callArgs = args.map((_, i) => i);
		bench.add(`SyncHook#call (5 taps, ${argCount} args)`, () => {
			hook.call(...callArgs);
		});
	}

	// Single tap that touches its args (prevents the engine from assuming
	// arguments are unused).
	const touchingHook = new SyncHook(["a", "b"]);
	let sink = 0;
	touchingHook.tap("touching", (a, b) => {
		sink = a + b;
	});
	touchingHook.call(1, 2);
	bench.add("SyncHook#call (1 tap, reads args)", () => {
		touchingHook.call(sink, 2);
	});

	await runBench(bench);
}

module.exports = main;
runIfMain(module, main);
