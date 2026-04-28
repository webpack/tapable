/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
"use strict";

const util = require("util");

/** @typedef {import("./Hook").EXPECTED_ANY} EXPECTED_ANY */

/**
 * @template H
 * @template [K=EXPECTED_ANY]
 * @typedef {(key: K) => H} HookFactory
 */

/**
 * @template H
 * @template [K=EXPECTED_ANY]
 * @typedef {object} HookMapInterceptor
 * @property {((key: K, hook: H) => H)=} factory called when a hook is created for a new key
 */

/**
 * @template H, K
 * @param {K} key key passed through unchanged
 * @param {H} hook hook returned unchanged
 * @returns {H} the hook unchanged
 */
const defaultFactory = (key, hook) => hook;

/**
 * @template H
 */
class HookMap {
	/**
	 * @param {HookFactory<H>} factory factory creating new hooks for unknown keys
	 * @param {string=} name name of the hook map
	 */
	constructor(factory, name = undefined) {
		/** @type {Map<EXPECTED_ANY, H>} */
		this._map = new Map();
		/** @type {string | undefined} */
		this.name = name;
		/** @type {HookFactory<H>} */
		this._factory = factory;
		/** @type {HookMapInterceptor<H>[]} */
		this._interceptors = [];
	}

	/**
	 * @param {EXPECTED_ANY} key the key to look up
	 * @returns {H | undefined} the hook stored for `key`, if any
	 */
	get(key) {
		return this._map.get(key);
	}

	/**
	 * @param {EXPECTED_ANY} key the key to look up or create
	 * @returns {H} the hook stored for `key`, creating one via the factory if missing
	 */
	for(key) {
		// Hot path: inline the map lookup to skip the `this.get(key)`
		// indirection. This gets hit on every hook access in consumers
		// like webpack.
		const map = this._map;
		const hook = map.get(key);
		if (hook !== undefined) {
			return hook;
		}
		let newHook = this._factory(key);
		const interceptors = this._interceptors;
		for (let i = 0; i < interceptors.length; i++) {
			newHook =
				/** @type {NonNullable<HookMapInterceptor<H>["factory"]>} */
				(interceptors[i].factory)(key, newHook);
		}
		map.set(key, newHook);
		return newHook;
	}

	/**
	 * @param {HookMapInterceptor<H>} interceptor the interceptor to register
	 * @returns {void}
	 */
	intercept(interceptor) {
		this._interceptors.push(
			Object.assign(
				{
					factory: defaultFactory
				},
				interceptor
			)
		);
	}
}

HookMap.prototype.tap =
	// @ts-expect-error deprecated
	util.deprecate(function tap(key, options, fn) {
		// @ts-expect-error deprecated
		return this.for(key).tap(options, fn);
	}, "HookMap#tap(key,…) is deprecated. Use HookMap#for(key).tap(…) instead.");

HookMap.prototype.tapAsync =
	// @ts-expect-error deprecated
	util.deprecate(function tapAsync(key, options, fn) {
		// @ts-expect-error deprecated
		return this.for(key).tapAsync(options, fn);
	}, "HookMap#tapAsync(key,…) is deprecated. Use HookMap#for(key).tapAsync(…) instead.");

HookMap.prototype.tapPromise =
	// @ts-expect-error deprecated
	util.deprecate(function tapPromise(key, options, fn) {
		// @ts-expect-error deprecated
		return this.for(key).tapPromise(options, fn);
	}, "HookMap#tapPromise(key,…) is deprecated. Use HookMap#for(key).tapPromise(…) instead.");

module.exports = HookMap;
