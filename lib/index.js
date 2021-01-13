#! /usr/bin/env node
"use strict";

const { MarkdownTableFormatter } = require("./markdown-table-formatter");
const { MarkdownTableFormatterCli } = require("./cli");

module.exports = { MarkdownTableFormatter, MarkdownTableFormatterCli };
