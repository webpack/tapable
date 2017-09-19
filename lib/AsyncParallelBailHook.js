/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
"use strict";

const Hook = require("./Hook");
const simpleAsyncCases = require("./simpleAsyncCases");

class AsyncParallelBailHook extends Hook {
	constructor(args) {
		super(args);
		this.call = this._call = undefined;
	}

	template(options) {
		const simpleCase = simpleAsyncCases.bailing(options);
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
					let _done = new Set();
					let _currentPos = _fns.length;
					let _currentError, _currentResult;
					for(let _i = 0; _i < _fns.length; _i++) {
						if(_i >= _currentPos) return; // early ignore
						_fns[_i](${argsWithComma}((_i) => (_err, _result) => {
							if(_i >= _currentPos) return; // ignore
							if(_err || _result !== undefined) {
								_currentPos = _i;
								for(const _k of _done)
									if(_k >= _i)
										_done.delete(_k);
								_currentError = _err;
								_currentResult = _result;
							} else {
								_done.add(_i);
							}
							if(_done.size === _currentPos) {
								_currentPos = 0;
								_callback(_currentError, _currentResult);
							}
						})(_i));
					}
				}`;
			case "multiple-async promise":
				return `function(${args}) {
					return new Promise((_resolve, _reject) => {
						const _fns = this._x;
						let _done = new Set();
						let _currentPos = _fns.length;
						let _currentError, _currentResult;
						for(let _i = 0; _i < _fns.length; _i++) {
							if(_i >= _currentPos) return; // early ignore
							_fns[_i](${argsWithComma}((_i) => (_err, _result) => {
								if(_i >= _currentPos) return; // ignore
								if(_err || _result !== undefined) {
									_currentPos = _i;
									for(const _k of _done)
										if(_k >= _i)
											_done.delete(_k);
									_currentError = _err;
									_currentResult = _result;
								} else {
									_done.add(_i);
								}
								if(_done.size === _currentPos) {
									_currentPos = 0;
									if(_currentError) {
										_reject(_currentError);
										return;
									}
									_resolve(_currentResult);
								}
							})(_i));
						}
					});
				}`;
			case "multiple-promise async":
				return `function(${argsWithCallback}) {
					const _fns = this._x;
					const _promises = _fns.map(_fn => _fn(${args}));
					Promise.race(_promises).catch(() => {}); // prevent unhandled rejections
					let _i = 0;
					(function _next() {
						_promises[_i].then(_result => {
							if(_result !== undefined) {
								_callback(null, _result);
								return;
							}
							if(++_i >= _promises.length) {
								_callback();
								return;
							}
							_next();
						}, _err => {
							_callback(_err);
						});
					}());
				}`;
			case "multiple-promise promise":
				return `function(${args}) {
					const _fns = this._x;
					const _promises = _fns.map(_fn => _fn(${args}));
					Promise.race(_promises).catch(() => {}); // prevent unhandled rejections
					let _i = 0;
					return (function _next() {
						return _promises[_i].then(_result => {
							if(_result !== undefined) {
								return _result;
							}
							if(++_i >= _promises.length) {
								return;
							}
							return _next();
						});
					}());
				}`;
			case "multiple async":
			case "intercept async":
				return `function(${argsWithCallback}) {
					const _taps = this._x;
					${isIntercept ? `const _intercept = this.interceptors;
						for(let _j = 0; _j < _intercept.length; _j++)
							_intercept[_j].call(${args});
					` : ""}
					const _promises = _taps.map(_tap => {
						${isIntercept ? `for(let _j = 0; _j < _intercept.length; _j++)
							_tap = _intercept[_j].tap(_tap);
						` : ""}
						switch(_tap.type) {
							case "sync":
								try {
									return Promise.resolve(_tap.fn(${args}));
								} catch(_err) {
									return Promise.resolve().then(() => { throw _err; });
								}
							case "async":
								return new Promise((_resolve, _reject) => {
									_tap.fn(${argsWithComma}(_err, _result) => {
										if(_err) {
											_reject(_err);
											return;
										}
										_resolve(_result);
									});
								});
							case "promise":
								return Promise.resolve(_tap.fn(${args}));
						}
					});
					Promise.race(_promises).catch(() => {}); // prevent unhandled rejections
					let _i = 0;
					(function _next() {
						_promises[_i].then(_result => {
							if(_result !== undefined) {
								_callback(null, _result);
								return;
							}
							if(++_i >= _promises.length) {
								_callback();
								return;
							}
							_next();
						}, _err => {
							_callback(_err);
						});
					}());
				}`;
			case "multiple promise":
			case "intercept promise":
				return `function(${args}) {
					const _taps = this._x;
					${isIntercept ? `const _intercept = this.interceptors;
						for(let _j = 0; _j < _intercept.length; _j++)
							_intercept[_j].call(${args});
					` : ""}
					const _promises = _taps.map(_tap => {
						${isIntercept ? `for(let _j = 0; _j < _intercept.length; _j++)
							_tap = _intercept[_j].tap(_tap);
						` : ""}
						switch(_tap.type) {
							case "sync":
								try {
									return Promise.resolve(_tap.fn(${args}));
								} catch(_err) {
									return Promise.resolve().then(() => { throw _err; });
								}
							case "async":
								return new Promise((_resolve, _reject) => {
									_tap.fn(${argsWithComma}(_err, _result) => {
										if(_err) {
											_reject(_err);
											return;
										}
										_resolve(_result);
									});
								});
							case "promise":
								return Promise.resolve(_tap.fn(${args}));
						}
					});
					Promise.race(_promises).catch(() => {}); // prevent unhandled rejections
					let _i = 0;
					return (function _next() {
						return _promises[_i].then(_result => {
							if(_result !== undefined) {
								return _result;
							}
							if(++_i >= _promises.length) {
								return;
							}
							return _next();
						});
					}());
				}`;
			/* istanbul ignore next */
			default:
				/* istanbul ignore next */
				throw new Error(`Unsupported tap '${tap}' or type '${type}'`);
		}
	}
}

module.exports = AsyncParallelBailHook;
