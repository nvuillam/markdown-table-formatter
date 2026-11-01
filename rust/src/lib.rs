//! Markdown table formatter: aligns the columns of every table in a markdown text.
//!
//! Port of the markdown-table-prettify 4.x engine, with fixes: tables in code
//! blocks are left untouched, cell widths follow Unicode display width, and
//! texts are never altered outside of formatted tables.

mod code_blocks;
mod document;
mod finder;
mod table;
mod text;
mod wasm;
mod width;

use std::borrow::Cow;

#[derive(Debug, Clone, Default)]
pub struct Options {
    /// Number of spaces added on both sides of every cell value
    pub column_padding: usize,
}

/// Formats all markdown tables found in `text`.
pub fn format_tables(text: &str, options: &Options) -> String {
    let doc = document::Document::parse(text);
    let block_lines: Vec<&str> = doc
        .lines
        .iter()
        .zip(&doc.raw)
        .map(|(line, raw)| &raw[line.quote_prefix.len()..])
        .collect();
    let code = code_blocks::find_code_lines(&block_lines);

    let mut contents: Vec<Cow<str>> = doc
        .lines
        .iter()
        .map(|line| Cow::Borrowed(line.content))
        .collect();
    let mut from = 0;
    while let Some(range) = finder::find_next(&contents, &code, from) {
        if let Some(formatted) =
            table::format_table(&contents[range.start..=range.end], options.column_padding)
        {
            for (offset, line) in formatted.into_iter().enumerate() {
                contents[range.start + offset] = Cow::Owned(line);
            }
        }
        from = range.end + 1;
    }

    let mut result = String::with_capacity(text.len() + text.len() / 4);
    for (line, content) in doc.lines.iter().zip(&contents) {
        result.push_str(line.quote_prefix);
        result.push_str(line.list_prefix);
        result.push_str(content);
        result.push_str(line.eol);
    }
    result
}
