/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
"use strict";

const Hook = require("./Hook");
const HookCodeFactory = require("./HookCodeFactory");

// eslint-disable-next-line jsdoc/reject-function-type
/** @typedef {Function} EXPECTED_FUNCTION */
// eslint-disable-next-line jsdoc/reject-any-type
/** @typedef {any} EXPECTED_ANY */

/** @typedef {import("./Hook").CompileOptions} CompileOptions */
/** @typedef {import("./HookCodeFactory").ContentOptions} ContentOptions */

class AsyncSeriesBailHookCodeFactory extends HookCodeFactory {
	/**
	 * @param {ContentOptions} options content generation options
	 * @returns {string} generated body code
	 */
	content({ onError, onResult, resultReturns, onDone }) {
		return this.callTapsSeries({
			onError: (i, err, next, doneBreak) =>
				/** @type {(err: string) => string} */ (onError)(err) + doneBreak(true),
			onResult: (i, result, next) =>
				`if(${result} !== undefined) {\n${
					/** @type {(result: string) => string} */ (onResult)(result)
				}\n} else {\n${next()}}\n`,
			resultReturns,
			onDone
		});
	}
}

const factory = new AsyncSeriesBailHookCodeFactory();

/**
 * @this {Hook<EXPECTED_ANY, EXPECTED_ANY, EXPECTED_ANY>}
 * @param {CompileOptions} options compile options
 * @returns {EXPECTED_FUNCTION} the compiled call function
 */
function COMPILE(options) {
	factory.setup(this, options);
	return factory.create(options);
}

/**
 * @param {string[]=} args argument names of the hook
 * @param {string=} name name of the hook
 * @returns {Hook<EXPECTED_ANY, EXPECTED_ANY, EXPECTED_ANY>} a new AsyncSeriesBailHook instance
 */
function AsyncSeriesBailHook(args = [], name = undefined) {
	const hook = new Hook(args, name);
	hook.constructor = AsyncSeriesBailHook;
	hook.compile = COMPILE;
	hook._call = undefined;
	hook.call = undefined;
	return hook;
}

AsyncSeriesBailHook.prototype = null;

module.exports = AsyncSeriesBailHook;
