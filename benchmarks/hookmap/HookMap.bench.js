/*
	MIT License http://www.opensource.org/licenses/mit-license.php
*/
"use strict";

const { HookMap, SyncHook } = require("../../lib");
const { createBench, runBench, runIfMain } = require("../helpers");

async function main() {
	const bench = createBench();

	// --- Hot lookups on a warm map ---
	const warmMap = new HookMap(() => new SyncHook(["x"]));
	for (let i = 0; i < 20; i++) {
		warmMap.for(`key-${i}`).tap(`plugin-${i}`, () => {});
	}

	bench.add("HookMap#for (existing key)", () => {
		warmMap.for("key-10");
	});

	bench.add("HookMap#get (existing key)", () => {
		warmMap.get("key-10");
	});

	bench.add("HookMap#get (missing key)", () => {
		warmMap.get("not-there");
	});

	// --- Cold path: factory + interceptors on new keys ---
	bench.add("HookMap#for (10 new keys, no interceptors)", () => {
		const map = new HookMap(() => new SyncHook(["x"]));
		for (let i = 0; i < 10; i++) {
			map.for(`k-${i}`);
		}
	});

	bench.add("HookMap#for (10 new keys, 1 interceptor)", () => {
		const map = new HookMap(() => new SyncHook(["x"]));
		map.intercept({ factory: (_k, hook) => hook });
		for (let i = 0; i < 10; i++) {
			map.for(`k-${i}`);
		}
	});

	bench.add("HookMap#for (10 new keys, 3 interceptors)", () => {
		const map = new HookMap(() => new SyncHook(["x"]));
		map.intercept({ factory: (_k, hook) => hook });
		map.intercept({ factory: (_k, hook) => hook });
		map.intercept({ factory: (_k, hook) => hook });
		for (let i = 0; i < 10; i++) {
			map.for(`k-${i}`);
		}
	});

	await runBench(bench);
}

module.exports = main;
runIfMain(module, main);
