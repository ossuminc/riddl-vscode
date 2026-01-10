# RIDDL VSCode Extension - Guide for Claude Code

This file provides guidance for working with the RIDDL VSCode extension. For RIDDL language/compiler guidance, see `../riddl/CLAUDE.md`.

## Project Overview

This is a VSCode extension providing language support for RIDDL (Reactive Interface to Domain Definition Language). The extension integrates the RIDDL compiler (Scala.js) via npm package and provides IDE features like syntax highlighting, diagnostics, code completion, and commands.

## Technology Stack

- **Language**: TypeScript
- **Platform**: VSCode Extension API
- **RIDDL Integration**: `@ossuminc/riddl-lib` npm package (Scala.js compiled to JavaScript)
- **Build Tool**: npm + TypeScript compiler
- **Testing**: Mocha + VSCode Test API

## Project Structure

```
riddl-vscode/
├── src/
│   ├── extension.ts              # Extension entry point, activation
│   ├── commands.ts                # RIDDL commands (info, parse, validate, translate)
│   ├── semanticTokensProvider.ts  # Semantic highlighting
│   ├── hoverProvider.ts           # Hover documentation
│   ├── diagnosticsProvider.ts     # Real-time error checking
│   ├── completionProvider.ts      # Code completion (IntelliSense)
│   ├── definitionProvider.ts      # Go to Definition
│   ├── referenceProvider.ts       # Find All References
│   └── riddl-lib.d.ts             # TypeScript declarations for riddl-lib
├── syntaxes/
│   └── riddl.tmLanguage.json      # TextMate grammar for syntax highlighting
├── test/
│   └── suite/                     # Test suites for each feature
├── language-configuration.json     # Editor features (brackets, comments, etc.)
├── package.json                    # Extension manifest and dependencies
├── tsconfig.json                   # TypeScript configuration
├── COMMANDS.md                     # User-facing command documentation
├── MILESTONE*.md                   # Technical implementation documentation
└── README.md                       # User-facing README
```

## Extension Architecture

### Milestone-Based Development

The extension was built incrementally through milestones:

1. ✅ **Milestone 1**: Basic syntax highlighting (TextMate grammar)
2. ✅ **Milestone 2**: RIDDL library integration (@ossuminc/riddl-lib)
3. ✅ **Milestone 3**: Semantic token provider
4. ✅ **Milestone 4**: Hover documentation
5. ✅ **Milestone 5**: Diagnostics (syntax + semantic validation)
6. ✅ **Milestone 6**: Code intelligence (completion, definitions, references)
7. ✅ **Milestone 7**: Commands (info, parse, validate, translate)
8. ⏳ **Milestone 8**: TBD (debugging not applicable for specification language)

Each milestone has a corresponding `MILESTONEn_*.md` file documenting the implementation.

### Provider Pattern

VSCode uses a **provider pattern** for language features:

```typescript
// Register a provider with VSCode
context.subscriptions.push(
    vscode.languages.registerHoverProvider('riddl', new RiddlHoverProvider())
);
```

Each provider implements a specific interface:
- `HoverProvider` → `provideHover()`
- `CompletionItemProvider` → `provideCompletionItems()`
- `DefinitionProvider` → `provideDefinition()`
- `ReferenceProvider` → `provideReferences()`
- `DocumentSemanticTokensProvider` → `provideDocumentSemanticTokens()`

### RIDDL Library Integration

The extension uses `@ossuminc/riddl-lib`, a Scala.js npm package:

**Installation**:
```json
{
  "dependencies": {
    "@ossuminc/riddl-lib": "file:../riddl/npm-packages/ossuminc-riddl-lib-<version>.tgz"
  }
}
```

