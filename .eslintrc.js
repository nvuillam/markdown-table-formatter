module.exports = {
  env: {
    node: true,
    es6: true,
    mocha: true
  },
  extends: [
    'eslint:recommended'
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parser: "babel-eslint",
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module"
  },
  rules: {
    "indent": "off" // Managed by prettier
  }
}
