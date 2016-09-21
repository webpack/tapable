/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

// interface Tapable {
//    compilation(compilation, data): void;
// }

// this.plugin("compilation", function (compilation, data) { ... });

interface Plugin {
	apply(): void; 
}

export abstract class Tapable {
	private _plugins: any = {};
	static mixin(property: string): void {
		copyProperties(Tapable.prototype, property);	 
	}

	public apply(...plugins: Plugin[]) {
		for(let i = 0; i < plugins.length; i++) {
			plugins[i].apply(this);
		}
	}

	public plugin(names: string|string[], fn: Function ) {
		if(Array.isArray(names)) {
			names.forEach(function(name: string){
				this.plugin(name, fn);
			}, this);
			return;
		}
		if(!this._plugins[name]) this._plugins[name] = [fn];
		else this._plugins[name].push(fn);
	}

	protected applyPlugins(name: string, ...args: any[]) {
		if(!this._plugins[name]) return;
		
		let plugins = this._plugins[name];
		for(let i = 0; i < plugins.length; i++)
			plugins[i].apply(this, args);
	}

	protected applyPluginsWaterfall(name: string, init: any, ...args: any[]) {
		if(!this._plugins[name]) return init;

		let plugins = this._plugins[name];
		let current = init;
		for(let i = 0; i < plugins.length; i++)
			current = plugins[i].apply(this, [current].concat(args));
		return current;
	}

	protected applyPluginsWaterfall0(name: string, init: any) {
		var plugins = this._plugins[name];
		if(!plugins) return init;
		var current = init;
		for(var i = 0; i < plugins.length; i++)
			current = plugins[i].call(this, current);
		return current;
	} 
}


function TapableOld() {
	this._plugins = {};
}
module.exports = TapableOld;

function copyProperties(from, to) {
	for(var key in from)
		to[key] = from[key];
	return to;
}

// TapableOld.mixin = function mixinTapableOld(pt) {
// 	copyProperties(TapableOld.prototype, pt);
// };

// TapableOld.prototype.plugin = function plugin(name, fn) {
// 	if(Array.isArray(name)) {
// 		name.forEach(function(name) {
// 			this.plugin(name, fn);
// 		}, this);
// 		return;
// 	}
// 	if(!this._plugins[name]) this._plugins[name] = [fn];
// 	else this._plugins[name].push(fn);
// };

// TapableOld.prototype.apply = function apply() {
// 	for(var i = 0; i < arguments.length; i++) {
// 		arguments[i].apply(this);
// 	}
// };

// TapableOld.prototype.applyPlugins = function applyPlugins(name) {
// 	if(!this._plugins[name]) return;
// 	var args = Array.prototype.slice.call(arguments, 1);
// 	var plugins = this._plugins[name];
// 	for(var i = 0; i < plugins.length; i++)
// 		plugins[i].apply(this, args);
// };

// TapableOld.prototype.applyPluginsWaterfall = function applyPluginsWaterfall(name, init) {
// 	if(!this._plugins[name]) return init;
// 	var args = Array.prototype.slice.call(arguments, 2);
// 	var plugins = this._plugins[name];
// 	var current = init;
// 	for(var i = 0; i < plugins.length; i++)
// 		current = plugins[i].apply(this, [current].concat(args));
// 	return current;
// };

TapableOld.prototype.applyPluginsWaterfall0 = function applyPluginsWaterfall0(name, init) {
	var plugins = this._plugins[name];
	if(!plugins) return init;
	var current = init;
	for(var i = 0; i < plugins.length; i++)
		current = plugins[i].call(this, current);
	return current;
};

TapableOld.prototype.applyPluginsBailResult = function applyPluginsBailResult(name) {
	if(!this._plugins[name]) return;
	var args = Array.prototype.slice.call(arguments, 1);
	var plugins = this._plugins[name];
	for(var i = 0; i < plugins.length; i++) {
		var result = plugins[i].apply(this, args);
		if(typeof result !== "undefined") {
			return result;
		}
	}
};

TapableOld.prototype.applyPluginsBailResult1 = function applyPluginsBailResult1(name, param) {
	if(!this._plugins[name]) return;
	var plugins = this._plugins[name];
	for(var i = 0; i < plugins.length; i++) {
		var result = plugins[i].call(this, param);
		if(typeof result !== "undefined") {
			return result;
		}
	}
};

TapableOld.prototype.applyPluginsAsyncSeries = TapableOld.prototype.applyPluginsAsync = function applyPluginsAsync(name) {
	var args = Array.prototype.slice.call(arguments, 1);
	var callback = args.pop();
	if(!this._plugins[name] || this._plugins[name].length === 0) return callback();
	var plugins = this._plugins[name];
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

TapableOld.prototype.applyPluginsAsyncSeriesBailResult = function applyPluginsAsyncSeriesBailResult(name) {
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
};

TapableOld.prototype.applyPluginsAsyncSeriesBailResult1 = function applyPluginsAsyncSeriesBailResult1(name, param, callback) {
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
};

TapableOld.prototype.applyPluginsAsyncWaterfall = function applyPluginsAsyncWaterfall(name, init, callback) {
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
};

TapableOld.prototype.applyPluginsParallel = function applyPluginsParallel(name) {
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
};

TapableOld.prototype.applyPluginsParallelBailResult = function applyPluginsParallelBailResult(name) {
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
					done = done.filter(function(item) {
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
};

TapableOld.prototype.applyPluginsParallelBailResult1 = function applyPluginsParallelBailResult1(name, param, callback) {
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
					done = done.filter(function(item) {
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
};

