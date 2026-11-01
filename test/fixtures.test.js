#! /usr/bin/env node
"use strict";
const { describe, it } = require("node:test");
const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { MarkdownTableFormatter } = require("../lib/index");
const { listFixtures } = require("./helpers/fixtures");

const fixtures = listFixtures();

function copyToTmp(sourceFile) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "mtf-fixture-"));
  const file = path.join(tmpDir, "file.md");
  fs.copyFileSync(sourceFile, file);
  return file;
}

describe("Golden fixtures", () => {
  it("should find fixtures with an expected.md file", () => {
    assert(fixtures.length > 50, `only ${fixtures.length} fixtures found`);
    const missing = fixtures
      .filter((fixture) => fixture.expected === null)
      .map((fixture) => fixture.name);
    assert.deepStrictEqual(
      missing,
      [],
      "run node test/scripts/generate-fixtures.js",
    );
  });

  for (const fixture of fixtures) {
    describe(fixture.name, () => {
      const inputFile = path.join(fixture.dir, "input.md");
      const expectedFile = path.join(fixture.dir, "expected.md");
      const needsFormatting = fixture.input !== fixture.expected;

      it("formats the text into expected.md", () => {
        const actual = MarkdownTableFormatter.formatText(
          fixture.input,
          fixture.options,
        );
        assert.strictEqual(actual, fixture.expected);
      });

      it("is idempotent (expected.md stays unchanged)", () => {
        const actual = MarkdownTableFormatter.formatText(
          fixture.expected,
          fixture.options,
        );
        assert.strictEqual(actual, fixture.expected);
      });

      it("rewrites the file with the exact expected bytes", async () => {
        const file = copyToTmp(inputFile);
        const res = await new MarkdownTableFormatter({}).run(
          [file],
          fixture.options,
        );
        assert.strictEqual(res.status, 0);
        assert.deepStrictEqual(
          fs.readFileSync(file),
          fs.readFileSync(expectedFile),
        );
        assert.deepStrictEqual(res.updates, needsFormatting ? [file] : []);
        assert.deepStrictEqual(res.fileResults, [
          {
            file,
            updated: needsFormatting,
            before: needsFormatting ? fixture.input : null,
            after: needsFormatting ? fixture.expected : null,
          },
        ]);
      });

      it(`check mode returns ${needsFormatting ? 1 : 0} on input.md and leaves it untouched`, async () => {
        const file = copyToTmp(inputFile);
        const res = await new MarkdownTableFormatter({ check: true }).run(
          [file],
          fixture.options,
        );
        assert.strictEqual(res.status, needsFormatting ? 1 : 0);
        assert.deepStrictEqual(
          fs.readFileSync(file),
          fs.readFileSync(inputFile),
        );
      });

      it("check mode returns 0 on expected.md", async () => {
        const file = copyToTmp(expectedFile);
        const res = await new MarkdownTableFormatter({ check: true }).run(
          [file],
          fixture.options,
        );
        assert.strictEqual(res.status, 0);
        assert.deepStrictEqual(res.updates, []);
      });
    });
  }
});
