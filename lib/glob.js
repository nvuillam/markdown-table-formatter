"use strict";
// Minimal glob file search (replaces the glob package): supports **, *, ?, [abc], [!abc] and {a,b}.
// Like glob, wildcards do not match names starting with a dot.
// node_modules and .git folders are only searched when named explicitly in the pattern.
const fs = require("fs");
const path = require("path");

const SKIPPED_DIRS = new Set(["node_modules", ".git"]);
const MAGIC = /[*?[{]/;

/** Expands braces: "a/{b,c}.md" => ["a/b.md", "a/c.md"] */
function expandBraces(pattern) {
  const start = pattern.indexOf("{");
  if (start === -1) {
    return [pattern];
  }
  let depth = 0;
  const parts = [];
  let partStart = start + 1;
  for (let i = start; i < pattern.length; i++) {
    const char = pattern[i];
    if (char === "{") {
      depth++;
    } else if (char === "}" && --depth === 0) {
      parts.push(pattern.slice(partStart, i));
      const before = pattern.slice(0, start);
      const after = pattern.slice(i + 1);
      return parts.flatMap((part) => expandBraces(before + part + after));
    } else if (char === "," && depth === 1) {
      parts.push(pattern.slice(partStart, i));
      partStart = i + 1;
    }
  }
  return [pattern]; // unbalanced braces: literal
}

/** Converts one path segment pattern (without braces) to a RegExp */
function segmentRegExp(segment) {
  let source = "";
  for (let i = 0; i < segment.length; i++) {
    const char = segment[i];
    if (char === "*") {
      source += "[^/]*";
    } else if (char === "?") {
      source += "[^/]";
    } else if (char === "[") {
      const end = segment.indexOf("]", i + 2);
      if (end === -1) {
        source += "\\[";
      } else {
        let content = segment.slice(i + 1, end).replace(/\\/g, "\\\\");
        if (content.startsWith("!")) {
          content = "^" + content.slice(1);
        }
        source += `[${content}]`;
        i = end;
      }
    } else {
      source += char.replace(/[.+^${}()|\\]/g, "\\$&");
    }
  }
  const dotAllowed = segment.startsWith(".");
  return { regExp: new RegExp(`^${source}$`, process.platform === "win32" ? "i" : ""), dotAllowed, literal: !MAGIC.test(segment) };
}

function readDir(dir) {
  try {
    return fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return [];
  }
}

function isDirectory(dir, entry) {
  if (entry.isSymbolicLink()) {
    try {
      return fs.statSync(path.join(dir, entry.name)).isDirectory();
    } catch {
      return false;
    }
  }
  return entry.isDirectory();
}

function walk(dir, relative, segments, results) {
  if (segments.length === 0) {
    return;
  }
  const [segment, ...rest] = segments;
  if (segment === "**") {
    walk(dir, relative, rest, results);
    for (const entry of readDir(dir)) {
      if (entry.name.startsWith(".") || SKIPPED_DIRS.has(entry.name) || entry.isSymbolicLink() || !entry.isDirectory()) {
        continue;
      }
      walk(path.join(dir, entry.name), path.join(relative, entry.name), segments, results);
    }
    return;
  }
  const matcher = segmentRegExp(segment);
  for (const entry of readDir(dir)) {
    const name = entry.name;
    if (!matcher.regExp.test(name) || (name.startsWith(".") && !matcher.dotAllowed)) {
      continue;
    }
    const directory = isDirectory(dir, entry);
    if (rest.length === 0) {
      if (!directory) {
        results.add(path.join(relative, name));
      }
    } else if (directory && (matcher.literal || !SKIPPED_DIRS.has(name))) {
      walk(path.join(dir, name), path.join(relative, name), rest, results);
    }
  }
}

/**
 * Lists files matching a glob pattern
 * @param {string} pattern - Glob pattern, relative to cwd or absolute
 * @param {string} [cwd] - Base directory of relative patterns
 * @return {string[]} - Sorted file paths (relative when the pattern is relative)
 */
function globSync(pattern, cwd = process.cwd()) {
  const results = new Set();
  for (const expanded of expandBraces(pattern.replace(/\\/g, "/"))) {
    const segments = expanded.split("/");
    // Leading segments without wildcards form the base directory
    let baseCount = 0;
    while (baseCount < segments.length - 1 && !MAGIC.test(segments[baseCount])) {
      baseCount++;
    }
    const base = segments.slice(0, baseCount).join("/");
    const isAbsolute = path.isAbsolute(expanded) || /^[a-zA-Z]:/.test(expanded);
    const baseDir = isAbsolute ? base || "/" : path.join(cwd, base);
    const prefix = isAbsolute ? path.normalize(base || "/") : base ? path.normalize(base) : "";
    const rest = segments.slice(baseCount).filter((segment, i, all) => segment !== "" || i === all.length - 1);
    walk(baseDir, prefix, rest, results);
  }
  return [...results].sort();
}

module.exports = { globSync };
