/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
"use strict";

const AsyncParallelBailHook = require("../AsyncParallelBailHook");
const AsyncParallelHook = require("../AsyncParallelHook");
const HookTester = require("./HookTester");

describe("AsyncParallelHook", () => {
	it("should have to correct behavior", async () => {
		const tester = new HookTester((args) => new AsyncParallelHook(args));

		const result = await tester.run();

		expect(result).toMatchSnapshot();
	}, 15000);
});

describe("AsyncParallelBailHook", () => {
	it("should have to correct behavior", async () => {
		const tester = new HookTester((args) => new AsyncParallelBailHook(args));

		const result = await tester.run();

		expect(result).toMatchSnapshot();
	}, 15000);
});
