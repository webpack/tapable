/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
"use strict";

const Hook = require("./Hook");

class SyncBailHook extends Hook {
	tapAsync() {
		throw new Error("tapAsync is not supported on a SyncBailHook");
	}

	tapPromise() {
		throw new Error("tapPromise is not supported on a SyncBailHook");
	}

	template(options) {
		const args = options.args.join(", ");
		const argsWithCallback = args ? `${args}, _callback` : "_callback";
		const tap = options.tap;
		const type = options.type;
		let emitResult;
		switch(type) {
			case "async":
				emitResult = value => `return _callback(null, ${value});`;
				break;
			case "promise":
				emitResult = value => `return Promise.resolve(${value});`;
				break;
			case "sync":
				emitResult = value => `return ${value};`;
				break;
			/* istanbul ignore next */
			default:
				/* istanbul ignore next */
				throw new Error(`Unsupported type ${tap}`);
		}
		let content;
		switch(tap) {
			case "none":
				content = emitResult("undefined");
				break;
			case "sync":
				content = emitResult(`this._x(${args})`);
				break;
			case "multiple-sync":
				content = `
					const _taps = this._x;
					for(let _i = 0; _i < _taps.length; _i++) {
						const _result = _taps[_i](${args});
						if(_result !== undefined)
							${emitResult("_result")}
					}
					${emitResult("undefined")}
					`;
				break;
			case "intercept":
				content = `
					const _taps = this._x;
					const _intercept = this.interceptors;
					for(let _j = 0; _j < _intercept.length; _j++)
						_intercept[_j].call(${args});
					for(let _i = 0; _i < _taps.length; _i++) {
						let _tap = _taps[_i];
						for(let _j = 0; _j < _intercept.length; _j++)
							_tap = _intercept[_j].tap(_tap);
						const _result = _tap.fn(${args});
						if(_result !== undefined)
							${emitResult("_result")}
					}
					${emitResult("undefined")}
				`;
				break;
			/* istanbul ignore next */
			default:
				/* istanbul ignore next */
				throw new Error(`Unsupported tap type ${tap}`);
		}
		switch(type) {
			case "async":
				return `function(${argsWithCallback}) {
					${content}
				}`;
			case "promise":
			case "sync":
				return `function(${args}) {
					${content}
				}`;
			/* istanbul ignore next */
			default:
				/* istanbul ignore next */
				throw new Error(`Unsupported type ${tap}`);
		}
	}
}

module.exports = SyncBailHook;
