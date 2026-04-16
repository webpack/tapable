---
"tapable": patch
---

Perf: reduce tap-registration allocations.

`Hook#_tap` now builds the final tap descriptor in a single allocation for
the common `hook.tap("name", fn)` string-options case instead of creating an
intermediate `{ name }` object that was then merged via `Object.assign`. In
micro-benchmarks, registering 10 taps on a `SyncHook` is roughly 2× faster.
`HookCodeFactory#setup` also builds `_x` with a preallocated array + explicit
loop instead of `Array.prototype.map`, trimming a small amount of work on
every hook compile.
