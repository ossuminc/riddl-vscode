# RIDDL Language Support for VSCode

Language support for RIDDL (Reactive Interface to Domain Definition Language), a specification language for designing distributed, reactive, cloud-native systems using Domain-Driven Design principles.

## Features

### ✅ Milestone 1: Basic Syntax Highlighting
- **TextMate Grammar**: Comprehensive syntax highlighting
  - Keywords (domain, context, entity, type, command, event, etc.)
  - Predefined types (String, Integer, Boolean, Id, etc.)
  - Readability words (is, of, by, for, to, etc.)
  - Comments (line and block)
  - Strings and code blocks
  - Operators and punctuation
- **Editor Configuration**: Auto-closing brackets, comment toggling, code folding
- **Status**: Complete

### ✅ Milestone 2: RIDDL Library Integration
- **JavaScript-Friendly API**: Integration with `@ossuminc/riddl-lib`
  - Parse RIDDL source to AST
  - Tokenize for syntax highlighting
  - Returns JavaScript arrays (not Scala collections)
  - Proper error handling with structured error objects
- **TypeScript Declarations**: Full type definitions
- **Status**: Complete

### ✅ Milestone 3: Semantic Highlighting
- **Semantic Token Provider**: Parser-based syntax highlighting
  - Accurate token identification using RIDDL parser
  - Context-aware coloring
  - Real-time updates as you type
  - Works with all VSCode themes
- **Two-Layer Highlighting**: TextMate + Semantic for complete coverage
- **Status**: Complete

### ✅ Milestone 4: Hover Documentation
- **Hover Provider**: Rich documentation on hover
  - **Keywords**: Explanation of RIDDL keywords (domain, context, entity, etc.)
  - **Predefined Types**: Documentation for built-in types (Id, String, Number, etc.)
  - **Readability Words**: Info about structural keywords (is, of, by, etc.)
  - **Location Info**: Shows line and column numbers
- **Markdown Formatted**: Rich content with code blocks and sections
- **Status**: Complete

### ✅ Milestone 5: Diagnostics (Syntax + Semantic)
- **Comprehensive Error Checking**: Both syntax and semantic errors shown as squiggly underlines
  - **Parse/Syntax Errors**: Detects invalid syntax, missing braces, malformed expressions
  - **Validation Errors**: Detects undefined references, type mismatches, semantic violations
  - **Warnings**: Style issues, missing documentation, usage warnings
  - **Info Messages**: Informational hints and suggestions
- **Visual Distinction**: Source labels distinguish error types
  - `RIDDL (syntax)` - Parse errors (red squiggles)
  - `RIDDL (validation)` - Semantic errors (red squiggles)
  - `RIDDL (validation)` - Warnings (yellow squiggles)
  - `RIDDL (info)` - Info messages (blue squiggles)
- **Debounced Processing**: 500ms delay to avoid excessive processing while typing
- **Problems Panel Integration**: All diagnostics listed with full details
- **Status**: Complete (both syntax and semantic validation)

### ✅ Milestone 6: Code Intelligence
- **Completion Provider**: IntelliSense for RIDDL keywords, types, and identifiers
  - **Keywords**: All 50+ RIDDL keywords with snippets (domain, context, entity, command, etc.)
  - **Predefined Types**: Built-in types (String, Integer, Id, Boolean, etc.)
  - **Readability Words**: Structural keywords (is, of, by, with, etc.)
  - **Snippets**: Code templates for major constructs
  - **Documentation**: Rich descriptions for all completion items
- **Definition Provider**: "Go to Definition" (F12) navigation
  - Jump to where types, entities, commands, events are defined
  - Works across the entire document
  - Handles both user-defined and built-in types
- **Reference Provider**: "Find All References" (Shift+F12) functionality
  - Find all usages of a symbol
  - Optionally include or exclude the declaration
  - Works for types, entities, commands, events, and all identifiers
- **Status**: Complete

### ✅ Milestone 7: Commands
- **Four VSCode Commands**: Accessible via Command Palette (Cmd+Shift+P / Ctrl+Shift+P)
  - **RIDDL: Version Information**: Display RIDDL build info, version, and extension features
  - **RIDDL: Parse Current File**: Parse active file and show AST structure
  - **RIDDL: Validate Current File**: Run full validation (syntax + semantic) with errors/warnings
  - **RIDDL: Translate to Output Format**: Placeholder for future translation features
- **Output Panel Integration**: All results displayed in dedicated "RIDDL" output channel
- **Clean Formatting**: ANSI codes stripped, numbered messages, clear separators
- **Error Handling**: Graceful handling of missing editor, wrong file type, library errors
- **Status**: Complete

### 🚧 Upcoming Milestones
- **Milestone 8**: Debugging - Debug support for RIDDL

## Installation

### From Source (Development)

