# Changelog

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
