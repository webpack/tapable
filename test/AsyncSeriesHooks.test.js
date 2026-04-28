/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
"use strict";

const AsyncSeriesHook = require("../lib/AsyncSeriesHook");
const HookTester = require("./HookTester.test");

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
