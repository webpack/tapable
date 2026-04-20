/*
	MIT License http://www.opensource.org/licenses/mit-license.php
*/
"use strict";

const AsyncParallelBailHook = require("../AsyncParallelBailHook");
const AsyncParallelHook = require("../AsyncParallelHook");
const AsyncSeriesBailHook = require("../AsyncSeriesBailHook");
const AsyncSeriesHook = require("../AsyncSeriesHook");
const AsyncSeriesLoopHook = require("../AsyncSeriesLoopHook");
const AsyncSeriesWaterfallHook = require("../AsyncSeriesWaterfallHook");
const SyncBailHook = require("../SyncBailHook");
const SyncHook = require("../SyncHook");
const SyncLoopHook = require("../SyncLoopHook");
const SyncWaterfallHook = require("../SyncWaterfallHook");

describe("Hooks without explicit args", () => {
	it("should construct SyncHook without args", () => {
		const hook = new SyncHook();
		const mock = jest.fn();
		hook.tap("A", mock);
		hook.call();
		expect(mock).toHaveBeenCalledTimes(1);
	});

	it("should construct SyncBailHook without args", () => {
		const hook = new SyncBailHook();
		hook.tap("A", () => "bailed");
		expect(hook.call()).toBe("bailed");
	});

	it("should construct SyncLoopHook without args", () => {
		const hook = new SyncLoopHook();
		let count = 0;
		hook.tap("A", () => {
			if (count++ < 2) return true;
		});
		hook.call();
		expect(count).toBeGreaterThanOrEqual(3);
	});

	it("should throw if SyncWaterfallHook is constructed without args", () => {
		expect(() => new SyncWaterfallHook()).toThrow(
			/Waterfall hooks must have at least one argument/
		);
		expect(() => new SyncWaterfallHook([])).toThrow(
			/Waterfall hooks must have at least one argument/
		);
	});

	it("should throw if AsyncSeriesWaterfallHook is constructed without args", () => {
		expect(() => new AsyncSeriesWaterfallHook()).toThrow(
			/Waterfall hooks must have at least one argument/
		);
		expect(() => new AsyncSeriesWaterfallHook([])).toThrow(
			/Waterfall hooks must have at least one argument/
		);
	});

	it("should construct AsyncParallelHook without args", async () => {
		const hook = new AsyncParallelHook();
		const mock = jest.fn((cb) => cb());
		hook.tapAsync("A", mock);
		await new Promise((resolve) => {
			hook.callAsync(() => resolve());
		});
		expect(mock).toHaveBeenCalledTimes(1);
	});

	it("should construct AsyncParallelBailHook without args", async () => {
		const hook = new AsyncParallelBailHook();
		const mock = jest.fn((cb) => cb());
		hook.tapAsync("A", mock);
		await new Promise((resolve) => {
			hook.callAsync(() => resolve());
		});
		expect(mock).toHaveBeenCalledTimes(1);
	});

	it("should construct AsyncSeriesHook without args", async () => {
		const hook = new AsyncSeriesHook();
		const mock = jest.fn((cb) => cb());
		hook.tapAsync("A", mock);
		await new Promise((resolve) => {
			hook.callAsync(() => resolve());
		});
		expect(mock).toHaveBeenCalledTimes(1);
	});

	it("should construct AsyncSeriesBailHook without args", async () => {
		const hook = new AsyncSeriesBailHook();
		const mock = jest.fn((cb) => cb());
		hook.tapAsync("A", mock);
		await new Promise((resolve) => {
			hook.callAsync(() => resolve());
		});
		expect(mock).toHaveBeenCalledTimes(1);
	});

	it("should construct AsyncSeriesLoopHook without args", () => {
		const hook = new AsyncSeriesLoopHook();
		let calls = 0;
		hook.tapAsync("A", (cb) => {
			calls++;
			cb();
		});
		return new Promise((resolve) => {
			hook.callAsync(() => resolve());
		}).then(() => {
			expect(calls).toBeGreaterThanOrEqual(1);
		});
	});
});
