# Changelog

## [Unreleased]

## [2.1.0] 2026-11-01

- Core: Faster on large sets of files (about 1.6x on 1000 files)
  - Up to 32 files are read and written at the same time (results keep the order of the files)
  - File search no longer runs a stat call on each found file
  - Texts without `|` skip the formatting engine
  - The CLI no longer keeps the contents of updated files in memory
- API: `run(files, { keepContents: false })` returns `null` instead of the file contents in `before` / `after`

## [2.0.0] 2026-11-01

- Core: New formatting engine written in Rust and compiled to WebAssembly, embedded in the npm package
  - Same package on every platform (Windows, macOS, Linux, x64 and arm64), no native binary nor install script
  - Faster: about 2x on startup and on large sets of files
- Core: Now requires Node.js 22.17+ (file search uses the built-in `fs.globSync`, stable since this version)
- Core: No more runtime dependencies (previously 6 dependencies, among which the VS Code extension markdown-table-prettify)
- Breaking changes in formatting results:
  - Behavior of markdown-table-prettify 4.x: tables without border never pad their first column on the left, header-only tables (header + separator) are formatted, tables inside blockquotes (`> |`) and after list markers (`- |`) are formatted
  - Tables inside fenced code blocks (```` ``` ```` or `~~~`) and indented code blocks are no longer formatted
  - Column widths use the Unicode display width: kana, hangul, full-width characters and emoji count as 2 columns, combining marks and zero-width characters as 0
  - Ignore markers written inside a code block are no longer applied
  - File search skips `node_modules` and `.git` folders
- Fixes:
  - A lone carriage return inside a line no longer corrupts the text around it
  - A table with only empty columns no longer breaks the output
  - "Formatted markdown tables in N files" message was never displayed
  - `--version` displayed the version of the calling project when run from an npm script
  - Errors (missing file, invalid option) display a short message instead of a stack trace
- Debug logs: use `NODE_DEBUG=markdown-table-formatter` instead of `DEBUG=markdown-table-formatter`
- CI: Publish to npm with trusted publishing (OIDC) and provenance, beta and latest versions from a single workflow
- Add pre-commit hook definition (`.pre-commit-hooks.yaml`), by [@bittner](https://github.com/bittner)
- The built WebAssembly engine is committed, so that installs from git (pre-commit, `npm install github:...`) do not need a Rust toolchain
- Tests: 80+ golden fixtures shared by JavaScript and Rust tests, black-box CLI tests

## [1.7.0] 2025-12-27

- Upgrade dependencies
- CI: Add tests for Node 20, 22 and 24

## [1.6.1] 2024-06-11

- Upgrade dependencies

## [1.6.0] 2024-04-27

- Core: Upgrade minimum NodeJS version to 18.0
- Upgrade dependencies

## [1.5.0] 2023-11-25

- Core: Now requires Node 16+
- Upgrade dependencies
- Doc
  - Add table of contents
  - Add explanation of how to disable and re-enable formatting
- CI
  - Upgrade MegaLinter to v7
  - Rename master branch into main

## [1.4.0] 2022-07-25

- Add --verbose mode
- Dependencies: run `npm audit fix` to secure dependencies
- CI: Upgrade [MegaLinter](https://oxsecurity.github.io/megalinter/latest/) to v6

## [1.3.0] 2022-01-31

- Allow to override the table columns padding number of spaces using argument **--columnpadding**
- CI: Upgrade MegaLinter to v5 + fix CI tests on Windows & Mac

## [1.2.0] 2021-08-20

- Allow to call markdown-table-formatter with a glob parameter to find files to format
- Allow to call markdown-table-formatter without arguments (**/*.md will be used by default to collect files)
- Fix logs format

## [1.1.0] 2021-04-05

- Upgrade markdown-table-prettify to 3.4.0 so it can take in account inline disable comments

## [1.0.2] 2021-01-19

- Fix code coverage

## [1.0.1] 2021-01-14

- First working version :)

## [0.0.1] 2021-01-13

- Initial version
