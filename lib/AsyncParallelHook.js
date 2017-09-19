"use strict";

const Hook = require("./Hook");
const simpleAsyncCases = require("./simpleAsyncCases");

class AsyncParallelHook extends Hook {
	constructor(args) {
		super(args);
		this.call = this._call = undefined;
	}

	template(options) {
		const simpleCase = simpleAsyncCases.notBailing(options);
		if(simpleCase) return simpleCase;
		const args = options.args.join(", ");
		const argsWithCallback = args ? `${args}, _callback` : "_callback";
		const argsWithComma = args ? `${args}, ` : "";
		const tap = options.tap;
		const type = options.type;
		const isIntercept = tap == "intercept";
		switch(`${tap} ${type}`) {
			case "multiple-async async":
				return `function(${argsWithCallback}) {
					const _fns = this._x;
					let _remaining = _fns.length;
					const _handler = (_err) => {
						if(_err && _remaining > 0) {
							_remaining = -1;
							_callback(_err);
							return;
						}
						if(--_remaining === 0) {
							_callback();
						}
					};
					for(let _i = 0; _i < _fns.length; _i++) {
						_fns[_i](${argsWithComma}_handler);
					}
				}`;
			case "multiple-async promise":
				return `function(${args}) {
					return new Promise((_resolve, _reject) => {
						const _fns = this._x;
						let _remaining = _fns.length;
						const _handler = (_err) => {
							if(_err && _remaining > 0) {
								_remaining = -1;
								_reject(_err);
								return;
							}
							if(--_remaining === 0) {
								_resolve();
							}
						};
						for(let _i = 0; _i < _fns.length; _i++) {
							_fns[_i](${argsWithComma}_handler);
						}
					});
				}`;
			case "multiple-promise async":
				return `function(${argsWithCallback}) {
					const _fns = this._x;
					let _remaining = _fns.length;
					const _handler = () => {
						if(--_remaining === 0) {
							_callback();
						}
					}
					const _handlerErr = (_err) => {
						if(_remaining > 0) {
							_remaining = -1;
							_callback(_err);
						}
					}
					for(let _i = 0; _i < _fns.length; _i++) {
						Promise.resolve(_fns[_i](${args})).then(_handler, _handlerErr);
					}
				}`;
			case "multiple-promise promise":
				return `function(${args}) {
					const _fns = this._x;
					return Promise.all(_fns.map(_fn => _fn(${args}))).then(() => {});
				}`;
			case "multiple async":
			case "intercept async":
				return `function(${argsWithCallback}) {
					const _taps = this._x;
					${isIntercept ? `const _intercept = this.interceptors;
						for(let _j = 0; _j < _intercept.length; _j++)
							_intercept[_j].call(${args});
					` : ""}
					let _remaining = _taps.length;
					const _handler = (_err) => {
						if(_err && _remaining > 0) {
							_remaining = -1;
							_callback(_err);
							return;
						}
						if(--_remaining === 0) {
							_callback();
						}
					};
					const _handlerSuccess = () => {
						if(--_remaining === 0) {
							_callback();
						}
					}
					const _handlerErr = (_err) => {
						if(_remaining > 0) {
							_remaining = -1;
							_callback(_err);
						}
					}
					for(let _i = 0; _i < _taps.length; _i++) {
						${isIntercept ? `let _tap = _taps[_i];
						for(let _j = 0; _j < _intercept.length; _j++)
							_tap = _intercept[_j].tap(_tap);
						` : `const _tap = _taps[_i];`}
						switch(_tap.type) {
							case "sync":
								try {
									_tap.fn(${args});
								} catch(_err) {
									_handlerErr(_err);
									break;
								}
								_handlerSuccess();
								break;
							case "async":
								_tap.fn(${argsWithComma}_handler);
								break;
							case "promise":
								Promise.resolve(_tap.fn(${args})).then(_handlerSuccess, _handlerErr);
								break;
						}
					}
				}`;
			case "multiple promise":
			case "intercept promise":
				return `function(${args}) {
					const _taps = this._x;
					${isIntercept ? `const _intercept = this.interceptors;
					for(let _j = 0; _j < _intercept.length; _j++)
						_intercept[_j].call(${args});
					` : ""}
					let _earlyAbort = false;
					return Promise.all(_taps.map(_tap => {
						if(_earlyAbort) return;
						${isIntercept ? `for(let _j = 0; _j < _intercept.length; _j++)
							_tap = _intercept[_j].tap(_tap);
						` : ""}
						switch(_tap.type) {
							case "sync":
								try {
									_tap.fn(${args});
								} catch(_err) {
									_earlyAbort = true;
									return Promise.reject(_err);
								}
								return Promise.resolve();
								case "async":
								return new Promise((_resolve, _reject) => {
									_tap.fn(${argsWithComma}_err => {
										if(_err) {
											_earlyAbort = true;
											_reject(_err);
											return;
										}
										_resolve();
									});
								});
								break;
							case "promise":
								return _tap.fn(${args});
								break;
						}
					})).then(() => {});
				}`;
			/* istanbul ignore next */
			default:
				/* istanbul ignore next */
				throw new Error(`Unsupported tap '${tap}' or type '${type}'`);
		}
	}
}

module.exports = AsyncParallelHook;
