"use strict";

const Hook = require("./Hook");
const simpleAsyncCases = require("./simpleAsyncCases");

class AsyncSeriesWaterfallHook extends Hook {
	constructor(args) {
		super(args);
		if(args.length < 1) throw new Error("Waterfall hooks must have at least one argument");
		this.call = this._call = undefined;
	}

	template(options) {
		const args = options.args.join(", ");
		const firstArg = options.args[0];
		const argsWithCurrent = ["_current"].concat(options.args.slice(1)).join(", ");
		const argsWithCallback = `${args}, _callback`;
		const tap = options.tap;
		const type = options.type;
		const isIntercept = tap == "intercept";
		switch(`${tap} ${type}`) {
			case "none async":
				return `function(${argsWithCallback}) {
					_callback(null, ${firstArg});
				}`;
			case "none promise":
				return `function(${args}) {
					return Promise.resolve(${firstArg});
				}`;
			case "sync async":
				return `function(${argsWithCallback}) {
					let _result;
					try {
						_result = this._x(${args});
					} catch(_e) {
						_callback(_e);
						return;
					}
					_callback(null, _result !== undefined ? _result : ${firstArg});
				}`;
			case "sync promise":
				return `function(${args}) {
					return Promise.resolve().then(() => {
						const _result = this._x(${args});
						return _result !== undefined ? _result : ${firstArg};
					});
				}`;
			case "async async":
				return `function(${argsWithCallback}) {
					this._x(${args}, (_err, _result) => {
						if(_err) {
							_callback(_err);
							return;
						}
						_callback(null, _result !== undefined ? _result : ${firstArg});
					});
				}`;
			case "async promise":
				return `function(${args}) {
					return new Promise((_resolve, _reject) => {
						let _isSync = true;
						this._x(${args}, (_err, _result) => {
							if(_err) {
								if(_isSync)
									Promise.resolve().then(() => _reject(_err));
								else
									_reject(_err);
								return;
							}
							_resolve(_result !== undefined ? _result : ${firstArg});
						});
						_isSync = false;
					});
				}`;
			case "promise async":
				return `function(${argsWithCallback}) {
					Promise.resolve(this._x(${args})).then(_result => {
						_callback(null, _result !== undefined ? _result : ${firstArg});
					}, _err => {
						_callback(_err);
					});
				}`;
			case "promise promise":
				return `function(${args}) {
					return Promise.resolve(this._x(${args})).then(_result => {
						return _result !== undefined ? _result : ${firstArg};
					});
				}`;
			case "multiple-sync async":
				return `function(${argsWithCallback}) {
					let _current = ${firstArg};
					try {
						const _fns = this._x;
						for(let _i = 0; _i < _fns.length; _i++) {
							const _result = _fns[_i](${argsWithCurrent});
							if(_result !== undefined) {
								_current = _result;
							}
						}
					} catch(_err) {
						_callback(_err);
						return;
					}
					_callback(null, _current);
				}`;
			case "multiple-sync promise":
				return `function(${args}) {
					return new Promise(_resolve => {
						let _current = ${firstArg};
						const _fns = this._x;
						for(let _i = 0; _i < _fns.length; _i++) {
							const _result = _fns[_i](${argsWithCurrent});
							if(_result !== undefined) {
								_current = _result;
							}
						}
						_resolve(_current);
					});
				}`;
			case "multiple-async async":
				return `function(${argsWithCallback}) {
					const _fns = this._x;
					let _i = 0;
					let _current = ${firstArg};
					const _handler = (_err, _result) => {
						if(_err) {
							_callback(_err);
							return;
						}
						if(_result !== undefined) {
							_current = _result;
						}
						if(++_i >= _fns.length) {
							_callback(null, _current);
							return;
						}
						_next();
					};
					function _next() {
						_fns[_i](${argsWithCurrent}, _handler);
					}
					_next();
				}`;
			case "multiple-async promise":
				return `function(${args}) {
					return new Promise((_resolve, _reject) => {
						const _fns = this._x;
						let _i = 0;
						let _current = ${firstArg};
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
								_current = _result;
							}
							if(++_i >= _fns.length) {
								_resolve(_current);
								return;
							}
							_next();
						};
						function _next() {
							_isSync = true;
							_fns[_i](${argsWithCurrent}, _handler);
							_isSync = false;
						}
						_next();
					});
				}`;
			case "multiple-promise async":
				return `function(${argsWithCallback}) {
					const _fns = this._x;
					let _i = 0;
					let _current = ${firstArg};
					const _handler = (_result) => {
						if(_result !== undefined) {
							_current = _result;
						}
						if(++_i >= _fns.length) {
							_callback(null, _current);
							return;
						}
						_next();
					};
					const _handlerErr = (_err) => {
						_callback(_err);
					};
					function _next() {
						Promise.resolve(_fns[_i](${argsWithCurrent})).then(_handler, _handlerErr);
					}
					_next();
				}`;
			case "multiple-promise promise":
				return `function(${args}) {
					const _fns = this._x;
					let _i = 0;
					let _current = ${firstArg};
					function _next() {
						return Promise.resolve(_fns[_i](${argsWithCurrent})).then(_result => {
							if(_result !== undefined) {
								_current = _result;
							}
							if(++_i >= _fns.length) {
								return _current;
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
					let _current = ${firstArg};
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
							_current = _result;
						}
						if(++_i >= _taps.length) {
							_callback(null, _current);
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
									_result = _tap.fn(${argsWithCurrent});
								} catch(_err) {
									_handlerErr(_err);
								}
								_handlerSuccess(_result);
								break;
							case "async":
								_tap.fn(${argsWithCurrent}, _handler);
								break;
							case "promise":
								Promise.resolve(_tap.fn(${argsWithCurrent})).then(_handlerSuccess, _handlerErr);
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
					let _current = ${firstArg};
					function _getPromise() {
						${isIntercept ? `let _tap = _taps[_i];
						for(let _j = 0; _j < _intercept.length; _j++)
							_tap = _intercept[_j].tap(_tap);
						` : `const _tap = _taps[_i];`}
						switch(_tap.type) {
							case "sync":
								return Promise.resolve().then(() => {
									return _tap.fn(${argsWithCurrent});
								});
							case "async":
								return new Promise((_resolve, _reject) => {
									let _isSync = true;
									_tap.fn(${argsWithCurrent}, (_err, _result) => {
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
								return Promise.resolve(_tap.fn(${argsWithCurrent}));
						}
					}
					function _next() {
						return _getPromise().then(_result => {
							if(_result !== undefined) {
								_current = _result;
							}
							if(++_i >= _taps.length) {
								return _current;
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

module.exports = AsyncSeriesWaterfallHook;
