/*
	MIT License http://www.opensource.org/licenses/mit-license.php
*/
"use strict";

const SyncLoopHookTest = require("../lib/SyncLoopHook");

describe("SyncLoopHook", () => {
	it("should throw on tapAsync", () => {
		const hook = new SyncLoopHookTest(["a"]);
		expect(() => hook.tapAsync("A", () => {})).toThrow(
			/tapAsync is not supported on a SyncLoopHook/
		);
	});

	it("should throw on tapPromise", () => {
		const hook = new SyncLoopHookTest(["a"]);
		expect(() => hook.tapPromise("A", () => {})).toThrow(
			/tapPromise is not supported on a SyncLoopHook/
		);
	});

	it("should loop through taps until all return undefined", () => {
		const hook = new SyncLoopHookTest(["counter"]);
		let firstCalls = 0;
		let secondCalls = 0;
		hook.tap("first", () => {
			if (firstCalls++ < 2) return true;
		});
		hook.tap("second", () => {
			if (secondCalls++ < 1) return true;
		});
		hook.call();
		expect(firstCalls).toBeGreaterThanOrEqual(3);
		expect(secondCalls).toBeGreaterThanOrEqual(2);
	});

	it("should be callable without arguments using default args", () => {
		const hook = new SyncLoopHookTest();
		const mock = jest.fn();
		hook.tap("A", mock);
		hook.call();
		expect(mock).toHaveBeenCalledTimes(1);
	});
});
