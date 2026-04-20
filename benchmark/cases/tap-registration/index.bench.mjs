/*
 * tap-registration
 *
 * Measures Hook#tap / tapAsync / tapPromise at the registration step,
 * with the four kinds of options shapes that hit different code paths
 * in Hook.js (_tap, _insert):
 *   - string options (most common - plugin name only)
 *   - object options (same thing but wrapped)
 *   - stages (numeric ordering)
 *   - `before` constraint (forces the shift loop to scan)
 */

import tapable from "../../../lib/index.js";

const { SyncHook, AsyncSeriesHook } = tapable;

const TAP_COUNT = 10;

/**
 * @param {import('tinybench').Bench} bench
 */
export default function register(bench) {
	bench.add(
		`tap-registration: SyncHook tap x ${TAP_COUNT}, string options`,
		() => {
			const hook = new SyncHook(["a"]);
			for (let i = 0; i < TAP_COUNT; i++) {
				hook.tap(`p-${i}`, () => {});
			}
		}
	);

	bench.add(
		`tap-registration: SyncHook tap x ${TAP_COUNT}, object options`,
		() => {
			const hook = new SyncHook(["a"]);
			for (let i = 0; i < TAP_COUNT; i++) {
				hook.tap({ name: `p-${i}` }, () => {});
			}
		}
	);

	bench.add(
		`tap-registration: SyncHook tap x ${TAP_COUNT}, with stages`,
		() => {
			const hook = new SyncHook(["a"]);
			for (let i = 0; i < TAP_COUNT; i++) {
				hook.tap({ name: `p-${i}`, stage: i % 3 }, () => {});
			}
		}
	);

	bench.add(
		`tap-registration: SyncHook tap x ${TAP_COUNT}, alternating before`,
		() => {
			const hook = new SyncHook(["a"]);
			hook.tap("first", () => {});
			for (let i = 0; i < TAP_COUNT - 1; i++) {
				hook.tap({ name: `p-${i}`, before: "first" }, () => {});
			}
		}
	);

	bench.add(`tap-registration: AsyncSeriesHook tapAsync x ${TAP_COUNT}`, () => {
		const hook = new AsyncSeriesHook(["a"]);
		for (let i = 0; i < TAP_COUNT; i++) {
			hook.tapAsync(`p-${i}`, (_a, cb) => cb());
		}
	});

	bench.add(
		`tap-registration: AsyncSeriesHook tapPromise x ${TAP_COUNT}`,
		() => {
			const hook = new AsyncSeriesHook(["a"]);
			for (let i = 0; i < TAP_COUNT; i++) {
				hook.tapPromise(`p-${i}`, () => Promise.resolve());
			}
		}
	);
}
