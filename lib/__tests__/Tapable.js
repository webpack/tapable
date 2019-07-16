/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
"use strict";

const Tapable = require("../Tapable");
const SyncHook = require("../SyncHook");
const HookMap = require("../HookMap");

describe("Tapable", () => {
	it("should use same name or camelCase hook by default", () => {
		const t = new Tapable();
		t.hooks = {
			myHook: new SyncHook()
		};
		let called = 0;
		t.plugin("my-hook", () => called++);
		t.hooks.myHook.call();
		t.plugin("myHook", () => (called += 10));
		t.hooks.myHook.call();
		expect(called).toEqual(12);
	});

	it("should throw on unknown hook", () => {
		const t = new Tapable();
		t.hooks = {
			myHook: new SyncHook()
		};
		expect(() => {
			t.plugin("some-hook", () => {});
		}).toThrow(/some-hook/);
		t.hooks.myHook.call();
	});

	it("should use custom mapping", () => {
		const t = new Tapable();
		t.hooks = {
			myHook: new SyncHook(),
			hookMap: new HookMap(name => new SyncHook())
		};
		let called = 0;
		t._pluginCompat.tap("hookMap custom mapping", options => {
			const match = /^hookMap (.+)$/.exec(options.name);
			if (match) {
				t.hooks.hookMap.tap(
					match[1],
					options.fn.name || "unnamed compat plugin",
					options.fn
				);
				return true;
			}
		});
		t.plugin("my-hook", () => called++);
		t.plugin("hookMap test", () => (called += 10));
		const otherHookMapName = 'nothookMap other'
		expect(() => {
			t.plugin("nothookMap other", () => (called -= 10));
		}).toThrow(new RegExp(otherHookMapName))
		t.plugin("hookMap other", () => (called -= 10));
		t.hooks.myHook.call();
		expect(called).toEqual(1);
		t.hooks.hookMap.for("test").call();
		expect(called).toEqual(11);
		t.hooks.hookMap.for("other").call();
		expect(called).toEqual(1);
	});

	it('should throw if hook not defined', () => {
		const t = new Tapable()
		t.hooks = {
			hello: new SyncHook(),
		}
		let called = 0
		t.plugin('hello', () => (called += 2))
		t.hooks.hello.call()
		expect(called).toEqual(2)
		expect(() => {
			t.plugin('world', () => (called += 1000))
		}).toThrow(/world/)
	})

	it('should support Array name plugin', () => {
		const t = new Tapable()
		t.hooks = {
			hello: new SyncHook(),
			world: new SyncHook(),
		}
		let called = 0
		t.plugin(['hello', 'world'], () => (called += 2))
		t.hooks.hello.call()
		expect(called).toEqual(2)
		t.hooks.world.call()
		expect(called).toEqual(4)
	})
});
