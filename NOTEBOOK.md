# Engineering Notebook: RIDDL VS Code Extension

## Current Status

**All milestones complete.** Extension has full feature parity with IntelliJ
IDEA plugin for RIDDL language support. All 112 tests passing.

**Current RIDDL Library Version**: 1.1.1-1-7bc49bb2-20260120-1709

---

## Feature Analysis: VS Code vs IntelliJ Plugin

### Already Implemented (Milestones 1-7)

| Feature | Status | Notes |
|---------|--------|-------|
| Syntax Highlighting | ✅ | TextMate grammar |
| Semantic Tokens | ✅ | RIDDL tokenizer integration |
| Hover Documentation | ✅ | Keyword help |
| Diagnostics | ✅ | Syntax + semantic validation |
| Code Completion | ✅ | Context-aware keywords |
| Go to Definition | ✅ | Navigate to definitions |
| Find References | ✅ | Find all usages |
| Commands | ✅ | info, parse, validate, translate |
| Comment Toggle | ✅ | Via language-configuration.json |
| Bracket Matching | ✅ | Via language-configuration.json |
| Auto-close Pairs | ✅ | Via language-configuration.json |

### Feature Gaps vs IntelliJ Plugin

| Feature | IntelliJ | VS Code | Priority |
|---------|----------|---------|----------|
| MCP Client Infrastructure | ✅ | ✅ | Done |
| MCP AI Integration | ✅ | ✅ | Done |
| Generate from Description | ✅ | ✅ | Done |
| Explain Error (AI) | ✅ | ✅ | Done |
| Suggest Next Steps (AI) | ✅ | ✅ | Done |
| Check Completeness | ✅ | ✅ | Done |
| Check Simulability | ✅ | ✅ | Done |
| Code Actions (Light Bulb) | ✅ | ✅ | Done |
| Code Folding | ✅ | ✅ | Done |
| Document Outline/Structure | ✅ | ✅ | Done |
| Enhanced Completions | ✅ | ✅ | Done |
| Color Customization | ✅ | Partial | Low (future) |

---

## Roadmap

### Milestone 8: RIDDL Library 1.1.1 Upgrade

**Goal**: Update to RIDDL library 1.1.1 with BAST support.

**Tasks**:
1. Rebuild riddl-lib npm package from riddl 1.1.1
2. Update package.json dependency
3. Update riddl-lib.d.ts (BASTImport node, endOffset in Location)
4. Test all existing functionality
5. Handle BAST imports gracefully (browser limitation)

