#! /usr/bin/env node
"use strict";
const { describe, it } = require("node:test");
const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { MarkdownTableFormatter } = require("../lib/index");
const { formatTables } = require("../lib/engine");
const { findFiles } = require("../lib/cli");

const BAD = "| a | bbbb |\n|-|-|\n| ccc | d |\n";
const GOOD = formatTables(BAD);
const NO_TABLE = "# Title\n\nSome text without table\r\n";

// More files than parallel slots, with alternating contents
function createFiles(count) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "mtf-parallel-"));
  const files = [];
  for (let i = 0; i < count; i++) {
    const file = path.join(dir, `f${String(i).padStart(3, "0")}.md`);
    fs.writeFileSync(file, i % 3 === 0 ? BAD : i % 3 === 1 ? GOOD : NO_TABLE);
    files.push(file);
  }
  return { dir, files };
}

describe("Parallel run", () => {
  it("returns results and updates in the order of the files", async () => {
    const { files } = createFiles(100);
    const res = await new MarkdownTableFormatter({}).run(files);
    assert.deepStrictEqual(
      res.fileResults.map((result) => result.file),
      files,
    );
    const expectedUpdates = files.filter((_, i) => i % 3 === 0);
    assert.deepStrictEqual(res.updates, expectedUpdates);
    for (const [i, file] of files.entries()) {
      const expected = i % 3 === 2 ? NO_TABLE : GOOD;
      assert.strictEqual(fs.readFileSync(file, "utf8"), expected);
    }
  });

  it("formats a file listed several times without corrupting it", async () => {
    const { files } = createFiles(1);
    const file = files[0];
    const relative = path.relative(process.cwd(), file);
    const res = await new MarkdownTableFormatter({}).run([
      file,
      relative,
      file,
    ]);
    assert.strictEqual(fs.readFileSync(file, "utf8"), GOOD);
    assert.deepStrictEqual(
      res.fileResults.map((result) => result.updated),
      [true, false, false],
    );
  });

  it("rejects when a file is missing", async () => {
    const { files } = createFiles(40);
    files.splice(10, 0, path.join(path.dirname(files[0]), "missing.md"));
    await assert.rejects(new MarkdownTableFormatter({}).run(files), {
      code: "ENOENT",
    });
  });

  it("returns null contents when keepContents is false", async () => {
    const { files } = createFiles(3);
    const res = await new MarkdownTableFormatter({ check: true }).run(files, {
      keepContents: false,
    });
    assert.strictEqual(res.status, 1);
    assert.deepStrictEqual(res.fileResults[0], {
      file: files[0],
      updated: true,
      before: null,
      after: null,
    });
  });

  it("returns texts without pipe unchanged", () => {
    for (const text of ["", "\n", NO_TABLE, "a\r\n\r\nb", "\uD800 lone"]) {
      assert.strictEqual(formatTables(text), text);
    }
  });

  it("finds files through symbolic links", (t) => {
    const { dir } = createFiles(1);
    fs.mkdirSync(path.join(dir, "sub"));
    try {
      fs.symlinkSync(path.join(dir, "f000.md"), path.join(dir, "link.md"));
      fs.symlinkSync(path.join(dir, "sub"), path.join(dir, "folder-link.md"));
    } catch {
      t.skip("symbolic links not allowed on this machine");
      return;
    }
    const previous = process.cwd();
    process.chdir(dir);
    try {
      assert.deepStrictEqual(findFiles("*.md"), ["f000.md", "link.md"]);
    } finally {
      process.chdir(previous);
    }
  });
});
