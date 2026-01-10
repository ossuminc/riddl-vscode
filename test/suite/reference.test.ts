/**
 * Tests for RIDDL Reference Provider
 */

import * as assert from 'assert';
import * as vscode from 'vscode';
import { RiddlReferenceProvider } from '../../src/referenceProvider';

suite('Reference Provider Test Suite', () => {

    test('Provider should be creatable', () => {
        const provider = new RiddlReferenceProvider();
        assert.ok(provider, 'Provider should be created');
    });

    test('Should find all references to a type', async () => {
        const provider = new RiddlReferenceProvider();

        const riddlCode = `type UserId is Id(User)
type UserName is String

command CreateUser(id: UserId, name: UserName)
event UserCreated(userId: UserId)`;

        const document = await vscode.workspace.openTextDocument({
            language: 'riddl',
            content: riddlCode
        });

        // Position on "UserId" definition (line 0)
        const position = new vscode.Position(0, 7);
        const references = provider.provideReferences(
            document,
            position,
            { includeDeclaration: true },
            new vscode.CancellationTokenSource().token
        );

        assert.ok(references, 'Should provide references');
        assert.ok(Array.isArray(references), 'References should be an array');

        // Should find: 1) definition, 2) in CreateUser command, 3) in UserCreated event
        assert.strictEqual((references as vscode.Location[]).length, 3, 'Should find 3 references (including definition)');
    });

    test('Should exclude declaration when requested', async () => {
        const provider = new RiddlReferenceProvider();

        const riddlCode = `type UserId is Id(User)
command CreateUser(id: UserId)
event UserCreated(userId: UserId)`;

        const document = await vscode.workspace.openTextDocument({
            language: 'riddl',
            content: riddlCode
        });

        // Position on "UserId" definition
        const position = new vscode.Position(0, 7);
        const references = provider.provideReferences(
            document,
            position,
            { includeDeclaration: false },
            new vscode.CancellationTokenSource().token
        );

        assert.ok(references, 'Should provide references');
        assert.ok(Array.isArray(references), 'References should be an array');

        // Should find only the usages, not the definition
        assert.strictEqual((references as vscode.Location[]).length, 2, 'Should find 2 references (excluding definition)');
    });

    test('Should find references from a usage', async () => {
        const provider = new RiddlReferenceProvider();

        const riddlCode = `type UserId is Id(User)
command CreateUser(id: UserId)
event UserCreated(userId: UserId)`;

        const document = await vscode.workspace.openTextDocument({
            language: 'riddl',
            content: riddlCode
        });

        // Position on "UserId" in CreateUser command (not on definition)
        const position = new vscode.Position(1, 24);
        const references = provider.provideReferences(
            document,
            position,
            { includeDeclaration: true },
            new vscode.CancellationTokenSource().token
        );

        assert.ok(references, 'Should provide references');

        // Should find all 3 occurrences: definition + 2 usages
        assert.strictEqual((references as vscode.Location[]).length, 3, 'Should find 3 references total');
    });

    test('Should find references for entity', async () => {
        const provider = new RiddlReferenceProvider();

        const riddlCode = `domain MyDomain is {
  entity User is {
    state UserState is {
      userId: Id(User)
    }
  }
}`;

        const document = await vscode.workspace.openTextDocument({
            language: 'riddl',
            content: riddlCode
        });

        // Position on "User" entity definition
        const position = new vscode.Position(1, 10);
        const references = provider.provideReferences(
            document,
            position,
            { includeDeclaration: true },
            new vscode.CancellationTokenSource().token
        );

        assert.ok(references, 'Should provide references');

        // Should find: 1) entity definition, 2) Id(User) reference
        assert.strictEqual((references as vscode.Location[]).length, 2, 'Should find 2 references');
    });

    test('Should return empty array for keywords', async () => {
        const provider = new RiddlReferenceProvider();

        const riddlCode = 'domain MyDomain is { }';

        const document = await vscode.workspace.openTextDocument({
            language: 'riddl',
            content: riddlCode
        });

        // Position on "domain" keyword
        const position = new vscode.Position(0, 2);
        const references = provider.provideReferences(
            document,
            position,
            { includeDeclaration: true },
            new vscode.CancellationTokenSource().token
        );

        assert.ok(references, 'Should return a result');
        assert.ok(Array.isArray(references), 'Should return an array');
        assert.strictEqual((references as vscode.Location[]).length, 0, 'Should have no references for keywords');
    });

    test('Should return empty array for undefined identifier', async () => {
        const provider = new RiddlReferenceProvider();

        const riddlCode = 'type MyType is SomeUndefinedType';

        const document = await vscode.workspace.openTextDocument({
            language: 'riddl',
            content: riddlCode
        });

        // Position on "SomeUndefinedType"
        const position = new vscode.Position(0, 20);
        const references = provider.provideReferences(
            document,
            position,
            { includeDeclaration: true },
            new vscode.CancellationTokenSource().token
        );

        assert.ok(references, 'Should return a result');
        assert.ok(Array.isArray(references), 'Should return an array');

        // Will find the one occurrence of SomeUndefinedType even though it's undefined
        assert.strictEqual((references as vscode.Location[]).length, 1, 'Should find the one usage');
    });

    test('Should handle empty document', async () => {
        const provider = new RiddlReferenceProvider();

        const document = await vscode.workspace.openTextDocument({
            language: 'riddl',
            content: ''
        });

        const position = new vscode.Position(0, 0);
        const references = provider.provideReferences(
            document,
            position,
            { includeDeclaration: true },
            new vscode.CancellationTokenSource().token
        );

        assert.ok(references, 'Should return a result');
        assert.ok(Array.isArray(references), 'Should return an array');
        assert.strictEqual((references as vscode.Location[]).length, 0, 'Should have no references in empty document');
    });

    test('Should find references to command', async () => {
        const provider = new RiddlReferenceProvider();

        const riddlCode = `command CreateUser(id: String)

handler UserHandler is {
  on command CreateUser {
    // handle
  }
}`;

        const document = await vscode.workspace.openTextDocument({
            language: 'riddl',
            content: riddlCode
        });

        // Position on "CreateUser" command definition
        const position = new vscode.Position(0, 10);
        const references = provider.provideReferences(
            document,
            position,
            { includeDeclaration: true },
            new vscode.CancellationTokenSource().token
        );

        assert.ok(references, 'Should provide references');

        // Should find: 1) command definition, 2) handler reference
        assert.strictEqual((references as vscode.Location[]).length, 2, 'Should find 2 references');
    });
});
