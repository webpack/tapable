"use strict";

const Hook = require("./Hook");
const simpleAsyncCases = require("./simpleAsyncCases");

class AsyncSeriesHook extends Hook {
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
		const isInspect = tap == "inspect";
		switch(`${tap} ${type}`) {
			case "multiple-async async":
				return `function(${argsWithCallback}) {
					const _fns = this._x;
					let _i = 0;
					const _handler = (_err) => {
						if(_err) {
							_callback(_err);
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
						const _handler = (_err) => {
							if(_err) {
								if(_isSync)
									Promise.resolve().then(() => _reject(_err));
								else
									_reject(_err);
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
					const _handler = () => {
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
						return Promise.resolve(_fns[_i](${args})).then(() => {
							if(++_i >= _fns.length) {
								return;
							}
							return _next();
						});
					}
					return _next();
				}`;
				xxx
			case "multiple async":
			case "inspect async":
				return `function(${argsWithCallback}) {
					const _taps = this._x;
					${isInspect ? `const _inspect = this.inspectors;
						for(let _j = 0; _j < _inspect.length; _j++)
							_inspect[_j].call(${args});
					` : ""}
					let _i = 0;
					const _handler = (_err) => {
						if(_err) {
							_callback(_err);
							return;
						}
						_handlerSuccess();
					};
					const _handlerErr = (_err) => {
						_callback(_err);
					};
					const _handlerSuccess = () => {
						if(++_i >= _taps.length) {
							_callback();
							return;
						}
						_next();
					};
					function _next() {
						${isInspect ? `let _tap = _taps[_i];
						for(let _j = 0; _j < _inspect.length; _j++)
							_tap = _inspect[_j].tap(_tap);
						` : `const _tap = _taps[_i];`}
						switch(_tap.type) {
							case "sync":
								try {
									_tap.fn(${args});
								} catch(_err) {
									_handlerErr(_err);
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
					_next();
				}`;
			case "multiple promise":
			case "inspect promise":
				return `function(${args}) {
					const _taps = this._x;
					${isInspect ? `const _inspect = this.inspectors;
					for(let _j = 0; _j < _inspect.length; _j++)
						_inspect[_j].call(${args});
					` : ""}
					let _i = 0;
					function _getPromise() {
						${isInspect ? `let _tap = _taps[_i];
						for(let _j = 0; _j < _inspect.length; _j++)
							_tap = _inspect[_j].tap(_tap);
						` : `const _tap = _taps[_i];`}
						switch(_tap.type) {
							case "sync":
								return Promise.resolve().then(() => {
									_tap.fn(${args});
								});
							case "async":
								return new Promise((_resolve, _reject) => {
									let _isSync = true;
									_tap.fn(${argsWithComma}(_err) => {
										if(_err) {
											if(_isSync)
												Promise.resolve().then(() => _reject(_err));
											else
												_reject(_err);
											return;
										}
										_resolve();
									});
									_isSync = false;
								});
							case "promise":
								return Promise.resolve(_tap.fn(${args}));
						}
					}
					function _next() {
						return _getPromise().then(() => {
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

module.exports = AsyncSeriesHook;