**Import and Usage**:
```typescript
import { RiddlAPI } from '@ossuminc/riddl-lib';

// Parse RIDDL source
const result = RiddlAPI.parseString(source, origin, verbose);

// Validate RIDDL source (includes parsing + semantic validation)
const validationResult = RiddlAPI.validateString(source, origin, verbose, noANSI);

// Tokenize for syntax highlighting
const tokensResult = RiddlAPI.parseToTokens(source, origin, verbose);

// Get build info
const buildInfo = RiddlAPI.buildInfo;
const formatInfo = RiddlAPI.formatInfo; // Pre-formatted string
```

**TypeScript Declarations**:
All API types are declared in `src/riddl-lib.d.ts` for type safety.

### Output Channels vs Diagnostics

**Two different display mechanisms**:

1. **Output Channel** (for commands):
   ```typescript
   const channel = vscode.window.createOutputChannel('RIDDL');
   channel.appendLine('Output text');
   channel.show();
   ```
   - User-initiated display (commands)
   - Plain text output
   - Used by: riddl.info, riddl.parse, riddl.validate, riddl.translate

2. **Diagnostics** (for real-time errors):
   ```typescript
   const diagnosticCollection = vscode.languages.createDiagnosticCollection('riddl');
   diagnosticCollection.set(document.uri, diagnostics);
   ```
   - Automatic display (squiggly underlines)
   - Integrated with Problems panel
   - Used by: diagnosticsProvider

### ANSI Code Handling

**Problem**: RIDDL library outputs ANSI color codes, but VSCode Output panel doesn't render them.

**Solution**: Strip ANSI codes before displaying:

```typescript
function stripAnsiCodes(text: string): string {
    // Remove ANSI escape sequences
    let cleaned = text.replace(/\x1b\[[0-9;]*m/g, '');
    // Also remove any remaining bracket-style codes
    cleaned = cleaned.replace(/\[([0-9]+;)*[0-9]*m/g, '');
    return cleaned;
}
```

**When to use**:
- Apply to all error messages shown in Output channel
- Apply to all diagnostic messages
- NOT needed for internal processing (only display)

### Coordinate System Conversion

**RIDDL uses 1-based coordinates**, **VSCode uses 0-based**:

```typescript
// RIDDL location → VSCode Range
const line = Math.max(0, riddlLocation.line - 1);
const col = Math.max(0, riddlLocation.col - 1);
const range = new vscode.Range(line, col, line, endCol);
```

**Always subtract 1** when converting from RIDDL to VSCode coordinates.

## Common Patterns

### Debounced Processing

For expensive operations (parsing, validation), use debouncing:

```typescript
private parseTimeout: NodeJS.Timeout | undefined;
private readonly debounceDelay = 500; // ms

public updateDiagnostics(document: vscode.TextDocument): void {
    if (this.parseTimeout) {
        clearTimeout(this.parseTimeout);
    }

    this.parseTimeout = setTimeout(() => {
        this.parseDiagnostics(document);
    }, this.debounceDelay);
}
```

**Why**: Avoids excessive parsing while user is typing.

### Document Lifecycle Events

Subscribe to document events in `extension.ts`:

```typescript
// Document opened
context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument((doc) => {
        if (doc.languageId === 'riddl') {
            // Initialize providers for this document
        }
    })
);

// Document changed
context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((event) => {
        if (event.document.languageId === 'riddl') {
            // Update diagnostics, semantic tokens, etc.
        }
    })
);

// Document closed
context.subscriptions.push(
    vscode.workspace.onDidCloseTextDocument((doc) => {
        if (doc.languageId === 'riddl') {
            // Clear diagnostics, dispose resources
        }
    })
);
```

**Always check** `languageId === 'riddl'` to avoid processing non-RIDDL files.

### Error Handling in Commands

All commands should handle missing editor and wrong file type:

```typescript
export function riddlParse(): void {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
        vscode.window.showErrorMessage('No active editor found. Please open a RIDDL file.');
        return;
    }

    if (editor.document.languageId !== 'riddl') {
        vscode.window.showErrorMessage('Current file is not a RIDDL file.');
        return;
    }

    // Proceed with command...
}
```

### Diagnostic Severity Mapping

