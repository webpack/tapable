/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
"use strict";

/** @typedef {import("./Hook").EXPECTED_ANY} EXPECTED_ANY */
/** @typedef {import("./Hook").EXPECTED_FUNCTION} EXPECTED_FUNCTION */
/** @typedef {import("./Hook").Tap} Tap */
/** @typedef {import("./Hook").TapOptions} TapOptions */

/**
 * @template T
 * @typedef {import("./Hook").AsArray<T>} AsArray
 */

/**
 * @template {EXPECTED_ANY[]} T
 * @template U
 * @typedef {import("./Hook").Append<T, U>} Append
 */

/**
 * @template E, T
 * @typedef {import("./Hook").InnerCallback<E, T>} InnerCallback
 */

/**
 * @template T
 * @template [R=void]
 * @template [AdditionalOptions=object]
 * @typedef {import("./Hook")<T, R, AdditionalOptions>} Hook
 */

/**
 * @template T, R, AdditionalOptions
 * @typedef {import("./Hook").HookInterceptor<T, R, AdditionalOptions>} HookInterceptor
 */

/**
 * @template {Hook<EXPECTED_ANY>} H
 */
class MultiHook {
	/**
	 * @param {H[]} hooks the underlying hooks to multiplex tap calls across
	 * @param {string=} name name of the multi hook
	 */
	constructor(hooks, name = undefined) {
		/** @type {H[]} */
		this.hooks = hooks;
		/** @type {string | undefined} */
		this.name = name;
	}

	/**
	 * @template T, R
	 * @param {string | Tap} options tap name or full tap options
	 * @param {(...args: AsArray<T>) => R} fn the function to register
	 * @returns {void}
	 */
	tap(options, fn) {
		const { hooks } = this;
		for (let i = 0; i < hooks.length; i++) {
			hooks[i].tap(options, fn);
		}
	}

	/**
	 * @template T, R
	 * @param {string | Tap} options tap name or full tap options
	 * @param {(...args: Append<AsArray<T>, InnerCallback<Error, R>>) => void} fn the function to register
	 * @returns {void}
	 */
	tapAsync(options, fn) {
		const { hooks } = this;
		for (let i = 0; i < hooks.length; i++) {
			hooks[i].tapAsync(options, fn);
		}
	}

	/**
	 * @template T, R
	 * @param {string | Tap} options tap name or full tap options
	 * @param {(...args: AsArray<T>) => Promise<R>} fn the function to register
	 * @returns {void}
	 */
	tapPromise(options, fn) {
		const { hooks } = this;
		for (let i = 0; i < hooks.length; i++) {
			hooks[i].tapPromise(options, /** @type {EXPECTED_ANY} */ (fn));
		}
	}

	/**
	 * @returns {boolean} true if any of the underlying hooks reports usage
	 */
	isUsed() {
		const { hooks } = this;
		for (let i = 0; i < hooks.length; i++) {
			if (hooks[i].isUsed()) {
				return true;
			}
		}
		return false;
	}

	/**
	 * @param {HookInterceptor<EXPECTED_ANY, EXPECTED_ANY, EXPECTED_ANY>} interceptor the interceptor to register
	 * @returns {void}
	 */
	intercept(interceptor) {
		const { hooks } = this;
		for (let i = 0; i < hooks.length; i++) {
			hooks[i].intercept(interceptor);
		}
	}

	/**
	 * @param {TapOptions} options the options to merge into each tap
	 * @returns {MultiHook<H>} a new MultiHook wrapping each underlying hook with the options
	 */
	withOptions(options) {
		return /** @type {MultiHook<H>} */ (
			new MultiHook(
				this.hooks.map(
					(hook) =>
						/** @type {H} */ (
							/** @type {unknown} */ (hook.withOptions(options))
						)
				),
				this.name
			)
		);
	}
}

module.exports = MultiHook;
