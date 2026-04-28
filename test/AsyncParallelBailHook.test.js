/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
"use strict";

const AsyncParallelBailHook = require("../lib/AsyncParallelBailHook");
const HookTester = require("./HookTester.test");

describe("AsyncParallelBailHook", () => {
	it("should have to correct behavior", async () => {
		const tester = new HookTester((args) => new AsyncParallelBailHook(args));

		const result = await tester.run();

		expect(result).toMatchSnapshot();
	}, 15000);
});
