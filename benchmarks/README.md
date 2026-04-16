# tapable benchmarks

Micro-benchmarks for tapable's hook primitives, built with
[tinybench](https://github.com/tinylibs/tinybench) and instrumented for
[CodSpeed](https://codspeed.io) via
[`@codspeed/tinybench-plugin`](https://github.com/CodSpeedHQ/codspeed-node).

## Running locally

```bash
# All benchmarks
npm run bench

# A single suite
npm run bench:sync
npm run bench:async
npm run bench:hookmap
npm run bench:interceptors
```

Local runs print a tinybench result table. The CodSpeed plugin is a no-op
outside of the CodSpeed runner, so nothing is uploaded from local runs.

## What is covered

- `benchmarks/sync.bench.js` &mdash; `SyncHook`, `SyncBailHook`,
  `SyncWaterfallHook`, `SyncLoopHook`, plus tap registration and
  first-call compile cost.
- `benchmarks/async.bench.js` &mdash; `AsyncSeriesHook`,
  `AsyncSeriesBailHook`, `AsyncSeriesWaterfallHook`, `AsyncParallelHook`,
  `AsyncParallelBailHook` (callback + promise forms).
- `benchmarks/hookmap.bench.js` &mdash; `HookMap#for` (hot/cold paths)
  and `HookMap#get`.
- `benchmarks/interceptors.bench.js` &mdash; the interceptor slow paths
  (`call`, `tap`, `register`) layered on top of `SyncHook` and
  `AsyncSeriesHook`.

## CI

`.github/workflows/codspeed.yml` runs `npm run bench` on push to `main`
and on pull requests, uploading results to CodSpeed. Set the
`CODSPEED_TOKEN` repository secret to enable uploads.
