---
"tapable": patch
---

Perf: reduce allocations and work on the tap registration and compile paths.

- `Hook#_tap` builds the final tap descriptor in a single allocation for the
  common `hook.tap("name", fn)` string-options case instead of creating an
  intermediate `{ name }` object that was then merged via `Object.assign`.
- `Hook#_insert` takes an O(1) fast path for the common append case (no
  `before`, and stage consistent with the last tap) - the previous
  implementation always ran the shift loop once.
- `Hook#_runRegisterInterceptors` early-returns when there are no
  interceptors and uses an indexed loop instead of `for…of`.
- `HookMap#for` inlines the `_map.get` lookup instead of routing through
  `this.get(key)`, saving a method dispatch on a path hit once per hook
  access in consumers like webpack.
- `HookCodeFactory#setup` builds `_x` with a preallocated array + explicit
  loop instead of `Array.prototype.map`.
- `HookCodeFactory#init` uses `Array.prototype.slice` instead of spread to
  skip the iterator protocol.
- `HookCodeFactory#args` memoizes the common no-before/no-after result so
  arguments are joined once per compile rather than once per tap.
- `HookCodeFactory#needContext`, `callTapsSeries`, `callTapsParallel` and
  `MultiHook`'s iteration use indexed loops with cached length, and the
  series/parallel code hoists the per-tap `done`/`doneBreak` closures
  out of the compile-time loop. Replaces `Array.prototype.findIndex`
  with a local loop to avoid callback allocation.

Registering 10 taps on a `SyncHook` is roughly 2× faster,
`SyncHook: tap 5 + first call (compile)` is ~15% faster, and
`HookMap#for (existing key)` is ~6% faster in the micro-benchmarks.
The `.call()` path is unchanged.
