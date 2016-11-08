/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

interface Plugin {
  (): void;
}

class Tapable {
  static mixin = (pt) => { copyProperties(Tapable.prototype, pt); };

  private _plugins: { [index: string]: Plugin[] };

  constructor() {
    this._plugins = {};
  }

  applyPlugins(name: string): void {
    if(!this._plugins[name]) return;
    var args = Array.prototype.slice.call(arguments, 1);
    var plugins = this._plugins[name];
    for(var i = 0; i < plugins.length; i++)
      plugins[i].apply(this, args);
  };

  applyPluginsWaterfall<T>(name: string, init: T): T {
    if(!this._plugins[name]) return init;
    var args = Array.prototype.slice.call(arguments, 2);
    var plugins = this._plugins[name];
    var current = init;
    for(var i = 0; i < plugins.length; i++)
      current = plugins[i].apply(this, [current].concat(args));
    return current;
  };

  applyPluginsWaterfall0<T>(name: string, init: T): T {
    var plugins = this._plugins[name];
    if(!plugins) return init;
    var current = init;
    for(var i = 0; i < plugins.length; i++)
      current = plugins[i].call(this, current);
    return current;
  };

  applyPluginsBailResult(name: string): any {
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

  applyPluginsBailResult1(name: string, param): any {
    if(!this._plugins[name]) return;
    var plugins = this._plugins[name];
    for(var i = 0; i < plugins.length; i++) {
      var result = plugins[i].call(this, param);
      if(typeof result !== "undefined") {
        return result;
      }
    }
  };

//Tapable.prototype.applyPluginsAsyncSeries = 
  applyPluginsAsync(name: string): void {
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

  applyPluginsAsyncSeriesBailResult(name: string): void {
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

  applyPluginsAsyncSeriesBailResult1(name: string, param, callback: Function): void {
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

  applyPluginsAsyncWaterfall(name: string, init, callback: Function): void {
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

  applyPluginsParallel(name: string): void {
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

  applyPluginsParallelBailResult(name: string): void {
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

  applyPluginsParallelBailResult1(name: string, param, callback: Function): void {
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


  plugin(name: string, fn: Plugin) {
    if(Array.isArray(name)) {
      name.forEach(function(name) {
        this.plugin(name, fn);
      }, this);
      return;
    }
    if(!this._plugins[name]) this._plugins[name] = [fn];
    else this._plugins[name].push(fn);
  };

  apply() {
    for(var i = 0; i < arguments.length; i++) {
      arguments[i].apply(this);
    }
  };
}

export = Tapable;

function copyProperties(from, to) {
	for(var key in from)
		to[key] = from[key];
	return to;
}
