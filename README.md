# Tapable

``` javascript
var Tapable = require("tapable");
```

`Tapable` is a class for plugin binding and applying.

Just extend it.

``` javascript
function MyClass() {
	Tapable.call(this);
}

MyClass.prototype = Object.create(Tapable.prototype);

MyClass.prototype.method = function() {};
```

Or mix it in.

``` javascript
function MyClass2() {
	EventEmitter.call(this);
	Tapable.call(this);
}

MyClass2.prototype = Object.create(EventEmitter.prototype);
Tapable.mixin(MyClass2.prototype);

MyClass2.prototype.method = function() {};
```

## Public functions

### apply

``` javascript
void apply(plugins: Plugin...)
```

Attaches all plugins passed as arguments to the instance, by calling `apply` on them.

### plugin

``` javascript
void plugin(names: string|string[], handler: Function)
```

`names` are the names (or a single name) of the plugin interfaces the class provides.

`handler` is a callback function. The signature depends on the class. `this` is the instance of the class.

## Protected functions

### applyPlugins

``` javascript
void applyPlugins(name: string, args: any...)
```

Synchronously applies all registered handlers for `name`. The handler functions are called with all args.

### applyPluginsWaterfall

``` javascript
any applyPluginsWaterfall(name: string, init: any, args: any...)
```

Synchronously applies all registered handlers for `name`. The handler functions are called with the return value of the previous handler and all args. For the first handler `init` is used and the return value of the last handler is return by `applyPluginsWaterfall`

### applyPluginsWaterfallWhileCond

``` javascript
any applyPluginsWaterfallWhileCond(name: string, init: any, cond: function, args: any...)
```

Synchronous applies all registered handers for `name`. The handler functions are called with the return value of the previous handler and all args. For the first handler `init` is used.  `cond` will be called with `init`/return value of the previous handler before the first/next handler is called; if it returns falsey, no more handlers will be applied and the current value will be returned.  Otherwise the return value of the very last handler will be returned.  This can be used to create plugins that filter the application of other plugins.  `cond` defaults to the identity function (but must be provided if any additonal args are to be given).

### applyPluginsAsync

``` javascript
void applyPluginsAsync(
	name: string,
	args: any...,
	callback: (err?: Error) -> void
)
```

Asynchronously applies all registered handlers for `name`. The handler functions are called with all args and a callback function with the signature `(err?: Error) -> void`. The handler functions are called in order of registration.

`callback` is called after all handlers are called.

### applyPluginsBailResult

``` javascript
any applyPluginsBailResult(name: string, args: any...)
```

Synchronously applies all registered handlers for `name`. The handler function are called with all args. If a handler function returns something `!== undefined`, the value is returned and no more handlers are applied.

### applyPluginsAsyncWaterfall

``` javascript
applyPluginsAsyncWaterfall(
	name: string,
	init: any,
	callback: (err: Error, result: any) -> void
)
```

Asynchronously applies all registered handlers for `name`. The handler functions are called with the current value and a callback function with the signature `(err: Error, nextValue: any) -> void`. When called, `nextValue` is the current value for the next handler. The current value for the first handler is `init`. After all handlers are applied, `callback` is called with the last value. If any handler passes a value for `err`, the `callback` is called with this error and no more handlers are called.

### applyPluginsAsyncSeries

``` javascript
applyPluginsAsyncSeries(
	name: string,
	args: any...,
	callback: (err: Error, result: any) -> void
)
```

Asynchronously applies all registered handlers for `name`. The handler functions are called with all `args` and a callback function with the signature `(err: Error) -> void`. The handlers are called in series, one at a time. After all handlers are applied, `callback` is called. If any handler passes a value for `err`, the `callback` is called with this error and no more handlers are called.

### applyPluginsParallel

``` javascript
applyPluginsParallel(
	name: string,
	args: any...,
	callback: (err?: Error) -> void
)
```

Applies all registered handlers for `name` in parallel. The handler functions are called with all args and a callback function with the signature `(err?: Error) -> void`. The `callback` function is called when all handlers have called the callback without `err`. If any handler calls the callback with `err`, `callback` is invoked with this error and the other handlers are ignored.

### applyPluginsParallelBailResult

``` javascript
applyPluginsParallelBailResult(
	name: string,
	args: any...,
	callback: (err: Error, result: any) -> void
)
```

Applies all registered handlers for `name` in parallel. The handler functions are called with all args and a callback function with the signature `(err?: Error) -> void`. Handler functions must call the callback. They can either pass an error, pass undefined, or pass a value. The first result (either error or value) which is not undefined is passed to the `callback`. The order is defined by registration, not by the speed of the handler function.
