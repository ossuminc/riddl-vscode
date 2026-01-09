import * as vscode from 'vscode';
import { RiddlSemanticTokensProvider, legend } from './semanticTokensProvider';
import { RiddlHoverProvider } from './hoverProvider';

/**
 * RIDDL VSCode Extension
 *
 * Milestone 1: Basic syntax highlighting via TextMate grammar
 * Milestone 2: RIDDL library integration
 * Milestone 3: Semantic highlighting via semantic token provider
 * Milestone 4: Hover provider for documentation
 *
 * This extension provides language support for RIDDL (Reactive Interface to Domain Definition Language),
 * a specification language for designing distributed, reactive, cloud-native systems using DDD principles.
 */

export function activate(context: vscode.ExtensionContext) {
    console.log('RIDDL extension is now active');

    try {
        const selector: vscode.DocumentSelector = { language: 'riddl', scheme: 'file' };

        // Register semantic token provider for enhanced syntax highlighting
        console.log('Creating semantic token provider...');
        const semanticProvider = new RiddlSemanticTokensProvider();
        console.log('Registering semantic token provider...');
        context.subscriptions.push(
            vscode.languages.registerDocumentSemanticTokensProvider(
                selector,
                semanticProvider,
                legend
            )
        );
        console.log('RIDDL semantic token provider registered');

        // Register hover provider for documentation
        console.log('Creating hover provider...');
        const hoverProvider = new RiddlHoverProvider();
        console.log('Registering hover provider...');
        context.subscriptions.push(
            vscode.languages.registerHoverProvider(
                selector,
                hoverProvider
            )
        );
        console.log('RIDDL hover provider registered');
    } catch (error) {
        console.error('Error during extension activation:', error);
        if (error instanceof Error) {
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
        }
        throw error;
    }

    // Register a simple command for testing
    const disposable = vscode.commands.registerCommand('riddl.showInfo', () => {
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
