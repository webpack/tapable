/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
"use strict";

const util = require("util");

// eslint-disable-next-line jsdoc/reject-function-type
/** @typedef {Function} EXPECTED_FUNCTION */
// eslint-disable-next-line jsdoc/reject-any-type
/** @typedef {any} EXPECTED_ANY */
/** @typedef {Record<string, EXPECTED_ANY>} EXPECTED_OBJECT */

/**
 * @template T
 * @typedef {T extends EXPECTED_ANY[] ? T : [T]} AsArray
 */

/**
 * @template {number} T
 * @typedef {T extends 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 ? T : never} Measure
 */

/**
 * @template {EXPECTED_ANY[]} T
 * @template U
 * @typedef {{
 * 0: [U];
 * 1: [T[0], U];
 * 2: [T[0], T[1], U];
 * 3: [T[0], T[1], T[2], U];
 * 4: [T[0], T[1], T[2], T[3], U];
 * 5: [T[0], T[1], T[2], T[3], T[4], U];
 * 6: [T[0], T[1], T[2], T[3], T[4], T[5], U];
 * 7: [T[0], T[1], T[2], T[3], T[4], T[5], T[6], U];
 * 8: [T[0], T[1], T[2], T[3], T[4], T[5], T[6], T[7], U];
 * }[Measure<T["length"]>]} Append
 */

/* eslint-disable jsdoc/ts-no-empty-object-type */
/**
 * @template X
 * @typedef {X extends UnsetAdditionalOptions ? {  } : X} IfSet
 */
/* eslint-enable jsdoc/ts-no-empty-object-type */

/**
 * @template {number} T
 * @template U
 * @typedef {T extends 0 ? void[] : ReadonlyArray<U> & { 0: U, length: T }} FixedSizeArray
 */

/**
 * @template {EXPECTED_ANY[]} T
 * @typedef {FixedSizeArray<T["length"], string>} ArgumentNames
 */

/**
 * @typedef {object} TapOptions
 * @property {string=} before name of an earlier tap to insert this tap before
 * @property {number=} stage stage to schedule the tap in (lower runs earlier)
 */

/**
 * @typedef {TapOptions & { name: string }} Tap
 */

/**
 * @typedef {Tap & { type: "sync" | "async" | "promise", fn: EXPECTED_FUNCTION }} FullTap
 */

/**
 * @template E, T
 * @typedef {(error: E | null, result?: T) => void} Callback
 */

/**
 * @template E, T
 * @typedef {(error?: E | null | false, result?: T) => void} InnerCallback
 */

/**
 * @template T
 * @template R
 * @template [AdditionalOptions=UnsetAdditionalOptions]
 * @typedef {object} HookInterceptor
 * @property {string=} name optional name of the interceptor
 * @property {((tap: FullTap & IfSet<AdditionalOptions>) => void)=} tap called for each tap before it runs
 * @property {((...args: EXPECTED_ANY[]) => void)=} call called when the hook is called
 * @property {((...args: EXPECTED_ANY[]) => void)=} loop called for each loop iteration of looping hooks
 * @property {((err: Error) => void)=} error called when an error occurs
 * @property {((result: R) => void)=} result called with the hook's result
 * @property {(() => void)=} done called when the hook is fully done
 * @property {((tap: FullTap & IfSet<AdditionalOptions>) => FullTap & IfSet<AdditionalOptions>)=} register called whenever a tap is registered
 * @property {boolean=} context true to pass a `_context` argument to interceptor callbacks
 */

/**
 * @typedef {object} UnsetAdditionalOptions
 * @property {true} _UnsetAdditionalOptions unset
 */

/**
 * @template T
 * @template R
 * @template [AdditionalOptions=UnsetAdditionalOptions]
 * @typedef {object} CompileOptions
 * @property {FullTap[]} taps the registered taps
 * @property {HookInterceptor<T, R, AdditionalOptions>[]} interceptors the registered interceptors
 * @property {ArgumentNames<AsArray<T>>[]} args names of the hook arguments (used for code generation)
 * @property {"sync" | "async" | "promise"} type call type
 */

const deprecateContext = util.deprecate(
	() => {},
	"Hook.context is deprecated and will be removed"
);

/**
 * @template T, R
 * @callback CallDelegate
 * @param {...AsArray<T>} args
 * @returns {R}
 */

/**
 * @template T, R
 * @type {CallDelegate<EXPECTED_ANY, EXPECTED_ANY>}
 * @this {Hook<T, R>}
 */
function CALL_DELEGATE(...args) {
	this.call = this._createCall("sync");
	return this.call(...args);
}

/**
 * @template T, R
 * @callback CallAsyncDelegate
 * @param {...Append<AsArray<T>, Callback<Error, R>>} args
 * @returns void
 */

/**
 * @template T, R
 * @type {CallAsyncDelegate<EXPECTED_ANY, EXPECTED_ANY>}
 * @this {Hook<T, R>}
 */
function CALL_ASYNC_DELEGATE(...args) {
	this.callAsync = this._createCall("async");
	return this.callAsync(...args);
}

