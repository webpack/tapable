/*
  MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
"use strict";

const SyncWaterfallHook = require("../SyncWaterfallHook");

describe("SyncWaterfallHook", () => {
	it("should throw an error when hook has no argument", () => {
		expect(() => new SyncWaterfallHook()).toThrow(
			"Waterfall hooks must have at least one argument"
		);
	});

	it("should allow to create sync hooks", async () => {
		const hook = new SyncWaterfallHook(["arg1", "arg2"]);

		const mock0 = jest.fn(arg => arg + ",0");
		const mock1 = jest.fn(arg => arg + ",1");
		const mock2 = jest.fn(arg => arg + ",2");
		hook.tap("A", mock0);
		hook.tap("B", mock1);
		hook.tap("C", mock2);

		const returnValue0 = hook.call("sync", "a2");
		expect(returnValue0).toBe("sync,0,1,2");
		expect(mock0).toHaveBeenLastCalledWith("sync", "a2");
		expect(mock1).toHaveBeenLastCalledWith("sync,0", "a2");
		expect(mock2).toHaveBeenLastCalledWith("sync,0,1", "a2");

		const returnValue1 = await new Promise(resolve =>
			hook.callAsync("async", "a2", (...args) => resolve(args))
		);

		expect(returnValue1).toEqual([null, "async,0,1,2"]);
		expect(mock0).toHaveBeenLastCalledWith("async", "a2");
		expect(mock1).toHaveBeenLastCalledWith("async,0", "a2");
		expect(mock2).toHaveBeenLastCalledWith("async,0,1", "a2");

		const returnValue2 = await hook.promise("promise", "a2");

		expect(returnValue2).toBe("promise,0,1,2");
		expect(mock0).toHaveBeenLastCalledWith("promise", "a2");
		expect(mock1).toHaveBeenLastCalledWith("promise,0", "a2");
		expect(mock2).toHaveBeenLastCalledWith("promise,0,1", "a2");
	});

	it("should allow to intercept calls", () => {
		const hook = new SyncWaterfallHook(["arg1", "arg2"]);

		const mockCall = jest.fn();
		const mock0 = jest.fn(() => "mock0");
		const mockRegister = jest.fn(x => ({
			name: "huh",
			type: "sync",
			fn: mock0
		}));

		const mock1 = jest.fn(() => "mock1");
		hook.tap("Test1", mock1);

		hook.intercept({
			call: mockCall,
			register: mockRegister
		});

		const mock2 = jest.fn(() => "mock2");
		hook.tap("Test2", mock2);

		const returnValue = hook.call(1, 2);

		expect(returnValue).toBe("mock0");
		expect(mockCall).toHaveBeenLastCalledWith(1, 2);
		expect(mockRegister).toHaveBeenLastCalledWith({
			type: "sync",
			name: "Test2",
			fn: mock2
		});
		expect(mock1).not.toHaveBeenLastCalledWith(1, 2);
		expect(mock2).not.toHaveBeenLastCalledWith(1, 2);
		expect(mock0.mock.calls).toEqual([[1, 2], ["mock0", 2]]);
	});
});
