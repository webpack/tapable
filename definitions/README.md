
# Definitions

First, we generated some types using Microsoft's dts-gen tool https://github.com/Microsoft/dts-gen

```sh
npm i -g dts-gen
npm i -g ./

dts-gen -m tapable -f ./types.d.ts
```

# Generation

```sh
# Install dependencies
yarn install

# Execute ./build.ts
yarn run build
```
