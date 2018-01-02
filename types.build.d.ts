/** Generated from definitions/types.template.ts */

declare module "tapable" {

    type TapType = "sync" | "promise" | "async"

    // The following parameters should be added by intersection typing (&)
    //  fn?: Function
    //  context?: boolean
    export type TapSharedOptions = {
        // Name of Tap for debugging and referencing for execution order (using before)
        name: string,
        // "sync" | "async" | "promise"
        type?: TapType,

        // Ensure Tap inserted at this index in call chain
        stage?: number,

        // tests/Hook.js
        // Ensure Tap executes before this Tap or these Taps (by name) 
        before?: string | string[]
    }

    type TapResult = any

    export type TapSyncFn0 = () => TapResult
    export type TapPromiseFn0 = () => Promise<TapResult>
    export type TapAsyncFn0 = (callback: (err: Error | null, result?: TapResult) => void) => void
    // Tap Functions with context
    export type TapSyncCtxFn0<T> = (ctx: T) => void
    export type TapPromiseCtxFn0<T> = (ctx: T) => Promise<TapResult>
    export type TapAsyncCtxFn0<T> = (ctx: T, callback: (err: Error | null, result?: TapResult) => void) => void

    export type TapSyncFn1<A> = (a: A) => TapResult
    export type TapPromiseFn1<A> = (a: A) => Promise<TapResult>
    export type TapAsyncFn1<A> = (a: A, callback: (err: Error | null, result?: TapResult) => void) => void
    // Tap Functions with context
    export type TapSyncCtxFn1<T, A> = (ctx: T, a: A) => void
    export type TapPromiseCtxFn1<T, A> = (ctx: T, a: A) => Promise<TapResult>
    export type TapAsyncCtxFn1<T, A> = (ctx: T, a: A, callback: (err: Error | null, result?: TapResult) => void) => void

    export type TapSyncFn2<A, B> = (a: A, b: B) => TapResult
    export type TapPromiseFn2<A, B> = (a: A, b: B) => Promise<TapResult>
    export type TapAsyncFn2<A, B> = (a: A, b: B, callback: (err: Error | null, result?: TapResult) => void) => void
    // Tap Functions with context
    export type TapSyncCtxFn2<T, A, B> = (ctx: T, a: A, b: B) => void
    export type TapPromiseCtxFn2<T, A, B> = (ctx: T, a: A, b: B) => Promise<TapResult>
    export type TapAsyncCtxFn2<T, A, B> = (ctx: T, a: A, b: B, callback: (err: Error | null, result?: TapResult) => void) => void

    export type TapSyncFn3<A, B, C> = (a: A, b: B, c: C) => TapResult
    export type TapPromiseFn3<A, B, C> = (a: A, b: B, c: C) => Promise<TapResult>
    export type TapAsyncFn3<A, B, C> = (a: A, b: B, c: C, callback: (err: Error | null, result?: TapResult) => void) => void
    // Tap Functions with context
    export type TapSyncCtxFn3<T, A, B, C> = (ctx: T, a: A, b: B, c: C) => void
    export type TapPromiseCtxFn3<T, A, B, C> = (ctx: T, a: A, b: B, c: C) => Promise<TapResult>
    export type TapAsyncCtxFn3<T, A, B, C> = (ctx: T, a: A, b: B, c: C, callback: (err: Error | null, result?: TapResult) => void) => void

    export type TapSyncFn4<A, B, C, D> = (a: A, b: B, c: C, d: D) => TapResult
    export type TapPromiseFn4<A, B, C, D> = (a: A, b: B, c: C, d: D) => Promise<TapResult>
    export type TapAsyncFn4<A, B, C, D> = (a: A, b: B, c: C, d: D, callback: (err: Error | null, result?: TapResult) => void) => void
    // Tap Functions with context
    export type TapSyncCtxFn4<T, A, B, C, D> = (ctx: T, a: A, b: B, c: C, d: D) => void
    export type TapPromiseCtxFn4<T, A, B, C, D> = (ctx: T, a: A, b: B, c: C, d: D) => Promise<TapResult>
    export type TapAsyncCtxFn4<T, A, B, C, D> = (ctx: T, a: A, b: B, c: C, d: D, callback: (err: Error | null, result?: TapResult) => void) => void

    type HookSyncTaps0 = {
        // Tap with included function
        tap(options: TapSharedOptions & { fn: TapSyncFn0 }): void;
        // Tap with function as second argument
        // TODO: Is the overriding behavior ambiguous? Currently, options.fn overrides second arg
        //  Same thing happens for type: "sync" | "async" | "promise"...
        tap(name: string | TapSharedOptions, fn: TapSyncFn0): void;
    }

