# Contributing

Contributions are very welcome !

Instructions :

- Fork the repository and clone it on your computer
- Install [Rust](https://rustup.rs/): the toolchain version is pinned in `rust-toolchain.toml` and installed automatically by rustup
- Install dependencies: `npm install`
- The formatting engine is in `rust/`: `npm run build:wasm` builds it to `lib/wasm/` (done automatically before `npm test`)
- Golden fixtures are in `test/fixtures/<case>/` (`input.md`, `expected.md`, optional `options.json`), used by both `npm test` and `npm run test:rust`
- Update source code and add mocha tests for any code you create
- Run `npm run lint:fix` then `npm run test` to check your updates didn't break anything
- Once your code is ready, documented and tested, please make a [pull request](https://github.com/nvuillam/markdown-table-formatter/pulls) :)