**1.1.1 Changes**:
- BAST (Binary AST) support - 6-10x faster loading, 63-71% size reduction
- New `BASTImport` node type (won't load in browser/JS)
- Syntax changes: removed `stop` statement, changed `reply` to `send`
- No breaking API changes for npm consumers

---

### Milestone 9: MCP Client Infrastructure

**Goal**: Create HTTP client for MCP server communication.

**Architecture**:
```
src/mcp/
├── mcpClient.ts       # HTTP JSON-RPC 2.0 client
├── mcpService.ts      # VS Code service wrapper
├── mcpTypes.ts        # TypeScript interfaces
└── mcpConfig.ts       # Configuration handling
```

**MCP Server Tools Available**:
- `validate-text` - Full RIDDL validation
- `validate-partial` - Validate incomplete models
- `check-completeness` - Find missing elements
- `check-simulability` - Check riddlsim compatibility
- `map-domain-to-riddl` - Generate RIDDL from natural language
- `explain-error` - Explain validation errors with suggestions
- `suggest-next` - Prioritized next steps for model completion

**Protocol**: HTTP JSON-RPC 2.0 to `/mcp/v1` endpoint

**Configuration** (to add to package.json):
- `riddl.mcp.serverUrl` - Default: http://localhost:8080
- `riddl.mcp.apiKey` - Optional authentication
- `riddl.mcp.enabled` - Enable/disable MCP features
- `riddl.mcp.autoConnect` - Auto-connect on activation

---

### Milestone 10: MCP Commands

**Goal**: Add commands for direct MCP tool invocation.

**Commands**:
| Command | MCP Tool | Description |
|---------|----------|-------------|
| `riddl.mcp.connect` | - | Connect to MCP server |
| `riddl.mcp.disconnect` | - | Disconnect from server |
| `riddl.mcp.validate` | validate-text | Validate via MCP |
| `riddl.mcp.validatePartial` | validate-partial | Validate incomplete model |
| `riddl.mcp.checkCompleteness` | check-completeness | Find missing elements |
| `riddl.mcp.checkSimulability` | check-simulability | Check simulation ready |
| `riddl.mcp.explainError` | explain-error | Explain validation error |
| `riddl.mcp.suggestNext` | suggest-next | Suggest next steps |

**UI Elements**:
- Status bar connection indicator
- Output channel for MCP results
- Command palette entries

---

### Milestone 11: AI-Assisted Code Generation

**Goal**: Enable generating RIDDL from natural language descriptions.

**Features**:
1. **Generate RIDDL from Description** command
   - Input dialog for natural language description
   - Insert generated RIDDL at cursor
   - Uses `map-domain-to-riddl` MCP tool

2. **Code Actions (Light Bulb)**
   - On empty blocks `{ ??? }`, offer generation
   - On validation errors, offer "Explain this error"

3. **Quick Fix Integration**
   - Explain error action on diagnostics
   - Generate suggested content for missing elements

---

### Milestone 12: Code Folding

**Goal**: Add intelligent code folding for RIDDL blocks.

**Foldable Constructs**:
- Definitions: domain, context, entity, adaptor, repository, projector,
  saga, streamlet, handler, function, state, type, epic, case, application
- Handlers: on command, on event, on query
- Comments: multi-line `/* ... */` blocks

**Implementation**: `FoldingRangeProvider` using RIDDL parser for boundaries.

---

### Milestone 13: Document Outline / Structure View

**Goal**: Add hierarchical document outline in Outline panel.

**Features**:
- Hierarchical tree showing definition structure
- Click to navigate
- Icons for definition types
- Breadcrumb navigation support

**Symbol Mapping**:
| RIDDL | VS Code SymbolKind |
|-------|-------------------|
| domain | Module |
| context | Namespace |
| entity | Class |
| type | TypeParameter |
| handler | Method |
| function | Function |
| state | Struct |
| repository | Interface |

---

### Milestone 14: Enhanced Completions

**Goal**: Improve code completion with full IntelliJ parity.

**Enhancements**:
1. **Context-Aware Keywords** by nesting level
2. **Type Completion** - All 30+ predefined types
3. **Readability Words** - is, are, of, to, from, by, for, with, as, in, on, at
4. **Snippet Completions** - Templates for domain, context, entity, handler

---

## Implementation Order

### Phase 1: Foundation
1. Milestone 8: Upgrade to RIDDL 1.1.1 (prerequisite)
2. Milestone 9: MCP Client Infrastructure

### Phase 2: AI Integration
3. Milestone 10: MCP Commands
4. Milestone 11: AI-Assisted Code Generation

### Phase 3: Editor Enhancements
5. Milestone 12: Code Folding
6. Milestone 13: Document Outline
7. Milestone 14: Enhanced Completions

---

## Dependencies

```
Milestone 8 (1.1.1 Upgrade)
    │
    └── Milestone 9 (MCP Client)
            │
            ├── Milestone 10 (MCP Commands)
            │       │
            │       └── Milestone 11 (AI Generation)
            │
            └── Independent:
                    ├── Milestone 12 (Code Folding)
                    ├── Milestone 13 (Document Outline)
                    └── Milestone 14 (Enhanced Completions)
```

---

## Resolved Questions (2026-01-20)

1. **MCP Server Deployment**: Yes, support both local and remote servers. Local
   needed for testing; remote for future paid subscriptions. **Open sub-question**:
   Should we embed MCP analysis logic directly in extension (via Scala.js) to
   eliminate network latency? See Architecture Discussion below.

2. **AI Feature Default**: ON by default. Future subscription key requirement
   will be added later when charging for MCP services.

3. **Snippet Library**: YES - Include comprehensive pattern snippets
   (Event-Sourced Entity, Aggregate Root, Saga, Repository, Projector, etc.)

4. **Multi-file Support**: YES - Project defined by top-level RIDDL file +
   includes/imports. BAST imports may be shared between projects.

5. **Phase 3 Priority**: No specific order required; all needed before release.

---

## Architecture Decision: Remote MCP Server (2026-01-20)

### Decision
Use client → server architecture via JSON-RPC 2.0 for all MCP features.
This matches the IntelliJ plugin implementation.

### Rationale
The MCP server's core value is **AI-assisted model development** - enabling
back-and-forth sessions where an AI uses deep domain knowledge to help users
create RIDDL models. This interactive refinement capability requires the
server; it's not just validation wrapping.

### Future Consideration: Local Analysis API
A separate analysis module could be added to riddl core for simple AST queries
(similar to the old StatsCommand approach). This would:
- Provide a clean API for JVM/JS tools to analyze AST
- Enable local analysis without server dependency
- Be packaged via existing `../riddl/scripts/` infrastructure

**Potential analyses to consider:**
- Completeness checking (missing handlers, empty definitions)
- Simulability validation (riddlsim compatibility)
- Statistics (definition counts, complexity metrics)
- Dependency graph extraction
- Reference resolution status

This is deferred for future design consideration. Current focus is IntelliJ
parity with server-based MCP integration.

---

## Technical Notes

### MCP Protocol
- HTTP JSON-RPC 2.0 to `/mcp/v1`
- Request: `{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{...}}`
- Session ID header: `X-Session-ID: vscode-{uuid}`
- 30-second timeout recommended

### Coordinate System
- RIDDL: 1-based (line 1, col 1)
- VS Code: 0-based (line 0, col 0)
- Always subtract 1 when converting RIDDL → VS Code

### ANSI Code Stripping
MCP server may return ANSI codes. Strip with: `/\x1b\[[0-9;]*m/g`

### BAST in Browser
BAST file loading not supported in JS platform. Files with `import "x.bast"`
will parse but import contents won't load. Show informational diagnostic.

---

## Work Completed (Recent)

- [x] Milestones 1-7 complete (syntax, diagnostics, completion, navigation)
- [x] Feature gap analysis vs IntelliJ plugin
- [x] MCP server capability research
- [x] RIDDL 1.1.1 API change analysis
- [x] Roadmap created
- [x] **Milestone 8: RIDDL 1.1.1 upgrade** (2026-01-20)
  - Built riddl-lib npm package: 1.1.1-1-7bc49bb2-20260120-1709
  - Updated package.json dependency
  - All 65 tests passing
  - Note: Validation edge case throws `requirement failed: fail: 25 >= 26`
    in riddl-lib (gracefully handled, may need fix in riddl core)
- [x] **Milestone 9: MCP Client Infrastructure** (2026-01-21)
  - Created `src/mcp/` module with:
    - `mcpTypes.ts` - JSON-RPC 2.0 and MCP protocol type definitions
    - `mcpClient.ts` - HTTP client for MCP server communication
    - `mcpService.ts` - VS Code integration (status bar, output channel,
      configuration, auto-connect)
    - `index.ts` - Barrel export file
  - Added package.json configuration:
    - `riddl.mcp.enabled` (default: true)
    - `riddl.mcp.serverUrl` (default: http://localhost:8080)
    - `riddl.mcp.apiKey` (optional)
    - `riddl.mcp.autoConnect` (default: true)
  - Added commands: `riddl.mcp.toggleConnection`, `riddl.mcp.showOutput`
  - Created test suite `test/suite/mcp.test.ts` with 13 tests for:
    - Type guards (isJsonRpcError, isJsonRpcSuccess)
    - JsonRpcErrorCodes constants
    - McpClientDefaults values
    - Client creation, session ID generation
    - Error handling for unavailable server
  - Integrated MCP service with extension.ts (activate/deactivate)
  - All 78 tests passing
- [x] **Milestone 10: MCP Commands** (2026-01-21)
  - Created `src/mcp/mcpCommands.ts` with:
    - `mcpValidate()` - Validate via MCP server
    - `mcpValidatePartial()` - Validate incomplete model
    - `mcpCheckCompleteness()` - Find missing elements
    - `mcpCheckSimulability()` - Check riddlsim compatibility
    - `mcpExplainError()` - Explain validation error with AI
    - `mcpSuggestNext()` - AI-powered next steps suggestion
    - `mcpGenerateRiddl()` - Generate RIDDL from description
  - Added 7 new commands to package.json command palette
  - Registered all MCP tool commands in extension.ts
  - Features include:
    - Progress indicators during MCP operations
    - Output channel formatting for results
    - ANSI code stripping for clean output
    - Error handling for unavailable server
    - Input dialogs for explain-error and generate-riddl
    - Automatic new document creation for generated RIDDL
  - Added 10 new tests for MCP client tool methods
  - All 88 tests passing
- [x] **Milestone 11: AI-Assisted Code Generation** (2026-01-21)
  - Created `src/codeActionsProvider.ts` with:
    - `RiddlCodeActionsProvider` - Light bulb suggestions for AI-assisted dev
    - Code action for empty blocks (`???`, `{ }`, `{}`) - Generate content
    - Code action for validation errors - Explain error with AI
    - Code action for syntax errors - Suggest fix with AI
    - Code action for warnings - Explain warning with AI
  - Registered three new code action commands:
    - `riddl.codeAction.generateContent` - Insert AI-generated RIDDL
    - `riddl.codeAction.explainError` - Show AI error explanation
    - `riddl.codeAction.suggestFix` - Show AI fix suggestion
  - Features include:
    - Automatic definition context detection (domain, entity, etc.)
    - Surrounding code context for accurate fixes
    - Progress indicators during MCP operations
    - Output channel integration for explanations
  - Created test suite `test/suite/codeActions.test.ts` with 7 tests
  - All 95 tests passing
- [x] **Milestone 12: Code Folding** (2026-01-21)
  - Created `src/foldingProvider.ts` with:
    - `RiddlFoldingRangeProvider` - Intelligent code folding
    - Brace-based folding for all RIDDL definitions
    - Multi-line comment folding (`/* ... */`)
    - Consecutive single-line comment folding
    - Region marker support (`// #region` / `// #endregion`)
  - Folding features:
    - Correctly ignores braces inside strings
    - Correctly ignores braces inside comments
    - Handles nested definitions (domain → context → entity → handler)
    - Only creates ranges for multi-line blocks
  - Created test suite `test/suite/folding.test.ts` with 9 tests
  - All 104 tests passing
- [x] **Milestone 13: Document Outline** (2026-01-21)
  - Created `src/documentSymbolProvider.ts` with:
    - `RiddlDocumentSymbolProvider` - Outline and breadcrumb support
    - Token-based symbol extraction using RIDDL parser
    - Fallback regex-based parsing for error resilience
    - Hierarchical symbol tree based on nesting
  - Symbol kind mappings:
    - domain → Module
    - context → Namespace
    - entity/adaptor/streamlet → Class
    - repository/projector/saga → Interface
    - type → TypeParameter
    - state → Struct
    - handler → Method
    - function → Function
    - command/event/query → Event
  - Features:
    - Click-to-navigate in Outline view
    - Breadcrumb navigation support
    - Go to Symbol (Ctrl+Shift+O)
    - Proper icon assignment for definition types
  - Created test suite `test/suite/documentSymbol.test.ts` with 8 tests
  - All 112 tests passing
- [x] **Milestone 14: Enhanced Completions** (2026-01-21)
  - Enhanced `src/completionProvider.ts` with:
    - 15 additional predefined types (Byte, Bytes, Pattern, Range, LatLong,
      Location, Email, Phone, Natural, Real, Optional, OneOrMore, ZeroOrMore,
      Mapping, Set)
    - 9 comprehensive DDD pattern snippets:
      - Event-Sourced Entity (full template with state, commands, events)
      - Aggregate Root (with invariants and CRUD operations)
      - Repository Pattern (query and persistence handlers)
      - Saga Pattern (distributed transaction orchestration)
      - Projector Pattern (read model from events)
      - Streamlet Processor (stream processing)
      - Handler with On Clauses (command/event/query handlers)
      - Epic with Cases (user story with scenarios)
      - Context with Common Elements (bounded context template)
  - Total completions: 60+ keywords, 34 types, 15 readability words, 9 patterns
  - All 112 tests passing

## Status: All Milestones Complete

All milestones (1-14) have been completed. The VS Code extension now has
feature parity with the IntelliJ IDEA plugin for RIDDL language support.

## Summary of Implemented Features

**Core Language Support (Milestones 1-7)**:
- Syntax highlighting (TextMate + Semantic tokens)
- Hover documentation for keywords and types
- Real-time diagnostics (syntax + semantic validation)
- Code completion with snippets
- Go to Definition
- Find All References
- Commands (info, parse, validate, translate)

**AI-Assisted Development (Milestones 8-11)**:
- RIDDL 1.1.1 library integration with BAST support
- MCP client for riddl-mcp-server communication
- MCP commands for AI tools
- Code actions (light bulb) for AI suggestions

**Editor Enhancements (Milestones 12-14)**:
- Code folding for definitions and comments
- Document outline with breadcrumbs
- Enhanced completions with DDD pattern snippets

---

## Design Decisions Log

| Decision | Rationale | Alternatives | Date |
|----------|-----------|--------------|------|
| Remote MCP server | AI-assisted dev needs server; local analysis deferred | Embedded Scala.js | 2026-01-20 |
| JSON-RPC 2.0 over HTTP | Match IntelliJ impl, MCP standard | WebSocket, gRPC | 2026-01-20 |
| Session per workspace | VS Code workspace model | Per-document, global | 2026-01-20 |
| Debounced MCP calls | Avoid server overload | Eager calls | 2026-01-20 |