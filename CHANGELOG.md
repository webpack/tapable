# tapable

## 2.3.4

### Patch Changes

- Declare `TypedHookMap` as an interface, as no such class is exported. (by [@alexander-akait](https://github.com/alexander-akait) in [#291](https://github.com/webpack/tapable/pull/291))

- Type the `call` and `loop` interceptor arguments as the hook's own. (by [@alexander-akait](https://github.com/alexander-akait) in [#288](https://github.com/webpack/tapable/pull/288))

## 2.3.3

### Patch Changes

- Improved performance in many places. (by [@alexander-akait](https://github.com/alexander-akait) in [#217](https://github.com/webpack/tapable/pull/217))

## 2.3.2

### Patch Changes

- Revert ignore invalid `before` values. (by [@alexander-akait](https://github.com/alexander-akait) in [#211](https://github.com/webpack/tapable/pull/211))

## 2.3.1

### Patch Changes

- Ignore invalid `before` values. (by [@alexander-akait](https://github.com/alexander-akait) in [#208](https://github.com/webpack/tapable/pull/208))

- Trim the `name` option when options is an object. (by [@alexander-akait](https://github.com/alexander-akait) in [#208](https://github.com/webpack/tapable/pull/208))
