# tapable benchmarks

Micro-benchmarks for tapable's hook primitives, built with
[tinybench](https://github.com/tinylibs/tinybench) and instrumented for
[CodSpeed](https://codspeed.io) via
[`@codspeed/tinybench-plugin`](https://github.com/CodSpeedHQ/codspeed-node).

## Layout

```
benchmarks/
  helpers.js                    - shared createBench / runBench helpers
  run.js                        - recursive runner for *.bench.js files
  sync/
    SyncHook.bench.js
    SyncBailHook.bench.js
    SyncWaterfallHook.bench.js
    SyncLoopHook.bench.js
  async/
    AsyncSeriesHook.bench.js
    AsyncSeriesBailHook.bench.js
    AsyncSeriesWaterfallHook.bench.js
    AsyncSeriesLoopHook.bench.js
    AsyncParallelHook.bench.js
    AsyncParallelBailHook.bench.js
  hookmap/
    HookMap.bench.js
    MultiHook.bench.js
  interceptors/
    sync.bench.js
    async.bench.js
  registration/
    tap.bench.js                - tap(), tapAsync(), tapPromise(), with stages/before
    compile.bench.js            - first-call compile cost per hook type
```

Each `*.bench.js` file exports an async `main()`. The runner
(`benchmarks/run.js`) discovers them recursively and executes them in one
process so the CodSpeed instrumentation session is shared. Any file can
also be run stand-alone (`node benchmarks/sync/SyncHook.bench.js`) thanks
to the `runIfMain(module, main)` shim in `helpers.js`.

## Running locally

```bash
# Everything
npm run bench

# A single suite (directory)
npm run bench:sync
npm run bench:async
npm run bench:hookmap
npm run bench:interceptors
npm run bench:registration

# A single file
node benchmarks/sync/SyncHook.bench.js
```

Local runs print a tinybench result table per file. The CodSpeed plugin
is a no-op outside of the CodSpeed runner, so nothing is uploaded from
local runs.

## CI

`.github/workflows/codspeed.yml` runs `npm run bench` on push to `main`
and on pull requests, uploading results to CodSpeed. Set the
`CODSPEED_TOKEN` repository secret to enable uploads.
