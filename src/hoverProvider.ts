/**
 * Hover Provider for RIDDL language
 *
 * Provides documentation and type information when hovering over RIDDL elements.
 */

import * as vscode from 'vscode';
import { RiddlAPI, Token, TokenResult } from '@ossuminc/riddl-lib';

/**
 * Get hover information for keywords
 */
function getKeywordHover(keyword: string): vscode.MarkdownString | null {
    const keywordDocs: Record<string, string> = {
        // Core Structure
        'domain': 'Top-level container for a bounded context in DDD. Groups related contexts, types, and definitions.',
        'context': 'A bounded context containing entities, types, and functionality. Represents a cohesive subsystem.',

        // Entity and Aggregates
        'entity': 'A domain entity with identity and lifecycle. Can be an aggregate root.',
        'adaptor': 'An adapter for external systems integration.',
        'projector': 'Projects events into a read model.',
        'repository': 'Storage abstraction for aggregates.',
        'saga': 'Coordinates long-running transactions across aggregates.',

        // Types
        'type': 'A type definition. Can be a simple type, record, enumeration, or other type expression.',
        'record': 'A record type with named fields.',
        'enumeration': 'An enumeration type with named values.',
        'alternation': 'A sum type (union) that can be one of several alternatives.',
        'aggregation': 'An aggregation type representing a collection.',

        // Messages
        'command': 'A command that triggers behavior. Commands are handled by entities to produce events.',
        'event': 'An event representing something that happened in the domain. Events are facts.',
        'query': 'A query for retrieving information without side effects.',
        'result': 'The result type returned by a query or function.',

        // Behavior
        'handler': 'Handles commands or events and implements business logic.',
        'function': 'A pure function definition.',
        'invariant': 'A business rule or constraint that must always be true.',
        'state': 'The state/data structure of an entity or aggregate.',

        // Streaming/Processing
        'inlet': 'An input port for a processor or pipe.',
        'outlet': 'An output port for a processor or pipe.',
        'connector': 'Connects an outlet to an inlet for data flow.',
        'streamlet': 'A stream processing element.',
        'flow': 'A data flow or processing pipeline.',
        'source': 'A source of streaming data.',
        'sink': 'A destination for streaming data.',
        'merge': 'Merges multiple streams into one.',
        'split': 'Splits one stream into multiple.',
        'router': 'Routes messages based on content.',
        'pipe': 'A simple data transformation pipe.',
        'void': 'Represents no data or empty stream.',

        // Epic/User Stories
        'epic': 'A user story or use case describing system behavior from user perspective.',
        'story': 'A user story within an epic.',
        'case': 'A use case scenario.',
        'interaction': 'An interaction between user and system.',
        'step': 'A step in a user story or use case.',

        // Authors and Organization
        'author': 'Defines an author or contributor to the specification.',
        'user': 'A user role in the system.',
        'group': 'A group of users or a team.',
        'organization': 'An organization owning or using the system.',

        // Modifiers and Options
        'option': 'Options/modifiers for definitions (e.g., aggregate, transient, finite, technology).',
        'term': 'A glossary term definition.',

        // File Organization
        'include': 'Includes another RIDDL file.',
        'import': 'Imports definitions from another context or domain.',

        // Documentation and Description
        'briefly': 'Provides a brief one-line description.',
        'described': 'Introduces a detailed description block.',
        'explained': 'Provides an explanation or rationale.',

        // Actions and Messaging
        'send': 'Sends a message to an entity or outlet.',
        'tell': 'Sends a command or message to a handler.',
        'call': 'Calls a function or invokes behavior.',
        'reply': 'Sends a reply message in response to a query or command.',
        'become': 'Changes state in a state machine or saga.',

        // Control Flow
        'when': 'Introduces a condition or temporal clause.',
        'if': 'Conditional branching.',
        'else': 'Alternative branch in conditional logic.',
        'do': 'Introduces an action block.',
        'foreach': 'Iterates over a collection.',
        'on': 'Event handler trigger (e.g., "on init", "on command").',

        // Field and Value
        'field': 'Defines a field in a record, state, or message type.',
        'value': 'A constant or enumeration value.',
        'constant': 'A constant value definition.',

        // Reference and Linking
        'reference': 'A reference to another definition.',
        'link': 'Links to external documentation or resources.',

        // Constraints and Requirements
        'requires': 'Specifies a required dependency or precondition.',
        'required': 'Marks a field as required (non-optional).',
        'optional': 'Marks a field or element as optional.',

        // Execution and Processing
        'init': 'Initialization logic or state.',
        'execute': 'Executes a command or action.',
        'returns': 'Specifies the return type of a function.',

        // Metadata and Organization
        'example': 'Provides an example usage or scenario.',
        'focus': 'Highlights the primary focus or subject.',
        'shown': 'Indicates something should be shown in documentation.',

        // Relationships
        'contains': 'Indicates containment relationship.',
        'relationship': 'Defines a relationship between entities.'
    };

    const doc = keywordDocs[keyword.toLowerCase()];
    if (doc) {
        const md = new vscode.MarkdownString();
        md.appendMarkdown(`**RIDDL Keyword:** \`${keyword}\`\n\n`);
        md.appendMarkdown(doc);
        return md;
    }
    return null;
}