Map RIDDL message types to VSCode severities:

```typescript
// Parse errors → Error severity
diagnostic.severity = vscode.DiagnosticSeverity.Error;
diagnostic.source = 'RIDDL (syntax)';

// Validation errors → Error severity
diagnostic.severity = vscode.DiagnosticSeverity.Error;
diagnostic.source = 'RIDDL (validation)';

// Warnings → Warning severity
diagnostic.severity = vscode.DiagnosticSeverity.Warning;
diagnostic.source = 'RIDDL (validation)';

// Info → Information severity
diagnostic.severity = vscode.DiagnosticSeverity.Information;
diagnostic.source = 'RIDDL (info)';
```

**Source label** distinguishes error types in Problems panel.

## Development Workflow

### Building and Running

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch mode (auto-recompile on changes)
npm run watch

# Run tests
npm run test

# Lint
npm run lint

# Package for distribution
npm run package
```

### Testing the Extension

1. Open project in VSCode
2. Press `F5` to launch Extension Development Host
3. In the new window, open a `.riddl` file
4. Test features:
   - Syntax highlighting
   - Hover over keywords
   - Code completion (Ctrl+Space)
   - Go to Definition (F12)
   - Find References (Shift+F12)
   - Commands (Cmd+Shift+P)
   - Real-time diagnostics (type errors)

### Updating RIDDL Library

When the RIDDL library is updated:

1. **Rebuild npm package** in riddl repository:
   ```bash
   cd ../riddl
   ./scripts/pack-npm-modules.sh riddlLib
   ```

2. **Update package.json** with new version:
   ```json
   "@ossuminc/riddl-lib": "file:../riddl/npm-packages/ossuminc-riddl-lib-<new-version>.tgz"
   ```

3. **Reinstall**:
   ```bash
   npm install
   ```

4. **Test** the extension with new library

### Documentation Standards

**Three types of documentation**:

1. **MILESTONE*.md** - Technical implementation docs
   - How features are implemented
   - Code snippets and architecture
   - Testing results
   - For developers/contributors

2. **COMMANDS.md** - User-facing command reference
   - How to use each command
   - Example outputs
   - Tips and best practices
   - For end users

3. **README.md** - Project overview
   - Feature list
   - Installation instructions
   - Quick start guide
   - For all audiences

**When adding features**, update all three as appropriate.

## Common Pitfalls

### 1. Forgetting to Check Language ID

**Wrong**:
```typescript
vscode.workspace.onDidChangeTextDocument((event) => {
    updateDiagnostics(event.document); // Runs on ALL files!
});
```

**Correct**:
```typescript
vscode.workspace.onDidChangeTextDocument((event) => {
    if (event.document.languageId === 'riddl') {
        updateDiagnostics(event.document);
    }
});
```

### 2. Coordinate System Confusion

**Wrong**:
```typescript
const range = new vscode.Range(error.location.line, error.location.col, ...);
// RIDDL uses 1-based, VSCode uses 0-based!
```

**Correct**:
```typescript
const line = Math.max(0, error.location.line - 1);
const col = Math.max(0, error.location.col - 1);
const range = new vscode.Range(line, col, ...);
```

### 3. Not Stripping ANSI Codes

**Wrong**:
```typescript
channel.appendLine(error.message); // May contain ANSI codes
```

**Correct**:
```typescript
channel.appendLine(stripAnsiCodes(error.message));
```

### 4. Mixing Output Channels and Diagnostics

**Commands** → Output Channel
**Real-time errors** → Diagnostics

Don't use diagnostics for command output or output channel for real-time errors.

### 5. Disposing Resources

Always dispose resources when deactivated:

```typescript
export function deactivate() {
    disposeCommands();
    // Dispose other resources
}
```

## Git Workflow

### Branch Strategy

- **master** - Production releases (currently active branch)
- Create feature branches for major new features
- Commit completed milestones to master

### Commit Messages

Follow this format:

```
Short description (imperative mood)

