#! /usr/bin/env node
"use strict";

const { MarkdownTableFormatter } = require("./markdown-table-formatter");
const { MarkdownTableFormatterCli } = require("./cli");

// Run only if called by script
const runningAsScript = !module.parent;

// Run asynchronously to use the returned status for process.exit
if (runningAsScript) {
  (async () => {
    try {
      await new MarkdownTableFormatterCli().run(process.argv);
    } catch (error) {
      console.error(`markdown-table-formatter: ${error.message}`);
      process.exitCode = 1;
    }
  })();
}

module.exports = { MarkdownTableFormatter, MarkdownTableFormatterCli };
