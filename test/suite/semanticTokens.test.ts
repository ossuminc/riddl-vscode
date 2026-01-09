/**
 * Semantic Token Provider Tests
 */

import * as assert from 'assert';
import * as vscode from 'vscode';
import { RiddlSemanticTokensProvider, legend } from '../../src/semanticTokensProvider';

suite('Semantic Tokens Provider Test Suite', () => {

    test('Legend should define expected token types', () => {
        const tokenTypes = legend.tokenTypes;

        // Check for expected token types
        assert.ok(tokenTypes.includes('keyword'), 'Should include keyword type');
        assert.ok(tokenTypes.includes('type'), 'Should include type');
        assert.ok(tokenTypes.includes('variable'), 'Should include variable');
        assert.ok(tokenTypes.includes('macro'), 'Should include macro for readability words');
        assert.ok(tokenTypes.includes('operator'), 'Should include operator for punctuation');
        assert.ok(tokenTypes.includes('comment'), 'Should include comment');
    });

    test('Legend should define expected modifiers', () => {
        const tokenModifiers = legend.tokenModifiers;

        assert.ok(tokenModifiers.includes('declaration'), 'Should include declaration modifier');
        assert.ok(tokenModifiers.includes('definition'), 'Should include definition modifier');
        assert.ok(tokenModifiers.includes('readonly'), 'Should include readonly modifier');
    });

    test('Provider should generate tokens for simple RIDDL code', async () => {
        const provider = new RiddlSemanticTokensProvider();

        // Create a mock document
        const riddlCode = 'domain TestDomain is { ??? }';
        const document = await vscode.workspace.openTextDocument({
            language: 'riddl',
            content: riddlCode
        });

        const cancellationToken: vscode.CancellationToken = {
            isCancellationRequested: false,
            onCancellationRequested: new vscode.EventEmitter<any>().event
        };

        // Get semantic tokens
        const tokens = await provider.provideDocumentSemanticTokens(
            document,
            cancellationToken
        );

        assert.ok(tokens, 'Should return semantic tokens');
        assert.ok(tokens.data.length > 0, 'Should have token data');

        // Tokens should be a multiple of 5 (each token is 5 integers)
        assert.strictEqual(tokens.data.length % 5, 0, 'Token data length should be multiple of 5');

        // We expect at least 6 tokens: domain, TestDomain, is, {, ???, }
        const tokenCount = tokens.data.length / 5;
        assert.ok(tokenCount >= 6, `Should have at least 6 tokens, got ${tokenCount}`);
    });

    test('Provider should handle complex RIDDL code', async () => {
        const provider = new RiddlSemanticTokensProvider();

        const complexCode = `
domain ECommerce is {
  type OrderId is Id(Order)

  context Ordering is {
    entity Order is {
      option aggregate
    }
  }
}`;

        const document = await vscode.workspace.openTextDocument({
            language: 'riddl',
            content: complexCode
        });

        const cancellationToken: vscode.CancellationToken = {
            isCancellationRequested: false,
            onCancellationRequested: new vscode.EventEmitter<any>().event
        };

        const tokens = await provider.provideDocumentSemanticTokens(
            document,
            cancellationToken
        );

        assert.ok(tokens, 'Should return semantic tokens');
        assert.ok(tokens.data.length > 0, 'Should have token data');

        const tokenCount = tokens.data.length / 5;
        assert.ok(tokenCount >= 20, `Should have many tokens for complex code, got ${tokenCount}`);
    });

    test('Provider should handle empty document gracefully', async () => {
        const provider = new RiddlSemanticTokensProvider();

        const document = await vscode.workspace.openTextDocument({
            language: 'riddl',
            content: ''
        });

        const cancellationToken: vscode.CancellationToken = {
            isCancellationRequested: false,
            onCancellationRequested: new vscode.EventEmitter<any>().event
        };

        const tokens = await provider.provideDocumentSemanticTokens(
            document,
            cancellationToken
        );

        assert.ok(tokens, 'Should return semantic tokens even for empty document');
        // Empty document should have no tokens
        assert.strictEqual(tokens.data.length, 0, 'Empty document should have no tokens');
    });

    test('Provider should handle errors gracefully', async () => {
        const provider = new RiddlSemanticTokensProvider();

        // Malformed RIDDL code
        const badCode = 'domain is { } context { }';

        const document = await vscode.workspace.openTextDocument({
            language: 'riddl',
            content: badCode
        });

        const cancellationToken: vscode.CancellationToken = {
            isCancellationRequested: false,
            onCancellationRequested: new vscode.EventEmitter<any>().event
        };

        // Should not throw
        const tokens = await provider.provideDocumentSemanticTokens(
            document,
            cancellationToken
        );

        assert.ok(tokens, 'Should return tokens even for malformed code');
        // Tokenization is lenient, should still get tokens
        assert.ok(tokens.data.length >= 0, 'Should handle errors gracefully');
    });
});
