/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
"use strict";

const SyncHook = require("../lib/SyncHook");
const HookTester = require("./HookTester.test");

describe("SyncHook", () => {
	it("should have to correct behavior", async () => {
		const tester = new HookTester((args) => new SyncHook(args));

		const result = await tester.run(true);

		expect(result).toMatchSnapshot();
	}, 15000);
});
