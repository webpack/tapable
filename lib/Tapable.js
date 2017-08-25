/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

// polyfill from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
// using the polyfill specifically to avoid the call to `Object.defineProperty` for performance reasons
function fastFilter(fun/*, thisArg*/) {
	'use strict';

	if (this === void 0 || this === null) {
		throw new TypeError();
	}

	var t = Object(this);
	var len = t.length >>> 0;
	if (typeof fun !== 'function') {
		throw new TypeError();
	}

	var res = [];
	var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
	for (var i = 0; i < len; i++) {
		if (i in t) {
			var val = t[i];

			// NOTE: Technically this should Object.defineProperty at
			//       the next index, as push can be affected by
			//       properties on Object.prototype and Array.prototype.
			//       But that method's new, and collisions should be
			//       rare, so use the more-compatible alternative.
			if (fun.call(thisArg, val, i, t)) {
				res.push(val);
			}
		}
	}

	return res;
}

function copyProperties(from, to) {
	for(var key in from)
		to[key] = from[key];
	return to;
}

class Tapable {
	constructor() {
		this._plugins = {};
	}
	
	mixin(pt) {
		copyProperties(Tapable.prototype, pt);
	}

	applyPlugins(name) {
		if(!this._plugins[name]) return;
		var args = Array.prototype.slice.call(arguments, 1);
		var plugins = this._plugins[name];
		for(var i = 0; i < plugins.length; i++)
			plugins[i].apply(this, args);
	}

	applyPlugins0(name) {
		var plugins = this._plugins[name];
		if(!plugins) return;
		for(var i = 0; i < plugins.length; i++)
			plugins[i].call(this);
	}

	applyPlugins1(name, param) {
		var plugins = this._plugins[name];
		if(!plugins) return;
		for(var i = 0; i < plugins.length; i++)
			plugins[i].call(this, param);
	}

	applyPlugins2(name, param1, param2) {
		var plugins = this._plugins[name];
		if(!plugins) return;
		for(var i = 0; i < plugins.length; i++)
			plugins[i].call(this, param1, param2);
	}

	applyPluginsWaterfall(name, init) {
		if(!this._plugins[name]) return init;
		var args = Array.prototype.slice.call(arguments, 1);
		var plugins = this._plugins[name];
		var current = init;
		for(var i = 0; i < plugins.length; i++) {
			args[0] = current;
			current = plugins[i].apply(this, args);
		}
		return current;
	}

	applyPluginsWaterfall0(name, init) {
		var plugins = this._plugins[name];
		if(!plugins) return init;
		var current = init;
		for(var i = 0; i < plugins.length; i++)
			current = plugins[i].call(this, current);
		return current;
	}

	applyPluginsWaterfall1(name, init, param) {
		var plugins = this._plugins[name];
		if(!plugins) return init;
		var current = init;
		for(var i = 0; i < plugins.length; i++)
			current = plugins[i].call(this, current, param);
		return current;
	}

	applyPluginsWaterfall2(name, init, param1, param2) {
		var plugins = this._plugins[name];
		if(!plugins) return init;
		var current = init;
		for(var i = 0; i < plugins.length; i++)
			current = plugins[i].call(this, current, param1, param2);
		return current;
	}

	applyPluginsBailResult(name) {
		if(!this._plugins[name]) return;
		var args = Array.prototype.slice.call(arguments, 1);
		var plugins = this._plugins[name];
		for(var i = 0; i < plugins.length; i++) {
			var result = plugins[i].apply(this, args);
			if(typeof result !== "undefined") {
				return result;
			}
		}
	}

	applyPluginsBailResult1(name, param) {
		if(!this._plugins[name]) return;
		var plugins = this._plugins[name];
		for(var i = 0; i < plugins.length; i++) {
			var result = plugins[i].call(this, param);
			if(typeof result !== "undefined") {
				return result;
			}
		}
	}

	applyPluginsBailResult2(name, param1, param2) {
		if(!this._plugins[name]) return;
		var plugins = this._plugins[name];
		for(var i = 0; i < plugins.length; i++) {
			var result = plugins[i].call(this, param1, param2);
			if(typeof result !== "undefined") {
				return result;
			}
		}
	}

	applyPluginsBailResult3(name, param1, param2, param3) {
		if(!this._plugins[name]) return;
		var plugins = this._plugins[name];
		for(var i = 0; i < plugins.length; i++) {
			var result = plugins[i].call(this, param1, param2, param3);
			if(typeof result !== "undefined") {
				return result;
			}
		}
	}

	applyPluginsBailResult4(name, param1, param2, param3, param4) {
		if(!this._plugins[name]) return;
		var plugins = this._plugins[name];
		for(var i = 0; i < plugins.length; i++) {
			var result = plugins[i].call(this, param1, param2, param3, param4);
			if(typeof result !== "undefined") {
				return result;
			}
		}
	}

	applyPluginsBailResult5(name, param1, param2, param3, param4, param5) {
		if(!this._plugins[name]) return;
		var plugins = this._plugins[name];
		for(var i = 0; i < plugins.length; i++) {
			var result = plugins[i].call(this, param1, param2, param3, param4, param5);
			if(typeof result !== "undefined") {
				return result;
			}
		}
	}

