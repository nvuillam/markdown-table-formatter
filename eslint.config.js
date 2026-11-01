"use strict";
// ESLint flat config, without imports so that it works the same locally and in MegaLinter

const nodeGlobals = Object.fromEntries(
  [
    "require",
    "module",
    "exports",
    "process",
    "console",
    "Buffer",
    "__dirname",
    "__filename",
    "WebAssembly",
    "setTimeout",
    "clearTimeout",
  ].map((name) => [name, "readonly"]),
);

module.exports = [
  {
    ignores: [
      "node_modules/**",
      "rust/target/**",
      "lib/wasm/**",
      "coverage/**",
      "megalinter-reports/**",
      "test/fixtures/**",
    ],
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: nodeGlobals,
    },
    rules: {
      "no-undef": "error",
      "no-unused-vars": ["error", { args: "after-used", caughtErrors: "none" }],
      "no-unreachable": "error",
      "no-dupe-keys": "error",
      "no-duplicate-case": "error",
      "no-empty": ["error", { allowEmptyCatch: true }],
      "no-redeclare": "error",
      "no-self-assign": "error",
      "no-constant-condition": ["error", { checkLoops: false }],
      "no-fallthrough": "error",
      "no-useless-escape": "error",
      "prefer-const": "error",
      eqeqeq: ["error", "always"],
    },
  },
];
