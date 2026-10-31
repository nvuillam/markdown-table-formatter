| Syntax              | Example  | Expected behavior | Actual behavior  |
|---------------------|----------|-------------------|------------------|
| `@alice`            | @alice   | mention link      | mention link     |
| `\@alice`           | \@alice  | no mention link   | **mention link** |
| ``` `@alice` ```    | `@alice` | no mention link   | no mention link  |
| `@​alice` with ZWSP | @​alice  | no mention link   | no mention link  |

| Code   | Character Name            | Example | Purpose                             |
|--------|---------------------------|---------|-------------------------------------|
| U+200B | Zero Width Space          | ab​cd   | Invisible word boundary             |
| U+200C | Zero Width Non-Joiner     | ab‌cd   | Prevents ligature joining           |
| U+200D | Zero Width Joiner         | ab‍cd   | Joins characters into ligature      |
| U+2060 | Word Joiner               | ab⁠cd   | Prevents line break                 |
| U+2061 | Function Application      | ab⁡cd   | Invisible math operator             |
| U+2062 | Invisible Times           | ab⁢cd   | Invisible multiplication sign       |
| U+2063 | Invisible Separator       | ab⁣cd   | Invisible list separator            |
| U+2064 | Invisible Plus            | ab⁤cd   | Invisible addition sign             |
| U+034F | Combining Grapheme Joiner | ab͏cd   | Joins combining character sequences |
| U+00AD | Soft Hyphen               | ab­cd   | Optional line-break hyphen          |
