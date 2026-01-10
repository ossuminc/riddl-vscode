/**
 * Completion Provider for RIDDL language
 *
 * Provides autocomplete suggestions for keywords, types, and identifiers.
 */

import * as vscode from 'vscode';

/**
 * RIDDL keyword definitions with descriptions
 */
const RIDDL_KEYWORDS = [
    // Core Structure
    { label: 'domain', kind: vscode.CompletionItemKind.Keyword, detail: 'Top-level container for a bounded context', insertText: 'domain ${1:Name} is {\n  ${2:???}\n}', documentation: 'Top-level container for a bounded context in DDD. Groups related contexts, types, and definitions.' },
    { label: 'context', kind: vscode.CompletionItemKind.Keyword, detail: 'A bounded context', insertText: 'context ${1:Name} is {\n  ${2:???}\n}', documentation: 'A bounded context containing entities, types, and functionality. Represents a cohesive subsystem.' },

    // Entity and Aggregates
    { label: 'entity', kind: vscode.CompletionItemKind.Keyword, detail: 'A domain entity', insertText: 'entity ${1:Name} is {\n  ${2:???}\n}', documentation: 'A domain entity with identity and lifecycle. Can be an aggregate root.' },
    { label: 'adaptor', kind: vscode.CompletionItemKind.Keyword, detail: 'An adapter for external systems', insertText: 'adaptor ${1:Name} is {\n  ${2:???}\n}', documentation: 'An adapter for external systems integration.' },
    { label: 'projector', kind: vscode.CompletionItemKind.Keyword, detail: 'Projects events into a read model', insertText: 'projector ${1:Name} is {\n  ${2:???}\n}', documentation: 'Projects events into a read model.' },
    { label: 'repository', kind: vscode.CompletionItemKind.Keyword, detail: 'Storage abstraction for aggregates', insertText: 'repository ${1:Name} is {\n  ${2:???}\n}', documentation: 'Storage abstraction for aggregates.' },
    { label: 'saga', kind: vscode.CompletionItemKind.Keyword, detail: 'Coordinates long-running transactions', insertText: 'saga ${1:Name} is {\n  ${2:???}\n}', documentation: 'Coordinates long-running transactions across aggregates.' },

    // Types
    { label: 'type', kind: vscode.CompletionItemKind.Keyword, detail: 'A type definition', insertText: 'type ${1:Name} is ${2:String}', documentation: 'A type definition. Can be a simple type, record, enumeration, or other type expression.' },
    { label: 'record', kind: vscode.CompletionItemKind.Keyword, detail: 'A record type', insertText: 'record ${1:Name} is {\n  ${2:field}: ${3:String}\n}', documentation: 'A record type with named fields.' },
    { label: 'enumeration', kind: vscode.CompletionItemKind.Keyword, detail: 'An enumeration type', insertText: 'enumeration ${1:Name} is {\n  ${2:Value1}, ${3:Value2}\n}', documentation: 'An enumeration type with named values.' },
    { label: 'alternation', kind: vscode.CompletionItemKind.Keyword, detail: 'A sum type (union)', insertText: 'alternation ${1:Name} is {\n  ${2:Option1} | ${3:Option2}\n}', documentation: 'A sum type (union) that can be one of several alternatives.' },
    { label: 'aggregation', kind: vscode.CompletionItemKind.Keyword, detail: 'An aggregation type', insertText: 'aggregation ${1:Name} is {\n  ${2:???}\n}', documentation: 'An aggregation type representing a collection.' },

    // Messages
    { label: 'command', kind: vscode.CompletionItemKind.Keyword, detail: 'A command message', insertText: 'command ${1:Name} is {\n  ${2:field}: ${3:String}\n}', documentation: 'A command that triggers behavior. Commands are handled by entities to produce events.' },
    { label: 'event', kind: vscode.CompletionItemKind.Keyword, detail: 'An event message', insertText: 'event ${1:Name} is {\n  ${2:field}: ${3:String}\n}', documentation: 'An event representing something that happened in the domain. Events are facts.' },
    { label: 'query', kind: vscode.CompletionItemKind.Keyword, detail: 'A query message', insertText: 'query ${1:Name} is {\n  ${2:field}: ${3:String}\n}', documentation: 'A query for retrieving information without side effects.' },
    { label: 'result', kind: vscode.CompletionItemKind.Keyword, detail: 'A result type', insertText: 'result ${1:Name} is {\n  ${2:field}: ${3:String}\n}', documentation: 'The result type returned by a query or function.' },

    // Behavior
    { label: 'handler', kind: vscode.CompletionItemKind.Keyword, detail: 'Handles commands or events', insertText: 'handler ${1:Name} is {\n  ${2:???}\n}', documentation: 'Handles commands or events and implements business logic.' },
    { label: 'function', kind: vscode.CompletionItemKind.Keyword, detail: 'A pure function', insertText: 'function ${1:Name}(${2:param}: ${3:String}): ${4:String} is {\n  ${5:???}\n}', documentation: 'A pure function definition.' },
    { label: 'invariant', kind: vscode.CompletionItemKind.Keyword, detail: 'A business rule or constraint', insertText: 'invariant ${1:Name} is {\n  ${2:???}\n}', documentation: 'A business rule or constraint that must always be true.' },
    { label: 'state', kind: vscode.CompletionItemKind.Keyword, detail: 'The state/data structure', insertText: 'state ${1:Name} is {\n  ${2:field}: ${3:String}\n}', documentation: 'The state/data structure of an entity or aggregate.' },

    // Streaming
    { label: 'inlet', kind: vscode.CompletionItemKind.Keyword, detail: 'An input port', insertText: 'inlet ${1:Name} is ${2:Type}', documentation: 'An input port for a processor or pipe.' },
    { label: 'outlet', kind: vscode.CompletionItemKind.Keyword, detail: 'An output port', insertText: 'outlet ${1:Name} is ${2:Type}', documentation: 'An output port for a processor or pipe.' },
    { label: 'connector', kind: vscode.CompletionItemKind.Keyword, detail: 'Connects outlet to inlet', insertText: 'connector ${1:Name} from ${2:outlet} to ${3:inlet}', documentation: 'Connects an outlet to an inlet for data flow.' },
    { label: 'streamlet', kind: vscode.CompletionItemKind.Keyword, detail: 'A stream processing element', insertText: 'streamlet ${1:Name} is {\n  ${2:???}\n}', documentation: 'A stream processing element.' },
    { label: 'flow', kind: vscode.CompletionItemKind.Keyword, detail: 'A data flow or pipeline', insertText: 'flow ${1:Name} is {\n  ${2:???}\n}', documentation: 'A data flow or processing pipeline.' },
    { label: 'source', kind: vscode.CompletionItemKind.Keyword, detail: 'A source of streaming data', insertText: 'source ${1:Name} is ${2:Type}', documentation: 'A source of streaming data.' },
    { label: 'sink', kind: vscode.CompletionItemKind.Keyword, detail: 'A destination for streaming data', insertText: 'sink ${1:Name} is ${2:Type}', documentation: 'A destination for streaming data.' },
    { label: 'merge', kind: vscode.CompletionItemKind.Keyword, detail: 'Merges multiple streams', insertText: 'merge ${1:Name}', documentation: 'Merges multiple streams into one.' },
    { label: 'split', kind: vscode.CompletionItemKind.Keyword, detail: 'Splits one stream', insertText: 'split ${1:Name}', documentation: 'Splits one stream into multiple.' },
    { label: 'router', kind: vscode.CompletionItemKind.Keyword, detail: 'Routes messages by content', insertText: 'router ${1:Name}', documentation: 'Routes messages based on content.' },
    { label: 'pipe', kind: vscode.CompletionItemKind.Keyword, detail: 'A data transformation pipe', insertText: 'pipe ${1:Name}', documentation: 'A simple data transformation pipe.' },
    { label: 'void', kind: vscode.CompletionItemKind.Keyword, detail: 'No data or empty stream', insertText: 'void', documentation: 'Represents no data or empty stream.' },

    // Epic/User Stories
    { label: 'epic', kind: vscode.CompletionItemKind.Keyword, detail: 'A user story or use case', insertText: 'epic ${1:Name} is {\n  ${2:???}\n}', documentation: 'A user story or use case describing system behavior from user perspective.' },
    { label: 'story', kind: vscode.CompletionItemKind.Keyword, detail: 'A user story', insertText: 'story ${1:Name} is {\n  ${2:???}\n}', documentation: 'A user story within an epic.' },
    { label: 'case', kind: vscode.CompletionItemKind.Keyword, detail: 'A use case scenario', insertText: 'case ${1:Name} is {\n  ${2:???}\n}', documentation: 'A use case scenario.' },

    // Authors and Organization
    { label: 'author', kind: vscode.CompletionItemKind.Keyword, detail: 'Defines an author', insertText: 'author ${1:Name} is {\n  name: "${2:Full Name}"\n  email: "${3:email@example.com}"\n}', documentation: 'Defines an author or contributor to the specification.' },
    { label: 'user', kind: vscode.CompletionItemKind.Keyword, detail: 'A user role', insertText: 'user ${1:Name} is {\n  ${2:???}\n}', documentation: 'A user role in the system.' },
    { label: 'group', kind: vscode.CompletionItemKind.Keyword, detail: 'A group of users', insertText: 'group ${1:Name} is {\n  ${2:???}\n}', documentation: 'A group of users or a team.' },
    { label: 'organization', kind: vscode.CompletionItemKind.Keyword, detail: 'An organization', insertText: 'organization ${1:Name} is {\n  ${2:???}\n}', documentation: 'An organization owning or using the system.' },

    // Modifiers and Options
    { label: 'option', kind: vscode.CompletionItemKind.Keyword, detail: 'Options/modifiers', insertText: 'option ${1:name}', documentation: 'Options/modifiers for definitions (e.g., aggregate, transient, finite, technology).' },
    { label: 'term', kind: vscode.CompletionItemKind.Keyword, detail: 'A glossary term', insertText: 'term ${1:Name} is "${2:definition}"', documentation: 'A glossary term definition.' },

    // File Organization
    { label: 'include', kind: vscode.CompletionItemKind.Keyword, detail: 'Includes another RIDDL file', insertText: 'include "${1:path/to/file.riddl}"', documentation: 'Includes another RIDDL file.' },
    { label: 'import', kind: vscode.CompletionItemKind.Keyword, detail: 'Imports from another context', insertText: 'import ${1:context}.${2:definition}', documentation: 'Imports definitions from another context or domain.' },

    // Common keywords without snippets
    { label: 'briefly', kind: vscode.CompletionItemKind.Keyword, detail: 'Brief description', documentation: 'Provides a brief one-line description.' },
    { label: 'described', kind: vscode.CompletionItemKind.Keyword, detail: 'Detailed description', documentation: 'Introduces a detailed description block.' },
    { label: 'explained', kind: vscode.CompletionItemKind.Keyword, detail: 'Explanation or rationale', documentation: 'Provides an explanation or rationale.' },
    { label: 'field', kind: vscode.CompletionItemKind.Keyword, detail: 'A field definition', documentation: 'Defines a field in a record, state, or message type.' },
    { label: 'send', kind: vscode.CompletionItemKind.Keyword, detail: 'Sends a message', documentation: 'Sends a message to an entity or outlet.' },
    { label: 'tell', kind: vscode.CompletionItemKind.Keyword, detail: 'Sends a command', documentation: 'Sends a command or message to a handler.' },
    { label: 'call', kind: vscode.CompletionItemKind.Keyword, detail: 'Calls a function', documentation: 'Calls a function or invokes behavior.' },
    { label: 'reply', kind: vscode.CompletionItemKind.Keyword, detail: 'Sends a reply', documentation: 'Sends a reply message in response to a query or command.' },
    { label: 'become', kind: vscode.CompletionItemKind.Keyword, detail: 'Changes state', documentation: 'Changes state in a state machine or saga.' },
];