    type HookSyncTaps1<A> = {
        // Tap with included function
        tap(options: TapSharedOptions & { fn: TapSyncFn1<A> }): void;
        // Tap with function as second argument
        // TODO: Is the overriding behavior ambiguous? Currently, options.fn overrides second arg
        //  Same thing happens for type: "sync" | "async" | "promise"...
        tap(name: string | TapSharedOptions, fn: TapSyncFn1<A>): void;
    }

    type HookSyncTaps2<A, B> = {
        // Tap with included function
        tap(options: TapSharedOptions & { fn: TapSyncFn2<A, B> }): void;
        // Tap with function as second argument
        // TODO: Is the overriding behavior ambiguous? Currently, options.fn overrides second arg
        //  Same thing happens for type: "sync" | "async" | "promise"...
        tap(name: string | TapSharedOptions, fn: TapSyncFn2<A, B>): void;
    }

    type HookSyncTaps3<A, B, C> = {
        // Tap with included function
        tap(options: TapSharedOptions & { fn: TapSyncFn3<A, B, C> }): void;
        // Tap with function as second argument
        // TODO: Is the overriding behavior ambiguous? Currently, options.fn overrides second arg
        //  Same thing happens for type: "sync" | "async" | "promise"...
        tap(name: string | TapSharedOptions, fn: TapSyncFn3<A, B, C>): void;
    }

    type HookSyncTaps4<A, B, C, D> = {
        // Tap with included function
        tap(options: TapSharedOptions & { fn: TapSyncFn4<A, B, C, D> }): void;
        // Tap with function as second argument
        // TODO: Is the overriding behavior ambiguous? Currently, options.fn overrides second arg
        //  Same thing happens for type: "sync" | "async" | "promise"...
        tap(name: string | TapSharedOptions, fn: TapSyncFn4<A, B, C, D>): void;
    }

    type HookAsyncTaps0 = {
        // Tap with included function
        tapPromise(options: TapSharedOptions & { fn: TapPromiseFn0 }): void;
        // Tap with function as second argument
        tapPromise(name: string | TapSharedOptions, fn: TapPromiseFn0): void;
        // Tap with included function
        tapAsync(options: TapSharedOptions & { fn: TapAsyncFn0 }): void;
        // Tap with function as second argument
        tapAsync(name: string | TapSharedOptions, fn: TapAsyncFn0): void;
    }

    type HookAsyncTaps1<A> = {
        // Tap with included function
        tapPromise(options: TapSharedOptions & { fn: TapPromiseFn1<A> }): void;
        // Tap with function as second argument
        tapPromise(name: string | TapSharedOptions, fn: TapPromiseFn1<A>): void;
        // Tap with included function
        tapAsync(options: TapSharedOptions & { fn: TapAsyncFn1<A> }): void;
        // Tap with function as second argument
        tapAsync(name: string | TapSharedOptions, fn: TapAsyncFn1<A>): void;
    }

    type HookAsyncTaps2<A, B> = {
        // Tap with included function
        tapPromise(options: TapSharedOptions & { fn: TapPromiseFn2<A, B> }): void;
        // Tap with function as second argument
        tapPromise(name: string | TapSharedOptions, fn: TapPromiseFn2<A, B>): void;
        // Tap with included function
        tapAsync(options: TapSharedOptions & { fn: TapAsyncFn2<A, B> }): void;
        // Tap with function as second argument
        tapAsync(name: string | TapSharedOptions, fn: TapAsyncFn2<A, B>): void;
    }

    type HookAsyncTaps3<A, B, C> = {
        // Tap with included function
        tapPromise(options: TapSharedOptions & { fn: TapPromiseFn3<A, B, C> }): void;
        // Tap with function as second argument
        tapPromise(name: string | TapSharedOptions, fn: TapPromiseFn3<A, B, C>): void;
        // Tap with included function
        tapAsync(options: TapSharedOptions & { fn: TapAsyncFn3<A, B, C> }): void;
        // Tap with function as second argument
        tapAsync(name: string | TapSharedOptions, fn: TapAsyncFn3<A, B, C>): void;
    }

    type HookAsyncTaps4<A, B, C, D> = {
        // Tap with included function
        tapPromise(options: TapSharedOptions & { fn: TapPromiseFn4<A, B, C, D> }): void;
        // Tap with function as second argument
        tapPromise(name: string | TapSharedOptions, fn: TapPromiseFn4<A, B, C, D>): void;
        // Tap with included function
        tapAsync(options: TapSharedOptions & { fn: TapAsyncFn4<A, B, C, D> }): void;
        // Tap with function as second argument
        tapAsync(name: string | TapSharedOptions, fn: TapAsyncFn4<A, B, C, D>): void;
    }


