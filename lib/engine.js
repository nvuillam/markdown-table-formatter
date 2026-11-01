"use strict";
// Loads the Rust formatting engine compiled to WebAssembly (lib/wasm, built by `npm run build:wasm`)
const fs = require("fs");
const path = require("path");

const WASM_FILE = path.join(__dirname, "wasm", "markdown_table_formatter.wasm");

let wasm = null;

function getWasm() {
  if (wasm === null) {
    if (!fs.existsSync(WASM_FILE)) {
      throw new Error(`${WASM_FILE} not found: run "npm run build:wasm"`);
    }
    const module = new WebAssembly.Module(fs.readFileSync(WASM_FILE));
    wasm = new WebAssembly.Instance(module, {}).exports;
  }
  return wasm;
}

/**
 * Formats all markdown tables found in a markdown string
 * @param {string} text - Markdown content
 * @param {number} [columnPadding] - Number of spaces around cell values
 * @return {string} - Formatted markdown content
 */
function formatTables(text, columnPadding = 0) {
  const engine = getWasm();
  const input = Buffer.from(text, "utf8");
  const inputPtr = engine.mtf_alloc(input.length);
  new Uint8Array(engine.memory.buffer, inputPtr, input.length).set(input);
  // mtf_format frees the input buffer
  const outputPtr = engine.mtf_format(inputPtr, input.length, columnPadding);
  const outputLength = engine.mtf_result_len();
  const output = Buffer.from(engine.memory.buffer, outputPtr, outputLength).toString("utf8");
  engine.mtf_free_result();
  return output;
}

module.exports = { formatTables };
