/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
"use strict";

/** @typedef {import("./Hook").EXPECTED_ANY} EXPECTED_ANY */
/** @typedef {import("./Hook").EXPECTED_OBJECT} EXPECTED_OBJECT */
/** @typedef {import("./Hook").EXPECTED_FUNCTION} EXPECTED_FUNCTION */
/** @typedef {import("./Hook").FullTap} FullTap */
/** @typedef {import("./Hook").CompileOptions<EXPECTED_ANY, EXPECTED_ANY, EXPECTED_ANY>} CompileOptions */

/**
 * @template T, R, AdditionalOptions
 * @typedef {import("./Hook").HookInterceptor<T, R, AdditionalOptions>} HookInterceptor
 */

/**
 * @template T, R, AdditionalOptions
 * @typedef {import("./Hook")<T, R, AdditionalOptions>} Hook
 */

/**
 * @typedef {(error: string) => string} OnErrorCallback
 */

/**
 * @typedef {(result: string) => string} OnResultCallback
 */

/**
 * @typedef {() => string} OnDoneCallback
 */

/**
 * @typedef {object} ContentOptions
 * @property {OnErrorCallback} onError generates code for handling an error
 * @property {OnResultCallback} onResult generates code for handling a result
 * @property {OnDoneCallback} onDone generates code for completion
 * @property {boolean=} resultReturns true if the generated function returns a result
 * @property {boolean=} doneReturns true if the generated function returns when done
 * @property {boolean=} rethrowIfPossible true to rethrow errors when safe
 */

/**
 * @typedef {object} CallTapOptions
 * @property {OnErrorCallback} onError generates code for handling an error
 * @property {OnResultCallback=} onResult generates code for handling a result
 * @property {OnDoneCallback=} onDone generates code for completion
 * @property {boolean=} rethrowIfPossible true to rethrow errors when safe
 */

/**
 * @typedef {object} CallTapsOptions
 * @property {((tapIndex: number, error: string, next: () => string, doneBreak: (skipDone: boolean) => string) => string)} onError generates code for handling an error
 * @property {((tapIndex: number, result: string, next: () => string, doneBreak: (skipDone: boolean) => string) => string)=} onResult generates code for handling a result
 * @property {OnDoneCallback} onDone generates code for completion
 * @property {boolean=} rethrowIfPossible true to rethrow errors when safe
 * @property {boolean=} doneReturns true if the generated function returns when done
 * @property {boolean=} resultReturns true if the generated function returns a result
 */

/**
 * @typedef {object} CallTapsParallelOptions
 * @property {((tapIndex: number, error: string, next: () => string, doneBreak: (skipDone: boolean) => string) => string)} onError generates code for handling an error
 * @property {((tapIndex: number, result: string, next: () => string, doneBreak: (skipDone: boolean) => string) => string)=} onResult generates code for handling a result
 * @property {(tapIndex: number, run: () => string, done: () => string, doneBreak: (skipDone: boolean) => string) => string=} onTap options
 * @property {OnDoneCallback=} onDone generates code for completion
 * @property {boolean=} rethrowIfPossible true to rethrow errors when safe
 */

class HookCodeFactory {
	constructor() {
		/** @type {CompileOptions | undefined} */
		this.options = undefined;
		/** @type {string[] | undefined} */
		this._args = undefined;
	}

