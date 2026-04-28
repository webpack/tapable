/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
"use strict";

/** @typedef {import("./Hook").EXPECTED_FUNCTION} EXPECTED_FUNCTION */

/**
 * Browser shim for `util.deprecate`. Logs the deprecation message once on the
 * first call, then forwards arguments to `fn`.
 * @param {EXPECTED_FUNCTION} fn the function to wrap
 * @param {string} msg the deprecation message
 * @returns {EXPECTED_FUNCTION} the wrapped function
 */
module.exports.deprecate = (fn, msg) => {
	let once = true;
	return function deprecate() {
		if (once) {
			// eslint-disable-next-line no-console
			console.warn(`DeprecationWarning: ${msg}`);
			once = false;
		}
		// @ts-expect-error expected
		// eslint-disable-next-line prefer-rest-params
		return fn.apply(this, arguments);
	};
};
