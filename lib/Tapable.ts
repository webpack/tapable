/*
 MIT License http://www.opensource.org/licenses/mit-license.php
 Author Tobias Koppers @sokra
 */
interface Handler {
    (...args: any[]): void;
}

interface Plugin {
    apply(...args: any[]): void;
}

interface CallbackFunction {
    (err?: Error, result?: any, ...args: any[]): void;
}

abstract class Tapable {
    private _plugins: {
        [propName: string]: Handler[]
    } = {};

    /**
     * Register plugin(s)
     * This acts as the same as on() of EventEmitter, for registering a handler/listener to do something when the
     * signal/event happens.
     *
     * @param names a string or an array of strings to generate the id(group name) of plugins
     * @param handler a function which provides the plugin functionality *
     */
    plugin(names: string[] | string, handler: Handler) {
        if (Array.isArray(names)) {
            names.forEach((name: string) => {
                this.plugin(name, handler);
            });
            return;
        }
        if (!this._plugins[names]) {
            this._plugins[names] = [handler];
        }
        else {
            this._plugins[names].push(handler);
        }
    }

    /**
     * invoke all plugins with this attached.
     * This method is just to "apply" plugins' definition, so that the real event listeners can be registered into
     * registry. Mostly the `apply` method of a plugin is the main place to place extension logic.
     */
    apply(...plugins: Plugin[]) {
        for (let plugin of plugins) {
            plugin.apply(this)
        }
    }

    /**
     * synchronously applies all registered handlers for target name(event id).
     *
     * The handlers are called with all the rest arguments.
     *
     * @param name - plugin group name
     * @param args
     */
    applyPlugins(name: string, ...args) {
        if (!this._plugins[name]) {
            return;
        }
        const plugins = this._plugins[name];
        for (const plugin of plugins) {
            plugin.apply(this, args);
        }
    }

    /**
     * synchronously applies all registered handlers for target name(event id).
     *
     * The handlers are called with the return value of the previous handler and all the rest arguments.
     *
     * `init` is used for the first handler.
     *
     * return the returned value of the last handler
     */
    applyPluginsWaterfall(name: string, init: any, ...args) {
        if (!this._plugins[name]) {
            return init;
        }
        const plugins = this._plugins[name];
        let current = init;
        for (const plugin of plugins) {
            current = plugin.apply(this, [current, ...args]);
        }
        return current;
    }

    /**
     * synchronously applies all registered handlers for target name(event id).
     *
     * The handlers are called ONLY with the return value of the previous handler.
     *
     * `init` is used for the first handler.
     *
     * return the returned value of the last handler
     */
    applyPluginsWaterfall0(name: string, init: any) {
        const plugins = this._plugins[name];
        if (!plugins) {
            return init;
        }
        let current = init;
        for (const plugin of plugins) {
            current = plugin.call(this, current);
        }
        return current;
    }

    /**
     * synchronously applies all registered handlers for target name(event id).
     *
     * The handlers are called with all the rest arguments.
     *
     * If a handler returns something !== undefined, that value is returned and no more handlers will be applied.
     */
    applyPluginsBailResult(name: string, ...args) {
        if (!this._plugins[name]) {
            return;
        }
        const plugins = this._plugins[name];
        for (const plugin of plugins) {
            const result = plugin.apply(this, args);
            if (typeof result !== 'undefined') {
                return result;
            }
        }
    }

    /**
     * synchronously applies all registered handlers for target name(event id).
     *
     * The handlers are called with target param
     *
     * If a handler returns something !== undefined, the value is returned and no more handlers are applied.
     *
     * Note: the fundamental difference with `{@link applyPluginsBailResult}`, is that,
     *       `{@link applyPluginsBailResult}` passes the arguments as arguments list for plugins
     *       while `{@link applyPluginsBailResult1}` passes the arguments as single param(any type) for plugins
     */
    applyPluginsBailResult1(name: string, param: any) {
        if (!this._plugins[name]) {
            return;
        }
        const plugins = this._plugins[name];
        for (const plugin of plugins) {
            const result = plugin.call(this, param);
            if (typeof result !== 'undefined') {
                return result;
            }
        }
    }

