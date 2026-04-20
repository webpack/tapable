/*
 * multi-hook
 *
 * MultiHook fans operations (tap / intercept / isUsed) across a small set
 * of underlying hooks. Covers the hot fan-out loop and the boolean-short
 * `isUsed` check.
 */

import tapable from "../../../lib/index.js";

const { MultiHook, SyncHook } = tapable;

function makeMulti() {
	return new MultiHook([
		new SyncHook(["x"]),
		new SyncHook(["x"]),
		new SyncHook(["x"])
	]);
}

const TAP_COUNT = 10;
const IS_USED_ITERATIONS = 2000;

/**
 * @param {import('tinybench').Bench} bench
 */
export default function register(bench) {
	bench.add(`multi-hook: tap x ${TAP_COUNT} across 3 hooks`, () => {
		const multi = makeMulti();
		for (let i = 0; i < TAP_COUNT; i++) {
			multi.tap(`p-${i}`, () => {});
		}
	});

	const usedMulti = makeMulti();
	for (let i = 0; i < 5; i++) {
		usedMulti.tap(`p-${i}`, () => {});
	}

	bench.add("multi-hook: isUsed (3 hooks, 5 taps)", () => {
		for (let i = 0; i < IS_USED_ITERATIONS; i++) {
			usedMulti.isUsed();
		}
	});

	bench.add("multi-hook: intercept across 3 hooks", () => {
		const multi = makeMulti();
		for (let i = 0; i < 5; i++) multi.tap(`p-${i}`, () => {});
		multi.intercept({ call: () => {} });
	});
}
