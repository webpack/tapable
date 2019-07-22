/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
"use strict";

require("babel-polyfill");

const SyncWaterfallHook = require("../SyncWaterfallHook");

describe("SyncWaterfallHook", () => {
	it('should allow to create waterfall hooks', async () => {
		const h1 = new SyncWaterfallHook(["a"]);
		const h2 = new SyncWaterfallHook(["a", "b"]);

		expect(h1.call(1)).toEqual(1);

		h1.tap("A", a => undefined);
		h2.tap("A", (a, b) => [a, b]);

		expect(h1.call(1)).toEqual(1);
		expect(await h1.promise(1)).toEqual(1);
		expect(await pify(cb => h1.callAsync(1, cb))).toEqual(1);
		expect(h2.call(1, 2)).toEqual([1, 2]);
		expect(await h2.promise(1, 2)).toEqual([1, 2]);
		expect(await pify(cb => h2.callAsync(1, 2, cb))).toEqual([1, 2]);

		let count = 1
		count = h1.call(count + ++count) // 1 + 2 => 3
		count = h1.call(count + ++count) // 3 + 4 => 7
		count = h1.call(count + ++count) // 7 + 8 => 15
		expect(count).toEqual(15)
	})

	it('should throw when args have length less than 1', () => {
		expect(() => {
			new SyncWaterfallHook([]);
		}).toThrow(/Waterfall/)
	})

	it("should allow to intercept calls", () => {
		const hook = new SyncWaterfallHook(["x"]);

		const mockCall = jest.fn();
		const mockTap = jest.fn(x => x);

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

	it('should throw on tapAsync', () => {
		const hook = new SyncWaterfallHook(["x"]);
		expect(() => hook.tapAsync()).toThrow(/tapAsync/)
	})

	it('should throw on tapPromise', () => {
		const hook = new SyncWaterfallHook(["x"]);
		expect(() => hook.tapPromise()).toThrow(/tapPromise/)
	})
});

function pify(fn) {
	return new Promise((resolve, reject) => {
		fn((err, result) => {
			if (err) reject(err);
			else resolve(result);
		});
	});
}
