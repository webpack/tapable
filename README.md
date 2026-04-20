# Tapable

The tapable package exposes many Hook classes, which can be used to create hooks for plugins.

```javascript
const {
	AsyncParallelBailHook,
	AsyncParallelHook,
	AsyncSeriesBailHook,
	AsyncSeriesHook,
	AsyncSeriesWaterfallHook,
	SyncBailHook,
	SyncHook,
	SyncLoopHook,
	SyncWaterfallHook
} = require("tapable");
```

## Installation

```shell
npm install --save tapable
```

## Usage

All Hook constructors take one optional argument, which is a list of argument names as strings.

```js
const hook = new SyncHook(["arg1", "arg2", "arg3"]);
```

The best practice is to expose all hooks of a class in a `hooks` property:

```js
class Car {
	constructor() {
		this.hooks = {
			accelerate: new SyncHook(["newSpeed"]),
			brake: new SyncHook(),
			calculateRoutes: new AsyncParallelHook(["source", "target", "routesList"])
		};
	}

	/* ... */
}
```

Other people can now use these hooks:

```js
const myCar = new Car();

// Use the tap method to add a consumer (plugin)
myCar.hooks.brake.tap("WarningLampPlugin", () => warningLamp.on());
```

It's required to pass a name to identify the plugin/reason.

You may receive arguments:

```js
myCar.hooks.accelerate.tap("LoggerPlugin", (newSpeed) =>
	console.log(`Accelerating to ${newSpeed}`)
);
```

For sync hooks, `tap` is the only valid method to add a plugin. Async hooks also support async plugins:

```js
myCar.hooks.calculateRoutes.tapPromise(
	"GoogleMapsPlugin",
	(source, target, routesList) =>
		// return a promise
		google.maps.findRoute(source, target).then((route) => {
			routesList.add(route);
		})
);
myCar.hooks.calculateRoutes.tapAsync(
	"BingMapsPlugin",
	(source, target, routesList, callback) => {
		bing.findRoute(source, target, (err, route) => {
			if (err) return callback(err);
			routesList.add(route);
			// call the callback
			callback();
		});
	}
);

// You can still use sync plugins
myCar.hooks.calculateRoutes.tap(
	"CachedRoutesPlugin",
	(source, target, routesList) => {
		const cachedRoute = cache.get(source, target);
		if (cachedRoute) routesList.add(cachedRoute);
	}
);
```

The class declaring these hooks needs to call them:

```js
class Car {
	/**
	 * You won't get returned value from SyncHook or AsyncParallelHook,
	 * to do that, use SyncWaterfallHook and AsyncSeriesWaterfallHook respectively
	 */

	setSpeed(newSpeed) {
		// following call returns undefined even when you returned values
		this.hooks.accelerate.call(newSpeed);
	}

	useNavigationSystemPromise(source, target) {
		const routesList = new List();
		return this.hooks.calculateRoutes
			.promise(source, target, routesList)
			.then((res) =>
				// res is undefined for AsyncParallelHook
				routesList.getRoutes()
			);
	}

	useNavigationSystemAsync(source, target, callback) {
		const routesList = new List();
		this.hooks.calculateRoutes.callAsync(source, target, routesList, (err) => {
			if (err) return callback(err);
			callback(null, routesList.getRoutes());
		});
	}
}
```

The Hook will compile a method with the most efficient way of running your plugins. It generates code depending on:

- The number of registered plugins (none, one, many)
- The kind of registered plugins (sync, async, promise)
- The used call method (sync, async, promise)
- The number of arguments
- Whether interception is used

This ensures fastest possible execution.

## Hook types

Each hook can be tapped with one or several functions. How they are executed depends on the hook type:

- Basic hook (without “Waterfall”, “Bail” or “Loop” in its name). This hook simply calls every function it tapped in a row.

- **Waterfall**. A waterfall hook also calls each tapped function in a row. Unlike the basic hook, it passes a return value from each function to the next function.

- **Bail**. A bail hook allows exiting early. When any of the tapped function returns anything, the bail hook will stop executing the remaining ones.

- **Loop**. When a plugin in a loop hook returns a non-undefined value the hook will restart from the first plugin. It will loop until all plugins return undefined.

Additionally, hooks can be synchronous or asynchronous. To reflect this, there’re “Sync”, “AsyncSeries”, and “AsyncParallel” hook classes:

- **Sync**. A sync hook can only be tapped with synchronous functions (using `myHook.tap()`).

- **AsyncSeries**. An async-series hook can be tapped with synchronous, callback-based and promise-based functions (using `myHook.tap()`, `myHook.tapAsync()` and `myHook.tapPromise()`). They call each async method in a row.

- **AsyncParallel**. An async-parallel hook can also be tapped with synchronous, callback-based and promise-based functions (using `myHook.tap()`, `myHook.tapAsync()` and `myHook.tapPromise()`). However, they run each async method in parallel.

The hook type is reflected in its class name. E.g., `AsyncSeriesWaterfallHook` allows asynchronous functions and runs them in series, passing each function’s return value into the next function.

