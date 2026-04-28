/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
"use strict";

const Hook = require("./Hook");
const HookCodeFactory = require("./HookCodeFactory");

/** @typedef {import("./Hook").EXPECTED_ANY} EXPECTED_ANY */
/** @typedef {import("./Hook").EXPECTED_FUNCTION} EXPECTED_FUNCTION */
/** @typedef {import("./Hook").CompileOptions<EXPECTED_ANY, EXPECTED_ANY, EXPECTED_ANY>} CompileOptions */
/** @typedef {import("./Hook").UnsetAdditionalOptions} UnsetAdditionalOptions */
/** @typedef {import("./HookCodeFactory").ContentOptions} ContentOptions */
/**
 * @template T
 * @typedef {import("./Hook").AsArray<T>} AsArray
 */
/**
 * @template {EXPECTED_ANY[]} T
 * @typedef {import("./Hook").ArgumentNames<T>} ArgumentNames
 */

class SyncWaterfallHookCodeFactory extends HookCodeFactory {
	/**
	 * @param {ContentOptions} options content generation options
	 * @returns {string} generated body code
	 */
	content({ onError, onResult, resultReturns, rethrowIfPossible }) {
		return this.callTapsSeries({
			onError: (i, err) => onError(err),
			onResult: (i, result, next) => {
				let code = "";
				code += `if(${result} !== undefined) {\n`;
				code += `${/** @type {string[]} */ (this._args)[0]} = ${result};\n`;
				code += "}\n";
				code += next();
				return code;
			},
			onDone: () => onResult(/** @type {string[]} */ (this._args)[0]),
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
 * @constructor
 * @template T
 * @template [R=AsArray<T>[0]]
 * @template [AdditionalOptions=UnsetAdditionalOptions]
 * @param {ArgumentNames<AsArray<T>>=} args argument names of the hook
 * @param {string=} name name of the hook
 * @returns {Hook<T, R, AdditionalOptions>} a new AsyncParallelBailHook instance
 */
function SyncWaterfallHook(
	args = /** @type {ArgumentNames<AsArray<T>>} */ (/** @type {unknown} */ ([])),
	name = undefined
) {
	if (args.length < 1) {
		throw new Error("Waterfall hooks must have at least one argument");
	}
	const hook = new Hook(args, name);
	hook.constructor = SyncWaterfallHook;
	hook.tapAsync = TAP_ASYNC;
	hook.tapPromise = TAP_PROMISE;
	hook.compile = COMPILE;
	return /** @type {Hook<T, R, AdditionalOptions>} */ (
		/** @type {unknown} */ (hook)
	);
}

/** @type {EXPECTED_ANY} */
SyncWaterfallHook.prototype = null;

module.exports = SyncWaterfallHook;