    // Taps with context
    type TapCtxOptions = { context: true } & TapSharedOptions

    type HookSyncCtxTaps0<T> = {
        // Tap with included function
        tap(options: TapCtxOptions & { fn: TapSyncCtxFn0<T> }): void;
        // Tap with function as second argument
        // TODO: Is the overriding behavior ambiguous? Currently, options.fn overrides second arg
        //  Same thing happens for type: "sync" | "async" | "promise"...
        tap(options: TapCtxOptions, fn: TapSyncCtxFn0<T>): void;
    }

    type HookSyncCtxTaps1<T, A> = {
        // Tap with included function
        tap(options: TapCtxOptions & { fn: TapSyncCtxFn1<T, A> }): void;
        // Tap with function as second argument
        // TODO: Is the overriding behavior ambiguous? Currently, options.fn overrides second arg
        //  Same thing happens for type: "sync" | "async" | "promise"...
        tap(options: TapCtxOptions, fn: TapSyncCtxFn1<T, A>): void;
    }

    type HookSyncCtxTaps2<T, A, B> = {
        // Tap with included function
        tap(options: TapCtxOptions & { fn: TapSyncCtxFn2<T, A, B> }): void;
        // Tap with function as second argument
        // TODO: Is the overriding behavior ambiguous? Currently, options.fn overrides second arg
        //  Same thing happens for type: "sync" | "async" | "promise"...
        tap(options: TapCtxOptions, fn: TapSyncCtxFn2<T, A, B>): void;
    }

    type HookSyncCtxTaps3<T, A, B, C> = {
        // Tap with included function
        tap(options: TapCtxOptions & { fn: TapSyncCtxFn3<T, A, B, C> }): void;
        // Tap with function as second argument
        // TODO: Is the overriding behavior ambiguous? Currently, options.fn overrides second arg
        //  Same thing happens for type: "sync" | "async" | "promise"...
        tap(options: TapCtxOptions, fn: TapSyncCtxFn3<T, A, B, C>): void;
    }

    type HookSyncCtxTaps4<T, A, B, C, D> = {
        // Tap with included function
        tap(options: TapCtxOptions & { fn: TapSyncCtxFn4<T, A, B, C, D> }): void;
        // Tap with function as second argument
        // TODO: Is the overriding behavior ambiguous? Currently, options.fn overrides second arg
        //  Same thing happens for type: "sync" | "async" | "promise"...
        tap(options: TapCtxOptions, fn: TapSyncCtxFn4<T, A, B, C, D>): void;
    }


    type HookAsyncCtxTaps0<T> = {
        // Tap with included function
        tapAsync(options: TapCtxOptions & { fn: TapAsyncCtxFn0<T> }): void;
        // Tap with function as second argument
        tapAsync(options: TapCtxOptions, fn: TapAsyncCtxFn0<T>): void;
        // Tap with included function
        tapPromise(options: TapCtxOptions & { fn: TapPromiseCtxFn0<T> }): void;
        // Tap with function as second argument
        tapPromise(options: TapCtxOptions, fn: TapPromiseCtxFn0<T>): void;
    }

    type HookAsyncCtxTaps1<T, A> = {
        // Tap with included function
        tapAsync(options: TapCtxOptions & { fn: TapAsyncCtxFn1<T, A> }): void;
        // Tap with function as second argument
        tapAsync(options: TapCtxOptions, fn: TapAsyncCtxFn1<T, A>): void;
        // Tap with included function
        tapPromise(options: TapCtxOptions & { fn: TapPromiseCtxFn1<T, A> }): void;
        // Tap with function as second argument
        tapPromise(options: TapCtxOptions, fn: TapPromiseCtxFn1<T, A>): void;
    }

    type HookAsyncCtxTaps2<T, A, B> = {
        // Tap with included function
        tapAsync(options: TapCtxOptions & { fn: TapAsyncCtxFn2<T, A, B> }): void;
        // Tap with function as second argument
        tapAsync(options: TapCtxOptions, fn: TapAsyncCtxFn2<T, A, B>): void;
        // Tap with included function
        tapPromise(options: TapCtxOptions & { fn: TapPromiseCtxFn2<T, A, B> }): void;
        // Tap with function as second argument
        tapPromise(options: TapCtxOptions, fn: TapPromiseCtxFn2<T, A, B>): void;
    }

