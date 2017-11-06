import {
	SyncHook,
	SyncBailHook,
	SyncWaterfallHook,
	SyncLoopHook,
	AsyncParallelHook,
	AsyncParallelBailHook,
	AsyncSequencialHook,
	AsyncSequencialBailHook,
	AsyncWaterfallHook
 } from "../index";

declare class List<T> {
	getRoutes(): T[];
	add(t: T): void;
}

interface Route {
	_routeBrand: any;
}

declare function findRoutePromise(source: string, target: string): Promise<Route>
declare function findRouteCallback(source: string, target: string, fn: Function): void
declare function cacheGet(source: string, target: string): Route

class Car {
	hooks = {
		accelerate: new SyncHook<number>(["newSpeed"]),
		break: new SyncHook(),
		calculateRoutes: new AsyncParallelHook<string, string, List<Route>>(["source", "target", "routesList"])
	};

	setSpeed(newSpeed: number) {
		this.hooks.accelerate.call(newSpeed);
	}

	useNavigationSystemPromise(source: string, target: string) {
		const routesList = new List<Route>();
		return this.hooks.calculateRoutes.promise(source, target, routesList).then(() => {
			return routesList.getRoutes();
		});
	}

	useNavigationSystemAsync(source: string, target: string, callback: Function) {
		const routesList = new List<Route>();
		this.hooks.calculateRoutes.callAsync(source, target, routesList, (err: any) => {
			if(err) return callback(err);
			callback(null, routesList.getRoutes());
		});
	}
}

const myCar = new Car();

// Use the tap method to add a consument
myCar.hooks.break.tap("WarningLampPlugin", () => console.log("warningLamp on"));

myCar.hooks.calculateRoutes.tapPromise("GoogleMapsPlugin", (source, target, routesList) => {
	// return a promise
	return findRoutePromise(source, target).then(route => {
		routesList.add(route);
	});
});
myCar.hooks.calculateRoutes.tapAsync("BingMapsPlugin", (source, target, routesList, callback) => {
	findRouteCallback(source, target, (err: any, route: any) => {
		if(err) return callback(err);
		routesList.add(route);
		// call the callback
		callback();
	});
});

// You can still use sync plugins
myCar.hooks.calculateRoutes.tap("CachedRoutesPlugin", (source, target, routesList) => {
	const cachedRoute = cacheGet(source, target);
	if(cachedRoute)
		routesList.add(cachedRoute);
})
