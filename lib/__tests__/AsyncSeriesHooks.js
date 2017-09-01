const HookTester = require("./HookTester");
const AsyncSeriesHook = require("../AsyncSeriesHook");
const AsyncSeriesBailHook = require("../AsyncSeriesBailHook");
const AsyncSeriesWaterfallHook = require("../AsyncSeriesWaterfallHook");

describe("AsyncSeriesHook", () => {
	it("should have to correct behavior", async () => {
		const tester = new HookTester((args) => new AsyncSeriesHook(args));

		const result = await tester.run();

		expect(result).toMatchSnapshot();
	})
})

describe("AsyncSeriesBailHook", () => {
	it("should have to correct behavior", async () => {
		const tester = new HookTester((args) => new AsyncSeriesBailHook(args));

		const result = await tester.run();

		expect(result).toMatchSnapshot();
	})
})

describe("AsyncSeriesWaterfallHook", () => {
	it("should have to correct behavior", async () => {
		const tester = new HookTester((args) => new AsyncSeriesWaterfallHook(args));

		const result = await tester.run();

		expect(result).toMatchSnapshot();
	})
})