	/**
	 * @param {CompileOptions} options compile options
	 * @returns {EXPECTED_FUNCTION} the compiled hook function
	 */
	create(options) {
		this.init(options);
		/** @type {EXPECTED_FUNCTION | undefined} */
		let fn;
		switch (options.type) {
			case "sync":
				fn = new Function(
					this.args(),
					`"use strict";\n${this.header()}${this.contentWithInterceptors({
						onError: (err) => `throw ${err};\n`,
						onResult: (result) => `return ${result};\n`,
						onDone: () => "",
						resultReturns: true,
						rethrowIfPossible: true
					})}`
				);
				break;
			case "async":
				fn = new Function(
					this.args({
						after: "_callback"
					}),
					`"use strict";\n${this.header()}${this.contentWithInterceptors({
						onError: (err) => `_callback(${err});\n`,
						onResult: (result) => `_callback(null, ${result});\n`,
						onDone: () => "_callback();\n"
					})}`
				);
				break;
			case "promise": {
				let errorHelperUsed = false;
				const content = this.contentWithInterceptors({
					onError: (err) => {
						errorHelperUsed = true;
						return `_error(${err});\n`;
					},
					onResult: (result) => `_resolve(${result});\n`,
					onDone: () => "_resolve();\n"
				});
				let code = "";
				code += '"use strict";\n';
				code += this.header();
				code += "return new Promise((function(_resolve, _reject) {\n";
				if (errorHelperUsed) {
					code += "var _sync = true;\n";
					code += "function _error(_err) {\n";
					code += "if(_sync)\n";
					code +=
						"_resolve(Promise.resolve().then((function() { throw _err; })));\n";
					code += "else\n";
					code += "_reject(_err);\n";
					code += "};\n";
				}
				code += content;
				if (errorHelperUsed) {
					code += "_sync = false;\n";
				}
				code += "}));\n";
				fn = new Function(this.args(), code);
				break;
			}
		}
		this.deinit();
		return /** @type {EXPECTED_FUNCTION} */ (fn);
	}

	/**
	 * @abstract
	 * @param {ContentOptions} _options content generation options
	 * @returns {string} generated body code
	 */
	content(_options) {
		throw new Error("Abstract: should be overridden");
	}

	/**
	 * @param {Hook<EXPECTED_ANY, EXPECTED_ANY, EXPECTED_ANY>} instance the hook instance to attach the resolved tap function array to
	 * @param {CompileOptions} options compile options containing the taps
	 * @returns {void}
	 */
	setup(instance, options) {
		const { taps } = options;
		const { length } = taps;
		/** @type {EXPECTED_FUNCTION[]}} */
		const fns = Array.from({ length });
		for (let i = 0; i < length; i++) {
			fns[i] = taps[i].fn;
		}
		instance._x = fns;
	}

	/**
	 * @param {CompileOptions} options compile options
	 * @returns {void}
	 */
	init(options) {
		this.options = options;
		// `_args` is only read (length / join / [0]) - never mutated - so we
		// can share the caller's array directly instead of paying for a copy
		// on every compile.
		this._args = /** @type {string[]} */ (
			/** @type {unknown} */ (options.args)
		);
		/** @type {string | undefined} */
		this._joinedArgs = undefined;
	}

	/**
	 * @returns {void}
	 */
	deinit() {
		this.options = undefined;
		this._args = undefined;
		this._joinedArgs = undefined;
	}

	/**
	 * @param {ContentOptions} options content generation options
	 * @returns {string} generated code with interceptor calls wrapped around content
	 */
	contentWithInterceptors(options) {
		if (/** @type {CompileOptions} */ (this.options).interceptors.length > 0) {
			const { onError, onResult, onDone } = options;
			let code = "";
			const opts = /** @type {CompileOptions} */ (this.options);
			for (let i = 0; i < opts.interceptors.length; i++) {
				const interceptor = opts.interceptors[i];
				if (interceptor.call) {
					code += `${this.getInterceptor(i)}.call(${this.args({
						before: interceptor.context ? "_context" : undefined
					})});\n`;
				}
			}
			code += this.content(
				Object.assign(options, {
					onError:
						onError &&
						/** @type {OnErrorCallback} */
						(
							(err) => {
								let code = "";
								for (let i = 0; i < opts.interceptors.length; i++) {
									const interceptor = opts.interceptors[i];
									if (interceptor.error) {
										code += `${this.getInterceptor(i)}.error(${err});\n`;
									}
								}
								code += onError(err);
								return code;
							}
						),
					onResult:
						onResult &&
						/** @type {OnResultCallback} */
						(
							(result) => {
								let code = "";
								for (let i = 0; i < opts.interceptors.length; i++) {
									const interceptor = opts.interceptors[i];
									if (interceptor.result) {
										code += `${this.getInterceptor(i)}.result(${result});\n`;
									}
								}
								code += onResult(result);
								return code;
							}
						),
					onDone:
						onDone &&
						/** @type {OnDoneCallback} */
						(
							() => {
								let code = "";
								for (let i = 0; i < opts.interceptors.length; i++) {
									const interceptor = opts.interceptors[i];
									if (interceptor.done) {
										code += `${this.getInterceptor(i)}.done();\n`;
									}
								}
								code += onDone();
								return code;
							}
						)
				})
			);
			return code;
		}
		return this.content(options);
	}

