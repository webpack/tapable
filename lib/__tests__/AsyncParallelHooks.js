/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
"use strict";

const HookTester = require("./HookTester");
const AsyncParallelHook = require("../AsyncParallelHook");
const AsyncParallelBailHook = require("../AsyncParallelBailHook");

describe("AsyncParallelHook", () => {
	it("should have to correct behavior", async () => {
		const tester = new HookTester(args => new AsyncParallelHook(args));

		const result = await tester.run();

		expect(result).toMatchSnapshot();
	}, 15000);
});

describe("AsyncParallelBailHook", () => {
	it("should have to correct behavior", async () => {
		const tester = new HookTester(args => new AsyncParallelBailHook(args));

		const result = await tester.run();

		expect(result).toMatchSnapshot();
	}, 15000);

	it("should bail on non-null return", async () => {
		const h1 = new AsyncParallelBailHook();
		const mockCall1 = jest.fn();
		const mockCall2 = jest.fn(() => "B");
		const mockCall3 = jest.fn(() => "C");
		h1.tap("A", mockCall1);
		h1.tap("B", mockCall2);
		h1.tap("C", mockCall3);
		expect(await h1.promise()).toEqual("B");
		expect(mockCall1).toHaveBeenCalledTimes(1);
		expect(mockCall2).toHaveBeenCalledTimes(1);
		expect(mockCall3).toHaveBeenCalledTimes(0);
	}, 15000);

	it("should bail on defined resolution", async () => {
		// Arrange
		const mockCall1 = jest.fn(() => undefined);
		const mockCall2 = jest.fn(() => "B");
		const mockCall3 = jest.fn(() => "C");

		// Act
		const h1 = new AsyncParallelBailHook([]);
		h1.tapPromise(
			"A",
			() => new Promise(res => setTimeout(() => res(mockCall1()), 100))
		);
		h1.tapPromise(
			"B",
			() => new Promise(res => setTimeout(() => res(mockCall2()), 5000))
		); // <= last to resolve
		h1.tapPromise(
			"C",
			() => new Promise(res => setTimeout(() => res(mockCall3()), 500))
		);

		// Assert
		expect(await h1.promise()).toEqual("C");
		expect(mockCall1).toHaveBeenCalledTimes(1);
		expect(mockCall2).toHaveBeenCalledTimes(0);
		expect(mockCall3).toHaveBeenCalledTimes(1);
	}, 15000);
});
