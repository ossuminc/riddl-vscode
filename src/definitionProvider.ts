/**
 * RIDDL Definition Provider
 *
 * Provides "Go to Definition" functionality for RIDDL identifiers.
 * Allows users to navigate to where types, entities, commands, events, etc. are defined.
 */

import * as vscode from 'vscode';
import { RiddlAPI, Token } from '@ossuminc/riddl-lib';

export class RiddlDefinitionProvider implements vscode.DefinitionProvider {

    /**
     * Provide definition location for a symbol at the given position
     */
    provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position,
        _token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.Definition | vscode.LocationLink[]> {

        const text = document.getText();

        console.log(`[Definition] Request at line ${position.line}, char ${position.character}`);

        // Tokenize the document
        const result = RiddlAPI.parseToTokens(text, document.fileName);

        if (!result.succeeded || !result.value || result.value.length === 0) {
            console.log('[Definition] No tokens found');
            return null;
        }

        const tokens = result.value;
        console.log(`[Definition] Found ${tokens.length} tokens`);

        // Find the token at the cursor position
        const tokenAtCursor = this.findTokenAtPosition(tokens, position);

        if (!tokenAtCursor) {
            console.log('[Definition] No token at cursor position');
            return null;
        }

        console.log(`[Definition] Token at cursor: "${tokenAtCursor.text}" (${tokenAtCursor.kind})`);

        // Only provide definitions for identifiers and predefined types (user-defined types)
        // Predefined types can be user-defined (like UserId) or built-in (like String, Id)
        if (tokenAtCursor.kind !== 'Identifier' && tokenAtCursor.kind !== 'Predefined') {
            console.log('[Definition] Token is not an identifier or type reference, no definition available');
            return null;
        }

        // Find the definition of this identifier
        const definition = this.findDefinition(tokens, document, tokenAtCursor);

        if (definition) {
            console.log(`[Definition] Found definition at line ${definition.range.start.line + 1}`);
            return new vscode.Location(document.uri, definition.range);
        }

        console.log('[Definition] No definition found');
        return null;
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
     * Find the definition of an identifier
     *
     * Looks for patterns like:
     * - type UserId is ...
     * - entity User is ...
     * - command PlaceOrder ...
     * - event OrderPlaced ...
     * - domain MyDomain is ...
     * - context MyContext is ...
     */
    private findDefinition(
        tokens: Token[],
        document: vscode.TextDocument,
        targetToken: Token
    ): vscode.Location | null {

        const targetName = targetToken.text;

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

        // Look for a pattern: <keyword> <identifier>
        for (let i = 0; i < tokens.length - 1; i++) {
            const token = tokens[i];
            const nextToken = tokens[i + 1];

            // Check if this is a definition keyword followed by our target identifier
            // Accept both 'Identifier' and 'Predefined' since user-defined types may be classified as either
            if (
                token.kind === 'Keyword' &&
                definitionKeywords.includes(token.text.toLowerCase()) &&
                (nextToken.kind === 'Identifier' || nextToken.kind === 'Predefined') &&
                nextToken.text === targetName
            ) {
                // Found the definition!
                const defStart = new vscode.Position(
                    nextToken.location.line - 1,
                    nextToken.location.col - 1
                );
                const defEnd = new vscode.Position(
                    nextToken.location.line - 1,
                    nextToken.location.col - 1 + nextToken.text.length
                );
                const defRange = new vscode.Range(defStart, defEnd);

                console.log(`[Definition] Found definition: ${token.text} ${nextToken.text}`);

                return new vscode.Location(document.uri, defRange);
            }
        }

        return null;
    }
}