	/**
	 * @returns {string} generated header preamble shared across all call types
	 */
	header() {
		let code = "";
		code += this.needContext() ? "var _context = {};\n" : "var _context;\n";
		code += "var _x = this._x;\n";
		if (/** @type {CompileOptions} */ (this.options).interceptors.length > 0) {
			code += "var _taps = this.taps;\n";
			code += "var _interceptors = this.interceptors;\n";
		}
		return code;
	}

	/**
	 * @returns {boolean} true if any tap requested a `_context`
	 */
	needContext() {
		const { taps } = /** @type {CompileOptions} */ (this.options);
		for (let i = 0; i < taps.length; i++) {
			if (/** @type {{ context?: boolean }} */ (taps[i]).context) return true;
		}
		return false;
	}

	/**
	 * @param {number} tapIndex index of the tap to call
	 * @param {CallTapOptions} options content generation options
	 * @returns {string} generated code that invokes the tap
	 */
	callTap(tapIndex, { onError, onResult, onDone, rethrowIfPossible }) {
		let code = "";
		let hasTapCached = false;
		const opts = /** @type {CompileOptions} */ (this.options);
		for (let i = 0; i < opts.interceptors.length; i++) {
			const interceptor = opts.interceptors[i];
			if (interceptor.tap) {
				if (!hasTapCached) {
					code += `var _tap${tapIndex} = ${this.getTap(tapIndex)};\n`;
					hasTapCached = true;
				}
				code += `${this.getInterceptor(i)}.tap(${
					interceptor.context ? "_context, " : ""
				}_tap${tapIndex});\n`;
			}
		}
		code += `var _fn${tapIndex} = ${this.getTapFn(tapIndex)};\n`;
		const tap =
			/** @type {FullTap & { context?: boolean }} */
			(opts.taps[tapIndex]);
		switch (tap.type) {
			case "sync":
				if (!rethrowIfPossible) {
					code += `var _hasError${tapIndex} = false;\n`;
					code += "try {\n";
				}
				if (onResult) {
					code += `var _result${tapIndex} = _fn${tapIndex}(${this.args({
						before: tap.context ? "_context" : undefined
					})});\n`;
				} else {
					code += `_fn${tapIndex}(${this.args({
						before: tap.context ? "_context" : undefined
					})});\n`;
				}
				if (!rethrowIfPossible) {
					code += "} catch(_err) {\n";
					code += `_hasError${tapIndex} = true;\n`;
					code += onError("_err");
					code += "}\n";
					code += `if(!_hasError${tapIndex}) {\n`;
				}
				if (onResult) {
					code += onResult(`_result${tapIndex}`);
				}
				if (onDone) {
					code += onDone();
				}
				if (!rethrowIfPossible) {
					code += "}\n";
				}
				break;
			case "async": {
				let cbCode = "";
				cbCode += onResult
					? `(function(_err${tapIndex}, _result${tapIndex}) {\n`
					: `(function(_err${tapIndex}) {\n`;
				cbCode += `if(_err${tapIndex}) {\n`;
				cbCode += onError(`_err${tapIndex}`);
				cbCode += "} else {\n";
				if (onResult) {
					cbCode += onResult(`_result${tapIndex}`);
				}
				if (onDone) {
					cbCode += onDone();
				}
				cbCode += "}\n";
				cbCode += "})";
				code += `_fn${tapIndex}(${this.args({
					before: tap.context ? "_context" : undefined,
					after: cbCode
				})});\n`;
				break;
			}
			case "promise":
				code += `var _hasResult${tapIndex} = false;\n`;
				code += `var _promise${tapIndex} = _fn${tapIndex}(${this.args({
					before: tap.context ? "_context" : undefined
				})});\n`;
				code += `if (!_promise${tapIndex} || !_promise${tapIndex}.then)\n`;
				code += `  throw new Error('Tap function (tapPromise) did not return promise (returned ' + _promise${tapIndex} + ')');\n`;
				code += `_promise${tapIndex}.then((function(_result${tapIndex}) {\n`;
				code += `_hasResult${tapIndex} = true;\n`;
				if (onResult) {
					code += onResult(`_result${tapIndex}`);
				}
				if (onDone) {
					code += onDone();
				}
				code += `}), function(_err${tapIndex}) {\n`;
				code += `if(_hasResult${tapIndex}) throw _err${tapIndex};\n`;
				code += onError(
					`!_err${tapIndex} ? new Error('Tap function (tapPromise) rejects "' + _err${tapIndex} + '" value') : _err${tapIndex}`
				);
				code += "});\n";
				break;
		}
		return code;
	}

