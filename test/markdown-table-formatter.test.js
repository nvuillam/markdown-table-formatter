#! /usr/bin/env node
"use strict";
//const { MarkdownTableFormatter } = require('../lib/index');

const {
    beforeEachTestCase,
/*    checkStatus,
    checkStdOutIncludes,
    checkStdErrIncludes */
} = require("./helpers/common");
const { MarkdownTableFormatterCli } = require('../lib/index');

describe("Tests", () => {
    beforeEach(beforeEachTestCase);

    it("should format a single file", async () => {
        const args = [null, null, "test_files/markdown_bad_1.md"];
        await new MarkdownTableFormatterCli().run(args);
    });

    it("should format multiple files", async () => {

    });

    it("should check a single file with success", async () => {

    });

    it("should check a single file with failure", async () => {

    });

    it("should tell that a file argument is mandatory", async () => {

    });

    it("should show version", async () => {

    });

    it("should show help", async () => {

    });


});

