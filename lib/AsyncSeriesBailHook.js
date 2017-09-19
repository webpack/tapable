"use strict";

const Hook = require("./Hook");
const simpleAsyncCases = require("./simpleAsyncCases");

class AsyncSeriesBailHook extends Hook {
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
					let _i = 0;
					const _handler = (_err, _result) => {
						if(_err) {
							_callback(_err);
							return;
						}
						if(_result !== undefined) {
							_callback(null, _result);
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
								_resolve(_result);
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
							_callback(null, _result);
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
								return _result;
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
							_callback(null, _result);
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
								return _result;
							}
							if(++_i >= _taps.length) {
								return;
							}
							return _next();
						});
					}
					return _next();
				}`;
			default:
				throw new Error(`Unsupported tap '${tap}' or type '${type}'`);
		}
	}
}

module.exports = AsyncSeriesBailHook;
