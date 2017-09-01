"use strict";

const Hook = require("./Hook");

class SyncWaterfallHook extends Hook {
	constructor(args) {
		super(args);
		if(args.length < 1) throw new Error("Waterfall hooks must have at least one argument");
	}

	tapAsync() {
		throw new Error("tapAsync is not supported on a SyncWaterfallHook");
	}

	tapPromise() {
		throw new Error("tapPromise is not supported on a SyncWaterfallHook");
	}

	template(options) {
		const args = options.args.join(", ");
		const firstArg = options.args[0];
		const argsWithCurrent = ["_current"].concat(options.args.slice(1)).join(", ");
		const argsWithCallback = `${args}, _callback`;
		const tap = options.tap;
		const type = options.type;
		let emitResult;
		switch(type) {
			case "async":
				emitResult = value => `return _callback(null, ${value});`;
				break;
			case "promise":
			case "sync":
				emitResult = value => `return ${value};`;
				break;
			default:
				throw new Error(`Unsupported type ${tap}`);
		}
		let content;
		switch(tap) {
			case "none":
				content = emitResult(firstArg);
				break;
			case "sync":
				content = `const _result = this._x(${args});
				${emitResult(`_result !== undefined ? _result : ${firstArg}`)}`;
				break;
			case "multiple-sync":
				content = `
					const _taps = this._x;
					let _current = ${firstArg};
					for(let _i = 0; _i < _taps.length; _i++) {
						const _result = _taps[_i](${argsWithCurrent});
						if(_result !== undefined)
							_current = _result;
					}
					${emitResult("_current")}
					`;
				break;
			case "inspect":
				content = `
					const _taps = this._x;
					let _current = ${firstArg};
					const _inspect = this.inspectors;
					for(let _j = 0; _j < _inspect.length; _j++)
						_inspect[_j].call(${args});
					for(let _i = 0; _i < _taps.length; _i++) {
						let _tap = _taps[_i];
						for(let _j = 0; _j < _inspect.length; _j++)
							_tap = _inspect[_j].tap(_tap);
						const _result = _tap.fn(${argsWithCurrent});
						if(_result !== undefined)
							_current = _result;
					}
					${emitResult("_current")}
				`;
				break;
			default:
				throw new Error(`Unsupported tap type ${tap}`);
		}
		switch(type) {
			case "async":
				return `function(${argsWithCallback}) {
					${content}
				}`;
			case "promise":
				return `function(${args}) {
					return Promise.resolve().then(() => {
						${content}
					});
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

module.exports = SyncWaterfallHook;