	/**
	 * @param {CallTapsOptions} options series-call options
	 * @returns {string} generated code calling all taps in series
	 */
	callTapsSeries({
		onError,
		onResult,
		resultReturns,
		onDone,
		doneReturns,
		rethrowIfPossible
	}) {
		const { taps } = /** @type {CompileOptions} */ (this.options);
		const tapsLength = taps.length;
		if (tapsLength === 0) return onDone();
		// Inlined findIndex to avoid the callback allocation.
		let firstAsync = -1;
		for (let i = 0; i < tapsLength; i++) {
			if (taps[i].type !== "sync") {
				firstAsync = i;
				break;
			}
		}
		const somethingReturns = resultReturns || doneReturns;
		// doneBreak doesn't depend on the loop variable - hoist to allocate once.
		/**
		 * @param {boolean} skipDone true when need to skip done, otherwise false
		 * @returns {string} code
		 */
		const doneBreak = (skipDone) => {
			if (skipDone) return "";
			return onDone();
		};
		let code = "";
		let current = onDone;
		let unrollCounter = 0;
		for (let j = tapsLength - 1; j >= 0; j--) {
			const i = j;
			const unroll =
				current !== onDone && (taps[i].type !== "sync" || unrollCounter++ > 20);
			if (unroll) {
				unrollCounter = 0;
				code += `function _next${i}() {\n`;
				code += current();
				code += "}\n";
				current = () => `${somethingReturns ? "return " : ""}_next${i}();\n`;
			}
			const done = current;
			const content = this.callTap(i, {
				onError: (error) => onError(i, error, done, doneBreak),
				onResult:
					onResult && ((result) => onResult(i, result, done, doneBreak)),
				onDone: !onResult ? done : undefined,
				rethrowIfPossible:
					rethrowIfPossible && (firstAsync < 0 || i < firstAsync)
			});
			current = () => content;
		}
		code += current();
		return code;
	}

	/**
	 * @param {CallTapsOptions} options looping-call options
	 * @returns {string} generated code that calls taps in a loop
	 */
	callTapsLooping({ onError, onDone, rethrowIfPossible }) {
		const opts = /** @type {CompileOptions} */ (this.options);
		if (opts.taps.length === 0) return onDone();
		const syncOnly = opts.taps.every(
			(/** @type {FullTap} */ t) => t.type === "sync"
		);
		let code = "";
		if (!syncOnly) {
			code += "var _looper = (function() {\n";
			code += "var _loopAsync = false;\n";
		}
		code += "var _loop;\n";
		code += "do {\n";
		code += "_loop = false;\n";
		for (let i = 0; i < opts.interceptors.length; i++) {
			const interceptor = opts.interceptors[i];
			if (interceptor.loop) {
				code += `${this.getInterceptor(i)}.loop(${this.args({
					before: interceptor.context ? "_context" : undefined
				})});\n`;
			}
		}
		code += this.callTapsSeries({
			onError,
			onResult: (i, result, next, doneBreak) => {
				let code = "";
				code += `if(${result} !== undefined) {\n`;
				code += "_loop = true;\n";
				if (!syncOnly) code += "if(_loopAsync) _looper();\n";
				code += doneBreak(true);
				code += "} else {\n";
				code += next();
				code += "}\n";
				return code;
			},
			onDone:
				onDone &&
				(() => {
					let code = "";
					code += "if(!_loop) {\n";
					code += onDone();
					code += "}\n";
					return code;
				}),
			rethrowIfPossible: rethrowIfPossible && syncOnly
		});
		code += "} while(_loop);\n";
		if (!syncOnly) {
			code += "_loopAsync = true;\n";
			code += "});\n";
			code += "_looper();\n";
		}
		return code;
	}

