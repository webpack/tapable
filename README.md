# Tapable

The tapable packages exposes many Hook classes, which can be used to create hooks for plugins.

``` javascript
const {
	SyncHook,
	SyncBailHook,
	SyncWaterfallHook,
	SyncLoopHook,
	AsyncParallelHook,
	AsyncParallelBailHook,
	AsyncSequencialHook,
	AsyncSequencialBailHook,
	AsyncWaterfallHook
 } = require("tapable");
```

## Usage

All Hook constructors take one optional argument, which is a list of argument names as strings.

``` js
const hook = new SyncHook(["arg1", "arg2", "arg3"]);
```

The best practice is to expose all hooks of a class in a `hooks` property:

``` js
class Car {
	constructor() {
		this.hooks = {
			accelerate: new SyncHook(["newSpeed"]),
			break: new SyncHook(),
			calculateRoutes: new AsyncParallelHook(["source", "target", "routesList"])
		};
	}

	/* ... */
}
```

Other people can now use these hooks:

``` js
const myCar = new Car();

// Use the tap method to add a consument
myCar.hooks.break.tap("WarningLampPlugin", () => warningLamp.on());
```

It's required to pass a name to identify the plugin/reason.

You may receive arguments:

``` js
myCar.hooks.accelerate.tap("LoggerPlugin", newSpeed => console.log(`Accelerating to ${newSpeed}`));
```

For sync hooks `tap` is the only valid method to add a plugin. Async hooks also support async plugins:

``` js
myCar.hooks.calculateRoutes.tapPromise("GoogleMapsPlugin", (source, target, routesList) => {
	// return a promise
	return google.maps.findRoute(source, target).then(route => {
		routesList.add(route);
	});
});
myCar.hooks.calculateRoutes.tapAsync("BingMapsPlugin", (source, target, routesList, callback) => {
	bing.findRoute(source, target, (err, route) => {
		if(err) return callback(err);
		routesList.add(route);
		// call the callback
		callback();
	});
});

// You can still use sync plugins
myCar.hooks.calculateRoutes.tap("CachedRoutesPlugin", (source, target, routesList) => {
	const cachedRoute = cache.get(source, target);
	if(cachedRoute)
		routesList.add(cachedRoute);
})
```

The class declaring these hooks need to call them:

``` js
class Car {
	/* ... */

	setSpeed(newSpeed) {
		this.hooks.accelerate.call(newSpeed);
	}

	useNavigationSystemPromise(source, target) {
		const routesList = new List();
		return this.hooks.calculateRoutes.promise(source, target, routesList).then(() => {
			return routesList.getRoutes();
		});
	}

	useNavigationSystemAsync(source, target, callback) {
		const routesList = new List();
		this.hooks.calculateRoutes.callAsync(source, target, routesList, err => {
			if(err) return callback(err);
			callback(null, routesList.getRoutes());
		});
	}
}
```

The Hook will compile a method with the most efficient way of running your plugins. It generates code depending on:
* The number of registered plugins (none, one, many)
* The kind of registered plugins (sync, async, promise)
* The used call method (sync, async, promise)
* The number of arguments
* Whether inspection is used

This ensures fastest possible execution.

## Inspection

All Hooks offer an additional inspection API:

``` js
myCar.hooks.calculateRoutes.inspect({
	call: (source, target, routesList) => {
		console.log("Starting to calculate routes");
	},
	tap: (tapInfo) => {
		// tapInfo = { type: "promise", name: "GoogleMapsPlugin", fn: ... }
		console.log(`${tapInfo.name} is doing it's job`);
		return tapInfo; // may return a new tapInfo object
	}
})
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

### hasPlugins

``` js
hasPlugins(
	name: string
)
```

Returns true, if plugins are registered for this name.