## Hook classes

The table below summarizes the 9 built-in hook classes. For each class:

- **Tap methods** are the `tapX` variants that may be used to register a handler.
- **Call methods** are the ways the owner of the hook can trigger it.
- **Result** is the value returned from `call` (or passed to the `callAsync` callback / resolved from the `promise` call).
- **Returned value from tap** describes whether the value returned from a tapped function has an effect.

| Class | Tap methods | Call methods | Result | Returned value from tap |
| --- | --- | --- | --- | --- |
| `SyncHook` | `tap` | `call` | `undefined` | ignored |
| `SyncBailHook` | `tap` | `call` | first non-`undefined` value, or `undefined` | short-circuits the hook |
| `SyncWaterfallHook` | `tap` | `call` | final value (first argument after the last tap) | passed as first argument to the next tap |
| `SyncLoopHook` | `tap` | `call` | `undefined` | non-`undefined` restarts the loop from the first tap |
| `AsyncParallelHook` | `tap`, `tapAsync`, `tapPromise` | `callAsync`, `promise` | `undefined` | ignored |
| `AsyncParallelBailHook` | `tap`, `tapAsync`, `tapPromise` | `callAsync`, `promise` | first non-`undefined` value, or `undefined` | short-circuits the hook |
| `AsyncSeriesHook` | `tap`, `tapAsync`, `tapPromise` | `callAsync`, `promise` | `undefined` | ignored |
| `AsyncSeriesBailHook` | `tap`, `tapAsync`, `tapPromise` | `callAsync`, `promise` | first non-`undefined` value, or `undefined` | short-circuits the hook |
| `AsyncSeriesLoopHook` | `tap`, `tapAsync`, `tapPromise` | `callAsync`, `promise` | `undefined` | non-`undefined` restarts the loop from the first tap |
| `AsyncSeriesWaterfallHook` | `tap`, `tapAsync`, `tapPromise` | `callAsync`, `promise` | final value (first argument after the last tap) | passed as first argument to the next tap |

Detailed behavior of each class:

### SyncHook

A basic synchronous hook. Every tapped function is called in registration order with the arguments passed to `call`. Return values from tapped functions are ignored and `call` returns `undefined`.

- Tap methods: `tap`
- Call methods: `call`
- `tapAsync` and `tapPromise` throw an error.

### SyncBailHook

A synchronous hook that allows exiting early. Every tapped function is called in order until one returns a non-`undefined` value; that value becomes the result of `call` and the remaining taps are skipped. If all taps return `undefined`, `call` returns `undefined`.

- Tap methods: `tap`
- Call methods: `call`

### SyncWaterfallHook

A synchronous hook that threads a value through its tapped functions. The first argument passed to `call` is forwarded to the first tap. If a tap returns a non-`undefined` value it replaces that argument for the next tap; otherwise the previous value is kept. `call` returns the value after the last tap has run. Additional arguments (if any) are passed through unchanged.

- Tap methods: `tap`
- Call methods: `call`

### SyncLoopHook

A synchronous hook that keeps re-running its taps until all of them return `undefined` for a full pass. Whenever a tap returns a non-`undefined` value the hook restarts from the first tap. `call` returns `undefined`.

- Tap methods: `tap`
- Call methods: `call`

### AsyncParallelHook

An asynchronous hook that runs all of its tapped functions in parallel. It completes when every tap has signalled completion (sync return, callback, or promise resolution). Return values and resolution values are ignored; `callAsync`'s callback is invoked with no result and `promise()` resolves to `undefined`. If any tap errors, the error is forwarded and remaining taps still complete but their results are discarded.

- Tap methods: `tap`, `tapAsync`, `tapPromise`
- Call methods: `callAsync`, `promise`

### AsyncParallelBailHook

Like `AsyncParallelHook`, but designed to bail out with a result. All tapped functions start in parallel; the first tap to produce a non-`undefined` value (synchronously, via its callback, or by resolving its promise) determines the hook’s result. The remaining taps continue to run but their results are ignored. Order is determined by tap registration order: an earlier tap’s value takes precedence over a later one’s, even if the later one finishes first.

- Tap methods: `tap`, `tapAsync`, `tapPromise`
- Call methods: `callAsync`, `promise`

### AsyncSeriesHook

An asynchronous hook that runs tapped functions one after another, waiting for each to finish before starting the next. Results are ignored; `callAsync`'s callback is invoked with no result and `promise()` resolves to `undefined`. The first error aborts the series.

- Tap methods: `tap`, `tapAsync`, `tapPromise`
- Call methods: `callAsync`, `promise`

### AsyncSeriesBailHook

An asynchronous series hook that allows exiting early. Tapped functions run one after another; as soon as one produces a non-`undefined` value, that value becomes the hook’s result and the remaining taps are skipped.

- Tap methods: `tap`, `tapAsync`, `tapPromise`
- Call methods: `callAsync`, `promise`

### AsyncSeriesLoopHook

