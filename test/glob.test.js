#! /usr/bin/env node
"use strict";
const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { globSync } = require("../lib/glob");

describe("File discovery (glob)", () => {
  let dir;
  const files = [
    "README.md",
    "docs/a.md",
    "docs/bad_1.md",
    "docs/sub/d1.md",
    "docs/sub/d2.md",
    "docs/notes.txt",
    ".hidden/h.md",
    ".dot.md",
    "node_modules/pkg/n.md",
    "x/node_modules/m.md",
    "x/.git/g.md",
  ];
  const native = (list) => list.map((file) => path.join(...file.split("/")));

  before(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "mtf-glob-"));
    for (const file of files) {
      fs.mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
      fs.writeFileSync(path.join(dir, file), "x");
    }
  });

  const cases = [
    ["**/*.md", ["README.md", "docs/a.md", "docs/bad_1.md", "docs/sub/d1.md", "docs/sub/d2.md"]],
    ["*.md", ["README.md"]],
    ["docs/*.md", ["docs/a.md", "docs/bad_1.md"]],
    ["./docs/*.md", ["docs/a.md", "docs/bad_1.md"]],
    ["**/*bad*.md", ["docs/bad_1.md"]],
    ["docs/sub/d[12].md", ["docs/sub/d1.md", "docs/sub/d2.md"]],
    ["docs/sub/d[!1].md", ["docs/sub/d2.md"]],
    ["docs/{a,bad_1}.md", ["docs/a.md", "docs/bad_1.md"]],
    ["docs/**/*.{md,txt}", ["docs/a.md", "docs/bad_1.md", "docs/notes.txt", "docs/sub/d1.md", "docs/sub/d2.md"]],
    ["docs/?.md", ["docs/a.md"]],
    ["node_modules/**/*.md", ["node_modules/pkg/n.md"]],
    [".hidden/*.md", [".hidden/h.md"]],
    ["nothing/**/*.md", []],
  ];
  for (const [pattern, expected] of cases) {
    it(`${pattern} (skips dot files, node_modules and .git unless named)`, () => {
      assert.deepStrictEqual(globSync(pattern, dir), native(expected).sort());
    });
  }

  it("supports absolute patterns", () => {
    const pattern = dir.split(path.sep).join("/") + "/docs/*.md";
    assert.deepStrictEqual(globSync(pattern), [path.join(dir, "docs", "a.md"), path.join(dir, "docs", "bad_1.md")]);
  });
});
