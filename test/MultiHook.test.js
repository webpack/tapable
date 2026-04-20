/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
"use strict";

const MultiHookTest = require("../lib/MultiHook");

describe("MultiHook", () => {
	const redirectedMethods = ["tap", "tapAsync", "tapPromise"];
	for (const name of redirectedMethods) {
		it(`should redirect ${name}`, () => {
			const calls = [];
			const fakeHook = {
				[name]: (options, fn) => {
					calls.push({ options, fn });
				}
			};
			new MultiHookTest([fakeHook, fakeHook])[name]("options", "fn");
			expect(calls).toEqual([
				{ options: "options", fn: "fn" },
				{ options: "options", fn: "fn" }
			]);
		});
	}

	it("should redirect intercept", () => {
		const calls = [];
		const fakeHook = {
			intercept: (interceptor) => {
				calls.push(interceptor);
			}
		};
		new MultiHookTest([fakeHook, fakeHook]).intercept("interceptor");
		expect(calls).toEqual(["interceptor", "interceptor"]);
	});

	it("should redirect withOptions", () => {
		const calls = [];
		const fakeHook = {
			withOptions: (options) => {
				calls.push(options);
				return {
					tap: (options, fn) => {
						calls.push({ options, fn });
					}
				};
			}
		};
		const newHook = new MultiHookTest([fakeHook, fakeHook]).withOptions(
			"options"
		);
		newHook.tap("options", "fn");
		expect(calls).toEqual([
			"options",
			"options",
			{ options: "options", fn: "fn" },
			{ options: "options", fn: "fn" }
		]);
	});

	it("should redirect isUsed", () => {
		const fakeHook1 = {
			isUsed: () => true
		};
		const fakeHook2 = {
			isUsed: () => false
		};
		expect(new MultiHookTest([fakeHook1, fakeHook1]).isUsed()).toBe(true);
		expect(new MultiHookTest([fakeHook1, fakeHook2]).isUsed()).toBe(true);
		expect(new MultiHookTest([fakeHook2, fakeHook1]).isUsed()).toBe(true);
		expect(new MultiHookTest([fakeHook2, fakeHook2]).isUsed()).toBe(false);
	});
});
