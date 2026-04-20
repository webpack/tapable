/*
	MIT License http://www.opensource.org/licenses/mit-license.php
*/
"use strict";

const utilBrowser = require("../util-browser");

describe("util-browser", () => {
	it("should warn only once and forward arguments", () => {
		const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
		const inner = jest.fn((...args) => args.reduce((a, b) => a + b, 0));
		const wrapped = utilBrowser.deprecate(inner, "do not use");

		expect(wrapped(1, 2, 3)).toBe(6);
		expect(wrapped(4, 5)).toBe(9);

		expect(inner).toHaveBeenCalledTimes(2);
		expect(warn).toHaveBeenCalledTimes(1);
		expect(warn).toHaveBeenCalledWith("DeprecationWarning: do not use");

		warn.mockRestore();
	});

	it("should preserve `this` when invoked as a method", () => {
		const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
		const obj = {
			value: 42,
			run: utilBrowser.deprecate(function run() {
				return this.value;
			}, "method deprecated")
		};
		expect(obj.run()).toBe(42);
		warn.mockRestore();
	});
});
