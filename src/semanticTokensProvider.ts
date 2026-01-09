/**
 * Semantic Token Provider for RIDDL language
 *
 * Provides rich syntax highlighting by mapping RIDDL tokens to VSCode semantic token types.
 */

import * as vscode from 'vscode';
import { RiddlAPI, Token, TokenResult } from '@ossuminc/riddl-lib';

/**
 * Legend defining the semantic token types and modifiers we use
 */
export const legend = new vscode.SemanticTokensLegend(
    [
        // Standard VSCode semantic token types
        'namespace',      // 0  - domain, context
        'class',          // 1  - entity, aggregate
        'enum',           // 2  - enumeration types
        'interface',      // 3  - type definitions
        'struct',         // 4  - record types
        'type',           // 5  - general types
        'parameter',      // 6  - parameters
        'variable',       // 7  - fields, variables
        'property',       // 8  - entity properties
        'function',       // 9  - functions, handlers
        'method',         // 10 - methods
        'keyword',        // 11 - RIDDL keywords
        'comment',        // 12 - comments
        'string',         // 13 - string literals
        'number',         // 14 - numeric literals
        'operator',       // 15 - operators
        'macro'           // 16 - readability words
    ],
    [
        // Modifiers
        'declaration',    // 0x01
        'definition',     // 0x02
        'readonly',       // 0x04
        'static',         // 0x08
        'deprecated',     // 0x10
        'abstract',       // 0x20
        'async',          // 0x40
        'modification',   // 0x80
        'documentation',  // 0x100
        'defaultLibrary'  // 0x200
    ]
);

/**
 * Map RIDDL token kinds to VSCode semantic token type indices
 */
function getTokenType(riddlTokenKind: string): number {
    switch (riddlTokenKind) {
        case 'Keyword':
            return 11; // keyword
        case 'Identifier':
            return 7;  // variable (context-dependent, could be refined)
        case 'Readability':
            return 16; // macro (for readability words like "is", "of", "by")
        case 'Punctuation':
            return 15; // operator
        case 'Predefined':
            return 5;  // type (for built-in types)
        case 'Comment':
            return 12; // comment
        case 'String':
            return 13; // string
        case 'Number':
            return 14; // number
        default:
            return 7;  // default to variable
    }
}

/**
 * Semantic Tokens Provider for RIDDL
 */
export class RiddlSemanticTokensProvider implements vscode.DocumentSemanticTokensProvider {

    async provideDocumentSemanticTokens(
        document: vscode.TextDocument,
        _token: vscode.CancellationToken
    ): Promise<vscode.SemanticTokens> {
        const builder = new vscode.SemanticTokensBuilder(legend);

        // Get document text
        const text = document.getText();
        const origin = document.uri.fsPath || 'untitled.riddl';

        console.log(`[SemanticTokens] Parsing document: ${origin}, length: ${text.length} chars`);

        try {
            // Parse to tokens using RiddlAPI
            const result: TokenResult = RiddlAPI.parseToTokens(text, origin);

            console.log(`[SemanticTokens] Parse succeeded: ${result.succeeded}`);

            if (result.succeeded && result.value) {
                console.log(`[SemanticTokens] Found ${result.value.length} tokens`);

                // Convert RIDDL tokens to VSCode semantic tokens
                let errorCount = 0;
                result.value.forEach((riddlToken: Token, index: number) => {
                    try {
                        const line = riddlToken.location.line - 1; // VSCode uses 0-based lines
                        const char = riddlToken.location.col - 1;  // VSCode uses 0-based columns
                        const length = riddlToken.text.length;
                        const tokenType = getTokenType(riddlToken.kind);
                        const tokenModifiers = 0; // No modifiers for now

                        builder.push(line, char, length, tokenType, tokenModifiers);
                    } catch (error) {
                        errorCount++;
                        if (errorCount <= 5) {
                            console.error(`[SemanticTokens] Error processing token ${index}:`, error);
                            console.error(`  Token: "${riddlToken.text}" at ${riddlToken.location.line}:${riddlToken.location.col}`);
                        }
                    }
                });

                if (errorCount > 0) {
                    console.log(`[SemanticTokens] ${errorCount} tokens failed to process`);
                }
            } else if (result.errors) {
                console.error('[SemanticTokens] Parse errors:', result.errors);
            }
        } catch (error) {
            console.error('[SemanticTokens] Error providing semantic tokens:', error);
            if (error instanceof Error) {
                console.error('[SemanticTokens] Error message:', error.message);
                console.error('[SemanticTokens] Error stack:', error.stack);
            }
        }

        return builder.build();
    }
}
