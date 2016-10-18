const copyProperties = (fromObj: Object, toObj: Object) => {
  for (let key in fromObj) {
    toObj[key] = fromObj[key]
  }

  return toObj;
}

interface Plugin {
  [name: string]: [Function]
}

type CallbackFunction = (err?: Error, result?: any, ...args) => void;
/**
 * A class for plugin binding and applying
 * 
 * Usage: simply extend it or mixin it
 */
class Tapable {
  
  /**
   * Generate mixin object
   * 
   * @param newObj - object which will be mixined
   * @return  - object which has been mixined
   */
  static mixin(newObj: any): any {
    copyProperties(Tapable.prototype, newObj);
  }

  private _plugins: Plugin = {};
  /**
   * Build plugin array
   * 
   * @param names a string or array of strings to generate the group name of plugins
   * @param handler   a function which provides the plugin functionalities * 
   */
  plugin(names: string | Array<string>, handler: Function) {
    if (names instanceof Array) {
      names.forEach((group) => {
        this.plugin(group, handler);
      });
      return;
    }
    if (!this._plugins[names]) {
      this._plugins[names] = [handler];
    } else {
      this._plugins[names].push(handler)
    };
  }
  /**
   * Attaches all plugins passed as arguments to the instance, by calling apply on them. 
   */
  apply(...args) {
    args.forEach(arg => arg.apply(this));
  }
  /**
   * Synchronous applies all registered handers for specified name. 
   * 
   * The handler functions are called with all args.
   * 
   * @param name - plugin group name
   */
  protected applyPlugins(name: string, ...args) {
    if (!this._plugins[name]) return;
    let plugins = this._plugins[name];
    for (let i = 0; i < plugins.length; i++) {
      plugins[i].apply(this, args);
    }
  }
  /**
   * Asynchronously applies all registered handers for name. 
   * 
   * The hander functions are called with all args and a callback function with the signature (err: Error) => void. 
   * 
   * The handers are called in series, one at a time. After all handlers are applied, callback is called. 
   * 
   * If any handler passes a value for err, the callback is called with this error and no more handlers are called.
   */
  private applyPluginsAsync(name: string, ...args) {
    let callback = <CallbackFunction>args.pop();
    if (!this._plugins[name] || this._plugins[name].length === 0) return callback();
    let plugins = this._plugins[name];
    let i = 0;
    let next = (err) => {
      if (err) return callback(err);
      i++;
      if (i >= plugins.length) {
        return callback();
      }
      plugins[i].apply(this, args);
    }
    args.push(copyProperties(callback, next));
    plugins[0].apply(this, args);
  }
  /**
   * Synchronous applies all registered handers for name. 
   * 
   * The handler functions are called with the return value of the previous handler and all args. 
   * 
   * For the first handler init is used and the return value of the last handler is return by applyPluginsWaterfall
   */
  protected applyPluginsWaterfall(name: string, init: any, ...args) {
    if (!this._plugins[name]) return init;
    let plugins = this._plugins[name];
    let current = init;
    for (let i = 0; i < plugins.length; i++)
      current = plugins[i].apply(this, [current, ...args]);
    return current;
  }
  /**
   * Synchronous applies all registered handers for name. 
   * 
   * The handler functions are called with the return value of the previous handler WITHOUT any args. 
   * 
   * For the first handler init is used and the return value of the last handler is return by applyPluginsWaterfall0
   */
  protected applyPluginsWaterfall0(name: string, init: any) {
    let plugins = this._plugins[name];
    if (!plugins) return init;
    let current = init;
    for (let i = 0; i < plugins.length; i++)
      current = plugins[i].call(this, current);
    return current;
  }
  /**
   * Synchronous applies all registered handers for name. The handler function are called with all args. 
   * 
   * If a handler function returns something !== undefined, the value is returned and no more handers are applied.
   */
  protected applyPluginsBailResult(name: string, ...args) {
    if (!this._plugins[name]) return;
    let plugins = this._plugins[name];
    for (let i = 0; i < plugins.length; i++) {
      let result = plugins[i].apply(this, args);
      if (typeof result !== "undefined") {
        return result;
      }
    }
  }
  /**
   * Synchronous applies all registered handlers for name. The handler function are called WITHOUT any args. 
   * 
   * If a handler function returns something !== undefined, the value is returned and no more handers are applied.
   */
  protected applyPluginsBailResult1(name: string, param: any) {
    if (!this._plugins[name]) return;
    let plugins = this._plugins[name];
    for (let i = 0; i < plugins.length; i++) {
      let result = plugins[i].call(this, param);
      if (typeof result !== "undefined") {
        return result;
      }
    }
  }
  /**
   * Asynchronously applies all registered handers for name. 
   * 
   * The hander functions are called with the current value and a callback function with the signature (err: Error, nextValue: any) => void. 
   * 
   * When called nextValue is the current value for the next handler. The current value for the first handler is init. 
   * 
   * After all handlers are applied, callback is called with the last value. 
   * 
   * If any handler passes a value for err, the callback is called with this error and no more handlers are called.
   */
  protected applyPluginsAsyncWaterfall(name: string, init: any, callback: Function) {
    if (!this._plugins[name] || this._plugins[name].length === 0) return callback(null, init);
    let plugins = this._plugins[name];
    let i = 0;
    let next = copyProperties(callback, (err, value) => {
      if (err) return callback(err);
      i++;
      if (i >= plugins.length) {
        return callback(null, value);
      }
      plugins[i].call(this, value, next);
    });
    plugins[0].call(this, init, next);
  }
  
