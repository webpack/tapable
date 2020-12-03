/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
"use strict";

function deprecateMethod(fn, msg) {
	let warned = false;
	return function deprecated(...args) {
		if (!warned) {
			warned = true;
			if (typeof process === "undefined") {
				console.warn("DeprecationWarning:", msg);
			} else {
				process.emitWarning(msg, "DeprecationWarning", deprecated);
			}
		}
		return fn.apply(this, args);
	}
}

module.exports.deprecateMethod = deprecateMethod;
