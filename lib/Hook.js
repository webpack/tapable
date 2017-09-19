"use strict";

class Hook {
	constructor(args) {
		if(!Array.isArray(args)) args = [];
		this.optionKeys = ["args", "tap", "type"];
		this._args = args;
		this.taps = [];
		this.interceptors = [];
		this.call = this._call = this.createCompileDelegate("call", "sync", args);
		this.promise = this._promise = this.createCompileDelegate("promise", "promise", args);
		this.callAsync = this._callAsync = this.createCompileDelegate("callAsync", "async", args.concat("_callback"));
		this._x = undefined;
	}

	compile(options) {
		const source = this.template(options);
		return new Function(`return (${source});`)();
		/*const optionKeys = this.optionKeys;
		let key = "/";
		for(let i = 0; i < optionKeys.length; i++)
			key = key + options[optionKeys[i]] + "/";
		return new Function(`return (${source});\n//# sourceURL=tapable:///${key}`)();*/
	}

	getTapType() {
		if(this.interceptors.length > 0) return "intercept";
		if(this.taps.length === 0) return "none";
		if(this.taps.length === 1) {
			const tap = this.taps[0];
			return tap.type;
		}
		let type = this.taps[0].type;
		for(let i = 1; i < this.taps.length; i++) {
			const tap = this.taps[i];
			if(tap.type !== type) return "multiple";
		}
		return "multiple-" + type;
	}

	createCall(type) {
		const tap = this.getTapType();
		if(tap === "sync" || tap === "async" || tap === "promise")
			this._x = this.taps[0].fn;
		else if(tap === "multiple-sync" || tap === "multiple-async" || tap === "multiple-promise")
			this._x = this.taps.map(t => t.fn);
		else
			this._x = this.taps;
		return this.compile({
			args: this._args,
			tap: tap,
			type: type
		});
	}

	createCompileDelegate(name, type, args) {
		return new Function(args, `
			this.${name} = this.createCall(${JSON.stringify(type)});
			return this.${name}(${args.join(", ")});
		`);
	}

	tap(options, fn) {
		if(typeof options === "string")
			options = { name: options };
		if(typeof options !== "object" || options === null)
			throw new Error("Invalid arguments to tap(options: Object, fn: function)");
		options = Object.assign({ type: "sync", fn: fn }, options);
		if(typeof options.name !== "string" || options.name === "")
			throw new Error("Missing name for tap");
		this._insert(options);
	}

	tapAsync(options, fn) {
		if(typeof options === "string")
			options = { name: options };
		if(typeof options !== "object" || options === null)
			throw new Error("Invalid arguments to tapAsync(options: Object, fn: function)");
		options = Object.assign({ type: "async", fn: fn }, options);
		if(typeof options.name !== "string" || options.name === "")
			throw new Error("Missing name for tapAsync");
		this._insert(options);
	}

	tapPromise(options, fn) {
		if(typeof options === "string")
			options = { name: options };
		if(typeof options !== "object" || options === null)
			throw new Error("Invalid arguments to tapPromise(options: Object, fn: function)");
		options = Object.assign({ type: "promise", fn: fn }, options);
		if(typeof options.name !== "string" || options.name === "")
			throw new Error("Missing name for tapPromise");
		this._insert(options);
	}

	isUsed() {
		return this.taps.length > 0 || this.interceptors.length > 0;
	}

	intercept(interceptor) {
		this._resetCompilation();
		this.interceptors.push(Object.assign({
			call: () => {},
			loop: () => {},
			tap: tap => tap,
		}, interceptor));
	}

	_resetCompilation() {
		this.call = this._call;
		this.callAsync = this._callAsync;
		this.promise = this._promise;
	}

	_insert(item) {
		this._resetCompilation();
		let before;
		if(typeof item.before === "string")
			before = new Set([item.before]);
		else if(Array.isArray(item.before)) {
			before = new Set(item.before);
		}
		let stage = 0;
		if(typeof item.stage === "number")
			stage = item.stage;
		let i = this.taps.length;
		while(i > 0) {
			i--;
			const x = this.taps[i];
			this.taps[i+1] = x;
			const xStage = x.stage || 0;
			if(before) {
				if(before.has(x.name)) {
					before.delete(x.name);
					continue;
				}
				if(before.size > 0) {
					continue;
				}
			}
			if(xStage > stage) {
				continue;
			}
			i++;
			break;
		}
		this.taps[i] = item;
	}
}

module.exports = Hook;
