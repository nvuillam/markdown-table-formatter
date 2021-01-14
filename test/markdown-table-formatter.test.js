#! /usr/bin/env node
"use strict";
const assert = require("assert");
const os = require("os");
const fse = require("fs-extra");
const path = require("path");
const { MarkdownTableFormatterCli } = require('../lib/index');
const {
    beforeEachTestCase,
    TEST_FILE_GOOD,
    TEST_FILE_BAD,
    checkStatus,
    checkStdOutIncludes
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
        const file_bad_tmp = os.tmpdir() +"/"+ TEST_FILE_BAD;
        fse.copySync(path.resolve(TEST_FILE_BAD), file_bad_tmp);
        const args = [null, null, file_bad_tmp];
        const res = await new MarkdownTableFormatterCli().run(args);
        checkStatus(res.status,0)
        assert(res.updates.length === 1,`${TEST_FILE_BAD} should have been updated`)
    });

    it("should format multiple files", async () => {
        const file_bad_tmp = os.tmpdir() +"/"+ TEST_FILE_BAD;
        fse.copySync(path.resolve(TEST_FILE_BAD), file_bad_tmp);
        const file_bad_tmp2 = os.tmpdir() +"/x/"+ TEST_FILE_BAD;
        fse.copySync(path.resolve(TEST_FILE_BAD), file_bad_tmp2);
        const args = [null, null,file_bad_tmp, file_bad_tmp2];
        const res = await new MarkdownTableFormatterCli().run(args);
        checkStatus(res.status,0)
        assert(res.updates.length === 2,`${file_bad_tmp} and ${file_bad_tmp2} should have been updated`)
    });

    
    it("should tell that a file argument is mandatory", async () => {
        const args = [null, null];
        try {
            await new MarkdownTableFormatterCli().run(args);
        } catch (e) {
            checkStdOutIncludes("You must send a file or a list of files as argument",e.message,"")            
        }
    });

    it("should show version", async () => {
        const args = [null, null, "--version"];
        const res = await new MarkdownTableFormatterCli().run(args);
        checkStdOutIncludes("markdown-table-formatter version",res.stdout,"")
    });

    it("should show help", async () => {
        const args = [null, null, "--help"];
        const res = await new MarkdownTableFormatterCli().run(args);
        checkStdOutIncludes("markdown-table-formatter [options]",res.stdout,"")
    });
    


});