Detailed explanation of what changed and why.
Focus on "why" rather than "what".

Features:
- Feature 1
- Feature 2

Fixes:
- Fix 1

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

### What to Commit

**Include**:
- Source files (`src/*.ts`)
- Configuration (`package.json`, `tsconfig.json`)
- Documentation (`*.md`)
- Tests (`test/**/*.ts`)
- Syntaxes (`syntaxes/*.json`)

**Exclude** (should be in .gitignore):
- `node_modules/`
- `out/` (compiled output)
- `*.vsix` (packaged extension)
- `.vscode-test/` (test artifacts)

## RIDDL Library API Reference

### Key Methods

**parseString(source, origin, verbose)**:
- Returns: `{ succeeded: boolean, value?: Root, errors?: Array<Error> }`
- Use for: Getting AST structure

**validateString(source, origin, verbose, noANSIMessages)**:
- Returns: `{ succeeded: boolean, parseErrors?: Array<Error>, validationMessages?: { errors, warnings, info } }`
- Use for: Full validation pipeline

**parseToTokens(source, origin, verbose)**:
- Returns: `{ succeeded: boolean, value?: Array<Token>, errors?: Array<Error> }`
- Use for: Semantic highlighting

**buildInfo**:
- Returns: Object with version, name, etc.
- Use for: Extension info display

**formatInfo**:
- Returns: Pre-formatted string with build info
- Use for: Quick info display

### Error Object Structure

```typescript
interface RiddlError {
    kind: string;           // Error type
    message: string;        // Error description (may contain ANSI codes)
    location: {
        line: number;       // 1-based line number
        col: number;        // 1-based column number
        offset: number;     // Character offset
        source: string;     // File path or "empty"
    };
}
```

## Testing Guidelines

### Test Organization

Each feature should have corresponding tests in `test/suite/`:
- `semanticTokens.test.ts`
- `hover.test.ts`
- `diagnostics.test.ts`
- `completion.test.ts`
- `definition.test.ts`
- `reference.test.ts`

### Test Pattern

```typescript
suite('Feature Name', () => {
    test('Test description', async () => {
        // Arrange
        const document = await vscode.workspace.openTextDocument({
            language: 'riddl',
            content: 'domain Test is { ??? }'
        });

        // Act
        const result = await provider.provide(document, position);

        // Assert
        assert.strictEqual(result.length, expectedCount);
    });
});
```

### Running Tests

```bash
npm run test
```

Tests run in a VSCode instance automatically.

## Notes for Future Sessions

1. **Language ID check is critical** - Always check `languageId === 'riddl'` in event handlers
2. **Coordinate conversion required** - RIDDL uses 1-based, VSCode uses 0-based (subtract 1)
3. **Strip ANSI codes for display** - Use `stripAnsiCodes()` for all user-visible output
4. **Debounce expensive operations** - 500ms delay for parsing/validation
5. **Two display mechanisms** - Output channel for commands, diagnostics for real-time errors
6. **Update npm package carefully** - Rebuild riddl library, update package.json, npm install
7. **Three documentation types** - Technical (MILESTONE*.md), User (COMMANDS.md), Overview (README.md)
8. **Dispose resources on deactivate** - Clean up in `deactivate()` function
9. **Test each feature** - Add tests to `test/suite/` for new features
10. **Source labels distinguish error types** - "RIDDL (syntax)" vs "RIDDL (validation)" in Problems panel

## Related Projects

- **RIDDL Language**: `../riddl/` - Compiler and language implementation
- **RIDDL Documentation**: https://riddl.ossuminc.com
- **VSCode Extension API**: https://code.visualstudio.com/api

## Future Enhancements

Potential features for future milestones:
- Workspace-wide symbol search
- Refactoring support (rename symbol, extract definition)
- Snippet generation from templates
- RIDDL file wizards (new domain, new entity, etc.)
- Integration with riddlc translation commands
- Visual diagram generation from RIDDL
- Multi-file project support
