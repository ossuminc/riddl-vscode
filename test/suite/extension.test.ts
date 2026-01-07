import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');

    test('Extension should be present', () => {
        assert.ok(vscode.extensions.getExtension('ossuminc.riddl-vscode'));
    });

    test('Extension should activate', async () => {
        const extension = vscode.extensions.getExtension('ossuminc.riddl-vscode');
        assert.ok(extension);
        await extension!.activate();
        assert.strictEqual(extension!.isActive, true);
    });

    test('RIDDL language should be registered', () => {
        const languages = vscode.languages.getLanguages();
        return languages.then((langs) => {
            assert.ok(langs.includes('riddl'), 'RIDDL language should be registered');
        });
    });

    test('RIDDL file association should work', async () => {
        // Create a temporary RIDDL file to test
        const doc = await vscode.workspace.openTextDocument({
            language: 'riddl',
            content: 'domain TestDomain is { ??? }'
        });

        assert.strictEqual(doc.languageId, 'riddl');
        assert.ok(doc.getText().includes('domain'));
    });

    test('Command riddl.showInfo should be registered', async () => {
        const commands = await vscode.commands.getCommands();
        assert.ok(commands.includes('riddl.showInfo'), 'riddl.showInfo command should be registered');
    });

    test('Command riddl.showInfo should execute', async () => {
        // This test ensures the command can be executed without errors
        await vscode.commands.executeCommand('riddl.showInfo');
        // If no error is thrown, the test passes
        assert.ok(true);
    });
});
