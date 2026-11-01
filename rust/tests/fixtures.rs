//! Runs the shared golden fixtures of test/fixtures (also used by the JS tests).

use markdown_table_formatter::{format_tables, Options};
use std::fs;
use std::path::Path;

fn options_of(dir: &Path) -> Options {
    let mut options = Options::default();
    if let Ok(json) = fs::read_to_string(dir.join("options.json")) {
        // Minimal parsing: only "columnpadding" is needed
        if let Some(pos) = json.find("\"columnpadding\"") {
            let digits: String = json[pos + 15..]
                .chars()
                .skip_while(|c| !c.is_ascii_digit())
                .take_while(char::is_ascii_digit)
                .collect();
            options.column_padding = digits.parse().unwrap_or(0);
        }
    }
    options
}

#[test]
fn golden_fixtures() {
    let root = Path::new(env!("CARGO_MANIFEST_DIR")).join("../test/fixtures");
    let mut failures = Vec::new();
    let mut count = 0;
    for entry in fs::read_dir(&root).unwrap() {
        let dir = entry.unwrap().path();
        if !dir.is_dir() {
            continue;
        }
        count += 1;
        let name = dir.file_name().unwrap().to_string_lossy().to_string();
        let input = fs::read_to_string(dir.join("input.md")).unwrap();
        let expected = fs::read_to_string(dir.join("expected.md")).unwrap();
        let options = options_of(&dir);
        if format_tables(&input, &options) != expected {
            failures.push(format!("{name}: output differs from expected.md"));
        } else if format_tables(&expected, &options) != expected {
            failures.push(format!("{name}: not idempotent"));
        }
    }
    assert!(count > 50, "only {count} fixtures found");
    assert!(
        failures.is_empty(),
        "{} failing fixtures:\n{}",
        failures.len(),
        failures.join("\n")
    );
}