    type HookAsyncCtxTaps3<T, A, B, C> = {
        // Tap with included function
        tapAsync(options: TapCtxOptions & { fn: TapAsyncCtxFn3<T, A, B, C> }): void;
        // Tap with function as second argument
        tapAsync(options: TapCtxOptions, fn: TapAsyncCtxFn3<T, A, B, C>): void;
        // Tap with included function
        tapPromise(options: TapCtxOptions & { fn: TapPromiseCtxFn3<T, A, B, C> }): void;
        // Tap with function as second argument
        tapPromise(options: TapCtxOptions, fn: TapPromiseCtxFn3<T, A, B, C>): void;
    }

    type HookAsyncCtxTaps4<T, A, B, C, D> = {
        // Tap with included function
        tapAsync(options: TapCtxOptions & { fn: TapAsyncCtxFn4<T, A, B, C, D> }): void;
        // Tap with function as second argument
        tapAsync(options: TapCtxOptions, fn: TapAsyncCtxFn4<T, A, B, C, D>): void;
        // Tap with included function
        tapPromise(options: TapCtxOptions & { fn: TapPromiseCtxFn4<T, A, B, C, D> }): void;
        // Tap with function as second argument
        tapPromise(options: TapCtxOptions, fn: TapPromiseCtxFn4<T, A, B, C, D>): void;
    }

    // Hook Calls

    // TODO: I'm pretty sure it will always be void... but putting this here as placeholder
    type HookResult = void

    type HookSyncCall0 = () => HookResult
    type HookSyncCalls0 = {
        call: HookSyncCall0;
    }

    type HookSyncCall1<A> = (a: A) => HookResult
    type HookSyncCalls1<A> = {
        call: HookSyncCall1<A>;
    }

    type HookSyncCall2<A, B> = (a: A, b: B) => HookResult
    type HookSyncCalls2<A, B> = {
        call: HookSyncCall2<A, B>;
    }

    type HookSyncCall3<A, B, C> = (a: A, b: B, c: C) => HookResult
    type HookSyncCalls3<A, B, C> = {
        call: HookSyncCall3<A, B, C>;
    }

    type HookSyncCall4<A, B, C, D> = (a: A, b: B, c: C, d: D) => HookResult
    type HookSyncCalls4<A, B, C, D> = {
        call: HookSyncCall4<A, B, C, D>;
    }

    type HookAsyncCall0 = (callback: (err: Error | null, result?: HookResult) => void) => void
    type HookPromiseCall0 = () => Promise<HookResult>
    type HookAsyncCalls0 = {
        promise: HookPromiseCall0;
        callAsync: HookAsyncCall0;
    }

    type HookAsyncCall1<A> = (a: A, callback: (err: Error | null, result?: HookResult) => void) => void
    type HookPromiseCall1<A> = (a: A) => Promise<HookResult>
    type HookAsyncCalls1<A> = {
        promise: HookPromiseCall1<A>;
        callAsync: HookAsyncCall1<A>;
    }

    type HookAsyncCall2<A, B> = (a: A, b: B, callback: (err: Error | null, result?: HookResult) => void) => void
    type HookPromiseCall2<A, B> = (a: A, b: B) => Promise<HookResult>
    type HookAsyncCalls2<A, B> = {
        promise: HookPromiseCall2<A, B>;
        callAsync: HookAsyncCall2<A, B>;
    }

    type HookAsyncCall3<A, B, C> = (a: A, b: B, c: C, callback: (err: Error | null, result?: HookResult) => void) => void
    type HookPromiseCall3<A, B, C> = (a: A, b: B, c: C) => Promise<HookResult>
    type HookAsyncCalls3<A, B, C> = {
        promise: HookPromiseCall3<A, B, C>;
        callAsync: HookAsyncCall3<A, B, C>;
    }

    type HookAsyncCall4<A, B, C, D> = (a: A, b: B, c: C, d: D, callback: (err: Error | null, result?: HookResult) => void) => void
    type HookPromiseCall4<A, B, C, D> = (a: A, b: B, c: C, d: D) => Promise<HookResult>
    type HookAsyncCalls4<A, B, C, D> = {
        promise: HookPromiseCall4<A, B, C, D>;
        callAsync: HookAsyncCall4<A, B, C, D>;
    }


    // Shared properties between async and sync
    type HookSharedProps0<T> = {
        // TODO: private? what are the options for hook?
        withOptions(options)

        isUsed(): boolean

        taps: (TapObject0 | TapCtxObject0<T>)[]
        intercept(interceptor: HookInterceptor0 | HookCtxInterceptor0<T>)
    }

