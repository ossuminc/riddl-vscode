/**
 * Tests for RIDDL Definition Provider
 */

import * as assert from 'assert';
import * as vscode from 'vscode';
import { RiddlDefinitionProvider } from '../../src/definitionProvider';

suite('Definition Provider Test Suite', () => {

    test('Provider should be creatable', () => {
        const provider = new RiddlDefinitionProvider();
        assert.ok(provider, 'Provider should be created');
    });

    test('Should find definition for type', async () => {
        const provider = new RiddlDefinitionProvider();

        const riddlCode = `type UserId is Id(User)
type UserName is String

command CreateUser(id: UserId, name: UserName)`;

        const document = await vscode.workspace.openTextDocument({
            language: 'riddl',
            content: riddlCode
        });

        // Position on "UserId" in the command (line 3, after "id: ")
        const position = new vscode.Position(3, 23);
        const definition = provider.provideDefinition(
            document,
            position,
            new vscode.CancellationTokenSource().token
        );

        assert.ok(definition, 'Should provide definition');

        if (Array.isArray(definition)) {
            assert.strictEqual(definition.length, 1, 'Should have one definition');
            const location = definition[0] as vscode.Location;
            assert.strictEqual(location.range.start.line, 0, 'Definition should be on line 0');
        } else if (definition instanceof vscode.Location) {
            assert.strictEqual(definition.range.start.line, 0, 'Definition should be on line 0');
        }
    });

    test('Should find definition for entity', async () => {
        const provider = new RiddlDefinitionProvider();

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

        // Position on "User" in Id(User) reference
        const position = new vscode.Position(3, 19);
        const definition = provider.provideDefinition(
            document,
            position,
            new vscode.CancellationTokenSource().token
        );

        assert.ok(definition, 'Should provide definition');

        if (Array.isArray(definition)) {
            assert.strictEqual(definition.length, 1, 'Should have one definition');
            const location = definition[0] as vscode.Location;
            assert.strictEqual(location.range.start.line, 1, 'Definition should be on line 1');
        } else if (definition instanceof vscode.Location) {
            assert.strictEqual(definition.range.start.line, 1, 'Definition should be on line 1');
        }
    });

    test('Should find definition for command', async () => {
        const provider = new RiddlDefinitionProvider();

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

        // Position on "CreateUser" in the handler
        const position = new vscode.Position(3, 17);
        const definition = provider.provideDefinition(
            document,
            position,
            new vscode.CancellationTokenSource().token
        );

        assert.ok(definition, 'Should provide definition');

        if (Array.isArray(definition)) {
            assert.strictEqual(definition.length, 1, 'Should have one definition');
            const location = definition[0] as vscode.Location;
            assert.strictEqual(location.range.start.line, 0, 'Definition should be on line 0');
        } else if (definition instanceof vscode.Location) {
            assert.strictEqual(definition.range.start.line, 0, 'Definition should be on line 0');
        }
    });

    test('Should find definition for domain', async () => {
        const provider = new RiddlDefinitionProvider();

        const riddlCode = `domain ECommerce is {
  type OrderId is Id(Order)
}`;

        const document = await vscode.workspace.openTextDocument({
            language: 'riddl',
            content: riddlCode
        });

        // Position on "ECommerce"
        const position = new vscode.Position(0, 10);
        const definition = provider.provideDefinition(
            document,
            position,
            new vscode.CancellationTokenSource().token
        );

        assert.ok(definition, 'Should provide definition');

        if (Array.isArray(definition)) {
            assert.strictEqual(definition.length, 1, 'Should have one definition');
            const location = definition[0] as vscode.Location;
            assert.strictEqual(location.range.start.line, 0, 'Definition should be on line 0');
        } else if (definition instanceof vscode.Location) {
            assert.strictEqual(definition.range.start.line, 0, 'Definition should be on line 0');
        }
    });

    test('Should return null for keywords', async () => {
        const provider = new RiddlDefinitionProvider();

        const riddlCode = 'domain MyDomain is { }';

        const document = await vscode.workspace.openTextDocument({
            language: 'riddl',
            content: riddlCode
        });

        // Position on "domain" keyword
        const position = new vscode.Position(0, 2);
        const definition = provider.provideDefinition(
            document,
            position,
            new vscode.CancellationTokenSource().token
        );

        assert.strictEqual(definition, null, 'Should not provide definition for keywords');
    });

    test('Should return null for undefined identifiers', async () => {
        const provider = new RiddlDefinitionProvider();

        const riddlCode = 'type MyType is SomeUndefinedType';

        const document = await vscode.workspace.openTextDocument({
            language: 'riddl',
            content: riddlCode
        });

        // Position on "SomeUndefinedType"
        const position = new vscode.Position(0, 20);
        const definition = provider.provideDefinition(
            document,
            position,
            new vscode.CancellationTokenSource().token
        );

        assert.strictEqual(definition, null, 'Should not provide definition for undefined identifiers');
    });

    test('Should return null for whitespace', async () => {
        const provider = new RiddlDefinitionProvider();

        const riddlCode = 'domain MyDomain is { }';

        const document = await vscode.workspace.openTextDocument({
            language: 'riddl',
            content: riddlCode
        });

        // Position on whitespace
        const position = new vscode.Position(0, 17);
        const definition = provider.provideDefinition(
            document,
            position,
            new vscode.CancellationTokenSource().token
        );

        assert.strictEqual(definition, null, 'Should not provide definition for whitespace');
    });

    test('Should handle empty document', async () => {
        const provider = new RiddlDefinitionProvider();

        const document = await vscode.workspace.openTextDocument({
            language: 'riddl',
            content: ''
        });

        const position = new vscode.Position(0, 0);
        const definition = provider.provideDefinition(
            document,
            position,
            new vscode.CancellationTokenSource().token
        );

        assert.strictEqual(definition, null, 'Should handle empty document');
    });
});
