//! Splits markdown text into lines, keeping each line ending and the blockquote /
//! list prefixes that wrap tables (`> | a | b |`, `- | a | b |`).

use crate::text::is_js_horizontal_whitespace;

pub struct Line<'a> {
    /// Blockquote markers, e.g. `> > `
    pub quote_prefix: &'a str,
    /// List marker stripped before a bordered table, e.g. `-` in `- | a | b |`
    pub list_prefix: &'a str,
    /// Line content without prefixes and line ending
    pub content: &'a str,
    /// `\n`, `\r\n` (or any trailing `\r` run before `\n`), or empty at end of file
    pub eol: &'a str,
}

pub struct Document<'a> {
    pub lines: Vec<Line<'a>>,
    /// Each line without its line ending
    pub raw: Vec<&'a str>,
}

impl<'a> Document<'a> {
    pub fn parse(text: &'a str) -> Self {
        let mut lines = Vec::new();
        let mut raw = Vec::new();
        for segment in split_lines(text) {
            let without_lf = segment.strip_suffix('\n').unwrap_or(segment);
            let value = without_lf.trim_end_matches('\r');
            let eol = &segment[value.len()..];
            let quote_len = quote_prefix_len(value);
            let list_len = list_prefix_len(&value[quote_len..]);
            lines.push(Line {
                quote_prefix: &value[..quote_len],
                list_prefix: &value[quote_len..quote_len + list_len],
                content: &value[quote_len + list_len..],
                eol,
            });
            raw.push(value);
        }
        Document { lines, raw }
    }
}

/// Same split as JS `text.match(/[^\n]*\n|[^\n]+/g) || [""]`
fn split_lines(text: &str) -> Vec<&str> {
    if text.is_empty() {
        return vec![""];
    }
    let mut result: Vec<&str> = text.split_inclusive('\n').collect();
    if result.is_empty() {
        result.push("");
    }
    result
}

/// JS regex `^([^\S\r\n]*(?:>[^\S\r\n]*)+)`
fn quote_prefix_len(line: &str) -> usize {
    let lead = skip_horizontal_ws(line, 0);
    let mut end = lead;
    let mut found = false;
    while line[end..].starts_with('>') {
        found = true;
        end = skip_horizontal_ws(line, end + 1);
    }
    if found {
        end
    } else {
        0
    }
}

/// JS regex `^([^\S\r\n]*(?:\d+[.)]|[-*+]))(?=[^\S\r\n]+\|)`
fn list_prefix_len(line: &str) -> usize {
    let start = skip_horizontal_ws(line, 0);
    let bytes = line.as_bytes();
    let mut end = start;
    while end < bytes.len() && bytes[end].is_ascii_digit() {
        end += 1;
    }
    if end > start {
        if end < bytes.len() && (bytes[end] == b'.' || bytes[end] == b')') {
            end += 1;
        } else {
            return 0;
        }
    } else if end < bytes.len() && matches!(bytes[end], b'-' | b'*' | b'+') {
        end += 1;
    } else {
        return 0;
    }
    let after_ws = skip_horizontal_ws(line, end);
    if after_ws > end && line[after_ws..].starts_with('|') {
        end
    } else {
        0
    }
}

fn skip_horizontal_ws(line: &str, from: usize) -> usize {
    let rest = &line[from..];
    from + (rest.len() - rest.trim_start_matches(is_js_horizontal_whitespace).len())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn lines_and_endings() {
        let doc = Document::parse("a\r\nb\nc");
        let eols: Vec<&str> = doc.lines.iter().map(|l| l.eol).collect();
        assert_eq!(eols, vec!["\r\n", "\n", ""]);
        assert_eq!(Document::parse("").lines.len(), 1);
        assert_eq!(Document::parse("a\rb\n").lines[0].content, "a\rb");
    }

    #[test]
    fn prefixes() {
        let doc = Document::parse("> > | a |\n- | b |\n12. | c |\n- text\n>");
        assert_eq!(doc.lines[0].quote_prefix, "> > ");
        assert_eq!(doc.lines[0].content, "| a |");
        assert_eq!(doc.lines[1].list_prefix, "-");
        assert_eq!(doc.lines[1].content, " | b |");
        assert_eq!(doc.lines[2].list_prefix, "12.");
        assert_eq!(doc.lines[3].list_prefix, "");
        assert_eq!(doc.lines[4].quote_prefix, ">");
        assert_eq!(doc.lines[4].content, "");
    }
}