    // Shared properties between async and sync
    type HookSharedProps1<T, A> = {
        // TODO: private? what are the options for hook?
        withOptions(options)

        isUsed(): boolean

        taps: (TapObject1<A> | TapCtxObject1<T, A>)[]
        intercept(interceptor: HookInterceptor1<A> | HookCtxInterceptor1<T, A>)
    }

    // Shared properties between async and sync
    type HookSharedProps2<T, A, B> = {
        // TODO: private? what are the options for hook?
        withOptions(options)

        isUsed(): boolean

        taps: (TapObject2<A, B> | TapCtxObject2<T, A, B>)[]
        intercept(interceptor: HookInterceptor2<A, B> | HookCtxInterceptor2<T, A, B>)
    }

    // Shared properties between async and sync
    type HookSharedProps3<T, A, B, C> = {
        // TODO: private? what are the options for hook?
        withOptions(options)

        isUsed(): boolean

        taps: (TapObject3<A, B, C> | TapCtxObject3<T, A, B, C>)[]
        intercept(interceptor: HookInterceptor3<A, B, C> | HookCtxInterceptor3<T, A, B, C>)
    }

    // Shared properties between async and sync
    type HookSharedProps4<T, A, B, C, D> = {
        // TODO: private? what are the options for hook?
        withOptions(options)

        isUsed(): boolean

        taps: (TapObject4<A, B, C, D> | TapCtxObject4<T, A, B, C, D>)[]
        intercept(interceptor: HookInterceptor4<A, B, C, D> | HookCtxInterceptor4<T, A, B, C, D>)
    }

    // Generics: Context, First Argument
    export type HookAsync0<T>
        = HookAsyncCalls0
        & HookAsyncCtxTaps0<T>
        & HookAsyncTaps0
        & HookSharedProps0<T>

    // Generics: Context, First Argument
    export type HookAsync1<T, A>
        = HookAsyncCalls1<A>
        & HookAsyncCtxTaps1<T, A>
        & HookAsyncTaps1<A>
        & HookSharedProps1<T, A>

    // Generics: Context, First Argument
    export type HookAsync2<T, A, B>
        = HookAsyncCalls2<A, B>
        & HookAsyncCtxTaps2<T, A, B>
        & HookAsyncTaps2<A, B>
        & HookSharedProps2<T, A, B>

    // Generics: Context, First Argument
    export type HookAsync3<T, A, B, C>
        = HookAsyncCalls3<A, B, C>
        & HookAsyncCtxTaps3<T, A, B, C>
        & HookAsyncTaps3<A, B, C>
        & HookSharedProps3<T, A, B, C>

    // Generics: Context, First Argument
    export type HookAsync4<T, A, B, C, D>
        = HookAsyncCalls4<A, B, C, D>
        & HookAsyncCtxTaps4<T, A, B, C, D>
        & HookAsyncTaps4<A, B, C, D>
        & HookSharedProps4<T, A, B, C, D>


    // HookSync has all the options of async
    export type HookSync0<T>
        = HookAsync0<T>
        & HookSyncCalls0
        & HookSyncCtxTaps0<T>
        & HookSyncTaps0
        & HookSharedProps0<T>

    // HookSync has all the options of async
    export type HookSync1<T, A>
        = HookAsync1<T, A>
        & HookSyncCalls1<A>
        & HookSyncCtxTaps1<T, A>
        & HookSyncTaps1<A>
        & HookSharedProps1<T, A>

    // HookSync has all the options of async
    export type HookSync2<T, A, B>
        = HookAsync2<T, A, B>
        & HookSyncCalls2<A, B>
        & HookSyncCtxTaps2<T, A, B>
        & HookSyncTaps2<A, B>
        & HookSharedProps2<T, A, B>

    // HookSync has all the options of async
    export type HookSync3<T, A, B, C>
        = HookAsync3<T, A, B, C>
        & HookSyncCalls3<A, B, C>
        & HookSyncCtxTaps3<T, A, B, C>
        & HookSyncTaps3<A, B, C>
        & HookSharedProps3<T, A, B, C>

    // HookSync has all the options of async
    export type HookSync4<T, A, B, C, D>
        = HookAsync4<T, A, B, C, D>
        & HookSyncCalls4<A, B, C, D>
        & HookSyncCtxTaps4<T, A, B, C, D>
        & HookSyncTaps4<A, B, C, D>
        & HookSharedProps4<T, A, B, C, D>

