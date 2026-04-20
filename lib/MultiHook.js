/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
"use strict";

class MultiHook {
	constructor(hooks, name = undefined) {
		this.hooks = hooks;
		this.name = name;
	}

	tap(options, fn) {
		for (const hook of this.hooks) {
			if (hook.tap) hook.tap(options, fn);
		}
	}

	tapAsync(options, fn) {
		for (const hook of this.hooks) {
			if (hook.tapAsync) hook.tapAsync(options, fn);
		}
	}

	tapPromise(options, fn) {
		for (const hook of this.hooks) {
			if (hook.tapPromise) hook.tapPromise(options, fn);
		}
	}

	isUsed() {
		for (const hook of this.hooks) {
			if (hook.isUsed && hook.isUsed()) return true;
		}
		return false;
	}

	intercept(interceptor) {
		for (const hook of this.hooks) {
			if (hook.intercept) hook.intercept(interceptor);
		}
	}

	withOptions(options) {
		return new MultiHook(
			this.hooks.map((hook) =>
				hook.withOptions ? hook.withOptions(options) : hook
			),
			this.name
		);
	}
}

module.exports = MultiHook;