	applyPluginsAsyncSeries1(name, param, callback) {
		var plugins = this._plugins[name];
		if(!plugins || plugins.length === 0) return callback();
		var i = 0;
		var _this = this;
		var innerCallback = copyProperties(callback, function next(err) {
			if(err) return callback(err);
			i++;
			if(i >= plugins.length) {
				return callback();
			}
			plugins[i].call(_this, param, innerCallback);
		});
		plugins[0].call(this, param, innerCallback);
	}

	applyPluginsAsyncSeriesBailResult(name) {
		var args = Array.prototype.slice.call(arguments, 1);
		var callback = args.pop();
		if(!this._plugins[name] || this._plugins[name].length === 0) return callback();
		var plugins = this._plugins[name];
		var i = 0;
		var _this = this;
		args.push(copyProperties(callback, function next() {
			if(arguments.length > 0) return callback.apply(null, arguments);
			i++;
			if(i >= plugins.length) {
				return callback();
			}
			plugins[i].apply(_this, args);
		}));
		plugins[0].apply(this, args);
	}

	applyPluginsAsyncSeriesBailResult1(name, param, callback) {
		var plugins = this._plugins[name];
		if(!plugins || plugins.length === 0) return callback();
		var i = 0;
		var _this = this;
		var innerCallback = copyProperties(callback, function next(err, result) {
			if(arguments.length > 0) return callback(err, result);
			i++;
			if(i >= plugins.length) {
				return callback();
			}
			plugins[i].call(_this, param, innerCallback);
		});
		plugins[0].call(this, param, innerCallback);
	}

	applyPluginsAsyncWaterfall(name, init, callback) {
		if(!this._plugins[name] || this._plugins[name].length === 0) return callback(null, init);
		var plugins = this._plugins[name];
		var i = 0;
		var _this = this;
		var next = copyProperties(callback, function(err, value) {
			if(err) return callback(err);
			i++;
			if(i >= plugins.length) {
				return callback(null, value);
			}
			plugins[i].call(_this, value, next);
		});
		plugins[0].call(this, init, next);
	}

	applyPluginsParallel(name) {
		var args = Array.prototype.slice.call(arguments, 1);
		var callback = args.pop();
		if(!this._plugins[name] || this._plugins[name].length === 0) return callback();
		var plugins = this._plugins[name];
		var remaining = plugins.length;
		args.push(copyProperties(callback, function(err) {
			if(remaining < 0) return; // ignore
			if(err) {
				remaining = -1;
				return callback(err);
			}
			remaining--;
			if(remaining === 0) {
				return callback();
			}
		}));
		for(var i = 0; i < plugins.length; i++) {
			plugins[i].apply(this, args);
			if(remaining < 0) return;
		}
	}

	applyPluginsParallelBailResult(name) {
		var args = Array.prototype.slice.call(arguments, 1);
		var callback = args[args.length - 1];
		if(!this._plugins[name] || this._plugins[name].length === 0) return callback();
		var plugins = this._plugins[name];
		var currentPos = plugins.length;
		var currentResult;
		var done = [];
		for(var i = 0; i < plugins.length; i++) {
			args[args.length - 1] = (function(i) {
				return copyProperties(callback, function() {
					if(i >= currentPos) return; // ignore
					done.push(i);
					if(arguments.length > 0) {
						currentPos = i + 1;
						done = fastFilter.call(done, function(item) {
							return item <= i;
						});
						currentResult = Array.prototype.slice.call(arguments);
					}
					if(done.length === currentPos) {
						callback.apply(null, currentResult);
						currentPos = 0;
					}
				});
			}(i));
			plugins[i].apply(this, args);
		}
	}

	applyPluginsParallelBailResult1(name, param, callback) {
		var plugins = this._plugins[name];
		if(!plugins || plugins.length === 0) return callback();
		var currentPos = plugins.length;
		var currentResult;
		var done = [];
		for(var i = 0; i < plugins.length; i++) {
			var innerCallback = (function(i) {
				return copyProperties(callback, function() {
					if(i >= currentPos) return; // ignore
					done.push(i);
					if(arguments.length > 0) {
						currentPos = i + 1;
						done = fastFilter.call(done, function(item) {
							return item <= i;
						});
						currentResult = Array.prototype.slice.call(arguments);
					}
					if(done.length === currentPos) {
						callback.apply(null, currentResult);
						currentPos = 0;
					}
				});
			}(i));
			plugins[i].call(this, param, innerCallback);
		}
	}

	hasPlugins(name) {
		var plugins = this._plugins[name];
		return plugins && plugins.length > 0;
	}

	plugin(name, fn) {
		if(Array.isArray(name)) {
			name.forEach(function(name) {
				this.plugin(name, fn);
			}, this);
			return;
		}
		if(!this._plugins[name]) this._plugins[name] = [fn];
		else this._plugins[name].push(fn);
	}

	apply() {
		for(var i = 0; i < arguments.length; i++) {
			arguments[i].apply(this);
		}
	}
}

Tapable.prototype.applyPluginsAsyncSeries = Tapable.prototype.applyPluginsAsync = function applyPluginsAsyncSeries(name) {
	var args = Array.prototype.slice.call(arguments, 1);
	var callback = args.pop();
	var plugins = this._plugins[name];
	if(!plugins || plugins.length === 0) return callback();
	var i = 0;
	var _this = this;
	args.push(copyProperties(callback, function next(err) {
		if(err) return callback(err);
		i++;
		if(i >= plugins.length) {
			return callback();
		}
		plugins[i].apply(_this, args);
	}));
	plugins[0].apply(this, args);
};

module.exports = Tapable;
