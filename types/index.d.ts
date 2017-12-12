/**
 * @deprecated
 */
export abstract class Tapable {
	static addCompatLayer<T>(instance: T): T & Tapable;

	abstract hooks: Record<string, Hook<any, any, any, any, any, any, any, any>>;
	protected _pluginCompat: SyncBailHook<CompatOption>;
	apply(...tapables: Plugin[]): void;
	plugin(name: string, fn: Function): void;
}

type FnCall<A, B, C, D, E, F, G, H> = (a?: A, b?: B, c?: C, d?: D, e?: E, f?: F, g?: G, h?: H, ...args: any[]) => any;
type FnUse<A, B, C, D, E, F, G, H> = (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, ...args: any[]) => any;

declare class Hook<A, B, C, D, E, F, G, H> {
	constructor(args?: string[]);
	call: FnCall<A, B, C, D, E, F, G, H>;
	tap(name: string, fn: FnUse<A, B, C, D, E, F, G, H>): void;
	tap(option: Option, fn: FnUse<A, B, C, D, E, F, G, H>): void;
	withOptions(options: object): this;
	isUsed(): boolean;
	intercept(interceptor: Interceptor): void;
}
declare class AsyncHook<A, B, C, D, E, F, G, H> extends Hook<A, B, C, D, E, F, G, H> {
	callAsync: FnCall<A, B, C, D, E, F, G, H>;
	promise: (a?: A, b?: B, c?: C, d?: D, e?: E, f?: F, g?: G, h?: H, ...args: any[]) => Promise<any>;
	tapAsync(name: string, fn: FnUse<A, B, C, D, E, F, G, H>): void;
	tapAsync(option: object, fn: FnUse<A, B, C, D, E, F, G, H>): void;
	tapPromise(name: string, fn: FnUse<A, B, C, D, E, F, G, H>): void;
	tapPromise(option: object, fn: FnUse<A, B, C, D, E, F, G, H>): void;
}

export class SyncHook<A=any, B=any, C=any, D=any, E=any, F=any, G=any, H=any> extends Hook<A, B, C, D, E, F, G, H> {}
export class SyncBailHook<A=any, B=any, C=any, D=any, E=any, F=any, G=any, H=any> extends Hook<A, B, C, D, E, F, G, H> {}
export class SyncWaterfallHook<A=any, B=any, C=any, D=any, E=any, F=any, G=any, H=any> extends Hook<A, B, C, D, E, F, G, H> {}
export class SyncLoopHook<A=any, B=any, C=any, D=any, E=any, F=any, G=any, H=any> extends Hook<A, B, C, D, E, F, G, H> {}

export class AsyncParallelHook<A=any, B=any, C=any, D=any, E=any, F=any, G=any, H=any> extends AsyncHook<A, B, C, D, E, F, G, H> {}
export class AsyncParallelBailHook<A=any, B=any, C=any, D=any, E=any, F=any, G=any, H=any> extends AsyncHook<A, B, C, D, E, F, G, H> {}
export class AsyncSequencialHook<A=any, B=any, C=any, D=any, E=any, F=any, G=any, H=any> extends AsyncHook<A, B, C, D, E, F, G, H> {}
export class AsyncSequencialBailHook<A=any, B=any, C=any, D=any, E=any, F=any, G=any, H=any> extends AsyncHook<A, B, C, D, E, F, G, H> {}
export class AsyncWaterfallHook<A=any, B=any, C=any, D=any, E=any, F=any, G=any, H=any> extends AsyncHook<A, B, C, D, E, F, G, H> {}

interface Plugin {
	apply(tapable: Tapable): void;
}

interface Option {
	name: string;
	fn?: Function;
}

interface CompatOption extends Option {
	names: Set<string>;
}

interface Interceptor {
	loop: Function;
	call: Function;
	tap: Function;
}
