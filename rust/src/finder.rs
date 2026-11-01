//! Finds table ranges: a valid separator row, the header row just above it, and
//! the following rows as long as they have the same number of cells.

use crate::text::{js_trim, split_line};

pub const IGNORE_START: &str = "<!-- markdown-table-prettify-ignore-start -->";
pub const IGNORE_END: &str = "<!-- markdown-table-prettify-ignore-end -->";

/// Inclusive line range
#[derive(Debug, PartialEq, Eq, Clone, Copy)]
pub struct Range {
    pub start: usize,
    pub end: usize,
}

/// Next table starting the search at line `from`. The ignore state is reset on
/// each search, as in the original engine.
pub fn find_next<S: AsRef<str>>(lines: &[S], code: &[bool], from: usize) -> Option<Range> {
    let mut ignoring = false;
    for i in from..lines.len() {
        if !code[i] {
            let trimmed = js_trim(lines[i].as_ref());
            if trimmed == IGNORE_START {
                ignoring = true;
            } else if trimmed == IGNORE_END {
                ignoring = false;
            }
        }
        if ignoring || code[i] {
            continue;
        }
        let (range, ignore_started) = range_at_separator(lines, code, i);
        ignoring = ignore_started;
        if range.is_some() {
            return range;
        }
    }
    None
}

fn range_at_separator<S: AsRef<str>>(
    lines: &[S],
    code: &[bool],
    separator: usize,
) -> (Option<Range>, bool) {
    let separator_cells = split_line(lines[separator].as_ref());
    if !has_valid_separators(&separator_cells) {
        return (None, false);
    }
    let header_cells = match separator.checked_sub(1) {
        Some(header) if !code[header] => split_line(lines[header].as_ref()).len(),
        _ => 0,
    };
    let header_valid = header_cells > 1 && header_cells == separator_cells.len();

    let mut last = separator;
    let mut ignore_started = false;
    for row in separator + 1..lines.len() {
        if code[row] {
            break;
        }
        if js_trim(lines[row].as_ref()) == IGNORE_START {
            ignore_started = true;
            break;
        }
        if !header_valid || split_line(lines[row].as_ref()).len() != header_cells {
            break;
        }
        last = row;
    }
    let range = header_valid.then(|| Range {
        start: separator - 1,
        end: last,
    });
    (range, ignore_started)
}

pub fn has_valid_separators(cells: &[&str]) -> bool {
    if cells.len() < 2 || cells[1].is_empty() {
        return false;
    }
    cells.iter().all(|cell| is_separator_cell(cell)) || all_dashes_with_border(cells)
}

/// `-`, `---`, `:--`, `--:`, `:-:` (surrounding spaces allowed)
fn is_separator_cell(cell: &str) -> bool {
    let trimmed = js_trim(cell);
    let trimmed = trimmed.strip_prefix(':').unwrap_or(trimmed);
    let trimmed = trimmed.strip_suffix(':').unwrap_or(trimmed);
    !trimmed.is_empty() && trimmed.bytes().all(|b| b == b'-')
}

fn all_dashes_with_border(cells: &[&str]) -> bool {
    let starting_border = cells.len() >= 3 && js_trim(cells[0]).is_empty();
    let ending_border = cells.len() >= 3 && js_trim(cells[cells.len() - 1]).is_empty();
    if !starting_border && !ending_border {
        return false;
    }
    let start = usize::from(starting_border);
    let end = if ending_border {
        cells.len() - 1
    } else {
        cells.len()
    };
    cells[start..end].iter().all(|cell| is_separator_cell(cell))
}

#[cfg(test)]
mod tests {
    use super::*;

    fn find(text: &str) -> Option<Range> {
        let lines: Vec<&str> = text.split('\n').collect();
        let code = vec![false; lines.len()];
        find_next(&lines, &code, 0)
    }

    #[test]
    fn separators() {
        for valid in ["|-|", "|-|-|", "-|-", "| :--- | ---: |", ":-:|-", "|-|-"] {
            assert!(has_valid_separators(&split_line(valid)), "{valid}");
        }
        for invalid in ["-", "a|b", "|:|-|", "| - - | - |", "-|"] {
            assert!(!has_valid_separators(&split_line(invalid)), "{invalid}");
        }
    }

    #[test]
    fn ranges() {
        assert_eq!(
            find("t\n| a | b |\n|-|-|\n| 1 | 2 |\nx"),
            Some(Range { start: 1, end: 3 })
        );
        assert_eq!(find("| a | b |\n|-|-|"), Some(Range { start: 0, end: 1 }));
        assert_eq!(find("|-|-|\n| 1 | 2 |"), None);
        assert_eq!(find("| a |\n|-|-|\n| 1 | 2 |"), None);
        assert_eq!(
            find(&format!("| a | b |\n|-|-|\n{IGNORE_START}\n| 1 | 2 |")),
            Some(Range { start: 0, end: 1 })
        );
        assert_eq!(
            find(&format!("{IGNORE_START}\n| a | b |\n|-|-|\n{IGNORE_END}")),
            None
        );
    }
}
