/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
"use strict";

const AsyncSeriesBailHook = require("../lib/AsyncSeriesBailHook");
const HookTester = require("./HookTester.test");

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
