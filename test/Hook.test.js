/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
"use strict";

const AsyncParallelBailHook = require("../lib/AsyncParallelBailHook");
const AsyncParallelHook = require("../lib/AsyncParallelHook");
const AsyncSeriesBailHook = require("../lib/AsyncSeriesBailHook");
const AsyncSeriesHook = require("../lib/AsyncSeriesHook");
const AsyncSeriesLoopHook = require("../lib/AsyncSeriesLoopHook");
const AsyncSeriesWaterfallHook = require("../lib/AsyncSeriesWaterfallHook");
const HookTest = require("../lib/Hook");
const SyncBailHook = require("../lib/SyncBailHook");
const SyncHook = require("../lib/SyncHook");
const SyncLoopHook = require("../lib/SyncLoopHook");
const SyncWaterfallHook = require("../lib/SyncWaterfallHook");

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

	describe("instance shape (V8 hidden-class layout)", () => {
		// `Hook.js` ends with `Object.setPrototypeOf(Hook.prototype, null)` and
		// the constructor does `this.compile = this.compile` etc. Both are
		// load-bearing performance optimizations - the self-assignments force
		// the methods that subclasses overwrite (`compile`, `tap`, `tapAsync`,
		// `tapPromise`) to be own properties in a fixed insertion order, so
		// every Hook/SyncHook/AsyncSeriesHook/... lands in the same V8 hidden
		// class. These tests pin the contract so a future "cleanup" cannot
		// silently regress it.

		// Layout produced by the base `Hook` constructor.
		const baseOwnKeys = [
			"_args",
			"name",
			"taps",
			"interceptors",
			"_call",
			"call",
			"_callAsync",
			"callAsync",
			"_promise",
			"promise",
			"_x",
			"compile",
			"tap",
			"tapAsync",
			"tapPromise"
		];

		// Subclass factories (`SyncHook(...)` etc.) tack `constructor` onto the
		// instance *after* the base layout is established, then overwrite a
		// few of the existing slots in place. So every subclass instance ends
		// up with the same shape, distinct from the bare `new Hook(...)` shape
		// but identical across all subclass families - which is the case that
		// matters in practice (users instantiate subclasses, not Hook).
		const subclassOwnKeys = [...baseOwnKeys, "constructor"];

		it("hook.prototype has a null prototype", () => {
			// `Object.setPrototypeOf(Hook.prototype, null)` keeps property
			// lookup at one hop and protects against prototype pollution.
			expect(Object.getPrototypeOf(HookTest.prototype)).toBeNull();
		});

		it("makes compile/tap/tapAsync/tapPromise own properties on every Hook instance", () => {
			const hook = new HookTest(["arg"]);
			// Self-assignments in the constructor must produce own props,
			// not inherited ones - otherwise subclass overwrites would
			// trigger a hidden-class transition on every instance.
			expect(Object.prototype.hasOwnProperty.call(hook, "compile")).toBe(true);
			expect(Object.prototype.hasOwnProperty.call(hook, "tap")).toBe(true);
			expect(Object.prototype.hasOwnProperty.call(hook, "tapAsync")).toBe(true);
			expect(Object.prototype.hasOwnProperty.call(hook, "tapPromise")).toBe(
				true
			);
		});

		it("makes the call/_call/callAsync/_callAsync/promise/_promise pairs own properties", () => {
			const hook = new HookTest(["arg"]);
			// The split is the lazy-compile reset pattern: `_xxx` is the
			// delegate, `xxx` is the live slot that gets replaced with the
			// compiled function on first invocation.
			for (const key of [
				"_call",
				"call",
				"_callAsync",
				"callAsync",
				"_promise",
				"promise"
			]) {
				expect(Object.prototype.hasOwnProperty.call(hook, key)).toBe(true);
			}
		});

		it("preserves the own-property insertion order on a base Hook", () => {
			const hook = new HookTest(["arg"]);
			expect(Object.keys(hook)).toEqual(baseOwnKeys);
		});

		it("preserves the same own-property layout across every Hook subclass", () => {
			// Subclasses overwrite `compile`/`tapAsync`/`tapPromise` (and some
			// wipe `_call`/`call` to undefined), but they must not introduce
			// new own properties or change their order beyond the trailing
			// `constructor` assignment. Otherwise instances of different
			// subclasses end up in different hidden classes and shared call
			// sites turn polymorphic.
			const subclasses = [
				new SyncHook(["arg"]),
				new SyncBailHook(["arg"]),
				new SyncLoopHook(["arg"]),
				new SyncWaterfallHook(["arg"]),
				new AsyncParallelHook(["arg"]),
				new AsyncParallelBailHook(["arg"]),
				new AsyncSeriesHook(["arg"]),
				new AsyncSeriesBailHook(["arg"]),
				new AsyncSeriesLoopHook(["arg"]),
				new AsyncSeriesWaterfallHook(["arg"])
			];

			for (const hook of subclasses) {
				expect(Object.keys(hook)).toEqual(subclassOwnKeys);
			}
		});

		it("does not change the own-property layout after taps/interceptors/calls", () => {
			// Once a hook is exercised end-to-end (tap, intercept, call) the
			// own-property set must still match the layout established by the
			// constructor. Anything new added by `_resetCompilation`,
			// `intercept`, the lazy compile, etc. would change the hidden
			// class for every hook that has ever been used.
			const hook = new SyncHook(["arg"]);
			hook.intercept({ call: () => {} });
			hook.tap("A", () => {});
			hook.call(1);

			expect(Object.keys(hook)).toEqual(subclassOwnKeys);
		});

		it("keeps Async* hooks in the same layout even with call/_call set to undefined", () => {
			// Async* hooks set `hook.call = undefined; hook._call = undefined`
			// to disable the sync entrypoint. The slots must still exist as
			// own properties (just holding `undefined`) so the hidden class
			// matches the rest of the family.
			const hook = new AsyncSeriesHook(["arg"]);
			expect(Object.prototype.hasOwnProperty.call(hook, "call")).toBe(true);
			expect(Object.prototype.hasOwnProperty.call(hook, "_call")).toBe(true);
			expect(hook.call).toBeUndefined();
			expect(hook._call).toBeUndefined();
		});
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
