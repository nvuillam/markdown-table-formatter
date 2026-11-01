/**
 * @fileoverview Command line options parsing (same behavior and messages as optionator, without dependency)
 * @author Nicolas Vuillamy
 */

"use strict";

const PREPEND = "markdown-table-formatter [options]";

const OPTIONS = [
  {
    option: "check",
    alias: "c",
    type: "Boolean",
    description: "Check only (exits 1 if wrongly formatted markdown tables are found)",
  },
  {
    option: "columnpadding",
    alias: "p",
    type: "Int",
    description: "Override table columns padding number of spaces",
  },
  { option: "help", alias: "h", type: "Boolean", description: "Show help" },
  { option: "version", alias: "v", type: "Boolean", description: "Show version" },
  { option: "verbose", alias: "z", type: "Boolean", description: "Verbose mode" },
];

const MUTUALLY_EXCLUSIVE = [["check", "help", "version"]];

const byName = (name) => OPTIONS.find((opt) => opt.option === name || opt.alias === name);
const flag = (name) => (name.length === 1 ? `-${name}` : `--${name}`);
const label = (opt) => `-${opt.alias}, --${opt.option}${opt.type === "Boolean" ? "" : ` ${opt.type}`}`;

function levenshtein(a, b) {
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    for (let j = 1; j <= b.length; j++) {
      current[j] = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    previous = current;
  }
  return previous[b.length];
}

function invalidOption(name) {
  const candidates = OPTIONS.flatMap((opt) => [opt.option, opt.alias]);
  const closest = candidates.reduce((best, candidate) => (levenshtein(name, candidate) < levenshtein(name, best) ? candidate : best));
  return new Error(`Invalid option '${flag(name)}' - perhaps you meant '${flag(closest)}'?`);
}

function convert(opt, value) {
  if (opt.type === "Int") {
    if (value === undefined) {
      throw new Error(`Value for '${opt.option}' of type 'Int' required.`);
    }
    if (!/^\d+$/.test(value)) {
      throw new Error(`Invalid value for option '${opt.option}' - expected type Int, received value: ${value}.`);
    }
    return parseInt(value, 10);
  }
  if (value === undefined || value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
  throw new Error(`Invalid value for option '${opt.option}' - expected type Boolean, received value: ${value}.`);
}

/**
 * Parses command line arguments
 * @param {string[]} input - process.argv-like array (the first 2 items are ignored)
 * @return {object} - Option values, and positional arguments in `_`
 */
function parse(input) {
  const args = input.slice(2);
  const result = {};
  const positional = [];
  for (let i = 0; i < args.length; i++) {
    const arg = String(args[i]);
    if (arg === "--") {
      positional.push(...args.slice(i + 1));
      break;
    }
    if (arg.startsWith("--")) {
      const [rawName, ...valueParts] = arg.slice(2).split("=");
      let value = valueParts.length > 0 ? valueParts.join("=") : undefined;
      let opt = byName(rawName);
      if (!opt && rawName.startsWith("no-") && byName(rawName.slice(3))?.type === "Boolean" && value === undefined) {
        opt = byName(rawName.slice(3));
        value = "false";
      }
      if (!opt || opt.option !== rawName.replace(/^no-/, "")) {
        throw invalidOption(rawName);
      }
      if (opt.type !== "Boolean" && value === undefined) {
        value = args[++i];
      }
      result[opt.option] = convert(opt, value);
    } else if (arg.startsWith("-") && arg.length > 1) {
      const names = arg.slice(1).split("");
      names.forEach((name, index) => {
        const opt = byName(name);
        if (!opt || opt.alias !== name) {
          throw /\d/.test(name) ? new Error(`No -NUM option defined.`) : invalidOption(name);
        }
        if (opt.type !== "Boolean") {
          if (index !== names.length - 1) {
            throw new Error(`Can't set argument '${name}' when not last flag in a group of short flags.`);
          }
          result[opt.option] = convert(opt, args[++i]);
        } else {
          result[opt.option] = true;
        }
      });
    } else {
      positional.push(arg);
    }
  }
  for (const group of MUTUALLY_EXCLUSIVE) {
    const used = group.filter((name) => name in result);
    if (used.length > 1) {
      throw new Error(
        `The options ${used.map((name) => `--${name}`).join(" and ")} are mutually exclusive - you cannot use them at the same time.`,
      );
    }
  }
  result._ = positional;
  return result;
}

function generateHelp() {
  const width = Math.max(...OPTIONS.map((opt) => label(opt).length));
  const lines = OPTIONS.map((opt) => `  ${label(opt).padEnd(width)}  ${opt.description}`);
  return `${PREPEND}\n\n${lines.join("\n")}`;
}

function generateHelpForOption(name) {
  const opt = byName(name);
  if (!opt) {
    return invalidOption(name).message;
  }
  const title = label(opt);
  return `${title}\n${"=".repeat(title.length)}\ndescription: ${opt.description}.`;
}

module.exports = { parse, generateHelp, generateHelpForOption };
