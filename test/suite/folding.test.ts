/**
 * Tests for Folding Range Provider
 */

import * as assert from 'assert';
import * as vscode from 'vscode';
import { RiddlFoldingRangeProvider } from '../../src/foldingProvider';

suite('Folding Range Provider Test Suite', () => {
    test('Provider should be creatable', () => {
        const provider = new RiddlFoldingRangeProvider();
        assert.ok(provider);
    });

    test('Should fold domain definition', async () => {
        const provider = new RiddlFoldingRangeProvider();

        const document = await vscode.workspace.openTextDocument({
            language: 'riddl',
            content: `domain Test is {
  context Users is {
    entity User is { ??? }
  }
}`,
        });

        console.log('Opened RIDDL file:', document.fileName);

        const context: vscode.FoldingContext = {};
        const token = new vscode.CancellationTokenSource().token;

        const ranges = provider.provideFoldingRanges(document, context, token);

        assert.ok(ranges);
        assert.ok(ranges!.length >= 1, 'Should have at least one folding range');

        // Check that the domain block is foldable
        const domainRange = ranges!.find(r => r.start === 0);
        assert.ok(domainRange, 'Should have folding range starting at line 0');
        assert.strictEqual(domainRange!.end, 4, 'Domain should fold to line 4');
    });

    test('Should fold nested definitions', async () => {
        const provider = new RiddlFoldingRangeProvider();

        const document = await vscode.workspace.openTextDocument({
            language: 'riddl',
            content: `domain Test is {
  context Ctx is {
    entity E is {
      handler H is {
        ???
      }
    }
  }
}`,
        });

        console.log('Opened RIDDL file:', document.fileName);

        const context: vscode.FoldingContext = {};
        const token = new vscode.CancellationTokenSource().token;

        const ranges = provider.provideFoldingRanges(document, context, token);

        assert.ok(ranges);
        // Should have multiple nested folding ranges
        assert.ok(ranges!.length >= 4, 'Should have at least 4 nested folding ranges');
    });

    test('Should fold multi-line comments', async () => {
        const provider = new RiddlFoldingRangeProvider();

        const document = await vscode.workspace.openTextDocument({
            language: 'riddl',
            content: `/*
 * This is a multi-line
 * comment block
 */
domain Test is { ??? }`,
        });

        console.log('Opened RIDDL file:', document.fileName);

        const context: vscode.FoldingContext = {};
        const token = new vscode.CancellationTokenSource().token;

        const ranges = provider.provideFoldingRanges(document, context, token);

        assert.ok(ranges);

        // Find the comment folding range
        const commentRange = ranges!.find(
            r => r.kind === vscode.FoldingRangeKind.Comment && r.start === 0
        );
        assert.ok(commentRange, 'Should have folding range for comment');
        assert.strictEqual(commentRange!.end, 3, 'Comment should fold to line 3');
    });

    test('Should fold consecutive single-line comments', async () => {
        const provider = new RiddlFoldingRangeProvider();

        const document = await vscode.workspace.openTextDocument({
            language: 'riddl',
            content: `// First comment
// Second comment
// Third comment
domain Test is { ??? }`,
        });

        console.log('Opened RIDDL file:', document.fileName);

        const context: vscode.FoldingContext = {};
        const token = new vscode.CancellationTokenSource().token;

        const ranges = provider.provideFoldingRanges(document, context, token);

        assert.ok(ranges);

        // Find the comment folding range for consecutive comments
        const commentRange = ranges!.find(
            r => r.kind === vscode.FoldingRangeKind.Comment && r.start === 0
        );
        assert.ok(commentRange, 'Should have folding range for consecutive comments');
        assert.strictEqual(commentRange!.end, 2, 'Comments should fold to line 2');
    });

    test('Should not fold single-line definitions', async () => {
        const provider = new RiddlFoldingRangeProvider();

        const document = await vscode.workspace.openTextDocument({
            language: 'riddl',
            content: 'type UserId is Id',
        });

        console.log('Opened RIDDL file:', document.fileName);

        const context: vscode.FoldingContext = {};
        const token = new vscode.CancellationTokenSource().token;

        const ranges = provider.provideFoldingRanges(document, context, token);

        // Should return undefined or empty array for single-line content
        assert.ok(
            !ranges || ranges.length === 0,
            'Should not have folding ranges for single-line content'
        );
    });

    test('Should handle empty document', async () => {
        const provider = new RiddlFoldingRangeProvider();

        const document = await vscode.workspace.openTextDocument({
            language: 'riddl',
            content: '',
        });

        console.log('Opened RIDDL file:', document.fileName);

        const context: vscode.FoldingContext = {};
        const token = new vscode.CancellationTokenSource().token;

        const ranges = provider.provideFoldingRanges(document, context, token);

        // Should return undefined for empty document
        assert.ok(
            !ranges || ranges.length === 0,
            'Should not have folding ranges for empty document'
        );
    });

    test('Should not fold braces inside strings', async () => {
        const provider = new RiddlFoldingRangeProvider();

        const document = await vscode.workspace.openTextDocument({
            language: 'riddl',
            content: `domain Test is {
  type Desc is String("{ not a block }")
}`,
        });

        console.log('Opened RIDDL file:', document.fileName);

        const context: vscode.FoldingContext = {};
        const token = new vscode.CancellationTokenSource().token;

        const ranges = provider.provideFoldingRanges(document, context, token);

        assert.ok(ranges);
        // Should only have one folding range for the domain block
        assert.strictEqual(ranges!.length, 1, 'Should only have one folding range');
        assert.strictEqual(ranges![0].start, 0, 'Should start at line 0');
        assert.strictEqual(ranges![0].end, 2, 'Should end at line 2');
    });

    test('Should handle region markers', async () => {
        const provider = new RiddlFoldingRangeProvider();

        const document = await vscode.workspace.openTextDocument({
            language: 'riddl',
            content: `// #region Types
type UserId is Id
type UserName is String
// #endregion

domain Test is { ??? }`,
        });

        console.log('Opened RIDDL file:', document.fileName);

        const context: vscode.FoldingContext = {};
        const token = new vscode.CancellationTokenSource().token;

        const ranges = provider.provideFoldingRanges(document, context, token);

        assert.ok(ranges);

        // Find the region folding range
        const regionRange = ranges!.find(
            r => r.kind === vscode.FoldingRangeKind.Region && r.start === 0 && r.end === 3
        );
        assert.ok(regionRange, 'Should have folding range for region');
    });
});
