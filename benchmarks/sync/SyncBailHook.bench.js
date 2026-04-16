/*
	MIT License http://www.opensource.org/licenses/mit-license.php
*/
"use strict";

const { SyncBailHook } = require("../../lib");
const { createBench, runBench, runIfMain } = require("../helpers");

function makeHook(numTaps, bailAt = -1) {
	const hook = new SyncBailHook(["a"]);
	for (let i = 0; i < numTaps; i++) {
		const idx = i;
		hook.tap(`plugin-${idx}`, (v) => (idx === bailAt ? v : undefined));
	}
	hook.call(1);
	return hook;
}

async function main() {
	const bench = createBench();

	// No bail - full chain walk.
	for (const n of [1, 5, 10, 20]) {
		const hook = makeHook(n, -1);
		bench.add(`SyncBailHook#call (${n} taps, no bail)`, () => {
			hook.call(1);
		});
	}

	// Bail at different positions for a 10-tap hook.
	for (const pos of [0, 4, 9]) {
		const hook = makeHook(10, pos);
		bench.add(`SyncBailHook#call (10 taps, bail at ${pos})`, () => {
			hook.call(1);
		});
	}

	await runBench(bench);
}

module.exports = main;
runIfMain(module, main);
