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

Synchronous applies all registered handlers for `name`. The handler functions are called with all args.

### applyPluginsWaterfall

``` javascript
any applyPluginsWaterfall(name: string, init: any, args: any...)
```

Synchronous applies all registered handlers for `name`. The handler functions are called with the return value of the previous handler and all args. For the first handler `init` is used and the return value of the last handler is return by `applyPluginsWaterfall`

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

Synchronous applies all registered handlers for `name`. The handler function are called with all args. If a handler function returns something `!== undefined`, the value is returned and no more handlers are applied.

### applyPluginsAsyncWaterfall

``` javascript
applyPluginsAsyncWaterfall(
	name: string,
	init: any,
	callback: (err: Error, result: any) -> void
)
```

Asynchronously applies all registered handlers for `name`. The handler functions are called with the current value and a callback function with the signature `(err: Error, nextValue: any) -> void`. When called `nextValue` is the current value for the next handler. The current value for the first handler is `init`. After all handlers are applied, `callback` is called with the last value. If any handler passes a value for `err`, the `callback` is called with this error and no more handlers are called.

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

Applies all registered handlers for `name` parallel. The handler functions are called with all args and a callback function with the signature `(err?: Error) -> void`. The `callback` function is called when all handlers called the callback without `err`. If any handler calls the callback with `err`, `callback` is invoked with this error and the other handlers are ignored.

### applyPluginsParallelBailResult

``` javascript
applyPluginsParallelBailResult(
	name: string,
	args: any...,
	callback: (err: Error, result: any) -> void
)
```

Applies all registered handlers for `name` parallel. The handler functions are called with all args and a callback function with the signature `(err?: Error) -> void`. Handler functions must call the callback. They can either pass an error, or pass undefined, or pass an value. The first result (either error or value) which is not undefined is passed to the `callback`. The order is defined by registeration not by speed of the handler function. This function compentate this.

