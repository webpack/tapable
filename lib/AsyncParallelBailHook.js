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
 * @template {EXPECTED_ANY[]} T
 * @typedef {import("./Hook").ArgumentNames<T>} ArgumentNames
 */
/**
 * @template T
 * @typedef {import("./Hook").AsArray<T>} AsArray
 */

/**
 * Mirror of the `AsyncParallelBailHook` class declared in `tapable.d.ts` for
 * use as the factory function's return type, so `new AsyncParallelBailHook(...)`
 * resolves to the specific subclass type instead of the generic `Hook`.
 * @template T
 * @template R
 * @template [AdditionalOptions=UnsetAdditionalOptions]
 * @typedef {import("../tapable").AsyncParallelBailHook<T, R, AdditionalOptions>} AsyncParallelBailHookType
 */

class AsyncParallelBailHookCodeFactory extends HookCodeFactory {
	/**
	 * @param {ContentOptions} options content generation options
	 * @returns {string} generated body code
	 */
	content({ onError, onResult, onDone }) {
		const opts = /** @type {CompileOptions} */ (this.options);
		let code = "";
		code += `var _results = new Array(${opts.taps.length});\n`;
		code += "var _checkDone = function() {\n";
		code += "for(var i = 0; i < _results.length; i++) {\n";
		code += "var item = _results[i];\n";
		code += "if(item === undefined) return false;\n";
		code += "if(item.result !== undefined) {\n";
		code += onResult("item.result");
		code += "return true;\n";
		code += "}\n";
		code += "if(item.error) {\n";
		code += onError("item.error");
		code += "return true;\n";
		code += "}\n";
		code += "}\n";
		code += "return false;\n";
		code += "}\n";
		code += this.callTapsParallel({
			onError: (i, err, done, doneBreak) => {
				let code = "";
				code += `if(${i} < _results.length && ((_results.length = ${
					i + 1
				}), (_results[${i}] = { error: ${err} }), _checkDone())) {\n`;
				code += doneBreak(true);
				code += "} else {\n";
				code += done();
				code += "}\n";
				return code;
			},
			onResult: (i, result, done, doneBreak) => {
				let code = "";
				code += `if(${i} < _results.length && (${result} !== undefined && (_results.length = ${
					i + 1
				}), (_results[${i}] = { result: ${result} }), _checkDone())) {\n`;
				code += doneBreak(true);
				code += "} else {\n";
				code += done();
				code += "}\n";
				return code;
			},
			onTap: (i, run, done, _doneBreak) => {
				let code = "";
				if (i > 0) {
					code += `if(${i} >= _results.length) {\n`;
					code += done();
					code += "} else {\n";
				}
				code += run();
				if (i > 0) code += "}\n";
				return code;
			},
			onDone
		});
		return code;
	}
}

const factory = new AsyncParallelBailHookCodeFactory();

/**
 * @template T
 * @template R
 * @template [AdditionalOptions=UnsetAdditionalOptions]
 * @this {Hook<T, R, AdditionalOptions>}
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
 * @returns {AsyncParallelBailHookType<T, R, AdditionalOptions>} a new AsyncParallelBailHook instance
 */
function AsyncParallelBailHook(
	args = /** @type {ArgumentNames<AsArray<T>>} */ (/** @type {unknown} */ ([])),
	name = undefined
) {
	const hook = new Hook(args, name);
	hook.constructor = AsyncParallelBailHook;
	hook.compile = COMPILE;
	// @ts-expect-error for performance reasons
	hook._call = undefined;
	hook.call = undefined;
	return /** @type {AsyncParallelBailHookType<T, R, AdditionalOptions>} */ (
		/** @type {unknown} */ (hook)
	);
}

/** @type {EXPECTED_ANY} */
AsyncParallelBailHook.prototype = null;

module.exports = AsyncParallelBailHook;
