/*
	MIT License http://www.opensource.org/licenses/mit-license.php
*/
"use strict";

const { AsyncSeriesLoopHook } = require("../../lib");
const { createBench, runBench, runIfMain } = require("../helpers");

function makeHook(numTaps, iterations) {
	const hook = new AsyncSeriesLoopHook(["state"]);
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
	// Warm up compile.
	hook.callAsync(
		{ counts: Array.from({ length: numTaps }, () => iterations) },
		() => {}
	);
	return hook;
}

function resetState(state) {
	for (let i = 0; i < state.counts.length; i++) state.counts[i] = 0;
}

function callAsyncPromisified(hook, value) {
	return new Promise((resolve) => hook.callAsync(value, resolve));
}

async function main() {
	const bench = createBench();

	for (const [n, iters] of [
		[3, 0],
		[3, 2],
		[10, 0]
	]) {
		const hook = makeHook(n, iters);
		const state = { counts: Array.from({ length: n }, () => 0) };
		bench.add(
			`AsyncSeriesLoopHook#callAsync (${n} sync taps, ${iters} reloops)`,
			() => callAsyncPromisified(hook, state),
			{ beforeEach: () => resetState(state) }
		);
	}

	await runBench(bench);
}

module.exports = main;
runIfMain(module, main);
