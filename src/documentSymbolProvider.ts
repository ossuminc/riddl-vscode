/**
 * RIDDL Document Symbol Provider
 *
 * Provides document symbols for:
 * - Outline view in VS Code
 * - Breadcrumb navigation
 * - Go to Symbol (Ctrl+Shift+O)
 *
 * Maps RIDDL definitions to VS Code symbol kinds for proper icons.
 */

import * as vscode from 'vscode';
import { RiddlAPI } from '@ossuminc/riddl-lib';

/**
 * Mapping of RIDDL definition types to VS Code symbol kinds
 */
const SYMBOL_KIND_MAP: Record<string, vscode.SymbolKind> = {
    // Top-level constructs
    'domain': vscode.SymbolKind.Module,
    'context': vscode.SymbolKind.Namespace,
    'application': vscode.SymbolKind.Package,
    'epic': vscode.SymbolKind.Package,

    // Entity-like definitions
    'entity': vscode.SymbolKind.Class,
    'adaptor': vscode.SymbolKind.Class,
    'streamlet': vscode.SymbolKind.Class,

    // Repository-like definitions
    'repository': vscode.SymbolKind.Interface,
    'projector': vscode.SymbolKind.Interface,
    'saga': vscode.SymbolKind.Interface,

    // Type definitions
    'type': vscode.SymbolKind.TypeParameter,
    'state': vscode.SymbolKind.Struct,

    // Behavioral definitions
    'handler': vscode.SymbolKind.Method,
    'function': vscode.SymbolKind.Function,

    // Handler triggers
    'on': vscode.SymbolKind.Event,

    // Case/Story definitions
    'case': vscode.SymbolKind.EnumMember,

    // Field definitions
    'field': vscode.SymbolKind.Field,

    // Other
    'constant': vscode.SymbolKind.Constant,
    'command': vscode.SymbolKind.Event,
    'event': vscode.SymbolKind.Event,
    'query': vscode.SymbolKind.Event,
    'result': vscode.SymbolKind.Struct,
    'inlet': vscode.SymbolKind.Property,
    'outlet': vscode.SymbolKind.Property,
    'connector': vscode.SymbolKind.Property,
    'pipe': vscode.SymbolKind.Property,
    'group': vscode.SymbolKind.Namespace,
    'output': vscode.SymbolKind.Property,
    'input': vscode.SymbolKind.Property,
};

/**
 * Token from RIDDL parser
 */
interface RiddlToken {
    kind: string;
    text: string;
    location: {
        line: number;
        col: number;
        offset: number;
        endOffset?: number;
    };
}

/**
 * RIDDL Document Symbol Provider
 */
export class RiddlDocumentSymbolProvider implements vscode.DocumentSymbolProvider {
    /**
     * Provide document symbols for the outline view
     */
    public provideDocumentSymbols(
        document: vscode.TextDocument,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _token: vscode.CancellationToken
    ): vscode.DocumentSymbol[] | undefined {
        const text = document.getText();
        const origin = document.fileName || 'untitled';

        try {
            // Parse the document to get tokens
            const result = RiddlAPI.parseToTokens(text, origin, false);

            if (result.succeeded && result.value) {
                const tokens = result.value as RiddlToken[];
                return this.buildSymbolTree(document, tokens);
            }
        } catch (error) {
            console.error('[DocumentSymbols] Parse error:', error);
        }

        // Fallback: use regex-based parsing
        return this.buildSymbolTreeFromRegex(document);
    }

    /**
     * Build symbol tree from RIDDL tokens
     */
    private buildSymbolTree(
        document: vscode.TextDocument,
        tokens: RiddlToken[]
    ): vscode.DocumentSymbol[] {
        const symbols: vscode.DocumentSymbol[] = [];
        const stack: { symbol: vscode.DocumentSymbol; depth: number }[] = [];
        let currentDepth = 0;

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];

            // Track brace depth for nesting
            if (token.kind === 'Punctuation') {
                if (token.text === '{') {
                    currentDepth++;
                } else if (token.text === '}') {
                    // Pop symbols that are at this depth or deeper
                    while (stack.length > 0 && stack[stack.length - 1].depth >= currentDepth) {
                        stack.pop();
                    }
                    currentDepth = Math.max(0, currentDepth - 1);
                }
                continue;
            }

