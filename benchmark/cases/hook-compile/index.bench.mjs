/*
 * hook-compile
 *
 * Measures first-call compile cost per hook type. Each iteration builds
 * a fresh hook with 5 taps and forces code generation by calling it once.
 * This is the path that webpack hits every time the tap-set changes.
 */

import tapable from "../../../lib/index.js";

const {
	SyncHook,
	SyncBailHook,
	SyncWaterfallHook,
	SyncLoopHook,
	AsyncSeriesHook,
	AsyncSeriesBailHook,
	AsyncSeriesWaterfallHook,
	AsyncParallelHook,
	AsyncParallelBailHook
} = tapable;

/**
 * @param {import('tinybench').Bench} bench
 */
export default function register(bench) {
	bench.add("hook-compile: SyncHook, 5 taps + first call", () => {
		const hook = new SyncHook(["a", "b"]);
		for (let i = 0; i < 5; i++) hook.tap(`p-${i}`, () => {});
		hook.call(1, 2);
	});

	bench.add("hook-compile: SyncBailHook, 5 taps + first call", () => {
		const hook = new SyncBailHook(["a"]);
		for (let i = 0; i < 5; i++) hook.tap(`p-${i}`, () => undefined);
		hook.call(1);
	});

	bench.add("hook-compile: SyncWaterfallHook, 5 taps + first call", () => {
		const hook = new SyncWaterfallHook(["v"]);
		for (let i = 0; i < 5; i++) hook.tap(`p-${i}`, (v) => v);
		hook.call(0);
	});

	bench.add("hook-compile: SyncLoopHook, 5 taps + first call", () => {
		const hook = new SyncLoopHook(["s"]);
		for (let i = 0; i < 5; i++) hook.tap(`p-${i}`, () => undefined);
		hook.call({});
	});

	bench.add("hook-compile: AsyncSeriesHook, 5 taps + first callAsync", () => {
		const hook = new AsyncSeriesHook(["a"]);
		for (let i = 0; i < 5; i++) hook.tap(`p-${i}`, () => {});
		hook.callAsync(1, () => {});
	});

	bench.add(
		"hook-compile: AsyncSeriesBailHook, 5 taps + first callAsync",
		() => {
			const hook = new AsyncSeriesBailHook(["a"]);
			for (let i = 0; i < 5; i++) hook.tap(`p-${i}`, () => undefined);
			hook.callAsync(1, () => {});
		}
	);

	bench.add(
		"hook-compile: AsyncSeriesWaterfallHook, 5 taps + first callAsync",
		() => {
			const hook = new AsyncSeriesWaterfallHook(["v"]);
			for (let i = 0; i < 5; i++) hook.tap(`p-${i}`, (v) => v);
			hook.callAsync(0, () => {});
		}
	);

	bench.add("hook-compile: AsyncParallelHook, 5 taps + first callAsync", () => {
		const hook = new AsyncParallelHook(["a"]);
		for (let i = 0; i < 5; i++) hook.tapAsync(`p-${i}`, (_a, cb) => cb());
		hook.callAsync(1, () => {});
	});

	bench.add(
		"hook-compile: AsyncParallelBailHook, 5 taps + first callAsync",
		() => {
			const hook = new AsyncParallelBailHook(["a"]);
			for (let i = 0; i < 5; i++) {
				hook.tapAsync(`p-${i}`, (_a, cb) => cb(null, undefined));
			}
			hook.callAsync(1, () => {});
		}
	);
}
