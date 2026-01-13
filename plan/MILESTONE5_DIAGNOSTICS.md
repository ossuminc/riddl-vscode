# Milestone 5: Diagnostics Provider

**Status:** ✅ Complete (Both parse and validation errors)
**Date:** 2026-01-08 (Enhanced with validation on 2026-01-09)

## Overview

Implemented real-time diagnostic provider that shows parse errors inline with squiggly underlines in the VSCode editor.

## Features Implemented

### 1. Diagnostic Provider (`src/diagnosticsProvider.ts`)

- **Real-time error checking:** Parses RIDDL files and displays errors as you type
- **Debounced parsing:** 500ms delay to avoid excessive parsing while typing
- **Error mapping:** Converts RIDDL parser errors to VSCode diagnostics
- **Range highlighting:** Underlines the specific token or word where error occurred
- **Error details:** Shows error message on hover
- **Source attribution:** All diagnostics labeled as from "RIDDL" source

### 2. Error Handling

**Parser exceptions:** When the RIDDL parser crashes on malformed input, shows a generic error diagnostic at document start

**Graceful degradation:** Continues to provide diagnostics even when parser throws exceptions

**Error details preserved:** Original RIDDL error kind and message preserved in diagnostic

### 3. Event Integration

Diagnostics update automatically on:
- **Document open:** Parse all open RIDDL files on extension activation
- **Document change:** Re-parse after 500ms debounce delay
- **Document close:** Clear diagnostics when file is closed

### 4. Severity Mapping

Currently all parse errors are shown as `Error` severity (red squiggles). The provider supports mapping different error kinds to different severities:
- `Error` → Red squiggles
- `Warning` → Yellow squiggles
- `Info` → Blue squiggles
- `Hint` → Gray dots

## Implementation Details

### Error Conversion

```typescript
function riddlErrorToDiagnostic(error: RiddlError, document: vscode.TextDocument): vscode.Diagnostic {
    // Convert 1-based RIDDL line/col to 0-based VSCode
    const line = Math.max(0, error.location.line - 1);
    const col = Math.max(0, error.location.col - 1);

    // Try to highlight the full word/token
    const range = new vscode.Range(line, col, line, endCol);

    const diagnostic = new vscode.Diagnostic(
        range,
        error.message,
        vscode.DiagnosticSeverity.Error
    );

    diagnostic.source = 'RIDDL';
    diagnostic.code = error.kind;

    return diagnostic;
}
```

### Debounced Parsing

```typescript
private readonly debounceDelay = 500; // ms

public updateDiagnostics(document: vscode.TextDocument): void {
    if (document.languageId !== 'riddl') return;

    if (this.parseTimeout) {
        clearTimeout(this.parseTimeout);
    }

    this.parseTimeout = setTimeout(() => {
        this.parseDiagnostics(document);
    }, this.debounceDelay);
}
```

### Extension Registration

```typescript
// Create diagnostics provider
const diagnosticsProvider = new RiddlDiagnosticsProvider();
context.subscriptions.push(diagnosticsProvider);

// Update on document events
context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument((doc) => {
        if (doc.languageId === 'riddl') {
            diagnosticsProvider.updateDiagnostics(doc);
        }
    })
);

context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((event) => {
        if (event.document.languageId === 'riddl') {
            diagnosticsProvider.updateDiagnostics(event.document);
        }
    })
);
```

## Testing

**Test Suite:** `test/suite/diagnostics.test.ts`

**Tests:**
1. ✅ Provider creation
2. ✅ Error reporting for invalid RIDDL
3. ✅ No errors for valid RIDDL
4. ✅ Dynamic updates when document changes
5. ✅ Clearing diagnostics
6. ✅ Empty document handling
7. ✅ RIDDL-only processing (ignores non-RIDDL files)

**Results:** 40/40 tests passing

## Validation Enhancement (2026-01-09)

### What Was Added

Extended the diagnostics provider to show both **syntax errors** (from parsing) and **semantic errors/warnings** (from validation).

#### 1. Enhanced RIDDL Library

**Added to `RiddlAPI.scala`:**
```scala
@JSExport("validateString")
def validateString(source: String, origin: String, verbose: Boolean): js.Dynamic = {
  // Parse the source
  val parseResult = TopLevelParser.parseInput(input, verbose)

  parseResult match {
    case Right(root) =>
      // Run standard passes: SymbolsPass → ResolutionPass → ValidationPass
      val passesResult = Pass.runStandardPasses(root)
      val messages = passesResult.messages

      // Return separated messages by severity
      js.Dynamic.literal(
        succeeded = !messages.hasErrors,
        parseErrors = js.Array(),
        validationMessages = js.Dynamic.literal(
          errors = formatMessagesAsArray(messages.filter(_.isError)),
          warnings = formatMessagesAsArray(messages.filter(_.isWarning)),
          info = formatMessagesAsArray(messages.filter(_.kind.severity == 0))
        )
      )

    case Left(parseMessages) =>
      // Return parse errors only
      js.Dynamic.literal(
        succeeded = false,
        parseErrors = formatMessagesAsArray(parseMessages),
        validationMessages = ...
      )
  }
}
```

