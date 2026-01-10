# RIDDL VSCode Commands

This document describes the commands available in the RIDDL VSCode extension.

## Accessing Commands

All RIDDL commands are accessible via the VSCode Command Palette:

**Mac:** `Cmd+Shift+P`
**Windows/Linux:** `Ctrl+Shift+P`

Type "RIDDL" to filter and see all available commands.

## Available Commands

### RIDDL: Version Information

**Command ID:** `riddl.info`

Displays comprehensive build and version information about RIDDL, including:
- RIDDL version and build details
- Documentation links
- Copyright and license information
- Build timestamp
- Scala and sbt versions used
- List of VSCode extension features

**When to use:**
- Check which version of RIDDL is integrated with the extension
- Get links to RIDDL documentation
- Verify extension installation and features

**Example Output:**
```
About RIDDL:
           name: riddl
        version: 1.0.1-14-54379e2e-20260109-2100
  documentation: https://riddl.ossuminc.com
      copyright: Copyright (c) 2019-2026 Ossum, Inc.
       built at: 2026-01-09T21:00:00Z
       licenses: Apache-2.0
   organization: Ossum Inc.
  scala version: 3.3.7
    sbt version: 1.12.0

VSCode Extension Features:
  ✓ Syntax Highlighting (TextMate + Semantic)
  ✓ Hover Documentation
  ✓ Real-time Diagnostics (Syntax + Semantic)
  ✓ Code Completion
  ✓ Go to Definition
  ✓ Find All References
```

---

### RIDDL: Parse Current File

**Command ID:** `riddl.parse`

Parses the currently active RIDDL file and displays the Abstract Syntax Tree (AST) structure in JSON format.

**Prerequisites:**
- A `.riddl` file must be open and active in the editor

**Output includes:**
- File path and size
- Parse success/failure status
- Full AST structure (if successful)
- Parse errors with location and description (if failed)

**When to use:**
- Verify RIDDL syntax is correct
- Inspect the AST structure for development/debugging
- Understand how RIDDL parser interprets your code
- Troubleshoot parse errors

**Example Output (Success):**
```
============================================================
RIDDL Parse Results
============================================================

File: /Users/reid/Code/project/domain.riddl
Size: 1523 characters

✓ Parse succeeded

AST Structure:
{
  "kind": "Root",
  "domains": [
    {
      "id": "MyDomain",
      "kind": "Domain",
      "isEmpty": false,
      "contents": [...]
    }
  ]
}

============================================================
```

**Example Output (Failure):**
```
============================================================
RIDDL Parse Results
============================================================

File: /Users/reid/Code/project/domain.riddl
Size: 1523 characters

✗ Parse failed

Errors:
1. [SyntaxError] at line 23, column 15
   Expected closing brace, found EOF
2. [ParseError] at line 15, column 8
   Unexpected token 'command'

============================================================
```

---

### RIDDL: Validate Current File

**Command ID:** `riddl.validate`

Runs full validation on the currently active RIDDL file, including both syntax checking and semantic validation.

**Prerequisites:**
- A `.riddl` file must be open and active in the editor

**Validation Pipeline:**
1. **Parse Phase:** Syntax checking
2. **Symbols Phase:** Build symbol table
3. **Resolution Phase:** Resolve type references
4. **Validation Phase:** Semantic rule checking

**Output includes:**
- File path and size
- Validation success/failure status
- Parse errors (syntax issues)
- Validation errors (semantic issues)
- Validation warnings (style/usage issues)
- Informational messages

**When to use:**
- Check for both syntax and semantic errors
- Identify undefined type references
- Find missing documentation or style issues
- Comprehensive file validation before committing

**Example Output (Success with Warnings):**
```
============================================================
RIDDL Validation Results
============================================================

File: /Users/reid/Code/project/domain.riddl
Size: 1523 characters

✓ Validation succeeded

Warnings (2):
1. [MissingDocumentation] at line 10, column 1
   Entity 'Order' should have brief documentation
2. [StyleWarning] at line 25, column 5
   Consider using more descriptive identifier name

Info Messages (1):
1. [Suggestion] at line 30, column 8
   Consider adding handler for PlaceOrder command

============================================================
```

**Example Output (Failure):**
```
============================================================
RIDDL Validation Results
============================================================

File: /Users/reid/Code/project/domain.riddl
Size: 1523 characters

✗ Validation failed

Parse Errors (1):
1. [SyntaxError] at line 15, column 8
   Missing closing brace

Validation Errors (2):
1. [UndefinedReference] at line 30, column 12
   Type 'OrderStatus' is not defined
2. [TypeMismatch] at line 45, column 20
   Expected Number, found String

Warnings (1):
1. [MissingDocumentation] at line 10, column 1
   Entity 'Order' should have brief documentation

============================================================
```

