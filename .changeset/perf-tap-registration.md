---
"tapable": patch
---

Perf: reduce tap-registration and HookMap-lookup overhead.

- `Hook#_tap` builds the final tap descriptor in a single allocation for the
  common `hook.tap("name", fn)` string-options case instead of creating an
  intermediate `{ name }` object that was then merged via `Object.assign`.
- `Hook#_insert` takes an O(1) fast path for the common append case (no
  `before`, and stage is consistent with the last tap) - the previous
  implementation always ran the shift loop once.
- `Hook#_runRegisterInterceptors` early-returns when there are no
  interceptors and uses an indexed loop instead of `for…of`.
- `HookMap#for` inlines the `_map.get` lookup instead of routing through
  `this.get(key)`, saving a method dispatch on a path hit once per hook
  access in consumers like webpack.
- `HookCodeFactory#setup` builds `_x` with a preallocated array + explicit
  loop instead of `Array.prototype.map`, trimming work on every compile.

Registering 10 taps on a `SyncHook` is roughly 2× faster in the
micro-benchmarks; `HookMap#for (existing key)` is ~6% faster. The `.call()`
path is unchanged.
