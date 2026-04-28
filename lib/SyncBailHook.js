/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
"use strict";

const Hook = require("./Hook");
const HookCodeFactory = require("./HookCodeFactory");

/** @typedef {import("./Hook").EXPECTED_ANY} EXPECTED_ANY */
/** @typedef {import("./Hook").EXPECTED_FUNCTION} EXPECTED_FUNCTION */
/** @typedef {import("./Hook").UnsetAdditionalOptions} UnsetAdditionalOptions */
/** @typedef {import("./Hook").CompileOptions<EXPECTED_ANY, EXPECTED_ANY, EXPECTED_ANY>} CompileOptions */
/** @typedef {import("./HookCodeFactory").ContentOptions} ContentOptions */

/**
 * @template T
 * @typedef {import("./Hook").AsArray<T>} AsArray
 */
/**
 * @template {EXPECTED_ANY[]} T
 * @typedef {import("./Hook").ArgumentNames<T>} ArgumentNames
 */

class SyncBailHookCodeFactory extends HookCodeFactory {
	/**
	 * @param {ContentOptions} options content generation options
	 * @returns {string} generated body code
	 */
	content({ onError, onResult, resultReturns, onDone, rethrowIfPossible }) {
		return this.callTapsSeries({
			onError: (i, err) => onError(err),
			onResult: (i, result, next) =>
				`if(${result} !== undefined) {\n${onResult(
					result
				)};\n} else {\n${next()}}\n`,
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
 * @constructor
 * @template T
 * @template R
 * @template [AdditionalOptions=UnsetAdditionalOptions]
 * @param {ArgumentNames<AsArray<T>>=} args argument names of the hook
 * @param {string=} name name of the hook
 * @returns {Hook<T, R, AdditionalOptions>} a new AsyncParallelBailHook instance
 */
function SyncBailHook(
	args = /** @type {ArgumentNames<AsArray<T>>} */ (/** @type {unknown} */ ([])),
	name = undefined
) {
	const hook = new Hook(args, name);
	hook.constructor = SyncBailHook;
	hook.tapAsync = TAP_ASYNC;
	hook.tapPromise = TAP_PROMISE;
	hook.compile = COMPILE;
	return /** @type {Hook<T, R, AdditionalOptions>} */ (
		/** @type {unknown} */ (hook)
	);
}

/** @type {EXPECTED_ANY} */
SyncBailHook.prototype = null;

module.exports = SyncBailHook;
