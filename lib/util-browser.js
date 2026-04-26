/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
"use strict";

// eslint-disable-next-line jsdoc/reject-function-type
/** @typedef {Function} EXPECTED_FUNCTION */
// eslint-disable-next-line jsdoc/reject-any-type
/** @typedef {any} EXPECTED_ANY */

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
		// eslint-disable-next-line prefer-rest-params
		return fn.apply(this, arguments);
	};
};
