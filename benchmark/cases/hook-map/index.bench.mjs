/*
 * hook-map
 *
 * HookMap is the keyed sub-hook container used by plugin systems
 * (webpack compilation.hooks.*). Hot paths:
 *   - `map.for(key)` on an already-populated key (pure Map.get)
 *   - `map.for(key)` on a new key (factory + interceptor walk)
 *   - `map.get(key)` for existing / missing keys
 */

import tapable from "../../../lib/index.js";

const { HookMap, SyncHook } = tapable;

const LOOKUP_ITERATIONS = 2000;
const COLD_KEYS = 10;

/**
 * @param {import('tinybench').Bench} bench
 */
export default function register(bench) {
	const warm = new HookMap(() => new SyncHook(["x"]));
	for (let i = 0; i < 20; i++) {
		warm.for(`key-${i}`).tap(`plugin-${i}`, () => {});
	}

	bench.add("hook-map: for(existing key)", () => {
		for (let i = 0; i < LOOKUP_ITERATIONS; i++) {
			warm.for("key-10");
		}
	});

	bench.add("hook-map: get(existing key)", () => {
		for (let i = 0; i < LOOKUP_ITERATIONS; i++) {
			warm.get("key-10");
		}
	});

	bench.add("hook-map: get(missing key)", () => {
		for (let i = 0; i < LOOKUP_ITERATIONS; i++) {
			warm.get("not-there");
		}
	});

	bench.add(`hook-map: for(new key) x ${COLD_KEYS}, no interceptors`, () => {
		const map = new HookMap(() => new SyncHook(["x"]));
		for (let i = 0; i < COLD_KEYS; i++) {
			map.for(`k-${i}`);
		}
	});

	bench.add(`hook-map: for(new key) x ${COLD_KEYS}, 1 interceptor`, () => {
		const map = new HookMap(() => new SyncHook(["x"]));
		map.intercept({ factory: (_k, hook) => hook });
		for (let i = 0; i < COLD_KEYS; i++) {
			map.for(`k-${i}`);
		}
	});

	bench.add(`hook-map: for(new key) x ${COLD_KEYS}, 3 interceptors`, () => {
		const map = new HookMap(() => new SyncHook(["x"]));
		map.intercept({ factory: (_k, hook) => hook });
		map.intercept({ factory: (_k, hook) => hook });
		map.intercept({ factory: (_k, hook) => hook });
		for (let i = 0; i < COLD_KEYS; i++) {
			map.for(`k-${i}`);
		}
	});
}