An asynchronous series hook that loops. Tapped functions run one after another; whenever a tap produces a non-`undefined` value the hook restarts from the first tap. The hook completes once a full pass yields `undefined` from every tap. The result is always `undefined`.

- Tap methods: `tap`, `tapAsync`, `tapPromise`
- Call methods: `callAsync`, `promise`

### AsyncSeriesWaterfallHook

An asynchronous series hook that threads a value through its taps. The first argument passed to `callAsync` / `promise` is forwarded to the first tap. A tap's non-`undefined` return / callback / resolution value replaces it for the next tap; `undefined` keeps the previous value. The hook completes with the value after the last tap.

- Tap methods: `tap`, `tapAsync`, `tapPromise`
- Call methods: `callAsync`, `promise`

## Interception

All Hooks offer an additional interception API:

```js
myCar.hooks.calculateRoutes.intercept({
	call: (source, target, routesList) => {
		console.log("Starting to calculate routes");
	},
	register: (tapInfo) => {
		// tapInfo = { type: "promise", name: "GoogleMapsPlugin", fn: ... }
		console.log(`${tapInfo.name} is doing its job`);
		return tapInfo; // may return a new tapInfo object
	}
});
```

**call**: `(...args) => void` Adding `call` to your interceptor will trigger when hooks are triggered. You have access to the hooks arguments.

**tap**: `(tap: Tap) => void` Adding `tap` to your interceptor will trigger when a plugin taps into a hook. Provided is the `Tap` object. `Tap` object can't be changed.

**loop**: `(...args) => void` Adding `loop` to your interceptor will trigger for each loop of a looping hook.

**register**: `(tap: Tap) => Tap | undefined` Adding `register` to your interceptor will trigger for each added `Tap` and allows to modify it.

## Context

Plugins and interceptors can opt-in to access an optional `context` object, which can be used to pass arbitrary values to subsequent plugins and interceptors.

```js
myCar.hooks.accelerate.intercept({
	context: true,
	tap: (context, tapInfo) => {
		// tapInfo = { type: "sync", name: "NoisePlugin", fn: ... }
		console.log(`${tapInfo.name} is doing it's job`);

		// `context` starts as an empty object if at least one plugin uses `context: true`.
		// If no plugins use `context: true`, then `context` is undefined.
		if (context) {
			// Arbitrary properties can be added to `context`, which plugins can then access.
			context.hasMuffler = true;
		}
	}
});

myCar.hooks.accelerate.tap(
	{
		name: "NoisePlugin",
		context: true
	},
	(context, newSpeed) => {
		if (context && context.hasMuffler) {
			console.log("Silence...");
		} else {
			console.log("Vroom!");
		}
	}
);
```

## HookMap

A HookMap is a helper class for a Map with Hooks

```js
const keyedHook = new HookMap((key) => new SyncHook(["arg"]));
```

```js
keyedHook.for("some-key").tap("MyPlugin", (arg) => {
	/* ... */
});
keyedHook.for("some-key").tapAsync("MyPlugin", (arg, callback) => {
	/* ... */
});
keyedHook.for("some-key").tapPromise("MyPlugin", (arg) => {
	/* ... */
});
```

```js
const hook = keyedHook.get("some-key");
if (hook !== undefined) {
	hook.callAsync("arg", (err) => {
		/* ... */
	});
}
```

## Hook/HookMap interface

Public:

```ts
interface Hook {
	tap: (name: string | Tap, fn: (context?, ...args) => Result) => void;
	tapAsync: (
		name: string | Tap,
		fn: (
			context?,
			...args,
			callback: (err: Error | null, result: Result) => void
		) => void
	) => void;
	tapPromise: (
		name: string | Tap,
		fn: (context?, ...args) => Promise<Result>
	) => void;
	intercept: (interceptor: HookInterceptor) => void;
}

interface HookInterceptor {
	call: (context?, ...args) => void;
	loop: (context?, ...args) => void;
	tap: (context?, tap: Tap) => void;
	register: (tap: Tap) => Tap;
	context: boolean;
}

interface HookMap {
	for: (key: any) => Hook;
	intercept: (interceptor: HookMapInterceptor) => void;
}

interface HookMapInterceptor {
	factory: (key: any, hook: Hook) => Hook;
}

interface Tap {
	name: string;
	type: string;
	fn: Function;
	stage: number;
	context: boolean;
	before?: string | Array;
}
```

Protected (only for the class containing the hook):

```ts
interface Hook {
	isUsed: () => boolean;
	call: (...args) => Result;
	promise: (...args) => Promise<Result>;
	callAsync: (
		...args,
		callback: (err: Error | null, result: Result) => void
	) => void;
}

interface HookMap {
	get: (key: any) => Hook | undefined;
	for: (key: any) => Hook;
}
```

## MultiHook

A helper Hook-like class to redirect taps to multiple other hooks:

```js
const { MultiHook } = require("tapable");

this.hooks.allHooks = new MultiHook([this.hooks.hookA, this.hooks.hookB]);
```
