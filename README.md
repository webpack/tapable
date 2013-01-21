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

``` javascript
void apply(plugins: Plugin...)
```

Attaches all plugins passed as arguments to the instance, by calling `apply` on them.

``` javascript
void plugin(name: string, handler: Function)
```

`name` is the name of the plugin interface the class provides.

`handler` is a callback function. The signature depends on the class. `this` is the instance of the class.

``` javascript
void restartApplyPlugins()
```

Should only be called from a handler function.

It restarts the process of applying handers.

## Protected functions

``` javascript
void applyPlugins(name: string, args: any...)
```

Synchronous applies all registered handers for `name`. The handler functions are called with all args.

``` javascript
void applyPluginsAsync(
	name: string,
	args: any...,
	callback: (err?: Error) -> void
)
```

Asynchronously applies all registered handers for `name`. The handler functions are called with all args and a callback function with the signature `(err?: Error) -> void`. The hander functions are called in order of registration.

`callback` is called after all handlers are called.

``` javascript
any applyPluginsBailResult(name: string, args: any...)
```

Synchronous applies all registered handers for `name`. The handler function are called with all args. If a handler function returns something `!== undefined`, the value is returned and no more handers are applied.

``` javascript
applyPluginsAsyncWaterfall(
	name: string,
	init: any,
	callback: (err: Error, result: any) -> void
)
```

Asynchronously applies all registered handers for `name`. The hander functions are called with the current value and a callback function with the signature `(err: Error, nextValue: any) -> void`. When called `nextValue` is the current value for the next handler. The current value for the first handler is `init`. After all handlers are applied, `callback` is called with the last value. If any handler passes a value for `err`, the `callback` is called with this error and no more handlers are called.

``` javascript
applyPluginsParallel(
	name: string,
	args: any...,
	callback: (err?: Error) -> void
)
```

Applies all registered handlers for `name` parallel. The handler functions are called with all args and a callback function with the signature `(err?: Error) -> void`. The `callback` function is called when all handlers called the callback without `err`. If any handler calls the callback with `err`, `callback` is invoked with this error and the other handlers are ignored.

`restartApplyPlugins` cannot be used.

``` javascript
applyPluginsParallelBailResult(
	name: string,
	args: any...,
	callback: (err: Error, result: any) -> void
)
```

Applies all registered handlers for `name` parallel. The handler functions are called with all args and a callback function with the signature `(err?: Error) -> void`. Handler functions must call the callback. They can either pass an error, or pass undefined, or pass an value. The first result (either error or value) with is not undefined is passed to the `callback`. The order is defined by registeration not by speed of the handler function. This function compentate this.

`restartApplyPlugins` cannot be used.
