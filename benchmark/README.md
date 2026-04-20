# Benchmarks

Performance benchmarks for `tapable`, tracked over time via
[CodSpeed](https://codspeed.io/).

Runner stack: [tinybench](https://github.com/tinylibs/tinybench) +
[`@codspeed/core`](https://www.npmjs.com/package/@codspeed/core) with a local
`withCodSpeed()` wrapper ported from webpack's
`test/BenchmarkTestCases.benchmark.mjs` (via enhanced-resolve). Locally it
falls back to plain tinybench wall-clock measurements, and under
`CodSpeedHQ/action` in CI it automatically switches to CodSpeed's
instrumentation mode.

## Running locally

```sh
npm run benchmark
```

Optional substring filter to run only matching cases:

```sh
npm run benchmark -- sync
BENCH_FILTER=async-parallel npm run benchmark
```

Locally the runner uses tinybench's wall-clock measurements and prints a
table of ops/s, mean, p99, and relative margin of error per task. Under CI,
the bridge detects the CodSpeed runner environment and switches to
instruction-counting mode automatically.

The V8 flags in `package.json` (`--no-opt --predictable --hash-seed=1` etc.)
are required by CodSpeed's instrumentation mode for deterministic results —
do not drop them.

### Optional: running real instruction counts locally

If you want to reproduce CI's exact instrument-count numbers on your own
machine (Linux only — the underlying Valgrind tooling has no macOS backend),
install the standalone CodSpeed CLI and wrap `npm run benchmark` with it:

```sh
curl -fsSL https://codspeed.io/install.sh | bash
codspeed run npm run benchmark
```

This is only useful if you want to debug an instruction-count regression
outside CI. Day-to-day benchmark iteration should use `npm run benchmark`
directly (wall-clock mode).

## Layout

```
benchmark/
├── run.mjs                     # entry point: discovers cases, runs bench
├── with-codspeed.mjs           # local @codspeed/core <-> tinybench bridge
└── cases/
    └── <case-name>/
        └── index.bench.mjs     # default export: register(bench, ctx)
```

Each case directory must contain `index.bench.mjs` exporting a default
function with the signature:

```js
export default function register(bench, { caseName, caseDir }) {
	bench.add("my case: descriptive name", () => {
		// ... hook calls ...
	});
}
```

## Existing cases

| Case                          | What it measures                                                                      |
| ----------------------------- | ------------------------------------------------------------------------------------- |
| `sync-hook`                   | Steady-state `SyncHook#call` at tap counts 0/1/5/10/20/50 and arg counts 0..5         |
| `sync-bail-hook`              | `SyncBailHook#call`, full walk vs. bail at start / middle / end                       |
| `sync-waterfall-hook`         | Value-threading through taps that all return / all skip / mixed                       |
| `sync-loop-hook`              | Single-pass and multi-pass loops                                                      |
| `async-series-hook`           | `callAsync` and `promise`, sync / async / promise tap flavors                         |
| `async-series-bail-hook`      | Full walk vs. bail, for sync and callback-async taps                                  |
| `async-series-waterfall-hook` | Waterfall for sync / async / promise taps                                             |
| `async-series-loop-hook`      | Single-pass and multi-pass async loops                                                |
| `async-parallel-hook`         | Fan-out across sync / async / promise taps                                            |
| `async-parallel-bail-hook`    | Parallel race with and without a bailing tap                                          |
| `hook-map`                    | `HookMap#for` hot / cold / missing lookups plus interceptor factories                 |
| `multi-hook`                  | Fan-out registration and `isUsed` / `intercept` across a 3-hook `MultiHook`           |
| `interceptors-sync`           | Baseline vs. `call`, `tap`, combined, multiple, and register interceptors on SyncHook |
| `interceptors-async`          | Same matrix on `AsyncSeriesHook` and `AsyncParallelHook`                              |
| `tap-registration`            | `tap` / `tapAsync` / `tapPromise` with string, object, stage, and `before` options    |
| `hook-compile`                | First-call code-gen cost for every hook type (5 taps + first call per iteration)      |

Add new cases by creating a new directory under `cases/` — `run.mjs` will
pick it up automatically on the next run.
