/*
	MIT License http://www.opensource.org/licenses/mit-license.php
*/
"use strict";

const { HookMap, SyncHook } = require("../lib");
const { createBench, runBench } = require("./helpers");

async function main() {
	const bench = createBench();

	// --- HookMap#for on existing key (hot lookup path) ---
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

	// --- HookMap#for for a new key (factory + interceptors cold path) ---
	bench.add("HookMap#for (new key, no interceptors)", () => {
		const map = new HookMap(() => new SyncHook(["x"]));
		for (let i = 0; i < 10; i++) {
			map.for(`k-${i}`);
		}
	});

	const interceptedTemplate = () => {
		const map = new HookMap(() => new SyncHook(["x"]));
		map.intercept({
			factory: (_key, hook) => hook
		});
		return map;
	};

	bench.add("HookMap#for (new key, with interceptor)", () => {
		const map = interceptedTemplate();
		for (let i = 0; i < 10; i++) {
			map.for(`k-${i}`);
		}
	});

	await runBench(bench);
}

main().catch((err) => {
	// eslint-disable-next-line no-console
	console.error(err);
	process.exit(1);
});
