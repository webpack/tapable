/*
	MIT License http://www.opensource.org/licenses/mit-license.php
*/
"use strict";

const {
	AsyncSeriesHook,
	AsyncSeriesBailHook,
	AsyncSeriesWaterfallHook,
	AsyncParallelHook,
	AsyncParallelBailHook
} = require("../lib");
const { createBench, runBench } = require("./helpers");

function syncTap() {}
function syncWaterfallTap(v) {
	return v + 1;
}

function makeAsyncSeriesHook(numTaps) {
	const hook = new AsyncSeriesHook(["a"]);
	for (let i = 0; i < numTaps; i++) {
		hook.tap(`plugin-${i}`, syncTap);
	}
	// Warm up (compile) once.
	hook.callAsync(1, () => {});
	return hook;
}

function makeAsyncSeriesWaterfallHook(numTaps) {
	const hook = new AsyncSeriesWaterfallHook(["value"]);
	for (let i = 0; i < numTaps; i++) {
		hook.tap(`plugin-${i}`, syncWaterfallTap);
	}
	hook.callAsync(0, () => {});
	return hook;
}

function makeAsyncSeriesBailHook(numTaps) {
	const hook = new AsyncSeriesBailHook(["a"]);
	for (let i = 0; i < numTaps; i++) {
		hook.tap(`plugin-${i}`, syncTap);
	}
	hook.callAsync(1, () => {});
	return hook;
}

function makeAsyncParallelHook(numTaps) {
	const hook = new AsyncParallelHook(["a"]);
	for (let i = 0; i < numTaps; i++) {
		// Use async taps so parallel behavior is exercised.
		hook.tapAsync(`plugin-${i}`, (_a, cb) => cb());
	}
	hook.callAsync(1, () => {});
	return hook;
}

function makeAsyncParallelBailHook(numTaps) {
	const hook = new AsyncParallelBailHook(["a"]);
	for (let i = 0; i < numTaps; i++) {
		hook.tapAsync(`plugin-${i}`, (_a, cb) => cb());
	}
	hook.callAsync(1, () => {});
	return hook;
}

async function main() {
	const bench = createBench();

	// --- AsyncSeriesHook.callAsync (sync taps) ---
	const seriesHook5 = makeAsyncSeriesHook(5);
	bench.add("AsyncSeriesHook#callAsync (5 sync taps)", () => {
		return new Promise((resolve) => {
			seriesHook5.callAsync(1, resolve);
		});
	});

	const seriesHook20 = makeAsyncSeriesHook(20);
	bench.add("AsyncSeriesHook#callAsync (20 sync taps)", () => {
		return new Promise((resolve) => {
			seriesHook20.callAsync(1, resolve);
		});
	});

	// --- AsyncSeriesHook.promise ---
	const seriesPromise5 = makeAsyncSeriesHook(5);
	bench.add("AsyncSeriesHook#promise (5 sync taps)", () => {
		return seriesPromise5.promise(1);
	});

	// --- AsyncSeriesBailHook.callAsync ---
	const seriesBail10 = makeAsyncSeriesBailHook(10);
	bench.add("AsyncSeriesBailHook#callAsync (10 sync taps)", () => {
		return new Promise((resolve) => {
			seriesBail10.callAsync(1, resolve);
		});
	});

	// --- AsyncSeriesWaterfallHook.callAsync ---
	const waterfall5 = makeAsyncSeriesWaterfallHook(5);
	bench.add("AsyncSeriesWaterfallHook#callAsync (5 sync taps)", () => {
		return new Promise((resolve) => {
			waterfall5.callAsync(0, resolve);
		});
	});

	const waterfall20 = makeAsyncSeriesWaterfallHook(20);
	bench.add("AsyncSeriesWaterfallHook#callAsync (20 sync taps)", () => {
		return new Promise((resolve) => {
			waterfall20.callAsync(0, resolve);
		});
	});

	// --- AsyncParallelHook.callAsync ---
	const parallel5 = makeAsyncParallelHook(5);
	bench.add("AsyncParallelHook#callAsync (5 async taps)", () => {
		return new Promise((resolve) => {
			parallel5.callAsync(1, resolve);
		});
	});

	const parallel20 = makeAsyncParallelHook(20);
	bench.add("AsyncParallelHook#callAsync (20 async taps)", () => {
		return new Promise((resolve) => {
			parallel20.callAsync(1, resolve);
		});
	});

	// --- AsyncParallelBailHook.callAsync ---
	const parallelBail10 = makeAsyncParallelBailHook(10);
	bench.add("AsyncParallelBailHook#callAsync (10 async taps)", () => {
		return new Promise((resolve) => {
			parallelBail10.callAsync(1, resolve);
		});
	});

	await runBench(bench);
}

main().catch((err) => {
	// eslint-disable-next-line no-console
	console.error(err);
	process.exit(1);
});
