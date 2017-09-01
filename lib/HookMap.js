class HookMap {
	constructor(factory) {
		this._map = new Map();
		this._factory = factory;
	}

	get(key) {
		return this._map.get(key);
	}

	for(key) {
		const hook = this.get(key);
		if(hook !== undefined) {
			return hook;
		}
		const newHook = this._factory(key);
		this._map.set(key, newHook);
		return newHook;
	}

	tap(key, options, fn) {
		return this.for(key).tap(options, fn);
	}

	tapAsync(key, options, fn) {
		return this.for(key).tapAsync(options, fn);
	}

	tapPromise(key, options, fn) {
		return this.for(key).tapPromise(options, fn);
	}
}

module.exports = HookMap;