/**
 * RIDDL predefined types
 */
const RIDDL_TYPES = [
    { label: 'String', kind: vscode.CompletionItemKind.TypeParameter, detail: 'Text type', documentation: 'A sequence of Unicode characters.' },
    { label: 'Integer', kind: vscode.CompletionItemKind.TypeParameter, detail: 'Whole number (64-bit)', documentation: 'A whole number (64-bit signed integer).' },
    { label: 'Number', kind: vscode.CompletionItemKind.TypeParameter, detail: 'Floating point number', documentation: 'A numeric value (double-precision floating point).' },
    { label: 'Boolean', kind: vscode.CompletionItemKind.TypeParameter, detail: 'True or false', documentation: 'A true or false value.' },
    { label: 'Date', kind: vscode.CompletionItemKind.TypeParameter, detail: 'Calendar date', documentation: 'A calendar date.' },
    { label: 'Time', kind: vscode.CompletionItemKind.TypeParameter, detail: 'Time of day', documentation: 'A time of day.' },
    { label: 'DateTime', kind: vscode.CompletionItemKind.TypeParameter, detail: 'Date and time', documentation: 'A specific point in time.' },
    { label: 'Timestamp', kind: vscode.CompletionItemKind.TypeParameter, detail: 'Timestamp with milliseconds', documentation: 'A timestamp with millisecond precision.' },
    { label: 'Duration', kind: vscode.CompletionItemKind.TypeParameter, detail: 'Length of time', documentation: 'A length of time.' },
    { label: 'URL', kind: vscode.CompletionItemKind.TypeParameter, detail: 'Web address', documentation: 'A uniform resource locator.' },
    { label: 'Id', kind: vscode.CompletionItemKind.TypeParameter, detail: 'Identifier type', insertText: 'Id(${1:EntityName})', documentation: 'An identifier type. Usage: Id(EntityName) creates a unique identifier for that entity.' },
    { label: 'UUID', kind: vscode.CompletionItemKind.TypeParameter, detail: 'Universally unique ID', documentation: 'A universally unique identifier (128-bit).' },
    { label: 'Decimal', kind: vscode.CompletionItemKind.TypeParameter, detail: 'Exact decimal number', documentation: 'A decimal number with exact precision.' },
    { label: 'Currency', kind: vscode.CompletionItemKind.TypeParameter, detail: 'Monetary value', documentation: 'A monetary value with currency code.' },
    { label: 'Length', kind: vscode.CompletionItemKind.TypeParameter, detail: 'Physical length', documentation: 'A physical length measurement.' },
    { label: 'Mass', kind: vscode.CompletionItemKind.TypeParameter, detail: 'Mass/weight', documentation: 'A mass/weight measurement.' },
    { label: 'Temperature', kind: vscode.CompletionItemKind.TypeParameter, detail: 'Temperature', documentation: 'A temperature measurement.' },
    { label: 'Nothing', kind: vscode.CompletionItemKind.TypeParameter, detail: 'Unit type', documentation: 'The unit type representing no value.' },
    { label: 'Abstract', kind: vscode.CompletionItemKind.TypeParameter, detail: 'Abstract type', documentation: 'An abstract type that must be refined.' },
];

