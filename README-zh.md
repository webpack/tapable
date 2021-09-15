# Tapable

[英文](./README.md)| 中文

tapable 提供了很多钩子方法，这些方法可以用于创建插件的钩子。

```javascript
const {
	SyncHook,
	SyncBailHook,
	SyncWaterfallHook,
	SyncLoopHook,
	AsyncParallelHook,
	AsyncParallelBailHook,
	AsyncSeriesHook,
	AsyncSeriesBailHook,
	AsyncSeriesWaterfallHook
} = require("tapable");
```

## Installation

## 安装

```shell
npm install --save tapable
```

## Usage

所有钩子的构造函数使用一个可选参数，该参数是一个由参数名称(字符串形式)构成的数组。

```js
const hook = new SyncHook(["arg1", "arg2", "arg3"]);
```

最佳实践是在一个类的`hooks`属性中暴露所有的钩子。

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

这样, 其他人可以按照如下方式使用这些钩子:

```js
const myCar = new Car();

// Use the tap method to add a consument
myCar.hooks.brake.tap("WarningLampPlugin", () => warningLamp.on());
```

注册方法时需要传入一个名字用于区分不同的插件。

可能接收到到如下参数:

```js
myCar.hooks.accelerate.tap("LoggerPlugin", newSpeed =>
	console.log(`Accelerating to ${newSpeed}`)
);
```

对于同步钩子, `tap`是唯一合法的方法来增加一个插件。 异步钩子同时也支持异步插件:

```js
myCar.hooks.calculateRoutes.tapPromise(
	"GoogleMapsPlugin",
	(source, target, routesList) => {
		// return a promise
		return google.maps.findRoute(source, target).then(route => {
			routesList.add(route);
		});
	}
);
myCar.hooks.calculateRoutes.tapAsync(
	"BingMapsPlugin",
	(source, target, routesList, callback) => {
		bing.findRoute(source, target, (err, route) => {
			if (err) return callback(err);
			routesList.add(route);
			// call the callback 执行回调
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

The class declaring these hooks need to call them:

声明的这些钩子, 调用时需要按照如下方式:

```js
class Car {
	/**
	 *	不可以在SyncHook或者AsyncParallelHook返回值
	 * 如果需要返回值, 可以使用SyncWaterfallHook或者AsyncSeriesWaterfallHook
	 **/

	setSpeed(newSpeed) {
		// 即便你的代码返回了值, 下面的执行结果依然会返回undefined
		this.hooks.accelerate.call(newSpeed);
	}

	useNavigationSystemPromise(source, target) {
		const routesList = new List();
		return this.hooks.calculateRoutes
			.promise(source, target, routesList)
			.then(res => {
				// res is undefined for AsyncParallelHook
				// 对于AsyncParallelHook, res 是undefined
				return routesList.getRoutes();
			});
	}

	useNavigationSystemAsync(source, target, callback) {
		const routesList = new List();
		this.hooks.calculateRoutes.callAsync(source, target, routesList, err => {
			if (err) return callback(err);
			callback(null, routesList.getRoutes());
		});
	}
}
```

在你的拆件中, Hook 会被编译成最有效的执行方式. 编译逻辑(用于生成执行代码)取决于:

- 注册的插件的数量(没有, 一个或多个)
- 所注册的插件的类型(同步, 异步或 promise)
- 执行 Hook 的调用方法(同步, 异步或 promise)
- 参数的数量
- 是否使用了拦截

这些条件会使得执行效率更快成为可能

## Hook types

每个钩子可以注册一个或多个方法, 钩子的类型会决定它们如何被执行:

- 基础钩子(名称中没有"Waterfall", "Bail"或者"Loop"). 这个钩子会依次执行每一个注册方法.

- **Waterfall**. 一个瀑布钩子同样会依次调用注册的方法, 但是与基础钩子不同是, 它会将上个方法的返回值传递给下个方法

- **Bail**. 一个 bail 钩子允许提前退出. 当任意一个注册的方法返回非 undefined, bail 钩子会停止执行后续方法

- **Loop**. 当循环钩子注册的方法返回了非 undefined, 钩子会重新从第一个方法执行. 它会一直执行直到所有插件返回 undefined.

此外, 钩子函数又分为同步和异步两种. 比如: "Sync", "AsyncSeries", "AsyncParallel”钩子函数。

- **Sync**. 同步钩子只能注册同步方法(使用方式: `myHook.tap()`)

- **AsyncSeries**. 异步串行钩子可以注册同步的, 基于回调的或者基于 Promised 的方法(使用方式: `myHook.tap()`, `myHook.tapAsync()`或`myHook.tapPromise()`). 调用时会异步的依次执行每一个注册的方法.

- **AsyncParallel**. 异步并行钩子同样也可以注册同步的, 基于回调的和基于 promise 的方法(使用方式: `myHook.tap()`, `myHook.tapAsync()`和`myHook.tapPromise()`). 但是, 它会以并行的方式执行每个异步方法.

钩子类型可以通过类名反映出来. 比如: `AsyncSeriesWaterfallHook` 可以注册异步方法和串行执行, 会把注册方法的返回值传递给下一个方法。

## Interception

所有钩子提供了额外的拦截 API:

```js
myCar.hooks.calculateRoutes.intercept({
	call: (source, target, routesList) => {
		console.log("Starting to calculate routes");
	},
	register: tapInfo => {
		// tapInfo = { type: "promise", name: "GoogleMapsPlugin", fn: ... }
		console.log(`${tapInfo.name} is doing its job`);
		return tapInfo; // may return a new tapInfo object
	}
});
```

**call**: `(...args) => void` 拦截器中的`call`方法，会在钩子函数执行 call 方法时(所有注册方法执行前)被触发，传递给钩子的参数会被当做参数传入。

**tap**: `(tap: Tap) => void` 拦截器中的`tap`方法，会在每一个注册方法执行时他都会被触发。 `Tap`对象会作为参数传入，`Tap`对象不可修改。

**loop**: `(...args) => void` 拦截器中的`loop`方法会在每个注册方法被执行时被触发。

**register**: `(tap: Tap) => Tap | undefined` 当拦截器中有`register`方法时，当每次添加新的`Tap`(注册事件)时会调用它. 该方法允许修改传入的 Tap 对象。

## Context

插件和拦截器可以选择使用可选参数`context`，它可以用于传递任意值给后续的插件和拦截器。

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

HookMap 是一个 Map 形式的 Hooks 集合帮助类。

```js
const keyedHook = new HookMap(key => new SyncHook(["arg"]));
```

```js
keyedHook.for("some-key").tap("MyPlugin", arg => {
	/* ... */
});
keyedHook.for("some-key").tapAsync("MyPlugin", (arg, callback) => {
	/* ... */
});
keyedHook.for("some-key").tapPromise("MyPlugin", arg => {
	/* ... */
});
```

```js
const hook = keyedHook.get("some-key");
if (hook !== undefined) {
	hook.callAsync("arg", err => {
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
		fn: (context?, ...args, callback: (err, result: Result) => void) => void
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
	callAsync: (...args, callback: (err, result: Result) => void) => void;
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