  /**
   * Asynchronously applies all registered handers for name. 
   * 
   * The hander functions are called with all args and a callback function with the signature (err: Error) => void. 
   * 
   * The handers are called in series, one at a time. 
   * 
   * After all handlers are applied, callback is called. 
   * 
   * If any handler passes a value for err, the callback is called with this error and no more handlers are called.
   */
  protected applyPluginsAsyncSeries(name: string, ...args) {
    this.applyPluginsAsync(name, ...args);
  }
  /**
   * Applies all registered handlers for name parallel. 
   * 
   * The handler functions are called with all args and a callback function with the signature (err?: Error) => void. 
   * 
   * The callback function is called when all handlers called the callback without err. 
   * 
   * If any handler calls the callback with err, callback is invoked with this error and the other handlers are ignored.
   */
  protected applyPluginsParallel(name: string, ...args) {
    let callback = <CallbackFunction>args.pop();
    if (!this._plugins[name] || this._plugins[name].length === 0) return callback();
    let plugins = this._plugins[name];
    let remaining = plugins.length;
    let next = (err) => {
      if (remaining < 0) return; // ignore
      if (err) {
        remaining = -1;
        return callback(err);
      }
      remaining--;
      if (remaining === 0) {
        return callback();
      }
    }
    args.push(copyProperties(callback, next));
    for (let i = 0; i < plugins.length; i++) {
      plugins[i].apply(this, args);
      if (remaining < 0) return;
    }
  }
  /**
   * Applies all registered handlers for name parallelly. 
   * 
   * The handler functions are called with all args and a callback function with the signature (err?: Error) => void. 
   * 
   * Handler functions must call the callback. They can either pass an error, or pass undefined, or pass an value. 
   * 
   * The first result (either error or value) with is not undefined is passed to the callback. 
   * 
   * The order is defined by registeration not by speed of the handler function. This function compentate this.
   */
  protected applyPluginsParallelBailResult(name: string, ...args) {
    let callback = <CallbackFunction>args[args.length - 1];
    if (!this._plugins[name] || this._plugins[name].length === 0)
      return callback();
    let plugins = this._plugins[name];
    let currentPos = plugins.length;
    let currentResult;
    let done = [];
    for (let i = 0; i < plugins.length; i++) {
      let argFn = (i) => {
        let fn = (...arg) => {
          if (i >= currentPos) return; // ignore
          done.push(i);
          if (arg.length > 0) {
            currentPos = i + 1;
            done = done.filter((item) => item <= i);
            currentResult = arg;
          }
          if (done.length === currentPos) {
            callback.apply(null, currentResult);
            currentPos = 0;
          }
        }
        return copyProperties(callback, fn);
      };
      args[args.length - 1] = argFn(i);
      plugins[i].apply(this, args);
    }
  }
  /**
   * Applies all registered handlers for name parallel. 
   * 
   * The handler functions are called with all args and a callback function with the signature (err?: Error) => void. 
   * 
   * Handler functions must call the callback. They can either pass an error, or pass undefined, or pass an value. 
   * 
   * The first result (either error or value) with is not undefined is passed to the callback. 
   * 
   * The order is defined by registeration not by speed of the handler function. This function compentate this.
   */
  protected applyPluginsParallelBailResult1(name: string, param: any, callback: Function) {
    let plugins = this._plugins[name];
    if (!plugins || plugins.length === 0) return callback();
    let currentPos = plugins.length;
    let currentResult;
    let done = [];
    for (let i = 0; i < plugins.length; i++) {
      let fn = (...args) => {
        if (i >= currentPos) return; // ignore
        done.push(i);
        if (args.length > 0) {
          currentPos = i + 1;
          done = done.filter(item => item <= i);
          currentResult = args;
        }
        if (done.length === currentPos) {
          callback.apply(null, currentResult);
          currentPos = 0;
        }
      }
      let innerCallback = (i) => copyProperties(callback, fn);
      plugins[i].call(this, param, innerCallback(i));
    }
  }
  /**
   * Asynchronously applies all registered handlers for name . 
   * 
   * The handler functions are called with all args and a callback function with the signature (err?: Error) => void. 
   * 
   * Handler functions must call the callback. They can either pass an error, or pass undefined, or pass an value.
   * 
   * The order is defined by registeration not by speed of the handler function. This function compentate this.
   */
  protected applyPluginsAsyncSeriesBailResult(name: string, ...args) {
    let callback = <CallbackFunction>args.pop();
    if (!this._plugins[name] || this._plugins[name].length === 0) return callback();
    let plugins = this._plugins[name];
    let i = 0;
    let next = (...params) => {
      if (params.length > 0) return callback.apply(null, params);
      i++;
      if (i >= plugins.length) {
        return callback();
      }
      plugins[i].apply(this, args);
    }
    args.push(copyProperties(callback, next));
    plugins[0].apply(this, args);
  }
  /**
   * Asynchronously applies all registered handlers for name . 
   * 
   * The handler functions are called with params and a callback function with the signature (err?: Error) => void. 
   * 
   * Handler functions must call the callback. They can either pass an error, or pass undefined, or pass an value.
   * 
   * The order is defined by registeration not by speed of the handler function. This function compentate this.
   */
  protected applyPluginsAsyncSeriesBailResult1(name: string, param: any, callback: Function) {
    let plugins = this._plugins[name];
    if (!plugins || plugins.length === 0) return callback();
    let i = 0;
    let next = function (err, result) {
      if (arguments.length > 0) return callback(err, result);
      i++;
      if (i >= plugins.length) {
        return callback();
      }
      plugins[i].call(this, param, innerCallback);
    };
    let innerCallback = copyProperties(callback, next);
    plugins[0].call(this, param, innerCallback);
  }
}

export = Tapable;