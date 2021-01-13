<!-- markdownlint-disable MD033 -->
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

Format markdown tables in files, using embeddeded [markdown-table-prettify](https://www.npmjs.com/package/markdown-table-prettify)

## Installation

### Local

```shell
npm install markdown-table-formatter --save
```

### Global

```shell
npm install markdown-table-formatter -g
```

## Usage

```shell
markdown-table-formatter [OPTIONS] (file(s))
```

### Options

| Parameter          | Description                         | Default value   |
|--------------------|--------------------------------|---------------|
| -c<br/>--check            | Check only, does not update files       |`false`                 |
| -h<br/>--help         | Displays help                   | <!-- --> |
| -v<br/>--version         | Displays version                   | <!-- --> |

## Examples

Call a class located in classpath

```javascript
const java = new MarkdownTableFormatter({
    classPath: 'test/java/dist',
    mainClass: 'com.nvuillam.MarkdownTableFormatter.MarkdownTableFormatterTester'
});
const { status, stdout, stderr } = await java.run();
```

You can see **more examples in** [**test methods**](https://github.com/nvuillam/markdown-table-formatter/blob/master/test/markdown-table-formatter.test.js)

## CONTRIBUTE

Contributions are very welcome !

Please follow [Contribution instructions](https://github.com/nvuillam/markdown-table-formatter/blob/master/CONTRIBUTING.md)

## RELEASE NOTES

### [1.0.0] 2020-08-10

- Initial version

____

See complete [CHANGELOG](https://github.com/nvuillam/markdown-table-formatter/blob/master/CHANGELOG.md)
