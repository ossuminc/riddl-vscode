# Milestone 7: RIDDL Commands

**Status:** ✅ Complete
**Date:** 2026-01-09

## Overview

Implemented four VSCode commands that allow users to interact with RIDDL files directly from the command palette. All commands output results to the VSCode Output panel for easy viewing.

## Features Implemented

### 1. Command Infrastructure (`src/commands.ts`)

Four commands are provided:
- **RIDDL: Version Information** (`riddl.info`) - Display RIDDL build and version information
- **RIDDL: Parse Current File** (`riddl.parse`) - Parse the active RIDDL file and show AST
- **RIDDL: Validate Current File** (`riddl.validate`) - Run full validation on active file
- **RIDDL: Translate to Output Format** (`riddl.translate`) - Translation support (placeholder)

### 2. Output Channel Management

- **Dedicated RIDDL channel:** All command output goes to a single "RIDDL" output channel
- **Automatic display:** Channel is shown when commands run
- **Clear before use:** Channel is cleared before each command to avoid confusion
- **ANSI stripping:** Color codes are removed for clean text output

### 3. Command Details

#### riddl.info - Version Information

Displays comprehensive build and version information about RIDDL:
- Name, version, and documentation links
- Copyright and license information
- Build timestamp
- Organization details
- Scala and sbt versions
- VSCode extension features list

**Usage:**
1. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
2. Type "RIDDL: Version Information"
3. View output in RIDDL Output panel

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

#### riddl.parse - Parse Current File

Parses the currently active RIDDL file and displays:
- File path and size
- Parse success or failure status
- Full AST (Abstract Syntax Tree) structure in JSON format
- Parse errors if parsing failed

**Usage:**
1. Open a `.riddl` file in the editor
2. Press `Cmd+Shift+P` and select "RIDDL: Parse Current File"
3. View parse results in RIDDL Output panel

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
      ...
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