    /**
     * asynchronously applies all registered handlers for target name(event id).
     *
     * The handlers are called with all the rest arguments
     * and a callback function with the signature (err: Error) => void.
     *
     * The handlers are called in series, one at a time. After all handlers are applied, callback is called.
     *
     * If any handler invokes the (anonymous)callback with error, no more handlers will be called
     * and the real callback is call with that error.
     */
    applyPluginsAsync(name: string, ...args) {
        const callback = <CallbackFunction>args.pop();
        if (!this._plugins[name] || this._plugins[name].length === 0) {
            return callback();
        }
        const plugins = this._plugins[name];
        let i = 0;
        args.push(copyProperties(callback, (err) => {
            if (err) {
                return callback(err);
            }
            i++;
            if (plugins.length <= i) {
                return callback();
            }
            plugins[i].apply(this, args);
        }));
        plugins[0].apply(this, args);
    }

    /**
     * same as `applyPluginsAsync`
     * @see applyPluginsAsync
     * @alias Tapable.applyPluginsAsync
     * @param name
     * @param args
     */
    applyPluginsAsyncSeries(name: string, ...args) {
        this.applyPluginsAsync(name, ...args)
    }

    /**
     * asynchronously applies all registered handlers for target name(event id).
     *
     * The handlers are called with all the rest arguments
     * and a callback function with the signature (...params) => void.
     *
     * Handlers must invoke the (anonymous)callback, otherwise the series is cut down and real callback won't be
     * invoked.
     *
     * The order is defined by registration order not by speed of the handler function.
     *
     * If a handler returns something !== undefined, that value is returned and no more handlers will be applied.
     */
    applyPluginsAsyncSeriesBailResult(name: string, ...args) {
        const callback = <CallbackFunction>args.pop();
        if (!this._plugins[name] || this._plugins[name].length === 0) {
            return callback();
        }
        const plugins = this._plugins[name];
        let i = 0;
        args.push(copyProperties(callback, (...params) => {
            if (params.length > 0) {
                return callback.apply(null, params);
            }
            i++;
            if (plugins.length <= i) {
                return callback();
            }
            plugins[i].apply(this, args);
        }));
        plugins[0].apply(this, args);
    }

    /**
     * asynchronously applies all registered handlers for target name(event id).
     *
     * @see applyPluginsAsyncSeriesBailResult
     *
     * Note: the fundamental difference with `{@link applyPluginsAsyncSeriesBailResult}`, is that,
     *       `{@link applyPluginsAsyncSeriesBailResult}` passes the arguments as arguments list for plugins
     *       while `{@link applyPluginsAsyncSeriesBailResult1}` passes the arguments as single param(any type)
     *       and a callback for plugins
     */
    applyPluginsAsyncSeriesBailResult1(name: string, param: any, callback: CallbackFunction) {
        const plugins = this._plugins[name];
        if (!plugins || plugins.length === 0) {
            return callback();
        }
        let i = 0;
        const innerCallback = copyProperties(callback, function next(err, result) {
            if (arguments.length > 0) {
                return callback(err, result);
            }
            i++;
            if (plugins.length <= i) {
                return callback();
            }
            plugins[i].call(this, param, innerCallback);
        }.bind(this));
        plugins[0].call(this, param, innerCallback);
    }

    /**
     * Asynchronously applies all registered handlers for target name(event id).
     *
     * The handlers are called with the current value and a callback function with the signature (err: Error,
     * nextValue: any) => void.
     *
     * `init` is used for the first handler. The rest handles are called with the value which previous handler uses to
     * invoke the (anonymous)callback invoked
     *
     * After all handlers are applied, callback is called with the last value.
     *
     * If any handler invokes the (anonymous)callback with error, no more handlers will be called
     * and the real callback is call with that error.
     */
    applyPluginsAsyncWaterfall(name: string, init: any, callback: CallbackFunction) {
        if (!this._plugins[name] || this._plugins[name].length === 0) {
            return callback(undefined, init);
        }
        const plugins = this._plugins[name];
        let i = 0;
        const next = copyProperties(callback, (err, value) => {
            if (err) {
                return callback(err);
            }
            i++;
            if (plugins.length <= i) {
                return callback(undefined, value);
            }
            plugins[i].call(this, value, next);
        });
        plugins[0].call(this, init, next);
    }

