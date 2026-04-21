/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
"use strict";

const HookTest = require("../lib/Hook");
const SyncHook = require("../lib/SyncHook");

describe("Hook", () => {
	it("should throw when compile is not overridden", () => {
		const hook = new HookTest(["arg"]);
		expect(() =>
			hook.compile({ taps: [], interceptors: [], args: [], type: "sync" })
		).toThrow(/Abstract: should be overridden/);
	});

	it("should throw when tap options are not a string or object", () => {
		const hook = new SyncHook();
		expect(() => hook.tap(42, () => {})).toThrow(
			new Error("Invalid tap options")
		);
		expect(() => hook.tap(null, () => {})).toThrow(
			new Error("Invalid tap options")
		);
		expect(() => hook.tap(undefined, () => {})).toThrow(
			new Error("Invalid tap options")
		);
		expect(() => hook.tap(true, () => {})).toThrow(
			new Error("Invalid tap options")
		);
	});

	it("should expose name/isUsed/intercept/withOptions from withOptions wrapper", () => {
		const hook = new SyncHook(["a"], "myHook");
		const wrapped = hook.withOptions({ stage: 10 });

		expect(wrapped.name).toBe("myHook");
		expect(wrapped.isUsed()).toBe(false);

		const interceptorCalls = [];
		wrapped.intercept({ call: (x) => interceptorCalls.push(x) });

		const calls = [];
		wrapped.tap("A", (x) => calls.push(["A", x]));
		wrapped.tap({ name: "B" }, (x) => calls.push(["B", x]));

		expect(wrapped.isUsed()).toBe(true);

		hook.call(1);
		expect(calls).toEqual([
			["A", 1],
			["B", 1]
		]);
		expect(interceptorCalls).toEqual([1]);
	});

	it("should allow nested withOptions to merge options", () => {
		const hook = new SyncHook();
		const nested = hook.withOptions({ stage: -5 }).withOptions({ before: "Z" });
		nested.tap("A", () => {});
		expect(hook.taps[0].stage).toBe(-5);
		expect(hook.taps[0].before).toBe("Z");
	});

	it("should keep the tap options unchanged when an interceptor's register returns undefined", () => {
		const hook = new SyncHook();
		hook.intercept({ register: () => undefined });
		hook.tap("A", () => {});
		expect(hook.taps[0].name).toBe("A");
	});

	it("should throw when options.name is missing entirely on an object tap", () => {
		const hook = new SyncHook();
		expect(() => hook.tap({}, () => {})).toThrow(
			new Error("Missing name for tap")
		);
	});

	it("should accept the optional hook name argument in the Hook constructor", () => {
		const hook = new SyncHook(["a"], "namedHook");
		expect(hook.name).toBe("namedHook");
	});

	it("should allow to insert hooks before others and in stages", () => {
		const hook = new SyncHook();

		const calls = [];
		hook.tap("A", () => calls.push("A"));
		hook.tap(
			{
				name: "B",
				before: "A"
			},
			() => calls.push("B")
		);

		calls.length = 0;
		hook.call();
		expect(calls).toEqual(["B", "A"]);

		hook.tap(
			{
				name: "C",
				before: ["A", "B"]
			},
			() => calls.push("C")
		);

		calls.length = 0;
		hook.call();
		expect(calls).toEqual(["C", "B", "A"]);

		hook.tap(
			{
				name: "D",
				before: "B"
			},
			() => calls.push("D")
		);

		calls.length = 0;
		hook.call();
		expect(calls).toEqual(["C", "D", "B", "A"]);

		hook.tap(
			{
				name: "E",
				stage: -5
			},
			() => calls.push("E")
		);
		hook.tap(
			{
				name: "F",
				stage: -3
			},
			() => calls.push("F")
		);

		calls.length = 0;
		hook.call();
		expect(calls).toEqual(["E", "F", "C", "D", "B", "A"]);
	});

	it("should work with `withOptions`", () => {
		const hook = new SyncHook();

		const calls = [];

		hook
			.withOptions({
				stage: -10
			})
			.tap("A", () => calls.push("A"));

		hook.tap(
			{
				name: "B",
				stage: 0
			},
			() => calls.push("B")
		);

		calls.length = 0;
		hook.call();
		expect(calls).toEqual(["A", "B"]);
	});

	it("should throw without a valid name", () => {
		const hook = new SyncHook();
		expect(() => hook.tap("", () => {})).toThrow(
			new Error("Missing name for tap")
		);
		expect(() => hook.tap(" ", () => {})).toThrow(
			new Error("Missing name for tap")
		);
		expect(() => hook.tap({ name: "" }, () => {})).toThrow(
			new Error("Missing name for tap")
		);
		expect(() => hook.tap({ name: " " }, () => {})).toThrow(
			new Error("Missing name for tap")
		);
	});

	it("should preserve custom tap options (e.g. webpack's `additionalAssets`) on the tap descriptor", () => {
		const hook = new SyncHook();

		// Options with only `name` plus a custom property - used by webpack's
		// processAssets (`additionalAssets: true`). The fast-path in `_tap`
		// must not drop the custom property.
		hook.tap({ name: "A", additionalAssets: true }, () => {});
		// Options with `name`, `stage` and a custom property go through the
		// slow path - also checked for completeness.
		hook.tap({ name: "B", stage: 10, extra: "value" }, () => {});

		expect(hook.taps[0].name).toBe("A");
		expect(hook.taps[0].additionalAssets).toBe(true);
		expect(hook.taps[1].name).toBe("B");
		expect(hook.taps[1].extra).toBe("value");
	});

	it("should not ignore invalid before values", () => {
		// A plugin may use a hook that will never be executed
		const hook = new SyncHook();

		const calls = [];

		hook.tap("A", () => calls.push("A"));

		hook.tap(
			{
				name: "B",
				before: "C"
			},
			() => calls.push("B")
		);

		hook.tap(
			{
				name: "C",
				before: ["Y"]
			},
			() => calls.push("C")
		);

		hook.tap(
			{
				name: "D",
				before: {}
			},
			() => calls.push("D")
		);

		hook.tap(
			{
				name: "E",
				before: null
			},
			() => calls.push("E")
		);

		calls.length = 0;
		hook.call();
		expect(calls).toEqual(["C", "B", "A", "D", "E"]);
	});
});