/**
 * RIDDL readability words
 */
const RIDDL_READABILITY = [
    { label: 'is', kind: vscode.CompletionItemKind.Keyword, detail: 'Readability word' },
    { label: 'of', kind: vscode.CompletionItemKind.Keyword, detail: 'Readability word' },
    { label: 'by', kind: vscode.CompletionItemKind.Keyword, detail: 'Readability word' },
    { label: 'with', kind: vscode.CompletionItemKind.Keyword, detail: 'Readability word' },
    { label: 'and', kind: vscode.CompletionItemKind.Keyword, detail: 'Readability word' },
    { label: 'for', kind: vscode.CompletionItemKind.Keyword, detail: 'Readability word' },
    { label: 'from', kind: vscode.CompletionItemKind.Keyword, detail: 'Readability word' },
    { label: 'to', kind: vscode.CompletionItemKind.Keyword, detail: 'Readability word' },
    { label: 'in', kind: vscode.CompletionItemKind.Keyword, detail: 'Readability word' },
    { label: 'as', kind: vscode.CompletionItemKind.Keyword, detail: 'Readability word' },
    { label: 'at', kind: vscode.CompletionItemKind.Keyword, detail: 'Readability word' },
    { label: 'are', kind: vscode.CompletionItemKind.Keyword, detail: 'Readability word' },
    { label: 'so', kind: vscode.CompletionItemKind.Keyword, detail: 'Readability word' },
    { label: 'that', kind: vscode.CompletionItemKind.Keyword, detail: 'Readability word' },
    { label: 'wants', kind: vscode.CompletionItemKind.Keyword, detail: 'Readability word' },
];

