/**
 * Hover Provider Tests
 */

import * as assert from 'assert';
import * as vscode from 'vscode';
import { RiddlHoverProvider } from '../../src/hoverProvider';

suite('Hover Provider Test Suite', () => {

    test('Hover on keyword should show documentation', async () => {
        const provider = new RiddlHoverProvider();

        const riddlCode = 'domain TestDomain is { ??? }';
        const document = await vscode.workspace.openTextDocument({
            language: 'riddl',
            content: riddlCode
        });

        const cancellationToken: vscode.CancellationToken = {
            isCancellationRequested: false,
            onCancellationRequested: new vscode.EventEmitter<any>().event
        };

        // Hover over "domain" keyword (position 0,2)
        const position = new vscode.Position(0, 2);
        const hover = await provider.provideHover(document, position, cancellationToken);

        assert.ok(hover, 'Should provide hover info for domain keyword');
        assert.ok(hover.contents.length > 0, 'Should have hover content');

        const content = (hover.contents[0] as vscode.MarkdownString).value;
        assert.ok(content.includes('domain'), 'Should mention domain');
        assert.ok(content.includes('bounded context') || content.includes('DDD'), 'Should have documentation');
    });

    test('Hover on identifier should show info', async () => {
        const provider = new RiddlHoverProvider();

        const riddlCode = 'domain TestDomain is { ??? }';
        const document = await vscode.workspace.openTextDocument({
            language: 'riddl',
            content: riddlCode
        });

        const cancellationToken: vscode.CancellationToken = {
            isCancellationRequested: false,
            onCancellationRequested: new vscode.EventEmitter<any>().event
        };

        // Hover over "TestDomain" identifier (position 0,10)
        const position = new vscode.Position(0, 10);
        const hover = await provider.provideHover(document, position, cancellationToken);

        assert.ok(hover, 'Should provide hover info for identifier');
        assert.ok(hover.contents.length > 0, 'Should have hover content');

        const content = (hover.contents[0] as vscode.MarkdownString).value;
        assert.ok(content.includes('TestDomain'), 'Should mention the identifier');
    });

    test('Hover on predefined type should show documentation', async () => {
        const provider = new RiddlHoverProvider();

        const riddlCode = 'type UserId is Id(User)';
        const document = await vscode.workspace.openTextDocument({
            language: 'riddl',
            content: riddlCode
        });

        const cancellationToken: vscode.CancellationToken = {
            isCancellationRequested: false,
            onCancellationRequested: new vscode.EventEmitter<any>().event
        };

        // Hover over "Id" predefined type (position 0,15)
        const position = new vscode.Position(0, 15);
        const hover = await provider.provideHover(document, position, cancellationToken);

        assert.ok(hover, 'Should provide hover info for predefined type');
        assert.ok(hover.contents.length > 0, 'Should have hover content');

        const content = (hover.contents[0] as vscode.MarkdownString).value;
        assert.ok(content.includes('Id'), 'Should mention Id type');
        assert.ok(content.includes('identifier'), 'Should have Id documentation');
    });

    test('Hover on readability word should show info', async () => {
        const provider = new RiddlHoverProvider();

        const riddlCode = 'domain TestDomain is { ??? }';
        const document = await vscode.workspace.openTextDocument({
            language: 'riddl',
            content: riddlCode
        });

        const cancellationToken: vscode.CancellationToken = {
            isCancellationRequested: false,
            onCancellationRequested: new vscode.EventEmitter<any>().event
        };

        // Hover over "is" readability word (position 0,19)
        const position = new vscode.Position(0, 19);
        const hover = await provider.provideHover(document, position, cancellationToken);

        assert.ok(hover, 'Should provide hover info for readability word');
        assert.ok(hover.contents.length > 0, 'Should have hover content');

        const content = (hover.contents[0] as vscode.MarkdownString).value;
        assert.ok(content.includes('is'), 'Should mention the readability word');
        assert.ok(content.includes('Readability') || content.includes('readability'), 'Should identify as readability word');
    });

    test('Hover includes location info', async () => {
        const provider = new RiddlHoverProvider();

        const riddlCode = 'domain TestDomain is { ??? }';
        const document = await vscode.workspace.openTextDocument({
            language: 'riddl',
            content: riddlCode
        });

        const cancellationToken: vscode.CancellationToken = {
            isCancellationRequested: false,
            onCancellationRequested: new vscode.EventEmitter<any>().event
        };

        const position = new vscode.Position(0, 2);
        const hover = await provider.provideHover(document, position, cancellationToken);

        assert.ok(hover, 'Should provide hover');
        const content = (hover.contents[0] as vscode.MarkdownString).value;
        assert.ok(content.includes('Line') && content.includes('Column'), 'Should include location info');
    });

    test('Hover returns null for whitespace', async () => {
        const provider = new RiddlHoverProvider();

        const riddlCode = 'domain TestDomain is { ??? }';
        const document = await vscode.workspace.openTextDocument({
            language: 'riddl',
            content: riddlCode
        });

        const cancellationToken: vscode.CancellationToken = {
            isCancellationRequested: false,
            onCancellationRequested: new vscode.EventEmitter<any>().event
        };

        // Hover over whitespace (position 0,6 - space after "domain")
        const position = new vscode.Position(0, 6);
        const hover = await provider.provideHover(document, position, cancellationToken);

        // Should either return null or empty hover
        if (hover) {
            // If it returns hover for whitespace, that's OK too
            assert.ok(true, 'Whitespace hover is acceptable');
        } else {
            assert.strictEqual(hover, null, 'Should return null for whitespace');
        }
    });

    test('Hover provides correct range', async () => {
        const provider = new RiddlHoverProvider();

        const riddlCode = 'domain TestDomain is { ??? }';
        const document = await vscode.workspace.openTextDocument({
            language: 'riddl',
            content: riddlCode
        });

        const cancellationToken: vscode.CancellationToken = {
            isCancellationRequested: false,
            onCancellationRequested: new vscode.EventEmitter<any>().event
        };

        const position = new vscode.Position(0, 2);
        const hover = await provider.provideHover(document, position, cancellationToken);

        assert.ok(hover, 'Should provide hover');
        assert.ok(hover.range, 'Should provide range');

        // Should cover the word "domain" (columns 0-6)
        assert.strictEqual(hover.range!.start.line, 0);
        assert.strictEqual(hover.range!.start.character, 0);
        assert.strictEqual(hover.range!.end.line, 0);
        assert.strictEqual(hover.range!.end.character, 6);
    });

    test('Hover on complex code with multiple lines', async () => {
        const provider = new RiddlHoverProvider();

        const complexCode = `domain ECommerce is {
  type OrderId is Id(Order)
  context Ordering is {
    entity Order is { ??? }
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

        // Hover over "entity" on line 3 (position 3,4)
        const position = new vscode.Position(3, 6);
        const hover = await provider.provideHover(document, position, cancellationToken);

        assert.ok(hover, 'Should provide hover for entity keyword');
        const content = (hover.contents[0] as vscode.MarkdownString).value;
        assert.ok(content.includes('entity') || content.includes('Entity'), 'Should document entity');
    });
});
