#! /usr/bin/env node
"use strict";
// Explains why two builds of the WebAssembly engine differ (used by CI when the committed file is outdated)
// Usage: node scripts/compare-wasm.js <committed.wasm> <built.wasm>
const fs = require("fs");

const [a, b] = process.argv.slice(2).map((file) => fs.readFileSync(file));

function printableStrings(buffer) {
  const strings = new Set();
  let current = "";
  for (const byte of buffer) {
    if (byte >= 32 && byte < 127) {
      current += String.fromCharCode(byte);
    } else {
      if (current.length >= 6) {
        strings.add(current);
      }
      current = "";
    }
  }
  return strings;
}

let firstDifference = -1;
for (let i = 0; i < Math.max(a.length, b.length); i++) {
  if (a[i] !== b[i]) {
    firstDifference = i;
    break;
  }
}
let differentBytes = 0;
for (let i = 0; i < Math.min(a.length, b.length); i++) {
  if (a[i] !== b[i]) {
    differentBytes++;
  }
}
console.log(
  `sizes: ${a.length} / ${b.length}, first difference at byte ${firstDifference}, ${differentBytes} different bytes`,
);
const stringsA = printableStrings(a);
const stringsB = printableStrings(b);
console.log(
  "only in committed file:",
  [...stringsA].filter((s) => !stringsB.has(s)),
);
console.log(
  "only in built file:",
  [...stringsB].filter((s) => !stringsA.has(s)),
);