	/**
	 * @param {CallTapsParallelOptions} options parallel-call options
	 * @returns {string} generated code that calls all taps in parallel
	 */
	callTapsParallel({
		onError,
		onResult,
		onDone,
		rethrowIfPossible,
		onTap = (i, run) => run()
	}) {
		const { taps } = /** @type {CompileOptions} */ (this.options);
		const tapsLength = taps.length;
		if (tapsLength <= 1) {
			return this.callTapsSeries({
				onError,
				onResult,
				// @ts-expect-error is it a bug?
				onDone,
				rethrowIfPossible
			});
		}
		// done and doneBreak don't depend on the loop variable - hoist them
		// so they're allocated once per compile instead of once per tap.
		const done = () => {
			if (onDone) return "if(--_counter === 0) _done();\n";
			return "--_counter;";
		};
		/**
		 * @param {boolean} skipDone true when need to skip done, otherwise false
		 * @returns {string} code
		 */
		const doneBreak = (skipDone) => {
			if (skipDone || !onDone) return "_counter = 0;\n";
			return "_counter = 0;\n_done();\n";
		};
		let code = "";
		code += "do {\n";
		code += `var _counter = ${tapsLength};\n`;
		if (onDone) {
			code += "var _done = (function() {\n";
			code += onDone();
			code += "});\n";
		}
		for (let i = 0; i < tapsLength; i++) {
			code += "if(_counter <= 0) break;\n";
			code += onTap(
				i,
				() =>
					this.callTap(i, {
						onError: (error) => {
							let code = "";
							code += "if(_counter > 0) {\n";
							code += onError(i, error, done, doneBreak);
							code += "}\n";
							return code;
						},
						onResult:
							onResult &&
							((result) => {
								let code = "";
								code += "if(_counter > 0) {\n";
								code += onResult(i, result, done, doneBreak);
								code += "}\n";
								return code;
							}),
						onDone: !onResult ? () => done() : undefined,
						rethrowIfPossible
					}),
				done,
				doneBreak
			);
		}
		code += "} while(false);\n";
		return code;
	}

	/**
	 * @param {{ before?: string, after?: string }=} options optional arguments to prepend or append
	 * @returns {string} comma-separated argument list as JS source
	 */
	args({ before, after } = {}) {
		// Hot during code generation. Join `_args` once and cache the result,
		// then build the customized variants via string concat instead of
		// allocating temporary `[before, ...allArgs]` / `[...allArgs, after]`
		// arrays and re-joining.
		let joined = this._joinedArgs;
		if (joined === undefined) {
			joined =
				/** @type {string[]} */ (this._args).length === 0
					? ""
					: /** @type {string[]} */ (this._args).join(", ");
			this._joinedArgs = joined;
		}
		if (!before && !after) return joined;
		if (joined.length === 0) {
			if (before && after) return `${before}, ${after}`;
			return /** @type {string} */ (before || after);
		}
		if (before && after) return `${before}, ${joined}, ${after}`;
		if (before) return `${before}, ${joined}`;
		return `${joined}, ${after}`;
	}

	/**
	 * @param {number} idx tap index
	 * @returns {string} JS expression that resolves to the registered tap function at index `idx`
	 */
	getTapFn(idx) {
		return `_x[${idx}]`;
	}

	/**
	 * @param {number} idx tap index
	 * @returns {string} JS expression that resolves to the tap descriptor at index `idx`
	 */
	getTap(idx) {
		return `_taps[${idx}]`;
	}

	/**
	 * @param {number} idx interceptor index
	 * @returns {string} JS expression that resolves to the interceptor at index `idx`
	 */
	getInterceptor(idx) {
		return `_interceptors[${idx}]`;
	}
}

module.exports = HookCodeFactory;