1. Clone this repository:
   ```bash
   git clone https://github.com/ossuminc/riddl-vscode
   cd riddl-vscode
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Compile the extension:
   ```bash
   npm run compile
   ```

4. Open the project in VSCode:
   ```bash
   code .
   ```

5. Press `F5` to launch the Extension Development Host

## Usage

### Commands

Access RIDDL commands via the Command Palette (`Cmd+Shift+P` on Mac, `Ctrl+Shift+P` on Windows/Linux):

#### RIDDL: Version Information
Display RIDDL build information, version, and extension features.

**Usage:**
1. Press `Cmd+Shift+P`
2. Type "RIDDL: Version Information"
3. View output in the RIDDL Output panel

#### RIDDL: Parse Current File
Parse the currently active RIDDL file and display the Abstract Syntax Tree (AST) structure.

**Usage:**
1. Open a `.riddl` file
2. Press `Cmd+Shift+P`
3. Type "RIDDL: Parse Current File"
4. View parse results and AST in the RIDDL Output panel

#### RIDDL: Validate Current File
Run full validation (syntax + semantic) on the currently active RIDDL file. Shows parse errors, validation errors, warnings, and informational messages.

**Usage:**
1. Open a `.riddl` file
2. Press `Cmd+Shift+P`
3. Type "RIDDL: Validate Current File"
4. View validation results in the RIDDL Output panel

#### RIDDL: Translate to Output Format
Placeholder for future translation features. Currently shows information about available `riddlc` translation commands.

### Editor Features

- **Syntax Highlighting**: Automatic for `.riddl` files
- **Hover Documentation**: Hover over keywords, types, and identifiers to see documentation
- **Code Completion**: Type to get IntelliSense suggestions (Ctrl+Space)
- **Go to Definition**: F12 or Cmd+Click on a type/identifier
- **Find All References**: Shift+F12 on any symbol
- **Real-time Diagnostics**: Errors and warnings appear as you type

## Development

### Project Structure

```
riddl-vscode/
├── src/
│   └── extension.ts          # Extension entry point
├── syntaxes/
│   └── riddl.tmLanguage.json # TextMate grammar for syntax highlighting
├── test/                     # Test files
├── language-configuration.json # Editor features configuration
├── package.json              # Extension manifest
├── tsconfig.json             # TypeScript configuration
└── README.md
```

### Building

```bash
# Compile TypeScript
npm run compile

# Watch mode (auto-recompile on changes)
npm run watch

# Lint
npm run lint

# Run tests
npm run test
```

### Testing the Extension

1. Open the project in VSCode
2. Press `F5` to launch the Extension Development Host
3. Open a `.riddl` file to see syntax highlighting
4. Try the command palette (`Cmd+Shift+P`) and run "RIDDL: Show Info"

### Packaging

To create a `.vsix` package for distribution:

```bash
npm run package
```

This creates a `riddl-vscode-*.vsix` file that can be installed with:

```bash
code --install-extension riddl-vscode-*.vsix
```

## RIDDL Language

RIDDL is a domain-specific language for designing distributed systems. Key concepts include:

- **Domain**: Top-level bounded contexts
- **Context**: Bounded contexts within domains
- **Entity**: Aggregates with state and behavior
- **Type**: Custom type definitions (commands, events, records, etc.)
- **Epic**: User stories and use cases
- **Processor**: Stream processing elements (sources, sinks, flows, etc.)

### Example RIDDL Code

```riddl
// Top level author
author Reid is {
  name: "Reid"
  email: "reid@ossum.biz"
}

// A domain definition
domain ECommerce is {
  type OrderId is Id(Order)

  command PlaceOrder(
    orderId: OrderId,
    items: String+
  )

  entity Order is {
    state OrderState is {
      orderId: OrderId,
      status: String
    }

    handler PlaceOrderHandler is {
      on command PlaceOrder {
        // Handle order placement
      }
    }
  }
} with {
  by author Reid
}
```

## Contributing

Contributions are welcome! This extension is being built incrementally with test-driven development.

### Development Roadmap

1. ✅ Milestone 1: Basic syntax highlighting via TextMate grammar
2. ✅ Milestone 2: RIDDL library integration (Scala.js)
3. ✅ Milestone 3: Semantic token provider
4. ✅ Milestone 4: Hover documentation
5. ✅ Milestone 5: Diagnostics (syntax + semantic validation)
6. ✅ Milestone 6: Code intelligence (completion, definitions, references)
7. ✅ Milestone 7: Commands (info, parse, validate, translate)
8. ⏳ Milestone 8: Debugging support

## License

Apache-2.0

## Links

- [RIDDL Language Repository](https://github.com/ossuminc/riddl)
- [RIDDL Documentation](https://riddl.ossuminc.com)
- [VSCode Extension API](https://code.visualstudio.com/api)

## Feedback

Please report issues at: https://github.com/ossuminc/riddl-vscode/issues
