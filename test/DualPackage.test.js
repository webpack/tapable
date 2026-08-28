const { SyncHook } = require("../lib/index.js");

describe("Dual Module Package", () => {
	it("should support ESM import via .mjs entry", () => {
		const hook = new SyncHook(["value"]);
		const calls = [];
		hook.tap("A", (v) => calls.push(v));
		hook.call(42);
		expect(calls).toEqual([42]);
	});

	it("should expose all Hook classes from CJS entry", () => {
		const tapable = require("../lib/index.js");
		expect(tapable.SyncHook).toBeDefined();
		expect(tapable.SyncBailHook).toBeDefined();
		expect(tapable.SyncWaterfallHook).toBeDefined();
		expect(tapable.SyncLoopHook).toBeDefined();
		expect(tapable.AsyncParallelHook).toBeDefined();
		expect(tapable.AsyncParallelBailHook).toBeDefined();
		expect(tapable.AsyncSeriesHook).toBeDefined();
		expect(tapable.AsyncSeriesBailHook).toBeDefined();
		expect(tapable.AsyncSeriesWaterfallHook).toBeDefined();
		expect(tapable.AsyncSeriesLoopHook).toBeDefined();
		expect(tapable.HookMap).toBeDefined();
		expect(tapable.MultiHook).toBeDefined();
		expect(tapable.__esModule).toBe(true);
	});
});