            // Check if this is a keyword that defines something
            if (token.kind === 'Keyword') {
                const keyword = token.text.toLowerCase();

                // Look for the name following the keyword
                if (SYMBOL_KIND_MAP[keyword]) {
                    const name = this.findFollowingIdentifier(tokens, i);

                    if (name) {
                        const line = Math.max(0, token.location.line - 1);
                        const col = Math.max(0, token.location.col - 1);

                        // Find the range for this definition
                        const range = this.findDefinitionRange(document, line, keyword);

                        const symbol = new vscode.DocumentSymbol(
                            name,
                            keyword,
                            SYMBOL_KIND_MAP[keyword],
                            range,
                            new vscode.Range(line, col, line, col + keyword.length)
                        );

                        // Add to parent or root
                        if (stack.length > 0) {
                            stack[stack.length - 1].symbol.children.push(symbol);
                        } else {
                            symbols.push(symbol);
                        }

                        // Push onto stack for potential children
                        stack.push({ symbol, depth: currentDepth });
                    }
                }
            }
        }

        return symbols;
    }

    /**
     * Find the identifier token following a keyword
     */
    private findFollowingIdentifier(
        tokens: RiddlToken[],
        keywordIndex: number
    ): string | undefined {
        // Look at the next few tokens for an identifier
        for (let i = keywordIndex + 1; i < Math.min(keywordIndex + 5, tokens.length); i++) {
            const token = tokens[i];

            if (token.kind === 'Identifier') {
                return token.text;
            }

            // Skip readability words and whitespace
            if (
                token.kind === 'Readability' ||
                token.kind === 'Whitespace' ||
                token.kind === 'Comment'
            ) {
                continue;
            }

            // Stop if we hit something else
            break;
        }

        return undefined;
    }

    /**
     * Find the range for a definition (from keyword to closing brace)
     */
    private findDefinitionRange(
        document: vscode.TextDocument,
        startLine: number,
        keyword: string
    ): vscode.Range {
        const text = document.getText();
        const lines = text.split('\n');

        // Find the opening brace on or after the start line
        let braceCount = 0;
        let foundOpenBrace = false;
        let endLine = startLine;

        for (let i = startLine; i < lines.length; i++) {
            const line = lines[i];

            for (const char of line) {
                if (char === '{') {
                    foundOpenBrace = true;
                    braceCount++;
                } else if (char === '}') {
                    braceCount--;

                    if (foundOpenBrace && braceCount === 0) {
                        endLine = i;
                        return new vscode.Range(
                            startLine,
                            0,
                            endLine,
                            lines[endLine].length
                        );
                    }
                }
            }
        }

        // If no closing brace found, just return the start line
        // This handles single-line definitions like "type UserId is Id"
        const startLineText = lines[startLine] || '';
        const keywordPos = startLineText.toLowerCase().indexOf(keyword);

        return new vscode.Range(
            startLine,
            keywordPos >= 0 ? keywordPos : 0,
            startLine,
            startLineText.length
        );
    }

    /**
     * Fallback: Build symbol tree using regex patterns
     */
    private buildSymbolTreeFromRegex(
        document: vscode.TextDocument
    ): vscode.DocumentSymbol[] {
        const symbols: vscode.DocumentSymbol[] = [];
        const text = document.getText();

        // Pattern to match RIDDL definitions
        const definitionPattern =
            /^\s*(domain|context|entity|adaptor|repository|projector|saga|streamlet|handler|function|state|type|epic|case|application|group)\s+(\w+)/gim;

        let match;
        while ((match = definitionPattern.exec(text)) !== null) {
            const keyword = match[1].toLowerCase();
            const name = match[2];
            const pos = document.positionAt(match.index);

            const range = this.findDefinitionRange(document, pos.line, keyword);
            const selectionRange = new vscode.Range(
                pos.line,
                match.index - document.offsetAt(new vscode.Position(pos.line, 0)),
                pos.line,
                match.index - document.offsetAt(new vscode.Position(pos.line, 0)) + match[0].length
            );

            const kind = SYMBOL_KIND_MAP[keyword] || vscode.SymbolKind.Variable;

            const symbol = new vscode.DocumentSymbol(
                name,
                keyword,
                kind,
                range,
                selectionRange
            );

            symbols.push(symbol);
        }

        // Build hierarchy based on ranges
        return this.buildHierarchy(symbols);
    }

    /**
     * Build hierarchy from flat symbol list based on range containment
     */
    private buildHierarchy(symbols: vscode.DocumentSymbol[]): vscode.DocumentSymbol[] {
        // Sort by start position
        symbols.sort((a, b) => a.range.start.compareTo(b.range.start));

        const result: vscode.DocumentSymbol[] = [];
        const stack: vscode.DocumentSymbol[] = [];

        for (const symbol of symbols) {
            // Pop symbols from stack that don't contain this one
            while (stack.length > 0) {
                const parent = stack[stack.length - 1];
                if (parent.range.contains(symbol.range)) {
                    break;
                }
                stack.pop();
            }

            // Add to parent or root
            if (stack.length > 0) {
                stack[stack.length - 1].children.push(symbol);
            } else {
                result.push(symbol);
            }

            // Push onto stack for potential children
            stack.push(symbol);
        }

        return result;
    }
}
