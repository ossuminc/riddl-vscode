import * as vscode from 'vscode';
import { RiddlSemanticTokensProvider, legend } from './semanticTokensProvider';
import { RiddlHoverProvider } from './hoverProvider';
import { RiddlDiagnosticsProvider } from './diagnosticsProvider';
import { RiddlCompletionProvider } from './completionProvider';
import { RiddlDefinitionProvider } from './definitionProvider';
import { RiddlReferenceProvider } from './referenceProvider';
import { RiddlCodeActionsProvider, registerCodeActionCommands } from './codeActionsProvider';
import { RiddlFoldingRangeProvider } from './foldingProvider';
import { RiddlDocumentSymbolProvider } from './documentSymbolProvider';
import * as commands from './commands';
import {
    getMcpService,
    disposeMcpService,
    mcpValidate,
    mcpValidatePartial,
    mcpCheckCompleteness,
    mcpCheckSimulability,
    mcpExplainError,
    mcpSuggestNext,
    mcpGenerateRiddl,
} from './mcp';

/**
 * RIDDL VSCode Extension
 *
 * Milestone 1: Basic syntax highlighting via TextMate grammar
 * Milestone 2: RIDDL library integration
 * Milestone 3: Semantic highlighting via semantic token provider
 * Milestone 4: Hover provider for documentation
 * Milestone 5: Diagnostics provider for parse and validation errors
 * Milestone 6: Code intelligence (completion, definitions, references)
 * Milestone 7: Commands (info, parse, validate, translate)
 * Milestone 9: MCP client infrastructure for AI-assisted features
 * Milestone 10: MCP commands for AI tools
 * Milestone 11: Code actions (light bulb) for AI-assisted development
 * Milestone 12: Code folding for definitions and comments
 * Milestone 13: Document outline and breadcrumb navigation
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

        // Register code actions provider for AI-assisted suggestions
        console.log('Creating code actions provider...');
        const codeActionsProvider = new RiddlCodeActionsProvider();
        console.log('Registering code actions provider...');
        context.subscriptions.push(
            vscode.languages.registerCodeActionsProvider(
                selector,
                codeActionsProvider,
                {
                    providedCodeActionKinds: RiddlCodeActionsProvider.providedCodeActionKinds,
                }
            )
        );
        console.log('RIDDL code actions provider registered');

        // Register code action commands
        registerCodeActionCommands(context);
        console.log('RIDDL code action commands registered');

        // Register folding range provider for code folding
        console.log('Creating folding range provider...');
        const foldingProvider = new RiddlFoldingRangeProvider();
        console.log('Registering folding range provider...');
        context.subscriptions.push(
            vscode.languages.registerFoldingRangeProvider(
                selector,
                foldingProvider
            )
        );
        console.log('RIDDL folding range provider registered');

        // Register document symbol provider for outline and breadcrumbs
        console.log('Creating document symbol provider...');
        const documentSymbolProvider = new RiddlDocumentSymbolProvider();
        console.log('Registering document symbol provider...');
        context.subscriptions.push(
            vscode.languages.registerDocumentSymbolProvider(
                selector,
                documentSymbolProvider
            )
        );
        console.log('RIDDL document symbol provider registered');

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

    // Initialize MCP service for AI-assisted features
    console.log('Initializing MCP service...');
    const mcpService = getMcpService();
    context.subscriptions.push(mcpService);

    // Register MCP commands
    context.subscriptions.push(
        vscode.commands.registerCommand('riddl.mcp.toggleConnection', () => {
            mcpService.toggleConnection();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('riddl.mcp.showOutput', () => {
            mcpService.showOutput();
        })
    );

    // Register MCP tool commands
    context.subscriptions.push(
        vscode.commands.registerCommand('riddl.mcp.validate', () => {
            mcpValidate();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('riddl.mcp.validatePartial', () => {
            mcpValidatePartial();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('riddl.mcp.checkCompleteness', () => {
            mcpCheckCompleteness();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('riddl.mcp.checkSimulability', () => {
            mcpCheckSimulability();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('riddl.mcp.explainError', () => {
            mcpExplainError();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('riddl.mcp.suggestNext', () => {
            mcpSuggestNext();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('riddl.mcp.generateRiddl', () => {
            mcpGenerateRiddl();
        })
    );

    console.log('MCP tool commands registered');

    // Auto-connect to MCP server if enabled
    const mcpConfig = mcpService.getConfig();
    if (mcpConfig.enabled && mcpConfig.autoConnect) {
        // Delay auto-connect to allow extension to fully activate
        setTimeout(() => {
            console.log('Auto-connecting to MCP server...');
            mcpService.connect().then((result) => {
                if (result.success) {
                    console.log('MCP auto-connect successful');
                } else {
                    console.log('MCP auto-connect failed:', result.error);
                }
            });
        }, 1000);
    }

    console.log('MCP service initialized');
}

export function deactivate() {
    console.log('RIDDL extension is now deactivated');
    commands.disposeCommands();
    disposeMcpService();
}
