//! Finds lines that belong to code blocks, where tables must not be formatted:
//! fenced blocks (``` or ~~~) and indented code blocks (4+ spaces after a blank
//! line, outside lists).

use crate::text::is_js_whitespace;

/// `lines` are line contents after blockquote markers (list markers included).
pub fn find_code_lines(lines: &[&str]) -> Vec<bool> {
    let mut code = vec![false; lines.len()];
    let mut fence: Option<(u8, usize)> = None;
    let mut in_list = false;
    let mut previous_blank = true;
    let mut in_indented_code = false;

    for (i, line) in lines.iter().enumerate() {
        if let Some((fence_char, fence_len)) = fence {
            code[i] = true;
            if is_closing_fence(line, fence_char, fence_len) {
                fence = None;
                previous_blank = false;
            }
            continue;
        }
        if line.chars().all(is_js_whitespace) {
            previous_blank = true;
            continue;
        }
        let indent = indent_columns(line);
        if !in_list && indent >= 4 && (previous_blank || in_indented_code) {
            code[i] = true;
            in_indented_code = true;
            previous_blank = false;
            continue;
        }
        in_indented_code = false;
        previous_blank = false;

        let list_item_content = list_item_content(line);
        if let Some(opened) = opening_fence(list_item_content.unwrap_or(line)) {
            code[i] = true;
            fence = Some(opened);
        }
        if list_item_content.is_some() {
            in_list = true;
        } else if indent == 0 {
            in_list = false;
        }
    }
    code
}

fn indent_columns(line: &str) -> usize {
    let mut columns = 0;
    for b in line.bytes() {
        match b {
            b' ' => columns += 1,
            b'\t' => columns += 4 - columns % 4,
            _ => break,
        }
    }
    columns
}

fn trim_indent(line: &str) -> &str {
    line.trim_start_matches([' ', '\t'])
}

/// Content after a list marker (`- `, `* `, `+ `, `1. `, `1) `), if the line is a list item
fn list_item_content(line: &str) -> Option<&str> {
    let rest = trim_indent(line);
    let bytes = rest.as_bytes();
    let mut end = 0;
    while end < bytes.len() && end < 9 && bytes[end].is_ascii_digit() {
        end += 1;
    }
    if end > 0 {
        if end < bytes.len() && (bytes[end] == b'.' || bytes[end] == b')') {
            end += 1;
        } else {
            return None;
        }
    } else if !bytes.is_empty() && matches!(bytes[0], b'-' | b'*' | b'+') {
        end = 1;
    } else {
        return None;
    }
    match bytes.get(end) {
        None => Some(""),
        Some(b' ') | Some(b'\t') => Some(&rest[end..]),
        _ => None,
    }
}

fn fence_run(line: &str) -> Option<(u8, usize, &str)> {
    let rest = trim_indent(line);
    let first = *rest.as_bytes().first()?;
    if first != b'`' && first != b'~' {
        return None;
    }
    let len = rest.bytes().take_while(|&b| b == first).count();
    Some((first, len, &rest[len..]))
}

fn opening_fence(line: &str) -> Option<(u8, usize)> {
    let (fence_char, len, info) = fence_run(line)?;
    if len < 3 || (fence_char == b'`' && info.contains('`')) {
        return None;
    }
    Some((fence_char, len))
}

fn is_closing_fence(line: &str, fence_char: u8, fence_len: usize) -> bool {
    match fence_run(line) {
        Some((c, len, rest)) => c == fence_char && len >= fence_len && rest.chars().all(is_js_whitespace),
        None => false,
    }
}

#[cfg(test)]
mod tests {
    use super::find_code_lines;

    fn code(text: &str) -> Vec<bool> {
        let lines: Vec<&str> = text.split('\n').collect();
        find_code_lines(&lines)
    }

    #[test]
    fn fences() {
        assert_eq!(code("a\n```\n| x |\n```\nb"), vec![false, true, true, true, false]);
        assert_eq!(code("~~~~\n~~~\n| x |\n~~~~\nb"), vec![true, true, true, true, false]);
        assert_eq!(code("```js\n| x |"), vec![true, true]);
        assert_eq!(code("- ```\n  | x |\n  ```\nb"), vec![true, true, true, false]);
        // inline code is not a fence
        assert_eq!(code("``` a ``` b\n| x |"), vec![false, false]);
    }

    #[test]
    fn indented_code() {
        assert_eq!(code("a\n\n    | x |\n    | y |\n\nb"), vec![false, false, true, true, false, false]);
        // a paragraph continuation is not code
        assert_eq!(code("a\n    | x |"), vec![false, false]);
        // inside a list, indentation is list content
        assert_eq!(code("- a\n\n    | x |"), vec![false, false, false]);
        assert_eq!(code("\t| x |"), vec![true]);
    }
}