**Message Types:**

| Type | Severity | Description |
|------|----------|-------------|
| **Parse Errors** | Error | Syntax issues that prevent parsing |
| **Validation Errors** | Error | Semantic issues (undefined types, type mismatches, etc.) |
| **Warnings** | Warning | Style issues, missing documentation, usage warnings |
| **Info Messages** | Info | Suggestions and informational hints |

---

### RIDDL: Translate to Output Format

**Command ID:** `riddl.translate`

Placeholder for future translation functionality.

**Current Status:**
This command currently displays an informational message about available translation features in the `riddlc` command-line tool.

**Available riddlc Translation Commands:**
- `hugo` - Generate Hugo documentation site
- `from` - Translate from other formats to RIDDL
- `dump` - Dump AST in various formats
- `prettify` - Reformat RIDDL source code

**Future Plans:**
Full translation support will be added in a future release, allowing you to:
- Generate documentation sites directly from VSCode
- Export RIDDL to various formats
- Reformat/prettify RIDDL files
- Import from other specification formats

**For Now:**
Use the `riddlc` command-line tool for translation operations:

```bash
riddlc hugo --input-file domain.riddl --output-dir ./docs
riddlc prettify --input-file domain.riddl
riddlc dump --input-file domain.riddl --format json
```

---

## Output Panel

All command results are displayed in the **RIDDL** output channel.

### Viewing Output

1. **Automatic:** The RIDDL output panel opens automatically when you run a command
2. **Manual:** View → Output → Select "RIDDL" from the dropdown

### Output Features

- **Clear separation:** Each command run clears previous output
- **Numbered messages:** Errors and warnings are numbered for easy reference
- **Location information:** All messages include line and column numbers
- **Clean formatting:** ANSI color codes are stripped for readability
- **Separators:** Visual separators make output sections easy to distinguish

---

## Tips & Best Practices

### Real-time vs On-Demand

**Real-time Diagnostics (automatic):**
- Syntax and validation errors appear as red/yellow squiggles as you type
- Shown in the editor and Problems panel
- Updates automatically after 500ms of inactivity

**Command Validation (on-demand):**
- Run `RIDDL: Validate Current File` for detailed output
- Shows complete error messages in the Output panel
- Includes full file path and context
- Useful for comprehensive error review

### When to Use Each Command

**Use `RIDDL: Version Information` when:**
- You need to report a bug (include version info)
- Checking if extension is installed correctly
- Verifying which RIDDL features are available

**Use `RIDDL: Parse Current File` when:**
- You want to see the AST structure
- Debugging parser issues
- Learning how RIDDL interprets your code
- Developing RIDDL tooling

**Use `RIDDL: Validate Current File` when:**
- You want comprehensive validation output
- Checking for all errors, warnings, and info messages
- Before committing changes
- Troubleshooting complex validation issues

### Keyboard Shortcuts

You can assign custom keyboard shortcuts to any command:

1. Open Keyboard Shortcuts: `Cmd+K Cmd+S` (Mac) or `Ctrl+K Ctrl+S` (Windows/Linux)
2. Search for "RIDDL"
3. Click the `+` icon next to a command
4. Press your desired key combination

**Suggested Shortcuts:**
- `Cmd+Shift+V` - RIDDL: Validate Current File
- `Cmd+Shift+I` - RIDDL: Version Information

---

## Error Handling

### Common Errors

**"No active editor found. Please open a RIDDL file."**
- Cause: No file is currently open in the editor
- Solution: Open a `.riddl` file first

**"Current file is not a RIDDL file."**
- Cause: The active file is not a `.riddl` file
- Solution: Switch to a RIDDL file or open one

**"Error retrieving RIDDL build information"**
- Cause: RIDDL library integration issue
- Solution: Reinstall the extension or report a bug

---

## Related Features

### Diagnostics Provider
Real-time error checking shows errors as you type (red/yellow squiggles in the editor and Problems panel).

### Hover Documentation
Hover over keywords, types, and identifiers to see inline documentation.

### Code Completion
Type and press `Ctrl+Space` to get IntelliSense suggestions for keywords, types, and identifiers.

### Go to Definition
Press `F12` or `Cmd+Click` on a type or identifier to jump to its definition.

### Find All References
Press `Shift+F12` on any symbol to find all its usages.

---

## Feedback & Issues

If you encounter issues with any commands:

1. Check the RIDDL output panel for detailed error messages
2. Verify you're using a `.riddl` file
3. Check the VSCode Developer Tools console: `Help → Toggle Developer Tools`
4. Report issues at: https://github.com/ossuminc/riddl-vscode/issues

Include:
- Extension version (`RIDDL: Version Information` output)
- VSCode version (`Help → About`)
- Steps to reproduce
- Error messages from output panel
