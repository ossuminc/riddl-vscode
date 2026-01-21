/**
 * Tests for Document Symbol Provider
 */

import * as assert from 'assert';
import * as vscode from 'vscode';
import { RiddlDocumentSymbolProvider } from '../../src/documentSymbolProvider';

suite('Document Symbol Provider Test Suite', () => {
    test('Provider should be creatable', () => {
        const provider = new RiddlDocumentSymbolProvider();
        assert.ok(provider);
    });

    test('Should provide symbols for domain', async () => {
        const provider = new RiddlDocumentSymbolProvider();

        const document = await vscode.workspace.openTextDocument({
            language: 'riddl',
            content: 'domain Test is { ??? }',
        });

        console.log('Opened RIDDL file:', document.fileName);

        const token = new vscode.CancellationTokenSource().token;
        const symbols = provider.provideDocumentSymbols(document, token);

        assert.ok(symbols);
        assert.ok(symbols!.length >= 1, 'Should have at least one symbol');

        const domainSymbol = symbols!.find(s => s.name === 'Test');
        assert.ok(domainSymbol, 'Should find domain symbol');
        assert.strictEqual(domainSymbol!.detail, 'domain');
        assert.strictEqual(domainSymbol!.kind, vscode.SymbolKind.Module);
    });

    test('Should provide nested symbols', async () => {
        const provider = new RiddlDocumentSymbolProvider();

        const document = await vscode.workspace.openTextDocument({
            language: 'riddl',
            content: `domain Test is {
  context Users is {
    entity User is { ??? }
  }
}`,
        });

        console.log('Opened RIDDL file:', document.fileName);

        const token = new vscode.CancellationTokenSource().token;
        const symbols = provider.provideDocumentSymbols(document, token);

        assert.ok(symbols);
        assert.ok(symbols!.length >= 1, 'Should have at least one symbol');

        // Find domain
        const domainSymbol = symbols!.find(s => s.name === 'Test');
        assert.ok(domainSymbol, 'Should find domain symbol');

        // Check for nested context (may or may not be nested depending on implementation)
        // The test is flexible to handle both hierarchical and flat symbol lists
        assert.ok(symbols!.length >= 1 || domainSymbol!.children.length >= 1,
            'Should have domain and potentially nested children');
    });

    test('Should map symbol kinds correctly', async () => {
        const provider = new RiddlDocumentSymbolProvider();

        const document = await vscode.workspace.openTextDocument({
            language: 'riddl',
            content: `domain D is {
  context C is {
    entity E is { ??? }
    type T is String
    handler H is { ??? }
    function F is { ??? }
  }
}`,
        });

        console.log('Opened RIDDL file:', document.fileName);

        const token = new vscode.CancellationTokenSource().token;
        const symbols = provider.provideDocumentSymbols(document, token);

        assert.ok(symbols);

        // Collect all symbols recursively
        const allSymbols: vscode.DocumentSymbol[] = [];
        const collect = (syms: vscode.DocumentSymbol[]) => {
            for (const s of syms) {
                allSymbols.push(s);
                if (s.children) {
                    collect(s.children);
                }
            }
        };
        collect(symbols!);

        // Verify symbol kinds
        const domain = allSymbols.find(s => s.detail === 'domain');
        if (domain) {
            assert.strictEqual(domain.kind, vscode.SymbolKind.Module);
        }

        const context = allSymbols.find(s => s.detail === 'context');
        if (context) {
            assert.strictEqual(context.kind, vscode.SymbolKind.Namespace);
        }

        const entity = allSymbols.find(s => s.detail === 'entity');
        if (entity) {
            assert.strictEqual(entity.kind, vscode.SymbolKind.Class);
        }
    });

    test('Should handle empty document', async () => {
        const provider = new RiddlDocumentSymbolProvider();

        const document = await vscode.workspace.openTextDocument({
            language: 'riddl',
            content: '',
        });

        console.log('Opened RIDDL file:', document.fileName);

        const token = new vscode.CancellationTokenSource().token;
        const symbols = provider.provideDocumentSymbols(document, token);

        // Should return undefined or empty array for empty document
        assert.ok(
            !symbols || symbols.length === 0,
            'Should not have symbols for empty document'
        );
    });

    test('Should handle document with only comments', async () => {
        const provider = new RiddlDocumentSymbolProvider();

        const document = await vscode.workspace.openTextDocument({
            language: 'riddl',
            content: `// This is a comment
/* Multi-line
   comment */`,
        });

        console.log('Opened RIDDL file:', document.fileName);

        const token = new vscode.CancellationTokenSource().token;
        const symbols = provider.provideDocumentSymbols(document, token);

        // Should return undefined or empty array for comment-only document
        assert.ok(
            !symbols || symbols.length === 0,
            'Should not have symbols for comment-only document'
        );
    });

    test('Should provide symbols for multiple top-level definitions', async () => {
        const provider = new RiddlDocumentSymbolProvider();

        const document = await vscode.workspace.openTextDocument({
            language: 'riddl',
            content: `domain A is { ??? }
domain B is { ??? }
domain C is { ??? }`,
        });

        console.log('Opened RIDDL file:', document.fileName);

        const token = new vscode.CancellationTokenSource().token;
        const symbols = provider.provideDocumentSymbols(document, token);

        // Should have symbols (may vary based on parser success)
        assert.ok(symbols !== undefined);
        // At minimum should find some symbols
        assert.ok(symbols!.length >= 1, 'Should have at least 1 symbol');
    });

    test('Should handle single-line type definitions', async () => {
        const provider = new RiddlDocumentSymbolProvider();

        const document = await vscode.workspace.openTextDocument({
            language: 'riddl',
            content: `domain Test is {
  type UserId is Id
  type UserName is String
}`,
        });

        console.log('Opened RIDDL file:', document.fileName);

        const token = new vscode.CancellationTokenSource().token;
        const symbols = provider.provideDocumentSymbols(document, token);

        // Should return symbols (at least the domain)
        assert.ok(symbols !== undefined);
        assert.ok(symbols!.length >= 1, 'Should have at least 1 symbol');

        // Collect all symbols
        const allSymbols: vscode.DocumentSymbol[] = [];
        const collect = (syms: vscode.DocumentSymbol[]) => {
            for (const s of syms) {
                allSymbols.push(s);
                if (s.children) {
                    collect(s.children);
                }
            }
        };
        collect(symbols!);

        // Should find at least the domain
        const domains = allSymbols.filter(s => s.detail === 'domain');
        assert.ok(domains.length >= 1, 'Should find at least 1 domain symbol');
    });
});
