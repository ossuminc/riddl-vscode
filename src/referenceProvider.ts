/**
 * RIDDL Reference Provider
 *
 * Provides "Find All References" functionality for RIDDL identifiers.
 * Allows users to find all usages of a symbol (type, entity, command, etc.)
 */

import * as vscode from 'vscode';
import { RiddlAPI, Token } from '@ossuminc/riddl-lib';

export class RiddlReferenceProvider implements vscode.ReferenceProvider {

    /**
     * Find all references to the symbol at the given position
     */
    provideReferences(
        document: vscode.TextDocument,
        position: vscode.Position,
        context: vscode.ReferenceContext,
        _token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.Location[]> {

        const text = document.getText();

        console.log(`[References] Request at line ${position.line}, char ${position.character}`);
        console.log(`[References] Include declaration: ${context.includeDeclaration}`);

        // Tokenize the document
        const result = RiddlAPI.parseToTokens(text, document.fileName);

        if (!result.succeeded || !result.value || result.value.length === 0) {
            console.log('[References] No tokens found');
            return [];
        }

        const tokens = result.value;
        console.log(`[References] Found ${tokens.length} tokens`);

        // Find the token at the cursor position
        const tokenAtCursor = this.findTokenAtPosition(tokens, position);

        if (!tokenAtCursor) {
            console.log('[References] No token at cursor position');
            return [];
        }

        console.log(`[References] Token at cursor: "${tokenAtCursor.text}" (${tokenAtCursor.kind})`);

        // Only provide references for identifiers and predefined types (user-defined types)
        if (tokenAtCursor.kind !== 'Identifier' && tokenAtCursor.kind !== 'Predefined') {
            console.log('[References] Token is not an identifier or type reference, no references available');
            return [];
        }

        // Find all references to this identifier
        const references = this.findReferences(
            tokens,
            document,
            tokenAtCursor,
            context.includeDeclaration
        );

        console.log(`[References] Found ${references.length} reference(s)`);
        return references;
    }

    /**
     * Find the token at the given position
     */
    private findTokenAtPosition(
        tokens: Token[],
        position: vscode.Position
    ): Token | null {

        for (const token of tokens) {
            const tokenStart = new vscode.Position(token.location.line - 1, token.location.col - 1);
            const tokenEnd = new vscode.Position(
                token.location.line - 1,
                token.location.col - 1 + token.text.length
            );
            const tokenRange = new vscode.Range(tokenStart, tokenEnd);

            if (tokenRange.contains(position)) {
                return token;
            }
        }

        return null;
    }

    /**
     * Find all references to an identifier in the token stream
     *
     * This includes:
     * - The definition itself (if includeDeclaration is true)
     * - All usages of the identifier
     */
    private findReferences(
        tokens: Token[],
        document: vscode.TextDocument,
        targetToken: Token,
        includeDeclaration: boolean
    ): vscode.Location[] {

        const targetName = targetToken.text;
        const locations: vscode.Location[] = [];

        // Keywords that introduce definitions
        const definitionKeywords = [
            'type', 'entity', 'command', 'event', 'query', 'result',
            'domain', 'context', 'handler', 'function', 'state',
            'adaptor', 'projector', 'repository', 'saga',
            'inlet', 'outlet', 'connector', 'streamlet', 'flow',
            'source', 'sink', 'merge', 'split', 'router', 'pipe',
            'epic', 'story', 'case', 'author', 'user',
            'term', 'include', 'constant', 'field'
        ];

        // Find all tokens that match the target name
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];

            // Check if this token matches our target
            if (
                (token.kind === 'Identifier' || token.kind === 'Predefined') &&
                token.text === targetName
            ) {
                // Check if this is a definition (preceded by a definition keyword)
                const isDefinition = i > 0 &&
                    tokens[i - 1].kind === 'Keyword' &&
                    definitionKeywords.includes(tokens[i - 1].text.toLowerCase());

                // Include this location if it's a reference, or if it's a definition and we should include declarations
                if (!isDefinition || includeDeclaration) {
                    const refStart = new vscode.Position(
                        token.location.line - 1,
                        token.location.col - 1
                    );
                    const refEnd = new vscode.Position(
                        token.location.line - 1,
                        token.location.col - 1 + token.text.length
                    );
                    const refRange = new vscode.Range(refStart, refEnd);

                    locations.push(new vscode.Location(document.uri, refRange));

                    console.log(`[References] Found ${isDefinition ? 'definition' : 'reference'}: ${token.text} at line ${token.location.line}`);
                }
            }
        }

        return locations;
    }
}
