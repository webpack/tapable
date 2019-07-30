/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
"use strict";

const HookTester = require("./HookTester");
const AsyncSeriesHook = require("../AsyncSeriesHook");
const AsyncSeriesBailHook = require("../AsyncSeriesBailHook");
const AsyncSeriesWaterfallHook = require("../AsyncSeriesWaterfallHook");
const AsyncSeriesLoopHook = require("../AsyncSeriesLoopHook");

describe("AsyncSeriesHook", () => {
	it("should not have call method", () => {
		const hook = new AsyncSeriesHook([]);
		expect(hook.call).toEqual(undefined);
		expect(typeof hook.callAsync).toEqual("function");
		expect(typeof hook.promise).toEqual("function");
	});

	it("should have tap method", done => {
		const hook = new AsyncSeriesHook([]);
		const mockTap = jest.fn();
		hook.tap("somePlugin", mockTap);
		hook.callAsync(() => done());
		expect(mockTap).toHaveBeenCalledTimes(1);
	});

	it("should have promise method", done => {
		const hook = new AsyncSeriesHook([]);
		const mockTap = jest.fn();
		hook.tap("somePlugin", mockTap);
		hook.promise().then(() => done());
		expect(mockTap).toHaveBeenCalledTimes(1);
	});

	it("should have to correct behavior", async () => {
		const tester = new HookTester(args => new AsyncSeriesHook(args));

		const result = await tester.run();

		expect(result).toMatchSnapshot();
	});
});

describe("AsyncSeriesBailHook", () => {
	it("should have to correct behavior", async () => {
		const tester = new HookTester(args => new AsyncSeriesBailHook(args));

		const result = await tester.run();

		expect(result).toMatchSnapshot();
	});
});

describe("AsyncSeriesWaterfallHook", () => {
	it("should have to correct behavior", async () => {
		const tester = new HookTester(args => new AsyncSeriesWaterfallHook(args));

		const result = await tester.run();

		expect(result).toMatchSnapshot();
	});
});

describe("AsyncSeriesLoopHook", () => {
	it("should have to correct behavior", async () => {
		const tester = new HookTester(args => new AsyncSeriesLoopHook(args));

		const result = await tester.runForLoop();

		expect(result).toMatchSnapshot();
	});
});
