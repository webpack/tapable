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
 * @template {EXPECTED_ANY[]} T
 * @typedef {import("./Hook").ArgumentNames<T>} ArgumentNames
 */
/**
 * @template T
 * @typedef {import("./Hook").AsArray<T>} AsArray
 */

class AsyncSeriesHookCodeFactory extends HookCodeFactory {
	/**
	 * @param {ContentOptions} options content generation options
	 * @returns {string} generated body code
	 */
	content({ onError, onDone }) {
		return this.callTapsSeries({
			onError: (i, err, next, doneBreak) => onError(err) + doneBreak(true),
			onDone
		});
	}
}

const factory = new AsyncSeriesHookCodeFactory();

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
 * @template [AdditionalOptions=UnsetAdditionalOptions]
 * @param {ArgumentNames<AsArray<T>>=} args argument names of the hook
 * @param {string=} name name of the hook
 * @returns {Hook<T, void, AdditionalOptions>} a new AsyncParallelBailHook instance
 */
function AsyncSeriesHook(
	args = /** @type {ArgumentNames<AsArray<T>>} */ (/** @type {unknown} */ ([])),
	name = undefined
) {
	const hook = new Hook(args, name);
	hook.constructor = AsyncSeriesHook;
	hook.compile = COMPILE;
	hook._call = undefined;
	hook.call = undefined;
	return /** @type {Hook<T, void, AdditionalOptions>} */ (
		/** @type {unknown} */ (hook)
	);
}

/** @type {EXPECTED_ANY} */
AsyncSeriesHook.prototype = null;

module.exports = AsyncSeriesHook;
