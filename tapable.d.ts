type SingleTypeTuple<N extends number, T, Carry extends readonly T[] = []> = Carry["length"] extends N
	? Carry
	: SingleTypeTuple<N, T, readonly [...Carry, T]>;
type AsArray<T> = T extends any[] ? T : [T];

declare class UnsetAdditionalOptions {
	_UnsetAdditionalOptions: true
}
type IfSet<X> = X extends UnsetAdditionalOptions ? {} : X;

type Callback<E, T> = (error: E | null, result?: T) => void;
type InnerCallback<E, T> = (error?: E | null | false, result?: T) => void;

type FullTap = Tap & {
	type: "sync" | "async" | "promise",
	fn: Function
}

type Tap = TapOptions & {
	name: string;
};

type TapOptions = {
	before?: string;
	stage?: number;
};

interface HookInterceptor<T, R, AdditionalOptions = UnsetAdditionalOptions> {
	name?: string;
	tap?: (tap: FullTap & IfSet<AdditionalOptions>) => void;
	call?: (...args: any[]) => void;
	loop?: (...args: any[]) => void;
	error?: (err: Error) => void;
	result?: (result: R) => void;
	done?: () => void;
	register?: (tap: FullTap & IfSet<AdditionalOptions>) => FullTap & IfSet<AdditionalOptions>;
}

type ArgumentNames<T extends unknown[]> = SingleTypeTuple<T["length"], string>;

declare class Hook<T, R, AdditionalOptions = UnsetAdditionalOptions> {
	constructor(args?: ArgumentNames<AsArray<T>>, name?: string);
	name: string | undefined;
	intercept(interceptor: HookInterceptor<T, R, AdditionalOptions>): void;
	isUsed(): boolean;
	callAsync(...args: [...AsArray<T>, Callback<Error, R>]): void;
	promise(...args: AsArray<T>): Promise<R>;
	tap(options: string | Tap & IfSet<AdditionalOptions>, fn: (...args: AsArray<T>) => R): void;
	withOptions(options: TapOptions & IfSet<AdditionalOptions>): Hook<T, R>;
}

export class SyncHook<T, R = void, AdditionalOptions = UnsetAdditionalOptions> extends Hook<T, R, AdditionalOptions> {
	call(...args: AsArray<T>): R;
}

export class SyncBailHook<T, R, AdditionalOptions = UnsetAdditionalOptions> extends SyncHook<T, R, AdditionalOptions> {}
export class SyncLoopHook<T, AdditionalOptions = UnsetAdditionalOptions> extends SyncHook<T, void, AdditionalOptions> {}
export class SyncWaterfallHook<T, AdditionalOptions = UnsetAdditionalOptions> extends SyncHook<T, AsArray<T>[0], AdditionalOptions> {}

declare class AsyncHook<T, R, AdditionalOptions = UnsetAdditionalOptions> extends Hook<T, R, AdditionalOptions> {
	tapAsync(
		options: string | Tap & IfSet<AdditionalOptions>,
		fn: (...args: [...AsArray<T>, InnerCallback<Error, R>]) => void
	): void;
	tapPromise(
		options: string | Tap & IfSet<AdditionalOptions>,
		fn: (...args: AsArray<T>) => Promise<R>
	): void;
}

export class AsyncParallelHook<T, AdditionalOptions = UnsetAdditionalOptions> extends AsyncHook<T, void, AdditionalOptions> {}
export class AsyncParallelBailHook<T, R, AdditionalOptions = UnsetAdditionalOptions> extends AsyncHook<T, R, AdditionalOptions> {}
export class AsyncSeriesHook<T, AdditionalOptions = UnsetAdditionalOptions> extends AsyncHook<T, void, AdditionalOptions> {}
export class AsyncSeriesBailHook<T, R, AdditionalOptions = UnsetAdditionalOptions> extends AsyncHook<T, R, AdditionalOptions> {}
export class AsyncSeriesLoopHook<T, AdditionalOptions = UnsetAdditionalOptions> extends AsyncHook<T, void, AdditionalOptions> {}
export class AsyncSeriesWaterfallHook<T, AdditionalOptions = UnsetAdditionalOptions> extends AsyncHook<T, AsArray<T>[0], AdditionalOptions> {}

type HookFactory<H> = (key: any, hook?: H) => H;

interface HookMapInterceptor<H> {
	factory?: HookFactory<H>;
}

export class HookMap<H> {
	constructor(factory: HookFactory<H>, name?: string);
	name: string | undefined;
	get(key: any): H | undefined;
	for(key: any): H;
	intercept(interceptor: HookMapInterceptor<H>): void;
}

export class MultiHook<H> {
	constructor(hooks: H[], name?: string);
	name: string | undefined;
	tap(options: string | Tap, fn?: Function): void;
	tapAsync(options: string | Tap, fn?: Function): void;
	tapPromise(options: string | Tap, fn?: Function): void;
}
