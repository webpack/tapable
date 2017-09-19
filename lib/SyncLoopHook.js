"use strict";

const Hook = require("./Hook");

class SyncLoopHook extends Hook {
	tapAsync() {
		throw new Error("tapAsync is not supported on a SyncLoopHook");
	}

	tapPromise() {
		throw new Error("tapPromise is not supported on a SyncLoopHook");
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
				content = `while(this._x(${args}) !== undefined);`;
				break;
			case "multiple-sync":
				content = `
					const _taps = this._x;
					for(let _i = 0; _i < _taps.length; _i++) {
						const _result = _taps[_i](${args});
						if(_result !== undefined)
							_i = -1;
					}
				`;
				break;
			case "intercept":
				content = `
					const _taps = this._x;
					const _intercept = this.interceptors;
					for(let _j = 0; _j < _intercept.length; _j++)
						_intercept[_j].call(${args});
					for(let _j = 0; _j < _intercept.length; _j++)
						_intercept[_j].loop(${args});
					for(let _i = 0; _i < _taps.length; _i++) {
						let _tap = _taps[_i];
						for(let _j = 0; _j < _intercept.length; _j++)
							_tap = _intercept[_j].tap(_tap);
						const _result = _tap.fn(${args});
						if(_result !== undefined) {
							for(let _j = 0; _j < _intercept.length; _j++)
								_intercept[_j].loop(${args});
							_i = -1;
						}
					}
				`;
				break;
			default:
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
			default:
				throw new Error(`Unsupported type ${tap}`);
		}
	}
}

module.exports = SyncLoopHook;