**What this does:**
- Runs full validation pipeline (Symbols → Resolution → Validation)
- Separates parse errors from validation messages
- Groups validation messages by severity (errors, warnings, info)

#### 2. Enhanced Diagnostics Provider

**Updated `diagnosticsProvider.ts`:**
- Now calls `RiddlAPI.validateString()` instead of `parseString()`
- Processes three categories of diagnostics:
  1. **Parse errors** - `RIDDL (syntax)` source, red squiggles
  2. **Validation errors** - `RIDDL (validation)` source, red squiggles
  3. **Validation warnings** - `RIDDL (validation)` source, yellow squiggles
  4. **Validation info** - `RIDDL (info)` source, blue squiggles

**Example diagnostic processing:**
```typescript
// Parse errors (syntax)
for (const error of result.parseErrors) {
  const diagnostic = riddlErrorToDiagnostic(error, document);
  diagnostic.source = 'RIDDL (syntax)';
  diagnostic.severity = vscode.DiagnosticSeverity.Error;
  diagnostics.push(diagnostic);
}

// Validation errors (semantic)
for (const error of result.validationMessages.errors) {
  const diagnostic = riddlErrorToDiagnostic(error, document);
  diagnostic.source = 'RIDDL (validation)';
  diagnostic.severity = vscode.DiagnosticSeverity.Error;
  diagnostics.push(diagnostic);
}

// Validation warnings
for (const warning of result.validationMessages.warnings) {
  const diagnostic = riddlErrorToDiagnostic(warning, document);
  diagnostic.source = 'RIDDL (validation)';
  diagnostic.severity = vscode.DiagnosticSeverity.Warning;
  diagnostics.push(diagnostic);
}
```

### What's Now Detected

**Syntax/Parse Errors (already supported):**
- Missing closing braces
- Invalid syntax
- Unexpected tokens
- Malformed expressions

**NEW - Semantic/Validation Errors:**
- Undefined type references
- Invalid cross-references
- Type mismatches
- Semantic constraint violations
- Missing required definitions
- Naming convention violations
- Domain-specific rule violations

**NEW - Validation Warnings:**
- Style issues
- Missing documentation
- Usage warnings
- Incomplete definitions

### Visual Distinction

Diagnostics are now distinguished by **source** label in the Problems panel:

- `RIDDL (syntax)` - Parse/syntax errors (red)
- `RIDDL (validation)` - Semantic errors/warnings (red for errors, yellow for warnings)
- `RIDDL (info)` - Informational messages (blue)

**In the editor:**
- Syntax errors: Red squiggly underlines
- Validation errors: Red squiggly underlines
- Validation warnings: Yellow squiggly underlines
- Info messages: Blue squiggly underlines

### Testing

Updated test suite to account for validation:
- Tests now distinguish between syntax and semantic errors
- Validates that syntactically valid but incomplete code passes parse but may have validation warnings
- Tests confirm proper source labeling

**All 40 tests passing** including new validation scenarios.

## Future Enhancements

### Phase 3: Enhanced Error Information

- **Related information:** Show related locations for cross-reference errors
- **Quick fixes:** Suggest fixes for common errors
- **Code actions:** Add missing definitions, import statements, etc.
- **Severity configuration:** Allow users to configure which validation checks to run

## Example Output

When you open a file with errors:

```riddl
domain BadDomain is { ???
```

You see:
- Red squiggly underline under the code
- On hover: "Parse error: requirement failed: fail: 25 >= 26"
- In Problems panel: "RIDDL (parse-exception) [1,1]: Parse error: requirement failed..."

## Architecture

```
User edits file
       ↓
onDidChangeTextDocument event
       ↓
updateDiagnostics() [debounced 500ms]
       ↓
parseDiagnostics()
       ↓
RiddlAPI.parseString()
       ↓
Extract errors from result
       ↓
Convert to VSCode diagnostics
       ↓
Set diagnostic collection
       ↓
VSCode shows squiggly underlines
```

## Performance

- **Debouncing:** 500ms delay prevents excessive parsing while typing
- **Incremental:** Only re-parses changed documents
- **Non-blocking:** Parsing happens asynchronously
- **Efficient:** Reuses same parser infrastructure as semantic tokens

## User Experience

- **Immediate feedback:** Errors appear 500ms after you stop typing
- **Clear indication:** Red squiggles show exact location of error
- **Helpful messages:** Hover shows full error message
- **Problems panel:** All errors listed in VSCode Problems panel
- **Navigation:** Click in Problems panel to jump to error

## Summary

Milestone 5 provides essential error checking for RIDDL files, showing syntax/parse errors in real-time as you edit. While it currently only shows parse errors, the architecture is ready to be enhanced with validation errors once the RIDDL library facade exposes the validation passes.

**Next Steps:**
1. Enhance RIDDL library to expose validation API
2. Add validation diagnostics alongside parse diagnostics
3. Distinguish between syntax and semantic errors visually
4. Add quick fixes and code actions
