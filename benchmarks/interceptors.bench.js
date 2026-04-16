/*
	MIT License http://www.opensource.org/licenses/mit-license.php
*/
"use strict";

const { SyncHook, AsyncSeriesHook } = require("../lib");
const { createBench, runBench } = require("./helpers");

function makeSyncHookWithInterceptors(numTaps, interceptors) {
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

	// No interceptors (baseline)
	const hookNoInt = makeSyncHookWithInterceptors(5, []);
	bench.add("SyncHook#call (5 taps, no interceptors)", () => {
		hookNoInt.call(1);
	});

	// Call interceptor only
	const callInterceptor = makeSyncHookWithInterceptors(5, [{ call: () => {} }]);
	bench.add("SyncHook#call (5 taps, call interceptor)", () => {
		callInterceptor.call(1);
	});

	// Tap interceptor (runs per tap)
	const tapInterceptor = makeSyncHookWithInterceptors(5, [{ tap: () => {} }]);
	bench.add("SyncHook#call (5 taps, tap interceptor)", () => {
		tapInterceptor.call(1);
	});

	// Register interceptor (only runs at registration time - measured during setup)
	bench.add("SyncHook#tap with register interceptor (10 taps)", () => {
		const hook = new SyncHook(["a"]);
		hook.intercept({ register: (tap) => tap });
		for (let i = 0; i < 10; i++) {
			hook.tap(`p-${i}`, () => {});
		}
	});

	// AsyncSeriesHook with interceptors
	const asyncHook = new AsyncSeriesHook(["a"]);
	asyncHook.intercept({ call: () => {} });
	for (let i = 0; i < 5; i++) {
		asyncHook.tap(`p-${i}`, () => {});
	}
	asyncHook.callAsync(1, () => {});
	bench.add("AsyncSeriesHook#callAsync (5 taps, call interceptor)", () => {
		return new Promise((resolve) => {
			asyncHook.callAsync(1, resolve);
		});
	});

	await runBench(bench);
}

main().catch((err) => {
	// eslint-disable-next-line no-console
	console.error(err);
	process.exit(1);
});
