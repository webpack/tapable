/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
"use strict";

const SyncBailHook = require("../lib/SyncBailHook");
const SyncHook = require("../lib/SyncHook");
const SyncLoopHook = require("../lib/SyncLoopHook");
const SyncWaterfallHook = require("../lib/SyncWaterfallHook");
const HookTester = require("./HookTester.test");

describe("SyncHook", () => {
	it("should have to correct behavior", async () => {
		const tester = new HookTester((args) => new SyncHook(args));

		const result = await tester.run(true);

		expect(result).toMatchSnapshot();
	}, 15000);
});

describe("SyncBailHook", () => {
	it("should have to correct behavior", async () => {
		const tester = new HookTester((args) => new SyncBailHook(args));

		const result = await tester.run(true);

		expect(result).toMatchSnapshot();
	}, 15000);
});

describe("SyncWaterfallHook", () => {
	it("should have to correct behavior", async () => {
		const tester = new HookTester((args) => new SyncWaterfallHook(args));

		const result = await tester.run(true);

		expect(result).toMatchSnapshot();
	}, 15000);
});

describe("SyncLoopHook", () => {
	it("should have to correct behavior", async () => {
		const tester = new HookTester((args) => new SyncLoopHook(args));

		const result = await tester.runForLoop(true);

		expect(result).toMatchSnapshot();
	}, 15000);
});
