#! /usr/bin/env node
const assert = require("assert");

const startPath = "./test/test_files/";
const TEST_FILE_GOOD = startPath + "markdown_good_1.md";
const TEST_FILE_BAD = startPath + "markdown_bad_1.md";

// Reset codeNarcCallsCounter before each test
const beforeEachTestCase = function () {};

function checkStatus(statusCode, status) {
  assert(status === statusCode, `Status is ${statusCode} (${status} returned)`);
}

function checkStdOutIncludes(textToCheck, stdout, stderr) {
  assert(
    stdout && stdout.includes(textToCheck),
    `stdout contains ${textToCheck}\nstdout:\n${stdout}\nstderr:\n${stderr}`
  );
}

function checkStdOutIncludesOneOf(textsToCheck, stdout, stderr) {
  assert(
    stdout && textsToCheck.filter((txt) => stdout.includes(txt)).length > 0,
    `stdout contains one of ${JSON.stringify(
      textsToCheck
    )}\nstdout:\n${stdout}\nstderr:\n${stderr}`
  );
}

function checkStdErrIncludes(textToCheck, stdout, stderr) {
  assert(
    stderr && stderr.includes(textToCheck),
    `stderr contains ${textToCheck}\nstdout:\n${stdout}\nstderr:\n${stderr}`
  );
}

module.exports = {
  beforeEachTestCase,
  checkStatus,
  checkStdOutIncludes,
  checkStdOutIncludesOneOf,
  checkStdErrIncludes,
  TEST_FILE_GOOD,
  TEST_FILE_BAD,
};
