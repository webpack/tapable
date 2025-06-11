"use strict";

const AsyncSeriesHook = require("../AsyncSeriesHook");

describe("HookStackOverflow", () => {
	it("should not crash when compiling a large hook", () => {
		const hook = new AsyncSeriesHook(["a", "b"]);

		for (let i = 0; i < 10; i++) {
			hook.tap("TestPlugin", (_a, _b) => {});
			hook.tapAsync("TestPlugin", (a, b, callback) => callback());
			hook.tapPromise("TestPlugin", (_a, _b) => Promise.resolve());
		}

		expect(hook.taps).toBeDefined();

		return hook.promise(1, 2);
	});
});