/**
 * @template T, R
 * @callback PromiseDeledate
 * @param {...AsArray<T>} args
 * @returns {Promise<R>}
 */

/**
 * @template T, R
 * @type {PromiseDeledate<EXPECTED_ANY, EXPECTED_ANY>}
 * @this {Hook<T, R>}
 */
function PROMISE_DELEGATE(...args) {
	this.promise = this._createCall("promise");
	return this.promise(...args);
}

/**
 * @template T
 * @template [R=void]
 * @template [AdditionalOptions=UnsetAdditionalOptions]
 */
class Hook {
	/**
	 * @param {ArgumentNames<AsArray<T>>=} args argument names of the hook (used for code generation)
	 * @param {string=} name name of the hook
	 */
	constructor(args = [], name = undefined) {
		/** @type {ArgumentNames<AsArray<T>>} */
		this._args = args;
		/** @type {string | undefined} */
		this.name = name;
		/** @type {FullTap[]} */
		this.taps = [];
		/** @type {HookInterceptor<T, R, AdditionalOptions>[]} */
		this.interceptors = [];
		/** @type {CallDelegate<T, R> | undefined} */
		this._call = CALL_DELEGATE;
		/** @type {CallDelegate<T, R> | undefined} */
		this.call = CALL_DELEGATE;
		/** @type {CallAsyncDelegate<T, R>} */
		this._callAsync = CALL_ASYNC_DELEGATE;
		/** @type {CallAsyncDelegate<T, R>} */
		this.callAsync = CALL_ASYNC_DELEGATE;
		/** @type {PromiseDeledate<T, R>} */
		this._promise = PROMISE_DELEGATE;
		/** @type {PromiseDeledate<T, R>} */
		this.promise = PROMISE_DELEGATE;
		/** @type {EXPECTED_FUNCTION[] | undefined} */
		this._x = undefined;

		// eslint-disable-next-line no-self-assign
		this.compile = this.compile;
		// eslint-disable-next-line no-self-assign
		this.tap = this.tap;
		// eslint-disable-next-line no-self-assign
		this.tapAsync = this.tapAsync;
		// eslint-disable-next-line no-self-assign
		this.tapPromise = this.tapPromise;
	}

	/**
	 * @abstract
	 * @param {CompileOptions<T, R, AdditionalOptions>} _options compile options
	 * @returns {EXPECTED_FUNCTION} the compiled call function
	 */
	compile(_options) {
		throw new Error("Abstract: should be overridden");
	}

	/**
	 * @param {"sync" | "async" | "promise"} type the call type
	 * @returns {EXPECTED_FUNCTION} the compiled call function
	 */
	_createCall(type) {
		return this.compile({
			taps: this.taps,
			interceptors: this.interceptors,
			args: this._args,
			type
		});
	}

	/**
	 * @param {"sync" | "async" | "promise"} type the tap type
	 * @param {string | (Tap & IfSet<AdditionalOptions>)} options name or full tap options
	 * @param {EXPECTED_FUNCTION} fn callback registered with the tap
	 * @returns {void}
	 */
	_tap(type, options, fn) {
		if (typeof options === "string") {
			// Fast path: a string options ("name") is by far the most common
			// case. Build the final descriptor in a single allocation instead
			// of creating `{ name }` and then `Object.assign`ing it.
			const name = options.trim();
			if (name === "") {
				throw new Error("Missing name for tap");
			}
			options =
				/** @type {FullTap & IfSet<AdditionalOptions>} */
				({ type, fn, name });
		} else {
			if (typeof options !== "object" || options === null) {
				throw new Error("Invalid tap options");
			}
			let { name } = options;
			if (typeof name === "string") {
				name = name.trim();
			}
			if (typeof name !== "string" || name === "") {
				throw new Error("Missing name for tap");
			}
			if (
				typeof (/** @type {{ context?: unknown }} */ (options).context) !==
				"undefined"
			) {
				deprecateContext();
			}
			// Fast path: only `name` is set. Build the descriptor as a literal
			// so `_insert` and downstream consumers see the same hidden class
			// as the string-options path, avoiding a polymorphic call site.
			// Scan with `for...in` (cheaper than allocating `Object.keys`)
			// to verify no other user-provided properties exist - e.g.
			// webpack's `additionalAssets` - otherwise they'd be dropped.
			let onlyName = true;
			for (const key in options) {
				if (key !== "name") {
					onlyName = false;
					break;
				}
			}
			if (onlyName) {
				options =
					/** @type {FullTap & IfSet<AdditionalOptions>} */
					({ type, fn, name });
			} else {
				options.name = name;
				// Preserve previous precedence: user-provided keys win over the internal `type`/`fn`.
				options = Object.assign({ type, fn }, options);
			}
		}
		options = this._runRegisterInterceptors(
			/** @type {FullTap & IfSet<AdditionalOptions>} */
			(options)
		);
		this._insert(
			/** @type {FullTap & IfSet<AdditionalOptions>} */
			(options)
		);
	}

