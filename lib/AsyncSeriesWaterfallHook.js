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

class AsyncSeriesWaterfallHookCodeFactory extends HookCodeFactory {
	/**
	 * @param {ContentOptions} options content generation options
	 * @returns {string} generated body code
	 */
	content({ onError, onResult, _onDone }) {
		return this.callTapsSeries({
			onError: (i, err, next, doneBreak) =>
				/** @type {(err: string) => string} */ (onError)(err) + doneBreak(true),
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
				)
		});
	}
}

const factory = new AsyncSeriesWaterfallHookCodeFactory();

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
 * @returns {Hook<EXPECTED_ANY, EXPECTED_ANY, EXPECTED_ANY>} a new AsyncSeriesWaterfallHook instance
 */
function AsyncSeriesWaterfallHook(args = [], name = undefined) {
	if (args.length < 1) {
		throw new Error("Waterfall hooks must have at least one argument");
	}
	const hook = new Hook(args, name);
	hook.constructor = AsyncSeriesWaterfallHook;
	hook.compile = COMPILE;
	hook._call = undefined;
	hook.call = undefined;
	return hook;
}

AsyncSeriesWaterfallHook.prototype = null;

module.exports = AsyncSeriesWaterfallHook;
