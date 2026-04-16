/*
	MIT License http://www.opensource.org/licenses/mit-license.php
*/
"use strict";

const { SyncLoopHook } = require("../../lib");
const { createBench, runBench, runIfMain } = require("../helpers");

function makeHook(numTaps, iterations) {
	const hook = new SyncLoopHook(["state"]);
	for (let i = 0; i < numTaps; i++) {
		const idx = i;
		hook.tap(`plugin-${idx}`, (state) => {
			if (state.counts[idx] < iterations) {
				state.counts[idx]++;
				return true;
			}
			return undefined;
		});
	}
	return hook;
}

function resetState(state) {
	for (let i = 0; i < state.counts.length; i++) {
		state.counts[i] = 0;
	}
}

async function main() {
	const bench = createBench();

	// Single-iteration loop (each tap returns undefined).
	for (const n of [3, 10]) {
		const hook = makeHook(n, 0);
		const state = { counts: Array.from({ length: n }, () => 0) };
		bench.add(
			`SyncLoopHook#call (${n} taps, 0 reloops)`,
			() => {
				hook.call(state);
			},
			{ beforeEach: () => resetState(state) }
		);
	}

	// Multi-iteration loop - taps trigger reloops.
	for (const iterations of [1, 3]) {
		const n = 3;
		const hook = makeHook(n, iterations);
		const state = { counts: Array.from({ length: n }, () => 0) };
		bench.add(
			`SyncLoopHook#call (${n} taps, ${iterations} reloops each)`,
			() => {
				hook.call(state);
			},
			{ beforeEach: () => resetState(state) }
		);
	}

	await runBench(bench);
}

module.exports = main;
runIfMain(module, main);