	/**
	 * @param {string | (Tap & IfSet<AdditionalOptions>)} options tap name or full tap options
	 * @param {(...args: AsArray<T>) => R} fn the function to register
	 * @returns {void}
	 */
	tap(options, fn) {
		this._tap("sync", options, fn);
	}

	/**
	 * @param {string | (Tap & IfSet<AdditionalOptions>)} options tap name or full tap options
	 * @param {(...args: Append<AsArray<T>, InnerCallback<Error, R>>) => void} fn the function to register
	 * @returns {void}
	 */
	tapAsync(options, fn) {
		this._tap("async", options, fn);
	}

	/**
	 * @param {string | (Tap & IfSet<AdditionalOptions>)} options tap name or full tap options
	 * @param {(...args: AsArray<T>) => Promise<R>} fn the function to register
	 * @returns {void}
	 */
	tapPromise(options, fn) {
		this._tap("promise", options, fn);
	}

	/**
	 * @param {FullTap & IfSet<AdditionalOptions>} options the tap descriptor
	 * @returns {FullTap & IfSet<AdditionalOptions>} possibly transformed options
	 */
	_runRegisterInterceptors(options) {
		const { interceptors } = this;
		const { length } = interceptors;
		// Common case: no interceptors.
		if (length === 0) return options;
		for (let i = 0; i < length; i++) {
			const interceptor = interceptors[i];
			if (interceptor.register) {
				const newOptions = interceptor.register(options);
				if (newOptions !== undefined) {
					options = newOptions;
				}
			}
		}
		return options;
	}

	/**
	 * @param {TapOptions & IfSet<AdditionalOptions>} options the options to merge into each tap
	 * @returns {Omit<this, "call" | "callAsync" | "promise">} a wrapper that pre-applies the options
	 */
	withOptions(options) {
		/**
		 * @param {string | (Tap & IfSet<AdditionalOptions>)} opt options
		 * @returns {Tap & IfSet<AdditionalOptions>} merged options
		 */
		const mergeOptions = (opt) =>
			Object.assign({}, options, typeof opt === "string" ? { name: opt } : opt);

		return /** @type {Omit<this, "call" | "callAsync" | "promise">} */ ({
			name: this.name,
			tap: (opt, fn) => this.tap(mergeOptions(opt), fn),
			tapAsync: (opt, fn) => this.tapAsync(mergeOptions(opt), fn),
			tapPromise: (opt, fn) => this.tapPromise(mergeOptions(opt), fn),
			intercept: (interceptor) => this.intercept(interceptor),
			isUsed: () => this.isUsed(),
			withOptions: (opt) => this.withOptions(mergeOptions(opt))
		});
	}

	/**
	 * @returns {boolean} true if the hook has any taps or interceptors registered
	 */
	isUsed() {
		return this.taps.length > 0 || this.interceptors.length > 0;
	}

	/**
	 * @param {HookInterceptor<T, R, AdditionalOptions>} interceptor the interceptor to register
	 * @returns {void}
	 */
	intercept(interceptor) {
		this._resetCompilation();
		this.interceptors.push(Object.assign({}, interceptor));
		if (interceptor.register) {
			for (let i = 0; i < this.taps.length; i++) {
				this.taps[i] = interceptor.register(this.taps[i]);
			}
		}
	}

	/**
	 * @returns {void}
	 */
	_resetCompilation() {
		this.call = this._call;
		this.callAsync = this._callAsync;
		this.promise = this._promise;
	}

	/**
	 * @param {FullTap & IfSet<AdditionalOptions>} item the tap to insert into the ordered taps list
	 * @returns {void}
	 */
	_insert(item) {
		this._resetCompilation();
		const { taps } = this;
		const stage = typeof item.stage === "number" ? item.stage : 0;

		// Fast path: the overwhelmingly common `hook.tap("name", fn)` case
		// has no `before` and default stage 0. If the list is empty or the
		// last tap's stage is <= the new item's stage the item belongs at
		// the end - append in O(1), skipping the Set allocation and the
		// shift loop.
		if (!(typeof item.before === "string" || Array.isArray(item.before))) {
			const n = taps.length;
			if (n === 0 || (taps[n - 1].stage || 0) <= stage) {
				taps[n] = item;
				return;
			}
		}

		/** @type {Set<string> | undefined} */
		let before;

		if (typeof item.before === "string") {
			before = new Set([item.before]);
		} else if (Array.isArray(item.before)) {
			before = new Set(item.before);
		}

		let i = taps.length;

		while (i > 0) {
			i--;
			const tap = taps[i];
			taps[i + 1] = tap;
			const xStage = tap.stage || 0;
			if (before) {
				if (before.has(tap.name)) {
					before.delete(tap.name);
					continue;
				}
				if (before.size > 0) {
					continue;
				}
			}
			if (xStage > stage) {
				continue;
			}
			i++;
			break;
		}
		taps[i] = item;
	}
}

Object.setPrototypeOf(Hook.prototype, null);

module.exports = Hook;
