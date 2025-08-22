/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
"use strict";

const AsyncSeriesBailHook = require("../AsyncSeriesBailHook");
const AsyncSeriesHook = require("../AsyncSeriesHook");
const AsyncSeriesLoopHook = require("../AsyncSeriesLoopHook");
const AsyncSeriesWaterfallHook = require("../AsyncSeriesWaterfallHook");
const HookTester = require("./HookTester");

describe("AsyncSeriesHook", () => {
	it("should not have call method", () => {
		const hook = new AsyncSeriesHook([]);
		expect(hook.call).toBeUndefined();
		expect(typeof hook.callAsync).toBe("function");
		expect(typeof hook.promise).toBe("function");
	});

	it("should have tap method", (done) => {
		const hook = new AsyncSeriesHook([]);
		const mockTap = jest.fn();
		hook.tap("somePlugin", mockTap);
		hook.callAsync(() => done());
		expect(mockTap).toHaveBeenCalledTimes(1);
	});

	it("should have promise method", (done) => {
		const hook = new AsyncSeriesHook([]);
		const mockTap = jest.fn();
		hook.tap("somePlugin", mockTap);
		hook.promise().then(() => done());
		expect(mockTap).toHaveBeenCalledTimes(1);
	});

	it("should have to correct behavior", async () => {
		const tester = new HookTester((args) => new AsyncSeriesHook(args));

		const result = await tester.run();

		expect(result).toMatchSnapshot();
	});
});

describe("AsyncSeriesBailHook", () => {
	it("should have to correct behavior", async () => {
		const tester = new HookTester((args) => new AsyncSeriesBailHook(args));

		const result = await tester.run();

		expect(result).toMatchSnapshot();
	});

	it("should not crash with many plugins", () => {
		const hook = new AsyncSeriesBailHook(["x"]);
		for (let i = 0; i < 1000; i++) {
			hook.tap("Test", () => 42);
		}
		hook.tapAsync("Test", (x, callback) => callback(null, 42));
		hook.tapPromise("Test", (_x) => Promise.resolve(42));
		return expect(hook.promise()).resolves.toBe(42);
	});
});

describe("AsyncSeriesWaterfallHook", () => {
	it("should have to correct behavior", async () => {
		const tester = new HookTester((args) => new AsyncSeriesWaterfallHook(args));

		const result = await tester.run();

		expect(result).toMatchSnapshot();
	});

	it("should work with undefined", async () => {
		const hook = new AsyncSeriesWaterfallHook(["x"]);
		hook.tap("number", () => 42);
		hook.tap("undefined", () => undefined);
		return expect(hook.promise()).resolves.toBe(42);
	});

	it("should work with void", async () => {
		const hook = new AsyncSeriesWaterfallHook(["x"]);
		hook.tap("number", () => 42);
		hook.tap("undefined", () => {});
		return expect(hook.promise()).resolves.toBe(42);
	});

	it("should work with undefined and number again", async () => {
		const hook = new AsyncSeriesWaterfallHook(["x"]);
		hook.tap("number", () => 42);
		hook.tap("undefined", () => {});
		hook.tap("number-again", () => 43);
		return expect(hook.promise()).resolves.toBe(43);
	});

	it("should work with null", async () => {
		const hook = new AsyncSeriesWaterfallHook(["x"]);
		hook.tap("number", () => 42);
		hook.tap("undefined", () => null);
		return expect(hook.promise()).resolves.toBeNull();
	});

	it("should work with different types", async () => {
		const hook = new AsyncSeriesWaterfallHook(["x"]);
		hook.tap("number", () => 42);
		hook.tap("string", () => "string");
		return expect(hook.promise()).resolves.toBe("string");
	});
});

describe("AsyncSeriesLoopHook", () => {
	it("should have to correct behavior", async () => {
		const tester = new HookTester((args) => new AsyncSeriesLoopHook(args));

		const result = await tester.runForLoop();

		expect(result).toMatchSnapshot();
	});
});
