/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
"use strict";

const Hook = require("./Hook");
const simpleAsyncCases = require("./simpleAsyncCases");

class AsyncSeriesLoopHook extends Hook {
	constructor(args) {
		super(args);
		this.call = this._call = undefined;
	}

	template(options) {
		const args = options.args.join(", ");
		const argsWithCallback = args ? `${args}, _callback` : "_callback";
		const argsWithComma = args ? `${args}, ` : "";
		const tap = options.tap;
		const type = options.type;
		const isIntercept = tap == "intercept";
		switch(`${tap} ${type}`) {
			case "none async":
				return `function(${argsWithCallback}) {
					_callback();
				}`;
			case "none promise":
				return `function(${args}) {
					return Promise.resolve();
				}`;
			case "sync async":
				return `function(${argsWithCallback}) {
					try {
						while(this._x(${args}) !== undefined);
					} catch(_e) {
						_callback(_e);
						return;
					}
					_callback();
				}`;
			case "sync promise":
				return `function(${args}) {
					return Promise.resolve().then(() => {
						while(this._x(${args}) !== undefined);
					});
				}`;
			case "async async":
				return `function(${argsWithCallback}) {
					const _next = () => {
						this._x(${argsWithComma}(_err, _result) => {
							if(_err) {
								_callback(_err);
								return;
							}
							if(_result !== undefined) {
								_next();
								return;
							}
							_callback();
						});
					};
					_next();
				}`;
			case "async promise":
				return `function(${args}) {
					return new Promise((_resolve, _reject) => {
						let _isSync = true;
						const _next = () => {
							this._x(${argsWithComma}(_err, _result) => {
								if(_err) {
									if(_isSync)
										Promise.resolve().then(() => _reject(_err));
									else
										_reject(_err);
									return;
								}
								if(_result !== undefined) {
									_next();
									return;
								}
								_resolve();
							});
						};
						_next();
						_isSync = false;
					});
				}`;
			case "promise async":
				return `function(${argsWithCallback}) {
					const _next = () => {
						Promise.resolve(this._x(${args})).then(_result => {
							if(_result !== undefined)
								_next();
							else
								_callback();
						}, _err => {
							_callback(_err);
						});
					}
					_next();
				}`;
			case "promise promise":
				return `function(${args}) {
					const _next = () => Promise.resolve(this._x(${args})).then(_result => {
						if(_result !== undefined)
							return _next();
					});
					return _next();
				}`;
			case "multiple-sync async":
				return `function(${argsWithCallback}) {
					try {
						const _fns = this._x;
						for(let _i = 0; _i < _fns.length; _i++) {
							const _result = _fns[_i](${args});
							if(_result !== undefined)
								_i = -1;
						}
					} catch(_err) {
						_callback(_err);
						return;
					}
					_callback();
				}`;
			case "multiple-sync promise":
				return `function(${args}) {
					return Promise.resolve().then(() => {
						const _fns = this._x;
						for(let _i = 0; _i < _fns.length; _i++) {
							const _result = _fns[_i](${args});
							if(_result !== undefined)
								_i = -1;
						}
					});
				}`;
			case "multiple-async async":
				return `function(${argsWithCallback}) {
					const _fns = this._x;
					let _i = 0;
					const _handler = (_err, _result) => {
						if(_err) {
							_callback(_err);
							return;
						}
						if(_result !== undefined) {
							_i = 0;
							_next();
							return;
						}
						if(++_i >= _fns.length) {
							_callback();
							return;
						}
						_next();
					};
					function _next() {
						_fns[_i](${argsWithComma}_handler);
					}
					_next();
				}`;
			case "multiple-async promise":
				return `function(${args}) {
					return new Promise((_resolve, _reject) => {
						const _fns = this._x;
						let _i = 0;
						let _isSync;
						const _handler = (_err, _result) => {
							if(_err) {
								if(_isSync)
									Promise.resolve().then(() => _reject(_err));
								else
									_reject(_err);
								return;
							}
							if(_result !== undefined) {
								_i = 0;
								_next();
								return;
							}
							if(++_i >= _fns.length) {
								_resolve();
								return;
							}
							_next();
						};
						function _next() {
							_isSync = true;
							_fns[_i](${argsWithComma}_handler);
							_isSync = false;
						}
						_next();
					});
				}`;
			case "multiple-promise async":
				return `function(${argsWithCallback}) {
					const _fns = this._x;
					let _i = 0;
					const _handler = (_result) => {
						if(_result !== undefined) {
							_i = 0;
							_next();
							return;
						}
						if(++_i >= _fns.length) {
							_callback();
							return;
						}
						_next();
					};
					const _handlerErr = (_err) => {
						_callback(_err);
					};
					function _next() {
						Promise.resolve(_fns[_i](${args})).then(_handler, _handlerErr);
					}
					_next();
				}`;
			case "multiple-promise promise":
				return `function(${args}) {
					const _fns = this._x;
					let _i = 0;
					function _next() {
						return Promise.resolve(_fns[_i](${args})).then(_result => {
							if(_result !== undefined) {
								_i = 0;
								return _next();
							}
							if(++_i >= _fns.length) {
								return;
							}
							return _next();
						});
					}
					return _next();
				}`;
			case "multiple async":
			case "intercept async":
				return `function(${argsWithCallback}) {
					const _taps = this._x;
					${isIntercept ? `const _intercept = this.interceptors;
						for(let _j = 0; _j < _intercept.length; _j++)
							_intercept[_j].call(${args});
					` : ""}
					${isIntercept ? `
						for(let _j = 0; _j < _intercept.length; _j++)
							_intercept[_j].loop(${args});
					` : ""}
					let _i = 0;
					const _handler = (_err, _result) => {
						if(_err) {
							_callback(_err);
							return;
						}
						_handlerSuccess(_result);
					};
					const _handlerErr = (_err) => {
						_callback(_err);
					};
					const _handlerSuccess = (_result) => {
						if(_result !== undefined) {
							_i = 0;
							${isIntercept ? `
								for(let _j = 0; _j < _intercept.length; _j++)
									_intercept[_j].loop(${args});
							` : ""}
							_next();
							return;
						}
						if(++_i >= _taps.length) {
							_callback();
							return;
						}
						_next();
					};
					function _next() {
						${isIntercept ? `let _tap = _taps[_i];
						for(let _j = 0; _j < _intercept.length; _j++)
							_tap = _intercept[_j].tap(_tap);
						` : `const _tap = _taps[_i];`}
						switch(_tap.type) {
							case "sync":
								let _result;
								try {
									_result = _tap.fn(${args});
								} catch(_err) {
									_handlerErr(_err);
								}
								_handlerSuccess(_result);
								break;
							case "async":
								_tap.fn(${argsWithComma}_handler);
								break;
							case "promise":
								Promise.resolve(_tap.fn(${args})).then(_handlerSuccess, _handlerErr);
								break;
						}
					}
					_next();
				}`;
			case "multiple promise":
			case "intercept promise":
				return `function(${args}) {
					const _taps = this._x;
					${isIntercept ? `const _intercept = this.interceptors;
					for(let _j = 0; _j < _intercept.length; _j++)
						_intercept[_j].call(${args});
					` : ""}
					${isIntercept ? `
						for(let _j = 0; _j < _intercept.length; _j++)
							_intercept[_j].loop(${args});
					` : ""}
					let _i = 0;
					function _getPromise() {
						${isIntercept ? `let _tap = _taps[_i];
						for(let _j = 0; _j < _intercept.length; _j++)
							_tap = _intercept[_j].tap(_tap);
						` : `const _tap = _taps[_i];`}
						switch(_tap.type) {
							case "sync":
								return Promise.resolve().then(() => {
									return _tap.fn(${args});
								});
							case "async":
								return new Promise((_resolve, _reject) => {
									let _isSync = true;
									_tap.fn(${argsWithComma}(_err, _result) => {
										if(_err) {
											if(_isSync)
												Promise.resolve().then(() => _reject(_err));
											else
												_reject(_err);
											return;
										}
										_resolve(_result);
									});
									_isSync = false;
								});
							case "promise":
								return Promise.resolve(_tap.fn(${args}));
						}
					}
					function _next() {
						return _getPromise().then(_result => {
							if(_result !== undefined) {
								${isIntercept ? `
									for(let _j = 0; _j < _intercept.length; _j++)
										_intercept[_j].loop(${args});
								` : ""}
								_i = 0;
								return _next();
							}
							if(++_i >= _taps.length) {
								return;
							}
							return _next();
						});
					}
					return _next();
				}`;
			/* istanbul ignore next */
			default:
				/* istanbul ignore next */
				throw new Error(`Unsupported tap '${tap}' or type '${type}'`);
		}
	}
}

module.exports = AsyncSeriesLoopHook;
