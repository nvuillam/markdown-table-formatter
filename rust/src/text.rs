//! Text helpers that reproduce JavaScript semantics used by the original engine.

/// Whitespace as defined by JavaScript `String.prototype.trim()` and regex `\s`.
/// Differs from Rust's `char::is_whitespace`: includes U+FEFF, excludes U+0085.
pub fn is_js_whitespace(c: char) -> bool {
    matches!(
        c,
        '\t' | '\n' | '\u{000B}' | '\u{000C}' | '\r' | ' ' | '\u{00A0}' | '\u{1680}'
            | '\u{2000}'..='\u{200A}'
            | '\u{2028}' | '\u{2029}' | '\u{202F}' | '\u{205F}' | '\u{3000}' | '\u{FEFF}'
    )
}

/// Horizontal whitespace: JS regex `[^\S\r\n]`.
pub fn is_js_horizontal_whitespace(c: char) -> bool {
    c != '\r' && c != '\n' && is_js_whitespace(c)
}

/// JavaScript `String.prototype.trim()`.
pub fn js_trim(s: &str) -> &str {
    s.trim_matches(is_js_whitespace)
}

/// Leading whitespace of a line: JS `line.match(/^\s*/)[0]`.
pub fn leading_whitespace(s: &str) -> &str {
    let rest = s.trim_start_matches(is_js_whitespace);
    &s[..s.len() - rest.len()]
}

/// Splits a table line into cells on `|`, except escaped `\|` and pipes inside an
/// open backtick code span. An empty line gives no cells.
pub fn split_line(line: &str) -> Vec<&str> {
    if line.is_empty() {
        return Vec::new();
    }
    let bytes = line.as_bytes();
    let mut cells = Vec::new();
    let mut start = 0;
    let mut backticks = 0usize;
    for (i, &b) in bytes.iter().enumerate() {
        match b {
            b'`' => backticks += 1,
            b'|' => {
                let escaped = i > 0 && bytes[i - 1] == b'\\';
                if !escaped && backticks % 2 == 0 {
                    cells.push(&line[start..i]);
                    start = i + 1;
                }
            }
            _ => {}
        }
    }
    cells.push(&line[start..]);
    cells
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn trim_like_javascript() {
        assert_eq!(js_trim("\u{FEFF} a \u{3000}"), "a");
        assert_eq!(js_trim("\u{0085}a"), "\u{0085}a");
    }

    #[test]
    fn split_cells() {
        assert_eq!(split_line(""), Vec::<&str>::new());
        assert_eq!(split_line("abc"), vec!["abc"]);
        assert_eq!(split_line("| a | b |"), vec!["", " a ", " b ", ""]);
        assert_eq!(split_line("a \\| b | c"), vec!["a \\| b ", " c"]);
        assert_eq!(split_line("`a | b` | c"), vec!["`a | b` ", " c"]);
        assert_eq!(split_line("é|ü"), vec!["é", "ü"]);
    }
}
