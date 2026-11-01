//! Builds a table model from its lines and writes it back with aligned columns.

use crate::text::{js_trim, leading_whitespace, split_line};
use crate::width::display_width;

#[derive(Clone, Copy, PartialEq, Eq)]
enum Alignment {
    NotSet,
    Left,
    Center,
    Right,
}

#[derive(Clone, Copy, PartialEq, Eq)]
enum Position {
    First,
    Middle,
    Last,
}

struct Table<'a> {
    /// Header and body rows (separator excluded), trimmed cell values
    rows: Vec<Vec<&'a str>>,
    alignments: Vec<Alignment>,
    left_pad: &'a str,
    has_left_border: bool,
    has_right_border: bool,
    longest: Vec<usize>,
}

/// Formats the lines of one table (header, separator, rows). Returns the new
/// line contents, or `None` when the table has no column left to write.
pub fn format_table<S: AsRef<str>>(lines: &[S], column_padding: usize) -> Option<Vec<String>> {
    let table = build(lines)?;
    Some(write(&table, column_padding))
}

fn build<S: AsRef<str>>(lines: &[S]) -> Option<Table<'_>> {
    let lines: Vec<&str> = lines.iter().map(AsRef::as_ref).collect();
    let mut rows: Vec<Vec<&str>> = lines
        .iter()
        .enumerate()
        .filter(|(i, _)| *i != 1)
        .map(|(_, line)| split_line(line).into_iter().map(js_trim).collect())
        .collect();
    let mut alignments: Vec<Alignment> =
        split_line(lines[1]).into_iter().map(alignment_of).collect();
    let column_count = rows[0].len();
    if alignments.len() != column_count || rows.iter().any(|row| row.len() != column_count) {
        return None;
    }

    let is_column_empty =
        |rows: &Vec<Vec<&str>>, col: usize| rows.iter().all(|row| row[col].is_empty());
    let had_left_border = is_column_empty(&rows, 0);
    let had_right_border = is_column_empty(&rows, column_count - 1);
    if had_left_border {
        rows.iter_mut().for_each(|row| {
            row.remove(0);
        });
        alignments.remove(0);
    }
    if had_right_border {
        rows.iter_mut().for_each(|row| {
            row.pop();
        });
        alignments.pop();
    }
    if alignments.is_empty() {
        return None;
    }

    // Indentation is kept with a clear left border, or when indented with tabs
    let indentation = left_pad(&lines);
    let left_pad = if had_left_border || indentation.starts_with('\t') {
        indentation
    } else {
        ""
    };

    let mut longest = vec![0; alignments.len()];
    for row in &rows {
        for (col, value) in row.iter().enumerate() {
            longest[col] = longest[col].max(display_width(value));
        }
    }
    Some(Table {
        rows,
        alignments,
        left_pad,
        has_left_border: had_left_border,
        // The right border always follows the left one
        has_right_border: had_left_border,
        longest,
    })
}

fn alignment_of(cell: &str) -> Alignment {
    let cell = js_trim(cell);
    match (cell.starts_with(':'), cell.ends_with(':')) {
        (true, true) => Alignment::Center,
        (false, true) => Alignment::Right,
        (true, false) => Alignment::Left,
        (false, false) => Alignment::NotSet,
    }
}

/// If at least half of the lines are indented, use the common tab indentation,
/// or else the most used indentation (first one on ties).
fn left_pad<'a>(lines: &[&'a str]) -> &'a str {
    let pads: Vec<&str> = lines.iter().map(|line| leading_whitespace(line)).collect();
    let non_empty: Vec<&str> = pads.iter().copied().filter(|pad| !pad.is_empty()).collect();
    if non_empty.is_empty() || non_empty.len() * 2 < pads.len() {
        return "";
    }
    let shortest = non_empty.iter().map(|pad| pad.len()).min().unwrap_or(0);
    let common_tabs = (0..shortest)
        .take_while(|&pos| non_empty.iter().all(|pad| pad.as_bytes()[pos] == b'\t'))
        .count();
    if common_tabs > 0 {
        return &non_empty[0][..common_tabs];
    }
    let mut counts: Vec<(&str, usize)> = Vec::new();
    for pad in &non_empty {
        match counts.iter_mut().find(|(value, _)| value == pad) {
            Some((_, count)) => *count += 1,
            None => counts.push((pad, 1)),
        }
    }
    let mut best = counts[0];
    for entry in &counts[1..] {
        if entry.1 > best.1 {
            best = *entry;
        }
    }
    best.0
}

