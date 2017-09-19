"use strict";

const Hook = require("./Hook");

class SyncHook extends Hook {
	tapAsync() {
		throw new Error("tapAsync is not supported on a SyncHook");
	}

	tapPromise() {
		throw new Error("tapPromise is not supported on a SyncHook");
	}

	template(options) {
		const args = options.args.join(", ");
		const argsWithCallback = args ? `${args}, _callback` : "_callback";
		const tap = options.tap;
		const type = options.type;
		let content;
		switch(tap) {
			case "none":
				content = "";
				break;
			case "sync":
				content = `this._x(${args});`;
				break;
			case "multiple-sync":
				content = `
					const _taps = this._x;
					for(let _i = 0; _i < _taps.length; _i++)
						_taps[_i](${args});
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
						_tap.fn(${args});
					}
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
					_callback();
				}`;
			case "promise":
				return `function(${args}) {
					${content}
					return Promise.resolve();
				}`;
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

module.exports = SyncHook;
