#! /usr/bin/env node
"use strict";
const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");
const { FIXTURES_DIR } = require("./helpers/fixtures");

const CLI = path.resolve(__dirname, "..", "lib", "index.js");
const VERSION = require("../package.json").version;
const BAD = path.join(FIXTURES_DIR, "align-mixed");
const GOOD = path.join(FIXTURES_DIR, "already-formatted");

function runCli(args, { cwd = process.cwd() } = {}) {
  const env = { ...process.env };
  delete env.npm_package_version;
  delete env.DEBUG;
  const res = spawnSync(process.execPath, [CLI, ...args], { cwd, env, encoding: "utf8" });
  return { status: res.status, stdout: res.stdout, stderr: res.stderr };
}

function tmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), "mtf-cli-"));
}

// Copies a fixture file into dir/relativePath and returns the absolute path
function copyFixture(fixtureDir, fileName, dir, relativePath) {
  const target = path.join(dir, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(path.join(fixtureDir, fileName), target);
  return target;
}

const read = (file) => fs.readFileSync(file, "utf8");

describe("CLI (black-box)", () => {
  describe("help and version", () => {
    for (const flag of ["--help", "-h"]) {
      it(`${flag} prints usage and all options`, () => {
        const res = runCli([flag]);
        assert.strictEqual(res.status, 0);
        assert(res.stdout.includes("markdown-table-formatter [options]"), res.stdout);
        for (const option of ["--check", "--columnpadding", "--help", "--version", "--verbose"]) {
          assert(res.stdout.includes(option), `help should list ${option}:\n${res.stdout}`);
        }
      });
    }

    for (const flag of ["--version", "-v"]) {
      it(`${flag} prints the package version`, () => {
        const res = runCli([flag]);
        assert.strictEqual(res.status, 0);
        assert.strictEqual(res.stdout.trim(), `markdown-table-formatter version ${VERSION}`);
      });
    }
  });

  describe("check mode", () => {
    for (const flag of ["--check", "-c"]) {
      it(`${flag} exits 1 and lists files to format, without changing them`, () => {
        const dir = tmpDir();
        const file = copyFixture(BAD, "input.md", dir, "bad.md");
        const res = runCli([flag, file]);
        assert.strictEqual(res.status, 1, res.stdout + res.stderr);
        assert(res.stdout.includes(`1 files contain markdown tables to format:\n- ${file}`), res.stdout);
        assert.strictEqual(read(file), read(path.join(BAD, "input.md")));
      });
    }

    it("exits 0 on a well formatted file", () => {
      const dir = tmpDir();
      const file = copyFixture(GOOD, "input.md", dir, "good.md");
      const res = runCli(["--check", file]);
      assert.strictEqual(res.status, 0, res.stdout + res.stderr);
      assert(res.stdout.includes("No markdown table formatting has been applied."), res.stdout);
    });

    it("lists only the files that need formatting", () => {
      const dir = tmpDir();
      const good = copyFixture(GOOD, "input.md", dir, "good.md");
      const bad = copyFixture(BAD, "input.md", dir, "bad.md");
      const res = runCli(["--check", good, bad]);
      assert.strictEqual(res.status, 1);
      assert(res.stdout.includes(`1 files contain markdown tables to format:\n- ${bad}`), res.stdout);
      assert(!res.stdout.includes(good), res.stdout);
    });
  });

  describe("format mode", () => {
    it("formats a single file and reports it", () => {
      const dir = tmpDir();
      const file = copyFixture(BAD, "input.md", dir, "bad.md");
      const res = runCli([file]);
      assert.strictEqual(res.status, 0, res.stdout + res.stderr);
      assert.strictEqual(read(file), read(path.join(BAD, "expected.md")));
      assert(res.stdout.includes(`Formatted markdown tables in 1 files:\n- ${file}`), res.stdout);
    });

    it("formats multiple files", () => {
      const dir = tmpDir();
      const file1 = copyFixture(BAD, "input.md", dir, "a.md");
      const file2 = copyFixture(BAD, "input.md", dir, "sub/b.md");
      const res = runCli([file1, file2]);
      assert.strictEqual(res.status, 0);
      assert.strictEqual(read(file1), read(path.join(BAD, "expected.md")));
      assert.strictEqual(read(file2), read(path.join(BAD, "expected.md")));
      assert(res.stdout.includes("Formatted markdown tables in 2 files:"), res.stdout);
    });

    it("reports nothing to do on a well formatted file", () => {
      const dir = tmpDir();
      const file = copyFixture(GOOD, "input.md", dir, "good.md");
      const res = runCli([file]);
      assert.strictEqual(res.status, 0);
      assert(res.stdout.includes("No markdown table formatting has been applied."), res.stdout);
    });

    for (const [args, fixtureName] of [
      [["--columnpadding", "1"], "padding-1"],
      [["-p", "3"], "padding-3"],
    ]) {
      it(`${args.join(" ")} applies column padding`, () => {
        const fixtureDir = path.join(FIXTURES_DIR, fixtureName);
        const dir = tmpDir();
        const file = copyFixture(fixtureDir, "input.md", dir, "file.md");
        const res = runCli([...args, file]);
        assert.strictEqual(res.status, 0, res.stdout + res.stderr);
        assert.strictEqual(read(file), read(path.join(fixtureDir, "expected.md")));
      });
    }

    for (const flag of ["--verbose", "-z"]) {
      it(`${flag} lists analyzed and updated files`, () => {
        const dir = tmpDir();
        const file = copyFixture(BAD, "input.md", dir, "bad.md");
        const res = runCli([flag, file]);
        assert.strictEqual(res.status, 0);
        assert(res.stdout.includes(`Markdown files to analyze:\n- ${file}`), res.stdout);
        assert(res.stdout.includes(`- Updated file ${file}`), res.stdout);
      });
    }
  });

  describe("file discovery", () => {
    it("formats all **/*.md files under the current directory when no file is given", () => {
      const dir = tmpDir();
      const file1 = copyFixture(BAD, "input.md", dir, "a.md");
      const file2 = copyFixture(BAD, "input.md", dir, "x/y/b.md");
      const other = copyFixture(BAD, "input.md", dir, "c.txt");
      const res = runCli([], { cwd: dir });
      assert.strictEqual(res.status, 0, res.stdout + res.stderr);
      assert.strictEqual(read(file1), read(path.join(BAD, "expected.md")));
      assert.strictEqual(read(file2), read(path.join(BAD, "expected.md")));
      assert.strictEqual(read(other), read(path.join(BAD, "input.md")));
    });

    it("uses a glob expression given as single argument", () => {
      const dir = tmpDir();
      const matched = copyFixture(BAD, "input.md", dir, "docs/bad_1.md");
      const notMatched = copyFixture(BAD, "input.md", dir, "docs/other.md");
      const res = runCli(["**/*bad*.md"], { cwd: dir });
      assert.strictEqual(res.status, 0, res.stdout + res.stderr);
      assert.strictEqual(read(matched), read(path.join(BAD, "expected.md")));
      assert.strictEqual(read(notMatched), read(path.join(BAD, "input.md")));
    });

    it("reports nothing to do when no markdown file is found", () => {
      const res = runCli([], { cwd: tmpDir() });
      assert.strictEqual(res.status, 0);
      assert(res.stdout.includes("No markdown table formatting has been applied."), res.stdout);
    });
  });

  describe("errors", () => {
    it("fails with the file path when a file does not exist", () => {
      const missing = path.join(tmpDir(), "missing.md");
      const res = runCli([missing]);
      assert.notStrictEqual(res.status, 0);
      assert(res.stderr.includes("missing.md"), res.stderr);
    });

    it("fails on an unknown option", () => {
      const res = runCli(["--unknown-option"]);
      assert.notStrictEqual(res.status, 0);
      assert(res.stderr.includes("unknown-option"), res.stderr);
    });

    it("fails on a non numeric column padding", () => {
      const res = runCli(["--columnpadding", "abc", path.join(GOOD, "input.md")]);
      assert.notStrictEqual(res.status, 0);
    });

    it("fails when --check and --help are combined", () => {
      const res = runCli(["--check", "--help"]);
      assert.notStrictEqual(res.status, 0);
    });
  });
});
