//! Display width of cell values, in terminal/monospace columns.

use unicode_width::UnicodeWidthStr;

/// ASCII characters (including tabs) count as 1 column. Other text uses Unicode
/// East Asian Width rules: CJK, kana, hangul, full-width forms and emoji are 2
/// columns; combining marks and zero-width characters are 0.
pub fn display_width(s: &str) -> usize {
    let mut width = 0;
    let mut run_start: Option<usize> = None;
    for (i, c) in s.char_indices() {
        if c.is_ascii() {
            if let Some(start) = run_start.take() {
                width += non_ascii_width(&s[start..i]);
            }
            width += 1;
        } else if run_start.is_none() {
            run_start = Some(i);
        }
    }
    if let Some(start) = run_start {
        width += non_ascii_width(&s[start..]);
    }
    width
}

fn non_ascii_width(run: &str) -> usize {
    // The soft hyphen is invisible inside a table cell
    let shy = run.matches('\u{00AD}').count();
    run.width().saturating_sub(shy)
}

#[cfg(test)]
mod tests {
    use super::display_width;

    #[test]
    fn widths() {
        assert_eq!(display_width("abc\t"), 4);
        assert_eq!(display_width("中文"), 4);
        assert_eq!(display_width("𠀀"), 2);
        assert_eq!(display_width("あ한Ａ"), 6);
        assert_eq!(display_width("e\u{0301}"), 1);
        assert_eq!(display_width("a\u{200B}b"), 2);
        assert_eq!(display_width("so\u{00AD}ft"), 4);
        assert_eq!(display_width("😀"), 2);
        assert_eq!(display_width("é"), 1);
    }
}
