/**
 * Tests for RIDDL Document Symbol Provider
 */

import * as assert from 'assert';
import * as vscode from 'vscode';
import { RiddlDocumentSymbolProvider } from '../../src/documentSymbolProvider';

const cancellationToken: vscode.CancellationToken = {
    isCancellationRequested: false,
    onCancellationRequested: new vscode.EventEmitter<void>().event
};

suite('Document Symbol Provider Test Suite', () => {

    test('Provider should be creatable', () => {
        const provider = new RiddlDocumentSymbolProvider();
        assert.ok(provider, 'Provider should be created');
    });

    test('Simple domain should return Domain symbol', async () => {
        const provider = new RiddlDocumentSymbolProvider();

        const riddlCode = 'domain TestDomain is { ??? }';
        const document = await vscode.workspace.openTextDocument({
            language: 'riddl',
            content: riddlCode
        });

        const symbols = await provider.provideDocumentSymbols(
            document, cancellationToken
        ) as vscode.DocumentSymbol[];

        assert.ok(symbols, 'Should return symbols');
        assert.ok(symbols.length > 0, 'Should have at least one symbol');
        assert.strictEqual(symbols[0].name, 'TestDomain');
        assert.strictEqual(symbols[0].kind, vscode.SymbolKind.Module);
    });

    test('Nested structure should have children', async () => {
        const provider = new RiddlDocumentSymbolProvider();

        const riddlCode = [
            'domain TestDomain is {',
            '  context TestContext is {',
            '    entity TestEntity is { ??? }',
            '  }',
            '}'
        ].join('\n');

        const document = await vscode.workspace.openTextDocument({
            language: 'riddl',
            content: riddlCode
        });

        const symbols = await provider.provideDocumentSymbols(
            document, cancellationToken
        ) as vscode.DocumentSymbol[];

        assert.ok(symbols, 'Should return symbols');
        assert.strictEqual(symbols.length, 1, 'Should have one top-level symbol');

        const domain = symbols[0];
        assert.strictEqual(domain.name, 'TestDomain');
        assert.ok(domain.children.length > 0, 'Domain should have children');

        const context = domain.children[0];
        assert.strictEqual(context.name, 'TestContext');
        assert.strictEqual(context.kind, vscode.SymbolKind.Namespace);
    });

    test('Empty document should return empty array', async () => {
        const provider = new RiddlDocumentSymbolProvider();

        const document = await vscode.workspace.openTextDocument({
            language: 'riddl',
            content: ''
        });

        const symbols = await provider.provideDocumentSymbols(
            document, cancellationToken
        ) as vscode.DocumentSymbol[];

        assert.ok(symbols, 'Should return symbols array');
        assert.strictEqual(symbols.length, 0, 'Should be empty for empty document');
    });

    test('Malformed code should return empty array', async () => {
        const provider = new RiddlDocumentSymbolProvider();

        const document = await vscode.workspace.openTextDocument({
            language: 'riddl',
            content: 'this is not valid riddl {'
        });

        const symbols = await provider.provideDocumentSymbols(
            document, cancellationToken
        ) as vscode.DocumentSymbol[];

        assert.ok(symbols, 'Should return symbols array');
        assert.strictEqual(symbols.length, 0, 'Should be empty for malformed code');
    });
});