/// Spaces (left, right) around a cell value inside its column
fn cell_padding(table: &Table, value: &str, col: usize) -> (usize, usize) {
    let column_count = table.alignments.len();
    let position = if col == 0 {
        Position::First
    } else if col == column_count - 1 {
        Position::Last
    } else {
        Position::Middle
    };
    // Without a left border, the first column is never padded on the left
    let alignment = if col == 0 && !table.has_left_border {
        Alignment::Left
    } else {
        table.alignments[col]
    };
    let longest = table.longest[col];
    let width = display_width(value);
    let free = if longest > 0 { longest - width } else { 1 };
    let base_right = if longest > 0 { longest - width + 1 } else { 2 };
    let (left_border, right_border) = (table.has_left_border, table.has_right_border);

    match alignment {
        Alignment::Center => {
            let extra = if position == Position::First && !left_border {
                1
            } else {
                2
            };
            let total = free + extra;
            let right = if position == Position::Last && !right_border {
                0
            } else {
                total.div_ceil(2)
            };
            (total / 2, right)
        }
        Alignment::Right => {
            let extra = if position == Position::First && !left_border {
                0
            } else {
                1
            };
            let right = if position == Position::Last && !left_border {
                0
            } else {
                1
            };
            (free + extra, right)
        }
        Alignment::Left | Alignment::NotSet => match position {
            Position::First => (usize::from(left_border), base_right),
            Position::Middle => (1, base_right),
            Position::Last => {
                let left = usize::from(!value.is_empty() || right_border);
                (left, if right_border { base_right } else { 0 })
            }
        },
    }
}

fn write(table: &Table, column_padding: usize) -> Vec<String> {
    let column_count = table.alignments.len();
    // Padded values and their display widths, per row
    let rows: Vec<Vec<(String, usize)>> = table
        .rows
        .iter()
        .map(|row| {
            row.iter()
                .enumerate()
                .map(|(col, value)| {
                    let (left, right) = cell_padding(table, value, col);
                    let padded = format!("{}{}{}", " ".repeat(left), value, " ".repeat(right));
                    (padded, left + display_width(value) + right)
                })
                .collect()
        })
        .collect();

    let mut widths = vec![0; column_count];
    for row in &rows {
        for (col, (_, width)) in row.iter().enumerate() {
            widths[col] = widths[col].max(*width);
        }
    }
    let separator: Vec<String> = widths
        .iter()
        .zip(&table.alignments)
        .map(|(&width, &alignment)| separator_cell(width, alignment))
        .collect();

    let pad = " ".repeat(column_padding);
    let write_row = |values: &mut dyn Iterator<Item = &str>| {
        let mut line = String::from(table.left_pad);
        if table.has_left_border {
            line.push('|');
        }
        for (col, value) in values.enumerate() {
            let last = col == column_count - 1;
            line.push_str(&pad);
            line.push_str(value);
            if !last || table.has_right_border {
                line.push_str(&pad);
            }
            if !last {
                line.push('|');
            }
        }
        if table.has_right_border {
            line.push('|');
        }
        line
    };

    let mut result = Vec::with_capacity(rows.len() + 1);
    for (i, row) in rows.iter().enumerate() {
        result.push(write_row(&mut row.iter().map(|(value, _)| value.as_str())));
        if i == 0 {
            result.push(write_row(&mut separator.iter().map(String::as_str)));
        }
    }
    result
}

fn separator_cell(width: usize, alignment: Alignment) -> String {
    if width < 2 {
        return "-".repeat(width);
    }
    match alignment {
        Alignment::Left => format!(":{}", "-".repeat(width - 1)),
        Alignment::Right => format!("{}:", "-".repeat(width - 1)),
        Alignment::Center => format!(":{}:", "-".repeat(width - 2)),
        Alignment::NotSet => "-".repeat(width),
    }
}

#[cfg(test)]
mod tests {
    use super::format_table;

    #[test]
    fn bordered_table() {
        let lines = ["| a | bb |", "|:-|-:|", "| 111 | 2 |"];
        assert_eq!(
            format_table(&lines, 0).unwrap(),
            vec!["| a   | bb |", "|:----|---:|", "| 111 |  2 |"]
        );
    }

    #[test]
    fn empty_columns_are_left_untouched() {
        assert_eq!(format_table(&[" | ", "-|-", " | "], 0), None);
    }
}
