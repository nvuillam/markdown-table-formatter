#! /usr/bin/env node
const { MarkdownTableFormatter } = require("./markdown-table-formatter");
const optionsDefinition = require("./options");
const fs = require("fs");
const path = require("path");

const EXCLUDED_DIRS = new Set(["node_modules", ".git"]);

/**
 * Lists files matching a glob pattern, skipping node_modules and .git folders
 * @param {string} pattern - Glob pattern
 * @return {string[]} - Sorted file paths
 */
function findFiles(pattern) {
  const exclude = (entry) => EXCLUDED_DIRS.has(path.basename(typeof entry === "string" ? entry : entry.name));
  return fs
    .globSync(pattern, { exclude })
    .filter((file) => fs.statSync(file).isFile())
    .sort();
}

class MarkdownTableFormatterCli {
  "use strict";

  options = {};

  async run(args) {
    this.options = optionsDefinition.parse(args);

    // Show version
    if (this.options.version) {
      const version = require("../package.json").version;
      const message = `markdown-table-formatter version ${version}`;
      console.log(message);
      return { stdout: message };
    }

    // Show help ( index or for an options)
    if (this.options.help) {
      let helpContent = "";
      if (this.options._.length) {
        helpContent = optionsDefinition.generateHelpForOption(
          this.options._[0],
        );
      } else {
        helpContent = optionsDefinition.generateHelp();
      }
      console.info(helpContent);
      return { stdout: helpContent };
    }

    // Processing formatting
    const formatter = new MarkdownTableFormatter(this.options);
    let files = this.options._;
    if (files.length === 0) {
      // use default glob expression **/*.md
      files = findFiles("**/*.md");
    } else if (files.length === 1 && files[0].includes("*")) {
      // use sent glob expression
      files = findFiles(files[0]);
    }
    const { status, updates } = await formatter.run(files, this.options);
    // Manage result
    if (status === 0 && updates.length === 0) {
      console.log("No markdown table formatting has been applied.");
    } else if (status === 0 && updates.length > 0) {
      console.log(
        `Formatted markdown tables in ${
          updates.length
        } files:\n- ${updates.join("\n- ")}`,
      );
    } else if (status === 1) {
      console.log(
        `${
          updates.length
        } files contain markdown tables to format:\n- ${updates.join("\n- ")}`,
      );
    }
    process.exitCode = status;
    return { status, updates };
  }
}

module.exports = { MarkdownTableFormatterCli, findFiles };