    // TODO: double check if `args` is optional
    // TODO: Is there a zero arg Hookable?
    interface HookableAsync {
        new <T = any>(): HookAsync0<T>
        new <T = any, A = any>(args: [string]): HookAsync1<T, A>
        new <T = any, A = any, B = any>(args: [string, string]): HookAsync2<T, A, B>
        new <T = any, A = any, B = any, C = any>(args: [string, string, string]): HookAsync3<T, A, B, C>
        new <T = any, A = any, B = any, C = any, D = any>(args: [string, string, string, string]): HookAsync4<T, A, B, C, D>
    }
    interface HookableSync {
        new <T = any>(): HookSync0<T>
        new <T = any, A = any>(args: [string]): HookSync1<T, A>
        new <T = any, A = any, B = any>(args: [string, string]): HookSync2<T, A, B>
        new <T = any, A = any, B = any, C = any>(args: [string, string, string]): HookSync3<T, A, B, C>
        new <T = any, A = any, B = any, C = any, D = any>(args: [string, string, string, string]): HookSync4<T, A, B, C, D>
    }

    // TODO: type permutations
    // TapObjects are the full form of a Tap
    export type TapCtxObject0<T> = TapSharedOptions & {
        context: true
    } & ({ type: "async", fn: TapAsyncCtxFn0<T> }
        | { type: "sync", fn: TapSyncCtxFn0<T> }
        | { type: "promise", fn: TapPromiseCtxFn0<T> })

    export type TapCtxObject1<T, A> = TapSharedOptions & {
        context: true
    } & ({ type: "async", fn: TapAsyncCtxFn1<T, A> }
        | { type: "sync", fn: TapSyncCtxFn1<T, A> }
        | { type: "promise", fn: TapPromiseCtxFn1<T, A> })

    export type TapCtxObject2<T, A, B> = TapSharedOptions & {
        context: true
    } & ({ type: "async", fn: TapAsyncCtxFn2<T, A, B> }
        | { type: "sync", fn: TapSyncCtxFn2<T, A, B> }
        | { type: "promise", fn: TapPromiseCtxFn2<T, A, B> })

    export type TapCtxObject3<T, A, B, C> = TapSharedOptions & {
        context: true
    } & ({ type: "async", fn: TapAsyncCtxFn3<T, A, B, C> }
        | { type: "sync", fn: TapSyncCtxFn3<T, A, B, C> }
        | { type: "promise", fn: TapPromiseCtxFn3<T, A, B, C> })

    export type TapCtxObject4<T, A, B, C, D> = TapSharedOptions & {
        context: true
    } & ({ type: "async", fn: TapAsyncCtxFn4<T, A, B, C, D> }
        | { type: "sync", fn: TapSyncCtxFn4<T, A, B, C, D> }
        | { type: "promise", fn: TapPromiseCtxFn4<T, A, B, C, D> })

    export type TapObject0 = TapSharedOptions & {
        context: false
    } & ({ type: "async", fn: TapAsyncFn0 }
        | { type: "sync", fn: TapSyncFn0 }
        | { type: "promise", fn: TapPromiseFn0 })

    export type TapObject1<A> = TapSharedOptions & {
        context: false
    } & ({ type: "async", fn: TapAsyncFn1<A> }
        | { type: "sync", fn: TapSyncFn1<A> }
        | { type: "promise", fn: TapPromiseFn1<A> })

    export type TapObject2<A, B> = TapSharedOptions & {
        context: false
    } & ({ type: "async", fn: TapAsyncFn2<A, B> }
        | { type: "sync", fn: TapSyncFn2<A, B> }
        | { type: "promise", fn: TapPromiseFn2<A, B> })

    export type TapObject3<A, B, C> = TapSharedOptions & {
        context: false
    } & ({ type: "async", fn: TapAsyncFn3<A, B, C> }
        | { type: "sync", fn: TapSyncFn3<A, B, C> }
        | { type: "promise", fn: TapPromiseFn3<A, B, C> })

    export type TapObject4<A, B, C, D> = TapSharedOptions & {
        context: false
    } & ({ type: "async", fn: TapAsyncFn4<A, B, C, D> }
        | { type: "sync", fn: TapSyncFn4<A, B, C, D> }
        | { type: "promise", fn: TapPromiseFn4<A, B, C, D> })

    // Non-context interceptor
    export type HookInterceptor0 = {
        // Adding call to your interceptor will trigger when hooks are triggered. You have access to the hooks arguments.
        call?: () => void,
        // Adding loop to your interceptor will trigger for each loop of a looping hook
        loop?: () => void,
        // Adding tap to your interceptor will trigger when a plugin taps into a hook. Provided is the Tap object. Tap object can't be changed
        // TODO: double check that TapObject is a single arg, here
        tap?: (tap: TapObject0) => void,
        // Adding register to your interceptor will trigger for each added Tap and allows to modify it.
        // TODO: double check that TapObject is a single arg and without context, here
        register?: (tap: TapObject0) => TapObject0,
        context?: false,
    }

