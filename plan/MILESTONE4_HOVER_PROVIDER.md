# Milestone 4: Hover Provider - COMPLETE

## Overview

Successfully implemented hover provider for RIDDL language, displaying documentation and type information when hovering over RIDDL elements.

## Implementation

### 1. Hover Provider

**File:** `src/hoverProvider.ts`

Implements `vscode.HoverProvider` interface:
- Parses RIDDL documents using `RiddlAPI.parseToTokens()`
- Finds token at cursor position
- Generates contextual documentation in Markdown format
- Returns hover with range highlighting

### 2. Hover Content by Token Type

#### Keywords

Provides documentation for all RIDDL keywords:

| Keyword | Documentation |
|---------|---------------|
| `domain` | Top-level container for a bounded context in DDD. Groups related contexts, types, and definitions. |
| `context` | A bounded context containing entities, types, and functionality. Represents a cohesive subsystem. |
| `entity` | A domain entity with identity and lifecycle. Can be an aggregate root. |
| `type` | A type definition. Can be a simple type, record, enumeration, or other type expression. |
| `command` | A command that triggers behavior. Commands are handled by entities to produce events. |
| `event` | An event representing something that happened in the domain. Events are facts. |
| `query` | A query for retrieving information without side effects. |
| `result` | The result type returned by a query or function. |
| `handler` | Handles commands or events and implements business logic. |
| `state` | The state/data structure of an entity or aggregate. |
| `function` | A pure function definition. |
| `adaptor` | An adapter for external systems integration. |
| `projector` | Projects events into a read model. |
| `repository` | Storage abstraction for aggregates. |
| `saga` | Coordinates long-running transactions across aggregates. |
| `option` | Options/modifiers for definitions (e.g., aggregate, transient). |
| `include` | Includes another RIDDL file. |
| `import` | Imports definitions from another context or domain. |

#### Predefined Types

Documentation for built-in RIDDL types:

| Type | Documentation |
|------|---------------|
| `String` | A sequence of Unicode characters. |
| `Integer` | A whole number (64-bit signed integer). |
| `Number` | A numeric value (double-precision floating point). |
| `Boolean` | A true or false value. |
| `Date` | A calendar date. |
| `Time` | A time of day. |
| `DateTime` | A specific point in time. |
| `Timestamp` | A timestamp with millisecond precision. |
| `Duration` | A length of time. |
| `URL` | A uniform resource locator. |
| `Id` | An identifier type. Usage: `Id(EntityName)` creates a unique identifier for that entity. |
| `UUID` | A universally unique identifier (128-bit). |
| `Decimal` | A decimal number with exact precision. |
| `Currency` | A monetary value with currency code. |
| `Length` | A physical length measurement. |
| `Mass` | A mass/weight measurement. |
| `Temperature` | A temperature measurement. |
| `Nothing` | The unit type representing no value. |
| `Abstract` | An abstract type that must be refined. |
| `Optional` | An optional value that may or may not be present. Usage: `TypeName?` |

#### Readability Words

Identifies structural keywords:
- **Purpose:** Improve code readability
- **Examples:** `is`, `of`, `by`, `for`, `to`, `from`, `are`, `with`, etc.
- **Note:** These are optional syntactic sugar

#### Identifiers

Basic information for user-defined names:
- Shows the identifier name
- Indicates it's a user-defined name
- (Future: could resolve to definition and show type info)

#### Punctuation

Shows the punctuation symbol:
- Braces: `{`, `}`
- Parentheses: `(`, `)`
- Other: `,`, `:`, etc.

### 3. Hover Features

#### Markdown Formatting

All hover content uses VSCode Markdown:
- **Bold** for titles
- `Code blocks` for code elements
- Sections separated by horizontal rules (`---`)
- Location info with emoji: 📍

#### Range Highlighting

Hovers include the exact range of the token:
- Highlights the full token under cursor
- Makes it clear what element is being documented

#### Example Hover Content

When hovering over `domain`:

```markdown
**RIDDL Keyword:** `domain`

Top-level container for a bounded context in DDD. Groups related contexts, types, and definitions.

---

📍 Line 1, Column 1
```

When hovering over `Id`:

```markdown
**RIDDL Type:** `Id`

An identifier type. Usage: `Id(EntityName)` creates a unique identifier for that entity.

---

📍 Line 2, Column 19
```

### 4. Extension Integration

**File:** `src/extension.ts`

Registers the hover provider on activation:

```typescript
vscode.languages.registerHoverProvider(
    { language: 'riddl', scheme: 'file' },
    new RiddlHoverProvider()
);
```

### 5. Token Position Matching

**Algorithm:**
1. Parse document to get all tokens with locations
2. Convert VSCode position (0-based) to RIDDL position (1-based)
3. Find token where:
   - Token line matches cursor line
   - Cursor column is within token's start and end columns