/**
 * Get hover information for predefined types
 */
function getPredefinedTypeHover(typeName: string): vscode.MarkdownString | null {
    const typeDocs: Record<string, string> = {
        'String': 'A sequence of Unicode characters.',
        'Integer': 'A whole number (64-bit signed integer).',
        'Number': 'A numeric value (double-precision floating point).',
        'Boolean': 'A true or false value.',
        'Date': 'A calendar date.',
        'Time': 'A time of day.',
        'DateTime': 'A specific point in time.',
        'Timestamp': 'A timestamp with millisecond precision.',
        'Duration': 'A length of time.',
        'URL': 'A uniform resource locator.',
        'Id': 'An identifier type. Usage: `Id(EntityName)` creates a unique identifier for that entity.',
        'UUID': 'A universally unique identifier (128-bit).',
        'Decimal': 'A decimal number with exact precision.',
        'Currency': 'A monetary value with currency code.',
        'Length': 'A physical length measurement.',
        'Mass': 'A mass/weight measurement.',
        'Temperature': 'A temperature measurement.',
        'Nothing': 'The unit type representing no value.',
        'Abstract': 'An abstract type that must be refined.',
        'Optional': 'An optional value that may or may not be present. Usage: `TypeName?`'
    };

    const doc = typeDocs[typeName];
    if (doc) {
        const md = new vscode.MarkdownString();
        md.appendMarkdown(`**RIDDL Type:** \`${typeName}\`\n\n`);
        md.appendMarkdown(doc);
        md.isTrusted = true;
        return md;
    }
    return null;
}

/**
 * Get hover information for readability words
 */
function getReadabilityHover(word: string): vscode.MarkdownString | null {
    const readabilityDocs: Record<string, string> = {
        'and': 'Conjunction for connecting related clauses or items.',
        'are': 'Plural form of "is" for readability.',
        'as': 'Indicates a role or alias.',
        'at': 'Indicates location or position.',
        'by': 'Indicates agency or authorship.',
        'for': 'Indicates purpose or beneficiary.',
        'from': 'Indicates source or origin.',
        'in': 'Indicates containment or location.',
        'is': 'Singular form for readability and natural language flow.',
        'of': 'Indicates possession or relation.',
        'so': 'Indicates consequence or purpose.',
        'that': 'Introduces a subordinate clause.',
        'to': 'Indicates direction or recipient.',
        'wants': 'Expresses user desire in user stories.',
        'with': 'Indicates accompaniment or association with something.'
    };

    const doc = readabilityDocs[word.toLowerCase()];
    const md = new vscode.MarkdownString();
    md.appendMarkdown(`**Readability Word:** \`${word}\`\n\n`);

    if (doc) {
        md.appendMarkdown(doc + ' ');
    }

    md.appendMarkdown('A structural keyword that improves readability. These words are optional syntactic sugar.');
    return md;
}