    // Non-context interceptor
    export type HookInterceptor1<A> = {
        // Adding call to your interceptor will trigger when hooks are triggered. You have access to the hooks arguments.
        call?: (a: A) => void,
        // Adding loop to your interceptor will trigger for each loop of a looping hook
        loop?: (a: A) => void,
        // Adding tap to your interceptor will trigger when a plugin taps into a hook. Provided is the Tap object. Tap object can't be changed
        // TODO: double check that TapObject is a single arg, here
        tap?: (tap: TapObject1<A>) => void,
        // Adding register to your interceptor will trigger for each added Tap and allows to modify it.
        // TODO: double check that TapObject is a single arg and without context, here
        register?: (tap: TapObject1<A>) => TapObject1<A>,
        context?: false,
    }

    // Non-context interceptor
    export type HookInterceptor2<A, B> = {
        // Adding call to your interceptor will trigger when hooks are triggered. You have access to the hooks arguments.
        call?: (a: A, b: B) => void,
        // Adding loop to your interceptor will trigger for each loop of a looping hook
        loop?: (a: A, b: B) => void,
        // Adding tap to your interceptor will trigger when a plugin taps into a hook. Provided is the Tap object. Tap object can't be changed
        // TODO: double check that TapObject is a single arg, here
        tap?: (tap: TapObject2<A, B>) => void,
        // Adding register to your interceptor will trigger for each added Tap and allows to modify it.
        // TODO: double check that TapObject is a single arg and without context, here
        register?: (tap: TapObject2<A, B>) => TapObject2<A, B>,
        context?: false,
    }

    // Non-context interceptor
    export type HookInterceptor3<A, B, C> = {
        // Adding call to your interceptor will trigger when hooks are triggered. You have access to the hooks arguments.
        call?: (a: A, b: B, c: C) => void,
        // Adding loop to your interceptor will trigger for each loop of a looping hook
        loop?: (a: A, b: B, c: C) => void,
        // Adding tap to your interceptor will trigger when a plugin taps into a hook. Provided is the Tap object. Tap object can't be changed
        // TODO: double check that TapObject is a single arg, here
        tap?: (tap: TapObject3<A, B, C>) => void,
        // Adding register to your interceptor will trigger for each added Tap and allows to modify it.
        // TODO: double check that TapObject is a single arg and without context, here
        register?: (tap: TapObject3<A, B, C>) => TapObject3<A, B, C>,
        context?: false,
    }

    // Non-context interceptor
    export type HookInterceptor4<A, B, C, D> = {
        // Adding call to your interceptor will trigger when hooks are triggered. You have access to the hooks arguments.
        call?: (a: A, b: B, c: C, d: D) => void,
        // Adding loop to your interceptor will trigger for each loop of a looping hook
        loop?: (a: A, b: B, c: C, d: D) => void,
        // Adding tap to your interceptor will trigger when a plugin taps into a hook. Provided is the Tap object. Tap object can't be changed
        // TODO: double check that TapObject is a single arg, here
        tap?: (tap: TapObject4<A, B, C, D>) => void,
        // Adding register to your interceptor will trigger for each added Tap and allows to modify it.
        // TODO: double check that TapObject is a single arg and without context, here
        register?: (tap: TapObject4<A, B, C, D>) => TapObject4<A, B, C, D>,
        context?: false,
    }

    export type HookCtxInterceptor0<T> = {
        // Adding call to your interceptor will trigger when hooks are triggered. You have access to the hooks arguments.
        call?: (ctx: T) => void,
        // Adding loop to your interceptor will trigger for each loop of a looping hook
        loop?: (ctx: T) => void,
        // Adding tap to your interceptor will trigger when a plugin taps into a hook. Provided is the Tap object. Tap object can't be changed
        tap?: (ctx: T, tap: TapCtxObject0<T>) => void,
        // Adding register to your interceptor will trigger for each added Tap and allows to modify it.
        register?: (tap: TapCtxObject0<T>) => TapCtxObject0<T>,
        context: true,
    }

