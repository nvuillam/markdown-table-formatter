#! /usr/bin/env node
"use strict";
// Builds the Rust engine to WebAssembly and copies it to lib/wasm/
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const crateDir = path.join(root, "rust");
const target = "wasm32-unknown-unknown";

execFileSync("cargo", ["build", "--release", "--target", target], {
  cwd: crateDir,
  stdio: "inherit",
});

const built = path.join(
  crateDir,
  "target",
  target,
  "release",
  "markdown_table_formatter.wasm",
);
const outDir = path.join(root, "lib", "wasm");
fs.mkdirSync(outDir, { recursive: true });
fs.copyFileSync(built, path.join(outDir, "markdown_table_formatter.wasm"));
console.log(
  `lib/wasm/markdown_table_formatter.wasm (${fs.statSync(built).size} bytes)`,
);
