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

class SyncBailHookCodeFactory extends HookCodeFactory {
	/**
	 * @param {ContentOptions} options content generation options
	 * @returns {string} generated body code
	 */
	content({ onError, onResult, resultReturns, onDone, rethrowIfPossible }) {
		return this.callTapsSeries({
			onError: (i, err) =>
				/** @type {(err: string) => string} */ (onError)(err),
			onResult: (i, result, next) =>
				`if(${result} !== undefined) {\n${
					/** @type {(result: string) => string} */ (onResult)(result)
				};\n} else {\n${next()}}\n`,
			resultReturns,
			onDone,
			rethrowIfPossible
		});
	}
}

const factory = new SyncBailHookCodeFactory();

const TAP_ASYNC = () => {
	throw new Error("tapAsync is not supported on a SyncBailHook");
};

const TAP_PROMISE = () => {
	throw new Error("tapPromise is not supported on a SyncBailHook");
};

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
 * @returns {Hook<EXPECTED_ANY, EXPECTED_ANY, EXPECTED_ANY>} a new SyncBailHook instance
 */
function SyncBailHook(args = [], name = undefined) {
	const hook = new Hook(args, name);
	hook.constructor = SyncBailHook;
	hook.tapAsync = TAP_ASYNC;
	hook.tapPromise = TAP_PROMISE;
	hook.compile = COMPILE;
	return hook;
}

SyncBailHook.prototype = null;

module.exports = SyncBailHook;
