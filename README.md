# RIDDL Language Support for VSCode

Language support for RIDDL (Reactive Interface to Domain Definition Language), a specification language for designing distributed, reactive, cloud-native systems using Domain-Driven Design principles.

## Features

### Milestone 1 (Current)
- **Syntax Highlighting**: Comprehensive TextMate grammar for RIDDL syntax
  - Keywords (domain, context, entity, type, etc.)
  - Predefined types (String, Integer, Boolean, etc.)
  - Comments (line and block)
  - Strings and code blocks
  - Markdown lines
  - Operators and punctuation
- **Editor Configuration**: Auto-closing brackets, comment toggling, and code folding

### Upcoming Milestones
- **Milestone 2**: Scala.js integration for semantic tokenization
- **Milestone 3**: Real-time diagnostics (errors and warnings)
- **Milestone 4+**: Hover information, go to definition, find references, code completion

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
2. ⏳ Milestone 2: Scala.js integration for semantic tokens
3. ⏳ Milestone 3: Real-time error diagnostics
4. ⏳ Milestone 4: Semantic features (hover, definitions, completion)

## License

Apache-2.0

## Links

- [RIDDL Language Repository](https://github.com/ossuminc/riddl)
- [RIDDL Documentation](https://riddl.ossuminc.com)
- [VSCode Extension API](https://code.visualstudio.com/api)

## Feedback

Please report issues at: https://github.com/ossuminc/riddl-vscode/issues