    export type HookCtxInterceptor1<T, A> = {
        // Adding call to your interceptor will trigger when hooks are triggered. You have access to the hooks arguments.
        call?: (ctx: T, a: A) => void,
        // Adding loop to your interceptor will trigger for each loop of a looping hook
        loop?: (ctx: T, a: A) => void,
        // Adding tap to your interceptor will trigger when a plugin taps into a hook. Provided is the Tap object. Tap object can't be changed
        tap?: (ctx: T, tap: TapCtxObject1<T, A>) => void,
        // Adding register to your interceptor will trigger for each added Tap and allows to modify it.
        register?: (tap: TapCtxObject1<T, A>) => TapCtxObject1<T, A>,
        context: true,
    }

    export type HookCtxInterceptor2<T, A, B> = {
        // Adding call to your interceptor will trigger when hooks are triggered. You have access to the hooks arguments.
        call?: (ctx: T, a: A, b: B) => void,
        // Adding loop to your interceptor will trigger for each loop of a looping hook
        loop?: (ctx: T, a: A, b: B) => void,
        // Adding tap to your interceptor will trigger when a plugin taps into a hook. Provided is the Tap object. Tap object can't be changed
        tap?: (ctx: T, tap: TapCtxObject2<T, A, B>) => void,
        // Adding register to your interceptor will trigger for each added Tap and allows to modify it.
        register?: (tap: TapCtxObject2<T, A, B>) => TapCtxObject2<T, A, B>,
        context: true,
    }

    export type HookCtxInterceptor3<T, A, B, C> = {
        // Adding call to your interceptor will trigger when hooks are triggered. You have access to the hooks arguments.
        call?: (ctx: T, a: A, b: B, c: C) => void,
        // Adding loop to your interceptor will trigger for each loop of a looping hook
        loop?: (ctx: T, a: A, b: B, c: C) => void,
        // Adding tap to your interceptor will trigger when a plugin taps into a hook. Provided is the Tap object. Tap object can't be changed
        tap?: (ctx: T, tap: TapCtxObject3<T, A, B, C>) => void,
        // Adding register to your interceptor will trigger for each added Tap and allows to modify it.
        register?: (tap: TapCtxObject3<T, A, B, C>) => TapCtxObject3<T, A, B, C>,
        context: true,
    }

    export type HookCtxInterceptor4<T, A, B, C, D> = {
        // Adding call to your interceptor will trigger when hooks are triggered. You have access to the hooks arguments.
        call?: (ctx: T, a: A, b: B, c: C, d: D) => void,
        // Adding loop to your interceptor will trigger for each loop of a looping hook
        loop?: (ctx: T, a: A, b: B, c: C, d: D) => void,
        // Adding tap to your interceptor will trigger when a plugin taps into a hook. Provided is the Tap object. Tap object can't be changed
        tap?: (ctx: T, tap: TapCtxObject4<T, A, B, C, D>) => void,
        // Adding register to your interceptor will trigger for each added Tap and allows to modify it.
        register?: (tap: TapCtxObject4<T, A, B, C, D>) => TapCtxObject4<T, A, B, C, D>,
        context: true,
    }


    export const SyncHook: HookableSync
    export const SyncBailHook: HookableSync
    export const SyncWaterfallHook: HookableSync
    export const SyncLoopHook: HookableSync
    export const AsyncParallelHook: HookableAsync
    export const AsyncParallelBailHook: HookableAsync
    export const AsyncSeriesHook: HookableAsync
    export const AsyncSeriesBailHook: HookableAsync
    export const AsyncSeriesWaterfallHook: HookableAsync

    export class Tapable {
        static addCompatLayer(instance: any): void;
    }


    // In-progress: All encompassing objects
    export type TapObject<
        T = any,
        // Loop produces A = any, B = any, C = any, etc... using /\bA\b/g replace
        A = any,
        B = any,
        C = any,
        D = any,
    > =
        | TapObject0 | TapCtxObject0<T>

        | TapObject1<A> | TapCtxObject1<T, A>

        | TapObject2<A, B> | TapCtxObject2<T, A, B>

        | TapObject3<A, B, C> | TapCtxObject3<T, A, B, C>

        | TapObject4<A, B, C, D> | TapCtxObject4<T, A, B, C, D>
    ;

    export type HookObject<
        T = any,
        // Loop produces A = any, B = any, C = any, etc... using /\bA\b/g replace
        A = any,
        B = any,
        C = any,
        D = any,
    > =
        | HookSync0<T> | HookAsync0<T>

        | HookSync1<T, A> | HookAsync1<T, A>

        | HookSync2<T, A, B> | HookAsync2<T, A, B>

        | HookSync3<T, A, B, C> | HookAsync3<T, A, B, C>

        | HookSync4<T, A, B, C, D> | HookAsync4<T, A, B, C, D>
    ;
}