/**
 * Find token at position
 */
function findTokenAtPosition(tokens: Token[], line: number, character: number): Token | null {
    // VSCode uses 0-based, RIDDL uses 1-based
    const riddlLine = line + 1;
    const riddlCol = character + 1;

    for (const token of tokens) {
        if (token.location.line === riddlLine) {
            const startCol = token.location.col;
            const endCol = token.location.col + token.text.length;

            if (riddlCol >= startCol && riddlCol <= endCol) {
                return token;
            }
        }
    }

    return null;
}

/**
 * RIDDL Hover Provider
 */
export class RiddlHoverProvider implements vscode.HoverProvider {

    async provideHover(
        document: vscode.TextDocument,
        position: vscode.Position,
        _token: vscode.CancellationToken
    ): Promise<vscode.Hover | null> {

        try {
            console.log(`[Hover] Request at line ${position.line}, char ${position.character}`);

            // Get document text
            const text = document.getText();
            const origin = document.uri.fsPath || 'untitled.riddl';

            console.log(`[Hover] Parsing document, length: ${text.length}`);

            // Parse to tokens
            const tokenResult: TokenResult = RiddlAPI.parseToTokens(text, origin);

            console.log(`[Hover] Parse succeeded: ${tokenResult.succeeded}`);

            if (!tokenResult.succeeded || !tokenResult.value) {
                console.log('[Hover] Parse failed or no tokens');
                if (tokenResult.errors) {
                    console.log('[Hover] Errors:', tokenResult.errors);
                }
                return null;
            }

            console.log(`[Hover] Found ${tokenResult.value.length} tokens`);

            // Find token at cursor position
            const token = findTokenAtPosition(tokenResult.value, position.line, position.character);

            if (!token) {
                console.log('[Hover] No token found at position');
                return null;
            }

            console.log(`[Hover] Found token: "${token.text}" (${token.kind}) at ${token.location.line}:${token.location.col}`);

            // Generate hover content based on token kind
            let hoverContent: vscode.MarkdownString | null = null;

            switch (token.kind) {
                case 'Keyword':
                    hoverContent = getKeywordHover(token.text);
                    break;

                case 'Predefined':
                    hoverContent = getPredefinedTypeHover(token.text);
                    break;

                case 'Readability':
                    hoverContent = getReadabilityHover(token.text);
                    break;

                case 'Identifier':
                    // For identifiers, we could look them up in the AST
                    // For now, just show basic info
                    hoverContent = new vscode.MarkdownString();
                    hoverContent.appendMarkdown(`**Identifier:** \`${token.text}\`\n\n`);
                    hoverContent.appendMarkdown('User-defined name.');
                    break;

                case 'Punctuation':
                    // Could provide pairing info for braces
                    hoverContent = new vscode.MarkdownString();
                    hoverContent.appendMarkdown(`**Punctuation:** \`${token.text}\`\n`);
                    break;

                default:
                    // Generic hover
                    hoverContent = new vscode.MarkdownString();
                    hoverContent.appendMarkdown(`**${token.kind}:** \`${token.text}\`\n`);
                    break;
            }

            if (hoverContent) {
                console.log('[Hover] Generated hover content');

                // Add location info
                hoverContent.appendMarkdown(`\n\n---\n\n`);
                hoverContent.appendMarkdown(`📍 Line ${token.location.line}, Column ${token.location.col}`);

                // Create hover range
                const startPos = new vscode.Position(
                    token.location.line - 1,
                    token.location.col - 1
                );
                const endPos = new vscode.Position(
                    token.location.line - 1,
                    token.location.col - 1 + token.text.length
                );
                const range = new vscode.Range(startPos, endPos);

                console.log(`[Hover] Returning hover with range: ${startPos.line}:${startPos.character} to ${endPos.line}:${endPos.character}`);
                return new vscode.Hover(hoverContent, range);
            }

            console.log('[Hover] No hover content generated');
            return null;

        } catch (error) {
            console.error('[Hover] Error providing hover:', error);
            return null;
        }
    }
}
