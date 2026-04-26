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

class SyncWaterfallHookCodeFactory extends HookCodeFactory {
	/**
	 * @param {ContentOptions} options content generation options
	 * @returns {string} generated body code
	 */
	content({ onError, onResult, resultReturns, rethrowIfPossible }) {
		return this.callTapsSeries({
			onError: (i, err) =>
				/** @type {(err: string) => string} */ (onError)(err),
			onResult: (i, result, next) => {
				let code = "";
				code += `if(${result} !== undefined) {\n`;
				code += `${/** @type {string[]} */ (this._args)[0]} = ${result};\n`;
				code += "}\n";
				code += next();
				return code;
			},
			onDone: () =>
				/** @type {(result: string) => string} */ (onResult)(
					/** @type {string[]} */ (this._args)[0]
				),
			doneReturns: resultReturns,
			rethrowIfPossible
		});
	}
}

const factory = new SyncWaterfallHookCodeFactory();

const TAP_ASYNC = () => {
	throw new Error("tapAsync is not supported on a SyncWaterfallHook");
};

const TAP_PROMISE = () => {
	throw new Error("tapPromise is not supported on a SyncWaterfallHook");
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
 * @param {string[]=} args argument names of the hook (must contain at least one)
 * @param {string=} name name of the hook
 * @returns {Hook<EXPECTED_ANY, EXPECTED_ANY, EXPECTED_ANY>} a new SyncWaterfallHook instance
 */
function SyncWaterfallHook(args = [], name = undefined) {
	if (args.length < 1) {
		throw new Error("Waterfall hooks must have at least one argument");
	}
	const hook = new Hook(args, name);
	hook.constructor = SyncWaterfallHook;
	hook.tapAsync = TAP_ASYNC;
	hook.tapPromise = TAP_PROMISE;
	hook.compile = COMPILE;
	return hook;
}

SyncWaterfallHook.prototype = null;

module.exports = SyncWaterfallHook;
