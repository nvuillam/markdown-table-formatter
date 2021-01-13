#! /usr/bin/env node
const { MarkdownTableFormatter } = require("./markdown-table-formatter");
const optionsDefinition = require("./options");

class MarkdownTableFormatterCli {
    "use strict";

    options = {};

    async process() {
        this.options = optionsDefinition.parse(process.argv);

        // Show version
        if (this.options.version) {
            let version = process.env.npm_package_version;
            console.log(`markdown-table-formatter version ${version}`);
            return;
        }

        // Show help ( index or for an options)
        if (this.options.help) {
            let help_content = "";
            if (this.options._.length) {
                help_content = optionsDefinition.generateHelpForOption(this.options._[0]);
            } else {
                help_content = optionsDefinition.generateHelp();
            }
            console.info(help_content);
            return;
        }

        // Processing formatting
        const formatter = new MarkdownTableFormatter(this.options);
        const files = this.options._;
        if (files.length === 0) {
            throw new Error("You must send a file or a list of files as argument");
        }
        const { status, updates } = await formatter.run(files);
        // Manage result
        if (status === 0 && updates.length === 0) {
            console.log("No markdown table formatting has been applied.");
        } else if (status === 0 && updates > 0) {
            console.log(`Formatted markdown tables in ${updates.length} files: - \n${updates.join("\n- ")}`);
        } else if (status === 1) {
            console.log(`${updates.length} files contain markdown tables to format: - \n${updates.join("\n- ")}`);
        }
        process.exitCode = status;
    }
}

module.exports = { MarkdownTableFormatterCli };
