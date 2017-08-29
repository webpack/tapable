const HookTester = require("./HookTester");
const SyncHook = require("../SyncHook");
const SyncBailHook = require("../SyncBailHook");

describe("SyncHook", () => {
	it("should have to correct behavior", async () => {
		const tester = new HookTester((args) => new SyncHook(args));

		const result = await tester.run(true);

		expect(result).toEqual({
			callNone: { type: 'no result' },
			callNoneWithArg: { type: 'no result' },
			callSingleSyncCalled: true,
			callSingleSync: { type: 'no result' },
			callSingleSyncWithArgCalled: 42,
			callSingleSyncWithArg: { type: 'no result' },
			callMultipleSyncCalled1: true,
			callMultipleSyncCalled2: true,
			callMultipleSync: { type: 'no result' },
			callMultipleSyncWithArgCalled1: 42,
			callMultipleSyncWithArgCalled2: 42,
			callMultipleSyncWithArg: { type: 'no result' },
			callMultipleSyncWithArgsCalled1: [ 42, 43, 44 ],
			callMultipleSyncWithArgsCalled2: [ 42, 43, 44 ],
			callMultipleSyncWithArgs: { type: 'no result' },
			callMultipleSyncErrorCalled1: true,
			callMultipleSyncErrorCalled2: true,
			callMultipleSyncError: { error: 'Error in sync2' },
			callInspectedCall1: [ 1, 2, 3 ],
			callInspectedCall2: [ 1, 2, 3 ],
			callInspectedTap1: { type: 'sync', fn: 2, name: 'sync2' },
			callInspectedTap2: { type: 'sync', fn: 3, name: 'sync1' },
			callInspected: { type: 'no result' },
		})
	})
})

describe("SyncBailHook", () => {
	it("should have to correct behavior", async () => {
		const tester = new HookTester((args) => new SyncBailHook(args));

		const result = await tester.run(true);

		expect(result).toEqual({
			callNone: { type: 'no result' },
			callNoneWithArg: { type: 'no result' },
			callSingleSyncCalled: true,
			callSingleSync: { type: 'return', value: 42 },
			callSingleSyncWithArgCalled: 42,
			callSingleSyncWithArg: { type: 'return', value: 42 },
			callMultipleSyncCalled1: true,
			callMultipleSync: { type: 'return', value: 42 },
			callMultipleSyncWithArgCalled1: 42,
			callMultipleSyncWithArg: { type: 'return', value: 42 + 42 },
			callMultipleSyncWithArgsCalled1: [ 42, 43, 44 ],
			callMultipleSyncWithArgs: { type: 'return', value: 42 + 43 + 44 },
			callMultipleSyncErrorCalled1: true,
			callMultipleSyncErrorCalled2: true,
			callMultipleSyncError: { error: 'Error in sync2' },
			callInspectedCall1: [ 1, 2, 3 ],
			callInspectedCall2: [ 1, 2, 3 ],
			callInspectedTap1: { type: 'sync', fn: 3, name: 'sync1' },
			callInspectedTap2: { type: 'sync', fn: 3, name: 'sync1' },
			callInspected: { type: 'return', value: 1 + 2 + 3 },
		})
	})
})
