#! /usr/bin/env node
"use strict";
const assert = require("assert");
const { MarkdownTableFormatterCli } = require('../lib/index');
const {
    beforeEachTestCase,
    TEST_FILE_GOOD,
    TEST_FILE_BAD
    checkStatus,
/*    checkStdOutIncludes,
    checkStdErrIncludes */
} = require("./helpers/common");

describe("Tests", () => {
    beforeEach(beforeEachTestCase);

    it("should check a single file with success", async () => {
        const args = [null, null,"--check", TEST_FILE_GOOD];
        const res = await new MarkdownTableFormatterCli().run(args);
        checkStatus(res.status,0)
    });

    it("should check a single file with failure", async () => {
        const args = [null, null, "--check", TEST_FILE_BAD];
        const res = await new MarkdownTableFormatterCli().run(args);
        checkStatus(res.status,1)
    });

    it("should format a single file", async () => {
        const args = [null, null, TEST_FILE_BAD];
        const res = await new MarkdownTableFormatterCli().run(args);
        checkStatus(res.status,0)
        assert(res.updates.length === 1,`${TEST_FILE_BAD} should have been updated`)
    });

    it("should format multiple files", async () => {
        const args = [null, null,TEST_FILE_GOOD, TEST_FILE_BAD];
        const res = await new MarkdownTableFormatterCli().run(args);
        checkStatus(res.status,0)
        assert(res.updates.length === 2,`${TEST_FILE_BAD} should have been updated`)
    });

    it("should tell that a file argument is mandatory", async () => {

    });

    it("should show version", async () => {

    });

    it("should show help", async () => {

    });


});