4. Return matched token or null

## Testing

### Automated Tests

**File:** `test/suite/hover.test.ts`

8 comprehensive tests:

1. ✅ **Hover on keyword** - Shows documentation for `domain`
2. ✅ **Hover on identifier** - Shows info for user-defined name
3. ✅ **Hover on predefined type** - Shows documentation for `Id`
4. ✅ **Hover on readability word** - Shows info for `is`
5. ✅ **Hover includes location info** - Displays line and column
6. ✅ **Hover returns null for whitespace** - No hover on empty space
7. ✅ **Hover provides correct range** - Highlights full token
8. ✅ **Hover on multi-line code** - Works with complex structures

### Manual Testing in VSCode

#### Setup

1. **Compile:** `npm run compile`
2. **Open in VSCode:** `code /Users/reid/Code/ossuminc/riddl-vscode`
3. **Press F5** to launch Extension Development Host
4. **Open:** `test-files/semantic-test.riddl`

#### Testing Hovers

Hover over different elements and verify:

1. **Keywords** (domain, context, entity, type)
   - Should show documentation explaining the keyword
   - Should include location info

2. **Predefined Types** (Id, String, Number)
   - Should show type documentation
   - `Id` should mention usage pattern

3. **Identifiers** (ECommerce, OrderId, Cart)
   - Should show basic identifier info
   - (Future: will show type and definition)

4. **Readability Words** (is, of, by)
   - Should indicate it's a readability word
   - Should note it's optional syntactic sugar

5. **Range Highlighting**
   - Token should be highlighted when hovering
   - Highlight should cover the exact token

## Architecture

```
User hovers → VSCode → Hover Provider
                ↓
        Get document text
                ↓
        RiddlAPI.parseToTokens()
                ↓
        Find token at position
                ↓
        Generate hover content
         (based on token kind)
                ↓
        Create Markdown string
                ↓
        Return Hover with range
                ↓
        VSCode displays popup
```

## Performance

- **Fast:** Token-based lookup (no AST traversal needed)
- **Efficient:** Reuses tokenization results
- **Responsive:** Hover appears immediately
- **No blocking:** Async implementation

## Benefits

1. **In-Editor Documentation**
   - No need to look up keywords in external docs
   - Contextual help as you type

2. **Type Information**
   - Quick reference for predefined types
   - Understand type usage (e.g., `Id(Entity)`)

3. **Learning Aid**
   - Helps new RIDDL users learn the language
   - Explains purpose of each element

4. **Productivity**
   - Reduces context switching
   - Faster development

## Future Enhancements

### 1. AST-Based Hover

Currently uses tokens only. Could be enhanced to:
- Resolve identifiers to their definitions
- Show type information for variables
- Display entity/type signatures
- Show full documentation from RIDDL comments

### 2. Navigation Links

Add clickable links in hover:
- "Go to definition" link
- "Find all references" link
- "Open documentation" link

### 3. Examples in Hover

Include usage examples:
```markdown
**RIDDL Type:** `Id`

An identifier type for entities.

**Example:**
```riddl
type UserId is Id(User)
type OrderId is Id(Order)
```
```

### 4. Signature Information

For functions, commands, events:
```markdown
**Command:** `AddItem`

**Signature:**
```riddl
command AddItem is {
  productId: ProductId,
  quantity: Number
}
```
```

## Files Modified/Created

**Created:**
- `src/hoverProvider.ts` - Hover provider implementation
- `test/suite/hover.test.ts` - Automated tests (8 tests)
- `MILESTONE4_HOVER_PROVIDER.md` - This document

**Modified:**
- `src/extension.ts` - Register hover provider

## Status

✅ **Milestone 4: COMPLETE**

- Hover provider implemented
- Documentation for keywords and types
- Token position matching working
- Tests passing (8/8)
- Ready for manual testing in VSCode
- Documentation complete

## Dependencies

- `@ossuminc/riddl-lib@1.0.1-10-0a1ff8e6-20260108-1320`
- VSCode API 1.75.0+
- TypeScript 4.9.5

## Example Usage

Open a RIDDL file and hover over:

1. **`domain`** → See "Top-level container for a bounded context..."
2. **`Id`** → See "An identifier type. Usage: Id(EntityName)..."
3. **`is`** → See "A structural keyword that improves readability..."
4. **`TestDomain`** → See "User-defined name"

All hovers include location information (line and column).

## References

- [VSCode Hover Provider API](https://code.visualstudio.com/api/references/vscode-api#HoverProvider)
- [VSCode Language Extensions Guide](https://code.visualstudio.com/api/language-extensions/programmatic-language-features)
- [RIDDL Documentation](https://github.com/ossuminc/riddl)
