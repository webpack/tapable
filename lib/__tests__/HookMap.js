/*
	MIT License http://www.opensource.org/licenses/mit-license.php
*/
"use strict";

const HookMap = require("../HookMap");
const SyncHook = require("../SyncHook");

describe("HookMap", () => {
	it("should return undefined from get when the key is unknown", () => {
		const map = new HookMap(() => new SyncHook());
		expect(map.get("missing")).toBeUndefined();
	});

	it("should lazily create hooks through for(...) and cache them", () => {
		const factory = jest.fn(() => new SyncHook(["a"]));
		const map = new HookMap(factory, "myMap");

		expect(map.name).toBe("myMap");

		const hook1 = map.for("key1");
		const hook2 = map.for("key1");
		const hook3 = map.for("key2");

		expect(hook1).toBe(hook2);
		expect(hook1).not.toBe(hook3);
		expect(factory).toHaveBeenCalledTimes(2);
		expect(factory).toHaveBeenNthCalledWith(1, "key1");
		expect(factory).toHaveBeenNthCalledWith(2, "key2");

		expect(map.get("key1")).toBe(hook1);
	});

	it("should apply interceptor factories when creating hooks", () => {
		const map = new HookMap(() => new SyncHook());
		const wrapped = new SyncHook();

		map.intercept({
			factory: (key, hook) => {
				expect(key).toBe("foo");
				expect(hook).toBeDefined();
				return wrapped;
			}
		});

		expect(map.for("foo")).toBe(wrapped);
	});

	it("should default the interceptor factory to pass-through", () => {
		const map = new HookMap(() => new SyncHook());
		map.intercept({});
		const hook = map.for("bar");
		expect(hook).toBeDefined();
		expect(map.get("bar")).toBe(hook);
	});

	it("should forward deprecated tap helpers to the underlying hook", () => {
		const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
		const map = new HookMap(() => new SyncHook(["a"]));

		const syncMock = jest.fn();
		map.tap("k", "plugin-sync", syncMock);
		map.for("k").call(1);
		expect(syncMock).toHaveBeenCalledWith(1);

		const asyncMap = new HookMap(
			() => new (require("../AsyncSeriesHook"))(["a"])
		);
		const asyncMock = jest.fn((_a, cb) => cb());
		asyncMap.tapAsync("k", "plugin-async", asyncMock);

		return new Promise((resolve) => {
			asyncMap.for("k").callAsync(2, () => {
				expect(asyncMock).toHaveBeenCalled();

				const promiseMap = new HookMap(
					() => new (require("../AsyncSeriesHook"))(["a"])
				);
				const promiseMock = jest.fn(() => Promise.resolve());
				promiseMap.tapPromise("k", "plugin-promise", promiseMock);

				promiseMap
					.for("k")
					.promise(3)
					.then(() => {
						expect(promiseMock).toHaveBeenCalledWith(3);
						warn.mockRestore();
						resolve();
					});
			});
		});
	});
});
