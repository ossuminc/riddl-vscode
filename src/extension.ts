import * as vscode from 'vscode';

/**
 * RIDDL VSCode Extension
 *
 * Milestone 1: Basic syntax highlighting via TextMate grammar
 *
 * This extension provides language support for RIDDL (Reactive Interface to Domain Definition Language),
 * a specification language for designing distributed, reactive, cloud-native systems using DDD principles.
 */

export function activate(context: vscode.ExtensionContext) {
    console.log('RIDDL extension is now active');

    // Register a simple command for testing
    let disposable = vscode.commands.registerCommand('riddl.showInfo', () => {
        vscode.window.showInformationMessage('RIDDL Language Support is active!');
    });

    context.subscriptions.push(disposable);

    // Log when a RIDDL file is opened
    vscode.workspace.onDidOpenTextDocument((document) => {
        if (document.languageId === 'riddl') {
            console.log('Opened RIDDL file:', document.fileName);
        }
    });
}

export function deactivate() {
    console.log('RIDDL extension is now deactivated');
}
