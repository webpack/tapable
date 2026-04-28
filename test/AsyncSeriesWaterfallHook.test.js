/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
"use strict";

const AsyncSeriesWaterfallHook = require("../lib/AsyncSeriesWaterfallHook");
const HookTester = require("./HookTester.test");

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