    /**
     * applies all registered handlers for target name(event id) in parallel.
     *
     * The handlers are called with all the rest arguments
     * and a callback function with the signature (err?: Error) => void.
     *
     * The callback function is called when all handlers call the callback without err.
     *
     * If any handler invokes the callback with err, callback is invoked with this error and the other handlers are
     * skipped.
     */
    applyPluginsParallel(name: string, ...args) {
        const callback = <CallbackFunction>args.pop();
        if (!this._plugins[name] || this._plugins[name].length === 0) {
            return callback();
        }
        const plugins = this._plugins[name];
        let remaining = plugins.length;
        args.push(copyProperties(callback, (err) => {
            if (remaining < 0) {
                return;
            } // ignore
            if (err) {
                remaining = -1;
                return callback(err);
            }
            remaining--;
            if (remaining === 0) {
                return callback();
            }
        }));
        for (const plugin of plugins) {
            plugin.apply(this, args);
            if (remaining < 0) {
                return;
            }
        }
    }

    /**
     * applies all registered handlers for target name(event id) in parallel.
     *
     * The handlers are called with all the rest arguments
     * and a callback function with the signature (currentResult?: []) => void.
     *
     * Handlers must call the callback.
     *
     * The first result (either error or value) with is not undefined is passed to the callback.
     *
     * The order is defined by registration not by speed of the handler function.
     */
    applyPluginsParallelBailResult(name: string, ...args) {
        const callback = <CallbackFunction>args[args.length - 1];
        if (!this._plugins[name] || this._plugins[name].length === 0) {
            return callback();
        }
        const plugins = this._plugins[name];
        let currentPos = plugins.length;
        let currentResult;
        let done: number[] = [];
        for (let i = 0; i < plugins.length; i++) {
            args[args.length - 1] = function (pos) {
                return copyProperties(callback, function shadowCallback(...args) {
                    if (pos >= currentPos) {
                        return; // ignore
                    }
                    done.push(pos);
                    if (args.length > 0) {
                        currentPos = pos + 1;
                        done = done.filter((item) => item <= pos);
                        currentResult = args;
                    }
                    if (done.length === currentPos) {
                        callback.apply(null, currentResult);
                        currentPos = 0;
                    }
                })
            }(i);
            plugins[i].apply(this, args);
        }
    }

    /**
     * applies all registered handlers for target name(event id) in parallel.
     *
     * @see applyPluginsParallelBailResult
     *
     * Note: the fundamental difference with `{@link applyPluginsParallelBailResult}`, is that,
     *       `{@link applyPluginsParallelBailResult}` passes the arguments as arguments list for plugins
     *       while `{@link applyPluginsParallelBailResult1}` passes the arguments as single param(any type)
     *       and a callback for plugins
     */
    applyPluginsParallelBailResult1(name: string, param: any, callback: CallbackFunction) {
        const plugins = this._plugins[name];
        if (!plugins || plugins.length === 0) {
            return callback();
        }
        let currentPos = plugins.length;
        let currentResult;
        let done: number[] = [];
        for (let i = 0; i < plugins.length; i++) {
            const innerCallback = function (pos) {
                return copyProperties(callback, function shadowCallback(...args) {
                    if (pos >= currentPos) {
                        return; // ignore
                    }
                    done.push(pos);
                    if (args.length > 0) {
                        currentPos = pos + 1;
                        done = done.filter((item) => item <= pos);
                        currentResult = args;
                    }
                    if (done.length === currentPos) {
                        callback.apply(null, currentResult);
                        currentPos = 0;
                    }
                })
            }(i);
            plugins[i].call(this, param, innerCallback);
        }
    }

    static mixin(proto) {
        copyProperties(Tapable.prototype, proto);
    }
}

export = Tapable;

function copyProperties(from, to) {
    for (const key in from)
        to[key] = from[key];
    return to;
}
