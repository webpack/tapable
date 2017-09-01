const HookTester = require("./HookTester");
const AsyncParallelHook = require("../AsyncParallelHook");
const AsyncParallelBailHook = require("../AsyncParallelBailHook");

describe("AsyncParallelHook", () => {
	it("should have to correct behavior", async () => {
		const tester = new HookTester((args) => new AsyncParallelHook(args));

		const result = await tester.run();

		expect(result).toMatchSnapshot();
	})
})

describe("AsyncParallelBailHook", () => {
	it("should have to correct behavior", async () => {
		const tester = new HookTester((args) => new AsyncParallelBailHook(args));

		const result = await tester.run();

		expect(result).toMatchSnapshot();
	})
})