## Code Example
```javascript
var Tapable = require("tapable");

function Compiler() {
    Tapable.call(this);
}

Compiler.prototype = Object.create(Tapable.prototype);

Compiler.prototype.method = function() {};

var compiler = new Compiler();

// ========= apply ==========
function plugin0() {
	console.log("plugin0 main function");
}

plugin0.prototype.apply = function()  {
	console.log("apply function");    /// that's why plugin of webpack always need an `apply` function
};

compiler.apply(new plugin0());
compiler.apply(plugin0);

/** output

plugin0 main function
apply function
plugin0 main function
*/

// ========= applyPlugins ==========
function plugin1() {
	console.log("plugin1 main function");
}

compiler.plugin("plugin1", (arg) => {
	console.log("apply plugin1-1");
	console.log(arg);
});

compiler.plugin("plugin1", (arg) => {
	console.log("apply plugin1-2");
	console.log(arg);
});

compiler.plugin("plugin1", (arg) => {
	console.log("apply plugin1-3");
	console.log(arg);
});

compiler.applyPlugins("plugin1", 1);

/** output

apply plugin1-1
1
apply plugin1-2
1
apply plugin1-3
1

*/

//===========applyPluginsWaterfall============
function plugin2() {
	console.log("plugin2 main function");
}

compiler.plugin("plugin4", (a, b) => {
	console.log("apply plugin4-1");
	console.log(a, b);
	return a + b;
});

compiler.plugin("plugin4", (a, b) => {
	console.log("apply plugin4-2");
	console.log(a, b);
	return a + b;
});

compiler.plugin("plugin4", (a, b) =>{
	console.log("apply plugin4-3");
	console.log(a, b);
	return a + b;
});

compiler.plugin("plugin4", (a, b) =>{
	console.log("apply plugin4-4");
	console.log(a, b);
	return a + b;
});

var returnVal = compiler.applyPluginsWaterfall("plugin4", 1, 2);
console.log("final result = " + returnVal);

/** output

apply plugin4-1
1 2
apply plugin4-2
3 2
apply plugin4-3
5 2
apply plugin4-4
7 2
final result = 9

*/

//===========applyPluginsAsync============
function plugin3() {
	console.log("plugin3 main function");
}

compiler.plugin("plugin3", (cb) => {
	console.log("apply plugin3-1");
	cb();
});

compiler.plugin("plugin3", (cb) =>{
	setTimeout(() => {
		console.log("apply plugin3-2");
		console.log("wait 1 second");
		cb();   // plugin3-3 won't be called until this cb is triggered
	}, 1000);
});

compiler.plugin("plugin3", (cb) =>{
	console.log("apply plugin3-3");
	cb();
});

compiler.applyPluginsAsync("plugin3", () => {
	console.log("plugin3 applyPluginsAsync cb");
});

/** output

apply plugin3-1
apply plugin3-2
wait 1 second
apply plugin3-3
plugin3 applyPluginsAsync cb

*/

//===========applyPluginsBailResult============
function plugin4() {
	console.log("plugin4 main function");
};


compiler.plugin("plugin4", (a) => {
	console.log("apply plugin4-1");
	console.log(a);
	return undefined;
});

compiler.plugin("plugin4", (a) => {
	console.log("apply plugin4-2");
	console.log(a);
	return undefined;
});

compiler.plugin("plugin4", (a) =>{
	console.log("apply plugin4-3");
	console.log(a);
	return a + 2; // if return a value that is !== undefined, the next handler won't be called
});

compiler.plugin("plugin4", (a) =>{
	console.log("apply plugin4-4");
	console.log(a);
});


var returnVal = compiler.applyPluginsBailResult("plugin4", 1);
console.log("final result=" + returnVal);

/** output

apply plugin4-1
1
apply plugin4-2
1
apply plugin4-3
1
final result=3

*/

//===========applyPluginsAsyncWaterfall============
function plugin5() {
	console.log("plugin5 main function");
}

compiler.plugin("plugin5", (a, cb) =>{
	console.log("apply plugin5-1");
	console.log(a);
	console.log("wait 1 second");
	setTimeout(() => {
		cb(null, a + 10); // plugin5-2 won't be called until this cb is triggered
	}, 1000);
});

compiler.plugin("plugin5", (a, cb) =>{
	console.log("apply plugin5-2");
	console.log(a);
	cb(null, a);
});

compiler.applyPluginsAsyncWaterfall("plugin5", 10, (err, result) => {
	if (err) {
		console.log("err = " + err);
	}
	else {
		console.log("result = " + result);
	}
});

/** output

apply plugin5-1
10
wait 1 second
apply plugin5-2
20
result = 20

*/

//===========applyPluginsAsyncSeries============
// called one by one
function plugin6() {
	console.log("plugin6 main function");
}

compiler.plugin("plugin6", (a, cb) =>{
	console.log("apply plugin6-1");
	console.log(a);
	cb(null);
});

compiler.plugin("plugin6", (a, cb) =>{
	console.log("apply plugin6-2");
	console.log(a);
	cb(null);
});

compiler.plugin("plugin6", (a, cb) =>{
	console.log("apply plugin6-3");
	console.log(a);
	cb(null, a);
});

compiler.applyPluginsAsyncSeries("plugin6", 1, (err, result) => {
	if (err) {
		console.log("err = " + err);
	}
	else {
		console.log("result = " + result);
	}
});

/** output

apply plugin6-1
1
apply plugin6-2
1
apply plugin6-3
1
result = undefined

*/

//===========applyPluginsParallel============
// run parallel
function plugin7() {
	console.log("plugin7 main function");
}

compiler.plugin("plugin7", (a, cb) =>{
	setTimeout(() => {
		console.log("apply plugin7-1");
		cb();
	}, 1001);
});

compiler.plugin("plugin7", (a, cb) =>{
	setTimeout(() => {
		console.log("apply plugin7-2");
		cb();
	}, 1000);
});

compiler.applyPluginsParallel("plugin7", 1, (err) => {
	if (err) {
		console.log("err = " + err);
	}
	else {
		console.log("success");
	}
});

/** output

apply plugin7-2  // this sometimes would be apply plugin7-1 since they run parallel
apply plugin7-1
success

*/

//===========applyPluginsParallelBailResult============
function plugin8() {
	console.log("plugin8 main function");
}

compiler.plugin("plugin8", (a, cb) =>{
	console.log("apply plugin8-1");
	console.log(a);
	cb(); // if we use cb(null, 6) here, the callback for applyPluginsParallelBailResult will be 
		  // called right away, if arguments for cb is empty, this callback will be silent
});

compiler.plugin("plugin8", (a, cb) =>{
	console.log("apply plugin8-2");
	console.log(a);
	cb(null, 6);
});


var returnVal = compiler.applyPluginsParallelBailResult("plugin8", 1, (err, result) => {
	if (err) {
		console.log("err = " + err);
	}
	else {
		console.log("result = " + result);
	}
});

/** output

apply plugin8-1
1
apply plugin8-2
1
result = 6


*/

```