/**
 * RIDDL Completion Provider
 */
export class RiddlCompletionProvider implements vscode.CompletionItemProvider {

    provideCompletionItems(
        _document: vscode.TextDocument,
        _position: vscode.Position,
        _token: vscode.CancellationToken,
        _context: vscode.CompletionContext
    ): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList> {

        const completions: vscode.CompletionItem[] = [];

        // Add all keywords
        for (const keyword of RIDDL_KEYWORDS) {
            const item = new vscode.CompletionItem(keyword.label, keyword.kind);
            item.detail = keyword.detail;
            if (keyword.documentation) {
                item.documentation = new vscode.MarkdownString(keyword.documentation);
            }
            if (keyword.insertText) {
                item.insertText = new vscode.SnippetString(keyword.insertText);
            }
            item.sortText = `1_${keyword.label}`; // Sort keywords first
            completions.push(item);
        }

        // Add all predefined types
        for (const type of RIDDL_TYPES) {
            const item = new vscode.CompletionItem(type.label, type.kind);
            item.detail = type.detail;
            if (type.documentation) {
                item.documentation = new vscode.MarkdownString(type.documentation);
            }
            if (type.insertText) {
                item.insertText = new vscode.SnippetString(type.insertText);
            }
            item.sortText = `2_${type.label}`; // Sort types after keywords
            completions.push(item);
        }

        // Add readability words
        for (const word of RIDDL_READABILITY) {
            const item = new vscode.CompletionItem(word.label, word.kind);
            item.detail = word.detail;
            item.sortText = `3_${word.label}`; // Sort readability words last
            completions.push(item);
        }

        return completions;
    }
}
