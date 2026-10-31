"use strict";
const fs = require("fs");
const path = require("path");

const FIXTURES_DIR = path.join(__dirname, "..", "fixtures");

/**
 * Lists golden fixtures: test/fixtures/<name>/{input.md, expected.md, options.json?}
 * options.json may contain "columnpadding" and "quirk" (why the old engine output is wrong).
 */
function listFixtures() {
  return fs
    .readdirSync(FIXTURES_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const dir = path.join(FIXTURES_DIR, entry.name);
      const optionsFile = path.join(dir, "options.json");
      const expectedFile = path.join(dir, "expected.md");
      const options = fs.existsSync(optionsFile) ? JSON.parse(fs.readFileSync(optionsFile, "utf8")) : {};
      return {
        name: entry.name,
        dir,
        options,
        input: fs.readFileSync(path.join(dir, "input.md"), "utf8"),
        expected: fs.existsSync(expectedFile) ? fs.readFileSync(expectedFile, "utf8") : null,
      };
    });
}

module.exports = { FIXTURES_DIR, listFixtures };
