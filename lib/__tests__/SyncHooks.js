const HookTester = require("./HookTester");
const SyncHook = require("../SyncHook");
const SyncBailHook = require("../SyncBailHook");
const SyncWaterfallHook = require("../SyncWaterfallHook");

describe("SyncHook", () => {
	it("should have to correct behavior", async () => {
		const tester = new HookTester((args) => new SyncHook(args));

		const result = await tester.run(true);

		expect(result).toMatchSnapshot();
	}, 15000)
})

describe("SyncBailHook", () => {
	it("should have to correct behavior", async () => {
		const tester = new HookTester((args) => new SyncBailHook(args));

		const result = await tester.run(true);

		expect(result).toMatchSnapshot();
	}, 15000)
})

describe("SyncWaterfallHook", () => {
	it("should have to correct behavior", async () => {
		const tester = new HookTester((args) => new SyncWaterfallHook(args));

		const result = await tester.run(true);

		expect(result).toMatchSnapshot();
	}, 15000)
})
