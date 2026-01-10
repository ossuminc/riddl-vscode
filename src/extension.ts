import * as vscode from 'vscode';
import { RiddlSemanticTokensProvider, legend } from './semanticTokensProvider';
import { RiddlHoverProvider } from './hoverProvider';
import { RiddlDiagnosticsProvider } from './diagnosticsProvider';
import { RiddlCompletionProvider } from './completionProvider';
import { RiddlDefinitionProvider } from './definitionProvider';
import { RiddlReferenceProvider } from './referenceProvider';
import * as commands from './commands';

/**
 * RIDDL VSCode Extension
 *
 * Milestone 1: Basic syntax highlighting via TextMate grammar
 * Milestone 2: RIDDL library integration
 * Milestone 3: Semantic highlighting via semantic token provider
 * Milestone 4: Hover provider for documentation
 * Milestone 5: Diagnostics provider for parse and validation errors
 * Milestone 6: Code intelligence (completion, definitions, references)
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

        // Register diagnostics provider for parse errors
        console.log('Creating diagnostics provider...');
        const diagnosticsProvider = new RiddlDiagnosticsProvider();
        context.subscriptions.push(diagnosticsProvider);

        // Update diagnostics when document opens
        context.subscriptions.push(
            vscode.workspace.onDidOpenTextDocument((document) => {
                if (document.languageId === 'riddl') {
                    console.log('Opened RIDDL file:', document.fileName);
                    diagnosticsProvider.updateDiagnostics(document);
                }
            })
        );

        // Update diagnostics when document changes
        context.subscriptions.push(
            vscode.workspace.onDidChangeTextDocument((event) => {
                if (event.document.languageId === 'riddl') {
                    diagnosticsProvider.updateDiagnostics(event.document);
                }
            })
        );

        // Clear diagnostics when document closes
        context.subscriptions.push(
            vscode.workspace.onDidCloseTextDocument((document) => {
                if (document.languageId === 'riddl') {
                    diagnosticsProvider.clearDiagnostics(document);
                }
            })
        );

        // Parse all currently open RIDDL documents
        vscode.workspace.textDocuments.forEach((document) => {
            if (document.languageId === 'riddl') {
                diagnosticsProvider.updateDiagnostics(document);
            }
        });

        console.log('RIDDL diagnostics provider registered');

        // Register completion provider for keywords, types, and identifiers
        console.log('Creating completion provider...');
        const completionProvider = new RiddlCompletionProvider();
        console.log('Registering completion provider...');
        context.subscriptions.push(
            vscode.languages.registerCompletionItemProvider(
                selector,
                completionProvider,
                '.' // Trigger on dot for qualified names
            )
        );
        console.log('RIDDL completion provider registered');

        // Register definition provider for "Go to Definition"
        console.log('Creating definition provider...');
        const definitionProvider = new RiddlDefinitionProvider();
        console.log('Registering definition provider...');
        context.subscriptions.push(
            vscode.languages.registerDefinitionProvider(
                selector,
                definitionProvider
            )
        );
        console.log('RIDDL definition provider registered');

        // Register reference provider for "Find All References"
        console.log('Creating reference provider...');
        const referenceProvider = new RiddlReferenceProvider();
        console.log('Registering reference provider...');
        context.subscriptions.push(
            vscode.languages.registerReferenceProvider(
                selector,
                referenceProvider
            )
        );
        console.log('RIDDL reference provider registered');

    } catch (error) {
        console.error('Error during extension activation:', error);
        if (error instanceof Error) {
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
        }
        throw error;
    }

    // Register RIDDL commands
    console.log('Registering RIDDL commands...');

    // riddl.info - Show version and build information
    context.subscriptions.push(
        vscode.commands.registerCommand('riddl.info', () => {
            commands.riddlInfo();
        })
    );

    // riddl.parse - Parse current RIDDL file
    context.subscriptions.push(
        vscode.commands.registerCommand('riddl.parse', () => {
            commands.riddlParse();
        })
    );

    // riddl.validate - Validate current RIDDL file
    context.subscriptions.push(
        vscode.commands.registerCommand('riddl.validate', () => {
            commands.riddlValidate();
        })
    );

    // riddl.translate - Translate RIDDL to output format (placeholder)
    context.subscriptions.push(
        vscode.commands.registerCommand('riddl.translate', () => {
            commands.riddlTranslate();
        })
    );

    // Keep the legacy showInfo command for backwards compatibility
    context.subscriptions.push(
        vscode.commands.registerCommand('riddl.showInfo', () => {
            vscode.window.showInformationMessage('RIDDL Language Support is active!');
        })
    );

    console.log('RIDDL commands registered');
}

export function deactivate() {
    console.log('RIDDL extension is now deactivated');
    commands.disposeCommands();
}
