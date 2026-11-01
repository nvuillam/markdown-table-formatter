#! /usr/bin/env node
"use strict";
// Builds the Rust engine to WebAssembly and copies it to lib/wasm/
//
// lib/wasm/markdown_table_formatter.wasm is committed, so that installs from git
// (pre-commit hook, npm install github:...) work without a Rust toolchain.
// The build is reproducible: paths embedded in the binary do not depend on the
// machine, so CI can check that the committed file matches the Rust sources.
//
// Usage:
//   node scripts/build-wasm.js              # build
//   node scripts/build-wasm.js --if-needed  # build only if the file is missing (npm prepack)
const { execFileSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const root = path.join(__dirname, "..");
const crateDir = path.join(root, "rust");
const target = "wasm32-unknown-unknown";
const output = path.join(root, "lib", "wasm", "markdown_table_formatter.wasm");

if (process.argv.includes("--if-needed") && fs.existsSync(output)) {
  console.log("lib/wasm/markdown_table_formatter.wasm already built");
  process.exit(0);
}

// Replace machine-specific paths embedded in panic locations by fixed ones
const cargoHome = process.env.CARGO_HOME || path.join(os.homedir(), ".cargo");
const registrySrc = path.join(cargoHome, "registry", "src");
const remaps = [
  [registrySrc, "/cargo/registry/src"],
  [crateDir, "/crate"],
];
if (path.sep === "\\") {
  // On Windows, paths also contain backslashes after the remapped prefix:
  // remap every source directory to its forward-slash form (the longest prefix applies last)
  const directories = (dir, relative) => [
    [dir, relative],
    ...fs
      .readdirSync(dir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .flatMap((entry) =>
        directories(path.join(dir, entry.name), `${relative}/${entry.name}`),
      ),
  ];
  const sourceDirs = [...directories(path.join(crateDir, "src"), "src")];
  if (fs.existsSync(registrySrc)) {
    for (const index of fs.readdirSync(registrySrc)) {
      for (const crate of lockedCrates()) {
        const crateSrc = path.join(registrySrc, index, crate);
        if (fs.existsSync(crateSrc)) {
          sourceDirs.push(
            ...directories(crateSrc, `/cargo/registry/src/${index}/${crate}`),
          );
        }
      }
    }
  }
  sourceDirs.sort((a, b) => a[0].length - b[0].length);
  remaps.push(...sourceDirs.map(([dir, to]) => [`${dir}\\`, `${to}/`]));
  // Relative paths of the crate sources (src\lib.rs)
  for (const [dir, to] of directories(path.join(crateDir, "src"), "src")) {
    remaps.push([`${path.relative(crateDir, dir)}\\`, `${to}/`]);
  }
}

/** Registry dependencies of rust/Cargo.lock, as "<name>-<version>" */
function lockedCrates() {
  const lock = fs.readFileSync(path.join(crateDir, "Cargo.lock"), "utf8");
  return [
    ...lock.matchAll(
      /name = "([^"]+)"\r?\nversion = "([^"]+)"\r?\nsource = "registry/g,
    ),
  ].map((match) => `${match[1]}-${match[2]}`);
}
const rustflags = remaps.map(
  ([from, to]) => `--remap-path-prefix=${from}=${to}`,
);

execFileSync("cargo", ["build", "--release", "--locked", "--target", target], {
  cwd: crateDir,
  stdio: "inherit",
  // Unit separator: paths may contain spaces
  env: { ...process.env, CARGO_ENCODED_RUSTFLAGS: rustflags.join("\x1f") },
});

const built = path.join(
  crateDir,
  "target",
  target,
  "release",
  "markdown_table_formatter.wasm",
);
fs.mkdirSync(path.dirname(output), { recursive: true });
// Copy the content only: the cargo output is executable on Linux, the committed file is not
fs.writeFileSync(output, fs.readFileSync(built), { mode: 0o644 });
fs.chmodSync(output, 0o644);
console.log(
  `lib/wasm/markdown_table_formatter.wasm (${fs.statSync(built).size} bytes)`,
);