============================================================
```

#### riddl.validate - Validate Current File

Runs full validation on the currently active RIDDL file:
- **Parse phase:** Checks syntax
- **Symbols phase:** Builds symbol table
- **Resolution phase:** Resolves references
- **Validation phase:** Checks semantic rules

Displays:
- File path and size
- Validation success or failure status
- Parse errors (if any)
- Validation errors (semantic issues)
- Validation warnings (style/usage issues)
- Informational messages

**Usage:**
1. Open a `.riddl` file in the editor
2. Press `Cmd+Shift+P` and select "RIDDL: Validate Current File"
3. View validation results in RIDDL Output panel

**Example Output (Success with warnings):**
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

#### riddl.translate - Translate to Output Format

Placeholder for future translation functionality. Currently displays informational message about available riddlc translation commands:
- `hugo` - Generate Hugo documentation site
- `from` - Translate from other formats to RIDDL
- `dump` - Dump AST in various formats
- `prettify` - Reformat RIDDL source code

**Note:** Full translation support will be added in a future release. Users should use the `riddlc` command-line tool for these operations.

### 4. Error Handling

All commands include robust error handling:

**No active editor:**
```
Error: No active editor found. Please open a RIDDL file.
```

**Wrong file type:**
```
Error: Current file is not a RIDDL file.
```

**RIDDL library errors:**
Displayed in the output channel with full error details.

### 5. ANSI Code Stripping

The `stripAnsiCodes()` function removes ANSI color escape sequences from error messages, ensuring clean readable output in the VSCode Output panel:

```typescript
function stripAnsiCodes(text: string): string {
    // Remove ANSI escape sequences
    let cleaned = text.replace(/\x1b\[[0-9;]*m/g, '');
    // Also remove any remaining bracket-style codes
    cleaned = cleaned.replace(/\[([0-9]+;)*[0-9]*m/g, '');
    return cleaned;
}
```

## Implementation Details

### Command Registration

Commands are registered in `src/extension.ts`:

```typescript
// Register commands
context.subscriptions.push(
    vscode.commands.registerCommand('riddl.info', riddlInfo)
);
context.subscriptions.push(
    vscode.commands.registerCommand('riddl.parse', riddlParse)
);
context.subscriptions.push(
    vscode.commands.registerCommand('riddl.validate', riddlValidate)
);
context.subscriptions.push(
    vscode.commands.registerCommand('riddl.translate', riddlTranslate)
);
```

### Package.json Configuration

Commands are declared in `package.json`:

```json
{
  "contributes": {
    "commands": [
      {
        "command": "riddl.info",
        "title": "RIDDL: Version Information"
      },
      {
        "command": "riddl.parse",
        "title": "RIDDL: Parse Current File"
      },
      {
        "command": "riddl.validate",
        "title": "RIDDL: Validate Current File"
      },
      {
        "command": "riddl.translate",
        "title": "RIDDL: Translate to Output Format"
      }
    ]
  }
}
```

### RIDDL Library Integration

Commands use the `@ossuminc/riddl-lib` JavaScript API:

**Info command:**
```typescript
import { RiddlAPI } from '@ossuminc/riddl-lib';

// Uses formatInfo or buildInfo
if (typeof RiddlAPI.formatInfo === 'string') {
    channel.appendLine(RiddlAPI.formatInfo);
} else {
    const buildInfo = RiddlAPI.buildInfo;
    channel.appendLine(`name: ${buildInfo.name}`);
    // ... format manually
}
```

**Parse command:**
```typescript
const result = RiddlAPI.parseString(source, origin, false);

if (result.succeeded && result.value) {
    channel.appendLine('✓ Parse succeeded');
    channel.appendLine(JSON.stringify(result.value, null, 2));
} else if (result.errors) {
    channel.appendLine('✗ Parse failed');
    result.errors.forEach((error, index) => {
        channel.appendLine(`${index + 1}. [${error.kind}] at line ${error.location.line}`);
        channel.appendLine(`   ${stripAnsiCodes(error.message)}`);
    });
}
```

**Validate command:**
```typescript
const result = RiddlAPI.validateString(source, origin, false, true);

if (result.succeeded) {
    channel.appendLine('✓ Validation succeeded');

    // Show warnings and info if present
    const { warnings, info } = result.validationMessages;
    // ... format messages
} else {
    channel.appendLine('✗ Validation failed');

    // Show parse errors and validation errors
    if (result.parseErrors) { /* ... */ }
    if (result.validationMessages.errors) { /* ... */ }
}
```

## RIDDL Library Fixes

### Origin Parameter Fix

During implementation, discovered and fixed an issue where validation messages showed "empty" as the filename instead of the actual file path.

**Problem:** `RiddlAPI.validateString()` was passing the `origin: String` directly to `RiddlParserInput`, but it expected a `URL` object. When the type didn't match, it defaulted to `URL.empty`.

**Solution:** Added `originToURL()` helper function in `RiddlAPI.scala`:

```scala
private def originToURL(origin: String): URL = {
  if origin.startsWith("/") then
    // Full file path - use fromFullPath
    URL.fromFullPath(origin)
  else
    // Simple identifier or relative path - create URL with path component
    URL(URL.fileScheme, "", "", origin)
  end if
}
```

Updated all 5 methods to use this helper:
- `parseString()`
- `parseStringWithContext()`
- `parseNebula()`
- `parseToTokens()`
- `validateString()`

**Result:** Messages now show actual filenames:
```
/Users/reid/Code/project/domain.riddl(66:11->26): Warning message
```

Instead of:
```
empty(66:11->26): Warning message
```

## Testing

### Manual Testing

All four commands were manually tested:

**riddl.info:**
- ✅ Displays version information correctly
- ✅ Shows extension features list
- ✅ Output appears in RIDDL channel

**riddl.parse:**
- ✅ Successfully parses valid RIDDL files
- ✅ Shows AST structure in JSON format
- ✅ Reports parse errors with location and message
- ✅ Handles empty files
- ✅ Requires active RIDDL file editor

**riddl.validate:**
- ✅ Runs full validation pipeline
- ✅ Reports parse errors separately from validation errors
- ✅ Shows warnings and info messages
- ✅ Displays actual filename (not "empty")
- ✅ Strips ANSI color codes
- ✅ Handles files with no errors

**riddl.translate:**
- ✅ Shows informational message
- ✅ Lists available riddlc translation commands
- ✅ Directs users to command-line tool

### Error Handling

- ✅ Graceful error when no editor is active
- ✅ Graceful error when non-RIDDL file is active
- ✅ RIDDL library errors displayed in output channel
- ✅ Clean output with ANSI codes stripped

## Architecture

```
User invokes command (Cmd+Shift+P)
       ↓
Command handler function (riddlInfo/Parse/Validate/Translate)
       ↓
Get or create RIDDL output channel
       ↓
Clear channel and show it
       ↓
Validate preconditions (active editor, RIDDL file)
       ↓
Call RiddlAPI method (formatInfo/parseString/validateString)
       ↓
Format results
       ↓
Strip ANSI codes from messages
       ↓
Append to output channel
       ↓
User views results in Output panel
```

## User Experience

### Invoking Commands

1. **Command Palette:**
   - Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
   - Type "RIDDL" to filter RIDDL commands
   - Select desired command

2. **Keyboard Shortcuts:**
   - Users can assign custom keybindings in VSCode settings
   - Example: Bind `Cmd+Shift+V` to `riddl.validate`

### Viewing Results

- All output appears in the "RIDDL" output channel
- Channel automatically shows when command runs
- Previous output is cleared for each command
- Output is formatted with separators for readability
- Errors are numbered and include location information

### Integration with Other Features

Commands complement existing features:
- **Diagnostics:** Real-time errors in editor
- **Commands:** On-demand validation in output panel
- **Hover:** Quick documentation lookup
- **Completion:** Code assistance while typing

## Future Enhancements

### Milestone 7 Extensions

1. **Translation Support:**
   - Implement full `riddl.translate` command
   - Add UI for selecting translation target (hugo, from, dump, prettify)
   - Support output directory configuration
   - Show translation results and generated files

2. **Command Configuration:**
   - Add settings for verbose output
   - Configure ANSI color rendering (if supported by output channel)
   - Custom output formatting preferences

3. **Batch Operations:**
   - Parse/validate all RIDDL files in workspace
   - Multi-file validation with aggregated results
   - Workspace-wide dependency checking

4. **Output Enhancements:**
   - Clickable file paths in output (navigate to definition)
   - Collapsible sections for large AST output
   - Export results to file (JSON, HTML, Markdown)

## Summary

Milestone 7 provides four essential commands for interacting with RIDDL files:

1. **riddl.info** - Version and build information
2. **riddl.parse** - Parse file and show AST
3. **riddl.validate** - Full validation with errors, warnings, and info
4. **riddl.translate** - Placeholder for future translation features

All commands output to a dedicated RIDDL Output channel with clean, readable formatting. The implementation includes proper error handling, ANSI code stripping, and integration with the RIDDL library's JavaScript API.

Additionally, fixed a critical bug in the RIDDL library where validation messages showed "empty" instead of the actual filename.

**Next milestone:** Debugging support for RIDDL files.
