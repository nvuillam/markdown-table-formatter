module.exports = {
  env: {
    node: true,
    es6: true,
    mocha: true,
  },
  extends: ["eslint:recommended"],
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly",
  },
  parser: "@babel/eslint-parser",
  parserOptions: {
    ecmaVersion: 2018,
    requireConfigFile: false,
    sourceType: "module",
  },
  rules: {
    indent: "off", // Managed by prettier
  },
};
