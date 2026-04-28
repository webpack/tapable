/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
"use strict";

const AsyncSeriesLoopHook = require("../lib/AsyncSeriesLoopHook");
const HookTester = require("./HookTester.test");

describe("AsyncSeriesLoopHook", () => {
	it("should have to correct behavior", async () => {
		const tester = new HookTester((args) => new AsyncSeriesLoopHook(args));

		const result = await tester.runForLoop();

		expect(result).toMatchSnapshot();
	});
});
