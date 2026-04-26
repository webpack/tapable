/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
"use strict";

// eslint-disable-next-line jsdoc/reject-function-type
/** @typedef {Function} EXPECTED_FUNCTION */
// eslint-disable-next-line jsdoc/reject-any-type
/** @typedef {any} EXPECTED_ANY */

/** @typedef {import("./Hook").Tap} Tap */
/** @typedef {import("./Hook").TapOptions} TapOptions */

/**
 * @template T, R, AdditionalOptions
 * @typedef {import("./Hook").HookInterceptor<T, R, AdditionalOptions>} HookInterceptor
 */

/**
 * @template H
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
	 * @param {string | Tap} options tap name or full tap options
	 * @param {EXPECTED_FUNCTION=} fn the function to register
	 * @returns {void}
	 */
	tap(options, fn) {
		const { hooks } = this;
		for (let i = 0; i < hooks.length; i++) {
			/** @type {{ tap: (o: EXPECTED_ANY, fn?: EXPECTED_FUNCTION) => void }} */ (
				hooks[i]
			).tap(options, fn);
		}
	}

	/**
	 * @param {string | Tap} options tap name or full tap options
	 * @param {EXPECTED_FUNCTION=} fn the function to register
	 * @returns {void}
	 */
	tapAsync(options, fn) {
		const { hooks } = this;
		for (let i = 0; i < hooks.length; i++) {
			/** @type {{ tapAsync: (o: EXPECTED_ANY, fn?: EXPECTED_FUNCTION) => void }} */ (
				hooks[i]
			).tapAsync(options, fn);
		}
	}

	/**
	 * @param {string | Tap} options tap name or full tap options
	 * @param {EXPECTED_FUNCTION=} fn the function to register
	 * @returns {void}
	 */
	tapPromise(options, fn) {
		const { hooks } = this;
		for (let i = 0; i < hooks.length; i++) {
			/** @type {{ tapPromise: (o: EXPECTED_ANY, fn?: EXPECTED_FUNCTION) => void }} */ (
				hooks[i]
			).tapPromise(options, fn);
		}
	}

	/**
	 * @returns {boolean} true if any of the underlying hooks reports usage
	 */
	isUsed() {
		const { hooks } = this;
		for (let i = 0; i < hooks.length; i++) {
			if (/** @type {{ isUsed: () => boolean }} */ (hooks[i]).isUsed()) {
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
			/** @type {{ intercept: (i: HookInterceptor<EXPECTED_ANY, EXPECTED_ANY, EXPECTED_ANY>) => void }} */ (
				hooks[i]
			).intercept(interceptor);
		}
	}

	/**
	 * @param {TapOptions} options the options to merge into each tap
	 * @returns {MultiHook<H>} a new MultiHook wrapping each underlying hook with the options
	 */
	withOptions(options) {
		return new MultiHook(
			this.hooks.map(
				(hook) =>
					/** @type {H} */ (
						/** @type {{ withOptions: (o: TapOptions) => H }} */ (
							hook
						).withOptions(options)
					)
			),
			this.name
		);
	}
}

module.exports = MultiHook;
