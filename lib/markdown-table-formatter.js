#! /usr/bin/env node
const fs = require("fs/promises");
const path = require("path");
const debug = require("util").debuglog("markdown-table-formatter");
const { formatTables } = require("./engine");

// Number of files read and written at the same time
const MAX_PARALLEL_FILES = 32;

class MarkdownTableFormatter {
  "use strict";

  /**
   * Creates a MarkdownTableFormatter instance
   * @param {object} [opts] - Run options
   * @param {string} [opts.check] - Define if we check only
   */
  constructor(opts) {
    this.checkOnly = opts.check;
  }

  /**
   * Formats all markdown tables found in a markdown string
   * @param {string} markdownString - Markdown content
   * @param {object} [options] - Format options
   * @param {number} [options.columnpadding] - Number of spaces around cell values
   * @return {string} - Formatted markdown content
   */
  static formatText(markdownString, options = {}) {
    return formatTables(markdownString, options.columnpadding || 0);
  }

  /**
   * Formats one file
   * @param {string} file - File path
   * @param {object} options - Run options (see run)
   * @return {Promise<object>} - File result (file, updated, before, after)
   */
  async formatFile(file, options) {
    if (debug.enabled) {
      debug(`[file] ${file}`);
    }
    const markdownString = await fs.readFile(file, "utf8");
    if (debug.enabled) {
      debug(`[file before]\n${markdownString}`);
    }
    const markdownStringPrettified = MarkdownTableFormatter.formatText(
      markdownString,
      options,
    );
    const updated = markdownStringPrettified !== markdownString;
    // Update file if necessary
    if (updated && !this.checkOnly) {
      await fs.writeFile(file, markdownStringPrettified);
      debug(`[updated] ${file} with:\n${markdownStringPrettified}`);
      if (options.verbose) {
        console.info(`- Updated file ${file}`);
      }
    }
    const keepContents = updated && options.keepContents !== false;
    return {
      file,
      updated,
      before: keepContents ? markdownString : null,
      after: keepContents ? markdownStringPrettified : null,
    };
  }

  /**
   * Runs markdown table formatter
   * @param {string[]} [files] - List of files to format
   * @param {object} [options] - Run options
   * @param {number} [options.columnpadding] - Number of spaces around cell values
   * @param {boolean} [options.verbose] - Log analyzed and updated files
   * @param {boolean} [options.keepContents] - Set to false to return null before / after contents (saves memory)
   * @return {Promise<any>} - Command result (status, fileResults, updates)
   */
  async run(files, options = {}) {
    if (options.verbose) {
      console.info("Markdown files to analyze:");
      for (const file of files) {
        console.info(`- ${file}`);
      }
    }
    // Several files are read and written at the same time; results keep the order of files
    const fileResults = new Array(files.length);
    // A file listed twice is processed after its previous occurrence, never at the same time
    const pending = new Map();
    let next = 0;
    let failed = false;
    const worker = async () => {
      while (next < files.length && !failed) {
        const index = next++;
        const file = files[index];
        const key = path.resolve(file);
        const result = (pending.get(key) || Promise.resolve())
          .catch(() => {})
          .then(() => this.formatFile(file, options));
        pending.set(key, result);
        try {
          fileResults[index] = await result;
        } catch (error) {
          failed = true;
          throw error;
        }
      }
    };
    const workerCount = Math.min(MAX_PARALLEL_FILES, files.length);
    await Promise.all(Array.from({ length: workerCount }, worker));
    const updates = fileResults
      .filter((fileResult) => fileResult.updated)
      .map((fileResult) => fileResult.file);
    let status = 0;
    if (this.checkOnly && updates.length > 0) {
      status = 1;
    }
    const result = {
      status,
      fileResults,
      updates,
    };
    return result;
  }
}

module.exports = { MarkdownTableFormatter };
