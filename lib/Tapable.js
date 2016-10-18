// @flow

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

type callback = (err: ?Error) => void;
type callbackWithResult = (err: ?Error, result: any) => void;

type Plugin = {
	apply(): void
};

function copyProperties<A: Object, B: Object>(from: A, to: B): A & B  {
	for(let key in from)
		to[key] = from[key];

	return (to: any);
}

module.exports = class Tapable {
	_plugins: {[id:string]: Function[]};
	constructor(cb: callback) {
		this._plugins = {};
	}

	static mixin(pt : Object) {
		copyProperties(Tapable.prototype, pt);
	}

	apply(...plugins: Plugin[]): void {
		for(let i = 0; i < plugins.length; i++) {
			plugins[i].apply(this);
		}
	}

	plugin(name: string | string[], fn: Function) {
		if(Array.isArray(name)) {
			name.forEach(function(name) {
				this.plugin(name, fn);
			}, this);
			return;
		}
		if(!this._plugins[name]) this._plugins[name] = [fn];
		else this._plugins[name].push(fn);
	}

	applyPluginsapplyPlugins(name: string, ...args: any[]) {
		if(!this._plugins[name]) return;
		const plugins = this._plugins[name];
		for(let i = 0; i < plugins.length; i++)
			plugins[i].apply(this, args);
	}

	applyPluginsWaterfall(name: string, init: any, ...args: any[]) {
		if(!this._plugins[name]) return init;
		const plugins = this._plugins[name];
		let current = init;
		for(let i = 0; i < plugins.length; i++)
			current = plugins[i].apply(this, [current].concat(args));
		return current;
	}

	applyPluginsWaterfall0(name: string, init: any) {
		const plugins = this._plugins[name];
		if(!plugins) return init;
		let current = init;
		for(let i = 0; i < plugins.length; i++)
			current = plugins[i].call(this, current);
		return current;
	}

	applyPluginsBailResult(name: string, ...args: any[]) {
		if(!this._plugins[name]) return;
		const plugins = this._plugins[name];
		for(let i = 0; i < plugins.length; i++) {
			const result = plugins[i].apply(this, args);
			if(typeof result !== "undefined") {
				return result;
			}
		}
	}

	applyPluginsBailResult1(name: string, param: any) {
		if(!this._plugins[name]) return;
		const plugins = this._plugins[name];
		for(let i = 0; i < plugins.length; i++) {
			const result = plugins[i].call(this, param);
			if(typeof result !== "undefined") {
				return result;
			}
		}
	}

	applyPluginsAsync(name: string, ...args: any[]) {
		const callback: callback = args.pop();

		if(!this._plugins[name] || this._plugins[name].length === 0) return callback();
		const plugins = this._plugins[name];
		let i = 0;
		args.push(copyProperties(callback, (err) => {
			if(err) return callback(err);
			i++;
			if(i >= plugins.length) {
				return callback();
			}
			plugins[i].apply(this, args);
		}));
		plugins[0].apply(this, args);
	}

	applyPluginsAsync(name: string, ...args: any[]) {
		let callback: Function = args.pop();
		if(!this._plugins[name] || this._plugins[name].length === 0) return callback();
		const plugins = this._plugins[name];
		let i = 0;
		args.push(copyProperties(callback, (err) => {
			if(err) return callback(err);
			i++;
			if(i >= plugins.length) {
				return callback();
			}
			plugins[i].apply(this, args);
		}));
		plugins[0].apply(this, args);
	}

	applyPluginsAsyncSeriesBailResult(name: string, ...args: any[]) {
		let callback = args.pop();
		if(!this._plugins[name] || this._plugins[name].length === 0) return callback();
		const plugins = this._plugins[name];
		let i = 0;
		args.push(copyProperties(callback, () => {
			if(arguments.length > 0) return callback.apply(null, arguments);
			i++;
			if(i >= plugins.length) {
				return callback();
			}
			plugins[i].apply(this, args);
		}));
		plugins[0].apply(this, args);
	}

	applyPluginsAsyncSeriesBailResult1(name: string, param: any, callback: callbackWithResult) {
		const plugins = this._plugins[name];
		if(!plugins || plugins.length === 0) return callback();
		let i = 0;
		const innerCallback = copyProperties(callback, (err, result) => {
			if(arguments.length > 0) return callback(err, result);
			i++;
			if(i >= plugins.length) {
				return callback();
			}
			plugins[i].call(this, param, innerCallback);
		});
		plugins[0].call(this, param, innerCallback);
	}

	applyPluginsAsyncWaterfall(name: string, init: any, callback: callbackWithResult) {
		if(!this._plugins[name] || this._plugins[name].length === 0) return callback(null, init);
		const plugins = this._plugins[name];
		let i = 0;
		const next = copyProperties(callback, (err, value) => {
			if(err) return callback(err);
			i++;
			if(i >= plugins.length) {
				return callback(null, value);
			}
			plugins[i].call(this, value, next);
		});
		plugins[0].call(this, init, next);
	}

	applyPluginsParallel(name: string, ...args: any[]) {
		const callback: callback = args.pop();

		if(!this._plugins[name] || this._plugins[name].length === 0) return callback();
		const plugins = this._plugins[name];
		let remaining = plugins.length;
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
		for(let i = 0; i < plugins.length; i++) {
			plugins[i].apply(this, args);
			if(remaining < 0) return;
		}
	}

	applyPluginsParallelBailResult(name: string, ...args: any[]) {
		const callback: callbackWithResult = args[args.length - 1];
		if(!this._plugins[name] || this._plugins[name].length === 0) return callback();
		const plugins = this._plugins[name];
		let currentPos = plugins.length;
		let currentResult;
		let done = [];
		for(let i = 0; i < plugins.length; i++) {
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
	}

	applyPluginsParallelBailResult1(name: string, param: any, callback: callbackWithResult) {
		let plugins = this._plugins[name];
		if(!plugins || plugins.length === 0) return callback();
		let currentPos = plugins.length;
		let currentResult;
		let done = [];
		for(let i = 0; i < plugins.length; i++) {
			let innerCallback = (function(i) {
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
	}
}
