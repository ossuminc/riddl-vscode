/**
 * Tests for RIDDL Completion Provider
 */

import * as assert from 'assert';
import * as vscode from 'vscode';
import { RiddlCompletionProvider } from '../../src/completionProvider';

suite('Completion Provider Test Suite', () => {

    test('Provider should be creatable', () => {
        const provider = new RiddlCompletionProvider();
        assert.ok(provider, 'Provider should be created');
    });

    test('Provider should suggest keywords', async () => {
        const provider = new RiddlCompletionProvider();

        const riddlCode = 'd';
        const document = await vscode.workspace.openTextDocument({
            language: 'riddl',
            content: riddlCode
        });

        const position = new vscode.Position(0, 1); // After 'd'
        const completions = provider.provideCompletionItems(
            document,
            position,
            new vscode.CancellationTokenSource().token,
            { triggerKind: vscode.CompletionTriggerKind.Invoke, triggerCharacter: undefined }
        );

        assert.ok(completions, 'Should provide completions');
        const items = Array.isArray(completions) ? completions : (completions as vscode.CompletionList).items;
        assert.ok(items.length > 0, 'Should have completion items');

        // Check that 'domain' is suggested
        const domainItem = items.find((item: vscode.CompletionItem) => item.label === 'domain');
        assert.ok(domainItem, 'Should suggest "domain" keyword');
        assert.strictEqual(domainItem.kind, vscode.CompletionItemKind.Keyword, 'domain should be a keyword');
    });

    test('Provider should suggest predefined types', async () => {
        const provider = new RiddlCompletionProvider();

        const riddlCode = 'type UserId is ';
        const document = await vscode.workspace.openTextDocument({
            language: 'riddl',
            content: riddlCode
        });

        const position = new vscode.Position(0, 15); // After 'is '
        const completions = provider.provideCompletionItems(
            document,
            position,
            new vscode.CancellationTokenSource().token,
            { triggerKind: vscode.CompletionTriggerKind.Invoke, triggerCharacter: undefined }
        );

        const items = Array.isArray(completions) ? completions : (completions as vscode.CompletionList).items;

        // Check that predefined types are suggested
        const stringItem = items.find((item: vscode.CompletionItem) => item.label === 'String');
        assert.ok(stringItem, 'Should suggest "String" type');
        assert.strictEqual(stringItem.kind, vscode.CompletionItemKind.TypeParameter, 'String should be a type');

        const idItem = items.find((item: vscode.CompletionItem) => item.label === 'Id');
        assert.ok(idItem, 'Should suggest "Id" type');
    });

    test('Provider should suggest readability words', async () => {
        const provider = new RiddlCompletionProvider();

        const riddlCode = 'domain Test ';
        const document = await vscode.workspace.openTextDocument({
            language: 'riddl',
            content: riddlCode
        });

        const position = new vscode.Position(0, 12); // After 'Test '
        const completions = provider.provideCompletionItems(
            document,
            position,
            new vscode.CancellationTokenSource().token,
            { triggerKind: vscode.CompletionTriggerKind.Invoke, triggerCharacter: undefined }
        );

        const items = Array.isArray(completions) ? completions : (completions as vscode.CompletionList).items;

        // Check that readability words are suggested
        const isItem = items.find((item: vscode.CompletionItem) => item.label === 'is');
        assert.ok(isItem, 'Should suggest "is" readability word');

        const withItem = items.find((item: vscode.CompletionItem) => item.label === 'with');
        assert.ok(withItem, 'Should suggest "with" readability word');
    });

    test('Completion items should have snippets for keywords', async () => {
        const provider = new RiddlCompletionProvider();

        const document = await vscode.workspace.openTextDocument({
            language: 'riddl',
            content: ''
        });

        const position = new vscode.Position(0, 0);
        const completions = provider.provideCompletionItems(
            document,
            position,
            new vscode.CancellationTokenSource().token,
            { triggerKind: vscode.CompletionTriggerKind.Invoke, triggerCharacter: undefined }
        );

        const items = Array.isArray(completions) ? completions : (completions as vscode.CompletionList).items;

        // Check that domain has a snippet
        const domainItem = items.find((item: vscode.CompletionItem) => item.label === 'domain');
        assert.ok(domainItem, 'Should have domain item');
        assert.ok(domainItem.insertText instanceof vscode.SnippetString, 'domain should have a snippet');
        assert.ok(
            (domainItem.insertText as vscode.SnippetString).value.includes('${'),
            'Snippet should have placeholders'
        );
    });

    test('Completion items should have documentation', async () => {
        const provider = new RiddlCompletionProvider();

        const document = await vscode.workspace.openTextDocument({
            language: 'riddl',
            content: ''
        });

        const position = new vscode.Position(0, 0);
        const completions = provider.provideCompletionItems(
            document,
            position,
            new vscode.CancellationTokenSource().token,
            { triggerKind: vscode.CompletionTriggerKind.Invoke, triggerCharacter: undefined }
        );

        const items = Array.isArray(completions) ? completions : (completions as vscode.CompletionList).items;

        // Check that items have documentation
        const entityItem = items.find((item: vscode.CompletionItem) => item.label === 'entity');
        assert.ok(entityItem, 'Should have entity item');
        assert.ok(entityItem.documentation, 'entity should have documentation');
        assert.ok(
            entityItem.documentation instanceof vscode.MarkdownString,
            'Documentation should be MarkdownString'
        );
    });

    test('Should provide completions for all major keyword categories', async () => {
        const provider = new RiddlCompletionProvider();

        const document = await vscode.workspace.openTextDocument({
            language: 'riddl',
            content: ''
        });

        const position = new vscode.Position(0, 0);
        const completions = provider.provideCompletionItems(
            document,
            position,
            new vscode.CancellationTokenSource().token,
            { triggerKind: vscode.CompletionTriggerKind.Invoke, triggerCharacter: undefined }
        );

        const items = Array.isArray(completions) ? completions : (completions as vscode.CompletionList).items;
        const labels = items.map((item: vscode.CompletionItem) => item.label as string);

        // Core structure
        assert.ok(labels.includes('domain'), 'Should include domain');
        assert.ok(labels.includes('context'), 'Should include context');

        // Entities
        assert.ok(labels.includes('entity'), 'Should include entity');
        assert.ok(labels.includes('adaptor'), 'Should include adaptor');

        // Types
        assert.ok(labels.includes('type'), 'Should include type');
        assert.ok(labels.includes('record'), 'Should include record');

        // Messages
        assert.ok(labels.includes('command'), 'Should include command');
        assert.ok(labels.includes('event'), 'Should include event');

        // Streaming
        assert.ok(labels.includes('inlet'), 'Should include inlet');
        assert.ok(labels.includes('outlet'), 'Should include outlet');
        assert.ok(labels.includes('connector'), 'Should include connector');

        // Predefined types
        assert.ok(labels.includes('String'), 'Should include String');
        assert.ok(labels.includes('Integer'), 'Should include Integer');
        assert.ok(labels.includes('Id'), 'Should include Id');

        // Readability
        assert.ok(labels.includes('is'), 'Should include is');
        assert.ok(labels.includes('with'), 'Should include with');
    });
});
