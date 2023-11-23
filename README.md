<!-- markdownlint-disable MD033 MD041 -->

# Markdown table formatter

[![Version](https://img.shields.io/npm/v/markdown-table-formatter.svg)](https://npmjs.org/package/markdown-table-formatter)
[![Downloads/week](https://img.shields.io/npm/dw/markdown-table-formatter.svg)](https://npmjs.org/package/markdown-table-formatter)
[![Downloads/total](https://img.shields.io/npm/dt/markdown-table-formatter.svg)](https://npmjs.org/package/markdown-table-formatter)
[![Mega-Linter](https://github.com/nvuillam/markdown-table-formatter/workflows/Mega-Linter/badge.svg)](https://github.com/nvuillam/mega-linter#readme)
[![codecov](https://codecov.io/gh/nvuillam/markdown-table-formatter/branch/master/graph/badge.svg)](https://codecov.io/gh/nvuillam/markdown-table-formatter)
[![GitHub contributors](https://img.shields.io/github/contributors/nvuillam/markdown-table-formatter.svg)](https://gitHub.com/nvuillam/markdown-table-formatter/graphs/contributors/)
[![GitHub stars](https://img.shields.io/github/stars/nvuillam/markdown-table-formatter?label=Star&maxAge=2592000)](https://GitHub.com/nvuillam/markdown-table-formatter/stargazers/)
[![License](https://img.shields.io/npm/l/markdown-table-formatter.svg)](https://github.com/nvuillam/markdown-table-formatter/blob/master/LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

Format markdown tables in files, using embedded [markdown-table-prettify](https://www.npmjs.com/package/markdown-table-prettify)

[![Banner](https://raw.githubusercontent.com/nvuillam/markdown-table-formatter/master/docs/assets/images/banner.jpg)](https://github.com/nvuillam/markdown-table-formatter#readme)

<!-- TABLE OF CONTENTS -->
## Table of Contents ##

- [Markdown table formatter](#Markdown-table-formatter)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
    - [Local](#local)
    - [Global](#global)
  - [Usage](#usage)
    - [Options](#options)
  - [Examples](#examples)
  - [Continuous Integration](#Continuous-Integration)
  - [Ignoring Code Blocks](#Ignoring-Code-Blocks)
  - [Contribute](#contribute)
  - [RELEASE NOTES](#RELEASE-NOTES)

## Installation

### Local

```shell
npm install markdown-table-formatter --save
```

---
<!-- Readme Navigation -->
[(Back to the Table of Contents)](#table-of-contents)

---

### Global

```shell
npm install markdown-table-formatter -g
```

---
<!-- Readme Navigation -->
[(Back to the Table of Contents)](#table-of-contents)

---

## Usage

```shell
markdown-table-formatter [OPTIONS] (file(s) or glob expression)
```

---
<!-- Readme Navigation -->
[(Back to the Table of Contents)](#table-of-contents)

---

### Options

| Parameter      | Description                       | Default value |
|----------------|-----------------------------------|---------------|
| -c<br/>--check | Check only, does not update files | `false`       |
| -p<br/>--columnpadding   | Override column padding number of spaces |
| -h<br/>--help    | Displays help                     | <!-- -->      |
| -v<br/>--version | Displays version                  | <!-- -->      |

---
<!-- Readme Navigation -->
[(Back to the Table of Contents)](#table-of-contents)

---

## Examples

Format all markdown files found within current directory

```shell
markdown-table-formatter
```

Format all markdown files found with a glob expression

```shell
markdown-table-formatter **/docs/*.md
```

Format markdown tables in a single file

```shell
markdown-table-formatter myfile.md
```

Format markdown tables in a multiple file

```shell
markdown-table-formatter myfile.md anotherFile.md andAnotherFile.md
```

Check if markdown table formatting is necessary in a single file

```shell
markdown-table-formatter --check myfile.md
```

Check if markdown table formatting is necessary in a multiple files

```shell
markdown-table-formatter --check myfile.md anotherFile.md andAnotherFile.md
```

You can see **more examples in** [**test methods**](https://github.com/nvuillam/markdown-table-formatter/blob/master/test/markdown-table-formatter.test.js)

---
<!-- Readme Navigation -->
[(Back to the Table of Contents)](#table-of-contents)

---

## Continuous Integration

You can automatically check markdown tables formatting and fix it using [MegaLinter](https://github.com/oxscurity/megalinter/), that embeds markdown-table-formatter out of the box

---
<!-- Readme Navigation -->
[(Back to the Table of Contents)](#table-of-contents)

---

## Ignoring Code Blocks

You may wish to ignore specific markdown content
especially when using with [Megalinter](https://github.com/oxsecurity/megalinter) or [terraform-docs](https://github.com/terraform-docs/terraform-docs)

to achieve this, place `<!-- markdown-table-prettify-ignore-start -->` before any content you wish to be ignored
and `<!-- markdown-table-prettify-ignore-end -->` after tge content you wish to ignore to resume formatting.

---
<!-- Readme Navigation -->
[(Back to the Table of Contents)](#table-of-contents)

---

## CONTRIBUTE

Contributions are very welcome !

Please follow [Contribution instructions](https://github.com/nvuillam/markdown-table-formatter/blob/master/CONTRIBUTING.md)

---
<!-- Readme Navigation -->
[(Back to the Table of Contents)](#table-of-contents)

---

## RELEASE NOTES

## [1.0.2] 2021-01-19

- Fix code coverage

## [1.0.1] 2021-01-13

- First working version :)

## [0.0.1] 2021-01-13

- Initial version

---
<!-- Readme Navigation -->
[(Back to the Table of Contents)](#table-of-contents)

---

____

See complete [CHANGELOG](https://github.com/nvuillam/markdown-table-formatter/blob/master/CHANGELOG.md)

---
<!-- Readme Navigation -->
[(Back to the Table of Contents)](#table-of-contents)

---
