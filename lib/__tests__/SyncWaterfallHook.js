/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
"use strict";

const SyncWaterfallHook = require("../SyncWaterfallHook");

function pify(fn) {
	return new Promise((resolve, reject) => {
		fn((err, result) => {
			if (err) reject(err);
			else resolve(result);
		});
	});
}

describe("SyncWaterfallHook", () => {
	it("should throw an error when hook has no argument", () => {
		expect(() => new SyncWaterfallHook()).toThrow(
			"Waterfall hooks must have at least one argument"
		);
	});

	it("should work", () => {
		const hook = new SyncWaterfallHook(["x"]);
		hook.tap("number", () => 42);
		hook.tap("string", () => "str");
		hook.tap("false", () => false);
		return expect(hook.call()).toBe(false);
	});

	it("should work with undefined", async () => {
		const hook = new SyncWaterfallHook(["x"]);
		hook.tap("number", () => 42);
		hook.tap("undefined", () => undefined);
		return expect(hook.call()).toBe(42);
	});

	it("should work with void", async () => {
		const hook = new SyncWaterfallHook(["x"]);
		hook.tap("number", () => 42);
		hook.tap("undefined", () => {});
		return expect(hook.call()).toBe(42);
	});

	it("should work with undefined and number again", async () => {
		const hook = new SyncWaterfallHook(["x"]);
		hook.tap("number", () => 42);
		hook.tap("undefined", () => {});
		hook.tap("number-again", () => 43);
		return expect(hook.call()).toBe(43);
	});

	it("should work with null", async () => {
		const hook = new SyncWaterfallHook(["x"]);
		hook.tap("number", () => 42);
		hook.tap("undefined", () => null);
		return expect(hook.call()).toBeNull();
	});

	it("should work with different types", async () => {
		const hook = new SyncWaterfallHook(["x"]);
		hook.tap("number", () => 42);
		hook.tap("string", () => "string");
		return expect(hook.call()).toBe("string");
	});

	it("should allow to create sync hooks", async () => {
		const hook = new SyncWaterfallHook(["arg1", "arg2"]);

		const mock0 = jest.fn((arg) => `${arg},0`);
		const mock1 = jest.fn((arg) => `${arg},1`);
		const mock2 = jest.fn((arg) => `${arg},2`);
		hook.tap("A", mock0);
		hook.tap("B", mock1);
		hook.tap("C", mock2);

		const returnValue0 = hook.call("sync", "a2");
		expect(returnValue0).toBe("sync,0,1,2");
		expect(mock0).toHaveBeenLastCalledWith("sync", "a2");
		expect(mock1).toHaveBeenLastCalledWith("sync,0", "a2");
		expect(mock2).toHaveBeenLastCalledWith("sync,0,1", "a2");

		const returnValue1 = await new Promise((resolve) => {
			hook.callAsync("async", "a2", (...args) => resolve(args));
		});

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
		const mockRegister = jest.fn((_x) => ({
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
		expect(mock0.mock.calls).toEqual([
			[1, 2],
			["mock0", 2]
		]);
	});

	it("should allow to create waterfall hooks", async () => {
		const h1 = new SyncWaterfallHook(["a"]);
		const h2 = new SyncWaterfallHook(["a", "b"]);

		expect(h1.call(1)).toBe(1);

		h1.tap("A", (_a) => undefined);
		h2.tap("A", (a, b) => [a, b]);

		expect(h1.call(1)).toBe(1);
		expect(await h1.promise(1)).toBe(1);
		expect(await pify((cb) => h1.callAsync(1, cb))).toBe(1);
		expect(h2.call(1, 2)).toEqual([1, 2]);
		expect(await h2.promise(1, 2)).toEqual([1, 2]);
		expect(await pify((cb) => h2.callAsync(1, 2, cb))).toEqual([1, 2]);

		let count = 1;
		count = h1.call(count + ++count); // 1 + 2 => 3
		count = h1.call(count + ++count); // 3 + 4 => 7
		count = h1.call(count + ++count); // 7 + 8 => 15
		expect(count).toBe(15);
	});

	it("should throw when args have length less than 1", () => {
		expect(() => {
			// eslint-disable-next-line no-new
			new SyncWaterfallHook([]);
		}).toThrow(/Waterfall/);
	});

	it("should allow to intercept calls #2", () => {
		const hook = new SyncWaterfallHook(["x"]);

		const mockCall = jest.fn();
		const mockTap = jest.fn((x) => x);

		hook.intercept({
			call: mockCall,
			tap: mockTap
		});

		hook.call(5);

		expect(mockCall).toHaveBeenLastCalledWith(5);
		expect(mockTap).not.toHaveBeenCalled();

		hook.tap("test", () => 10);

		hook.call(7);

		expect(mockCall).toHaveBeenLastCalledWith(7);
		expect(mockTap).toHaveBeenCalled();
	});

	it("should throw on tapAsync", () => {
		const hook = new SyncWaterfallHook(["x"]);
		expect(() => hook.tapAsync()).toThrow(/tapAsync/);
	});

	it("should throw on tapPromise", () => {
		const hook = new SyncWaterfallHook(["x"]);
		expect(() => hook.tapPromise()).toThrow(/tapPromise/);
	});
});
