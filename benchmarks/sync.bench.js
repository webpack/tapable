/*
	MIT License http://www.opensource.org/licenses/mit-license.php
*/
"use strict";

const {
	SyncHook,
	SyncBailHook,
	SyncWaterfallHook,
	SyncLoopHook
} = require("../lib");
const { createBench, runBench } = require("./helpers");

function makeSyncHook(numTaps) {
	const hook = new SyncHook(["a", "b"]);
	for (let i = 0; i < numTaps; i++) {
		hook.tap(`plugin-${i}`, (_a, _b) => {});
	}
	// Force compilation so the benchmark measures the steady-state call path.
	hook.call(1, 2);
	return hook;
}

function makeSyncBailHook(numTaps, bailAt = -1) {
	const hook = new SyncBailHook(["a"]);
	for (let i = 0; i < numTaps; i++) {
		hook.tap(`plugin-${i}`, (v) => (i === bailAt ? v : undefined));
	}
	hook.call(1);
	return hook;
}

function makeSyncWaterfallHook(numTaps) {
	const hook = new SyncWaterfallHook(["value"]);
	for (let i = 0; i < numTaps; i++) {
		hook.tap(`plugin-${i}`, (v) => v + 1);
	}
	hook.call(0);
	return hook;
}

function makeSyncLoopHook(numTaps) {
	const hook = new SyncLoopHook(["state"]);
	for (let i = 0; i < numTaps; i++) {
		const idx = i;
		hook.tap(`plugin-${idx}`, (state) => {
			if (state.counts[idx] < 1) {
				state.counts[idx]++;
				return true;
			}
			return undefined;
		});
	}
	return hook;
}

async function main() {
	const bench = createBench();

	// --- SyncHook.call ---
	const hook0 = makeSyncHook(0);
	bench.add("SyncHook#call (0 taps)", () => {
		hook0.call(1, 2);
	});

	const hook1 = makeSyncHook(1);
	bench.add("SyncHook#call (1 tap)", () => {
		hook1.call(1, 2);
	});

	const hook5 = makeSyncHook(5);
	bench.add("SyncHook#call (5 taps)", () => {
		hook5.call(1, 2);
	});

	const hook20 = makeSyncHook(20);
	bench.add("SyncHook#call (20 taps)", () => {
		hook20.call(1, 2);
	});

	// --- SyncBailHook.call ---
	const bailHookNoBail = makeSyncBailHook(10, -1);
	bench.add("SyncBailHook#call (10 taps, no bail)", () => {
		bailHookNoBail.call(1);
	});

	const bailHookMid = makeSyncBailHook(10, 5);
	bench.add("SyncBailHook#call (10 taps, bail mid)", () => {
		bailHookMid.call(1);
	});

	// --- SyncWaterfallHook.call ---
	const waterfall5 = makeSyncWaterfallHook(5);
	bench.add("SyncWaterfallHook#call (5 taps)", () => {
		waterfall5.call(0);
	});

	const waterfall20 = makeSyncWaterfallHook(20);
	bench.add("SyncWaterfallHook#call (20 taps)", () => {
		waterfall20.call(0);
	});

	// --- SyncLoopHook.call ---
	const loopHook = makeSyncLoopHook(5);
	const loopState = { counts: [0, 0, 0, 0, 0] };
	bench.add(
		"SyncLoopHook#call (5 taps)",
		() => {
			loopHook.call(loopState);
		},
		{
			beforeEach() {
				for (let i = 0; i < loopState.counts.length; i++) {
					loopState.counts[i] = 0;
				}
			}
		}
	);

	// --- Tap registration (no compilation in hot loop) ---
	bench.add("SyncHook#tap registration (10 taps)", () => {
		const h = new SyncHook(["a"]);
		for (let i = 0; i < 10; i++) {
			h.tap(`p-${i}`, () => {});
		}
	});

	bench.add("SyncHook#tap registration with stages (10 taps)", () => {
		const h = new SyncHook(["a"]);
		for (let i = 0; i < 10; i++) {
			h.tap({ name: `p-${i}`, stage: i % 3 }, () => {});
		}
	});

	// --- First-call compile cost ---
	bench.add("SyncHook first call compile (5 taps)", () => {
		const h = new SyncHook(["a", "b"]);
		for (let i = 0; i < 5; i++) {
			h.tap(`p-${i}`, () => {});
		}
		h.call(1, 2);
	});

	await runBench(bench);
}

main().catch((err) => {
	// eslint-disable-next-line no-console
	console.error(err);
	process.exit(1);
});
