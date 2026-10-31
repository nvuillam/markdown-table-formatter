#! /usr/bin/env node
"use strict";
/**
 * Writes test/fixtures/<case>/expected.md from input.md using the current engine.
 *
 * Usage:
 *   node test/scripts/generate-fixtures.js            # only fixtures without expected.md
 *   node test/scripts/generate-fixtures.js --force    # regenerate all fixtures
 *   node test/scripts/generate-fixtures.js case1 case2 # regenerate the listed fixtures
 *
 * Always review the git diff of expected.md files after running this script.
 */
const fs = require("fs");
const path = require("path");
const { MarkdownTableFormatter } = require("../../lib/markdown-table-formatter");
const { listFixtures } = require("../helpers/fixtures");

const args = process.argv.slice(2);
const force = args.includes("--force");
const only = args.filter((arg) => !arg.startsWith("--"));

let written = 0;
for (const fixture of listFixtures()) {
  const expectedFile = path.join(fixture.dir, "expected.md");
  const selected = only.length > 0 ? only.includes(fixture.name) : force || !fs.existsSync(expectedFile);
  if (!selected) {
    continue;
  }
  const expected = MarkdownTableFormatter.formatText(fixture.input, fixture.options);
  fs.writeFileSync(expectedFile, expected);
  written++;
  console.log(`- ${fixture.name}${expected === fixture.input ? " (unchanged)" : ""}`);
}
console.log(`${written} expected.md file(s) written`);
