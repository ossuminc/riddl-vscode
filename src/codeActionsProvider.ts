/**
 * RIDDL Code Actions Provider
 *
 * Provides code actions (light bulb suggestions) for:
 * - Empty blocks { ??? } - offer to generate content via MCP
 * - Validation errors - offer to explain error via MCP
 * - Missing definitions - offer to generate via MCP
 */

import * as vscode from 'vscode';
import { getMcpService } from './mcp';

/**
 * RIDDL Code Actions Provider
 */
export class RiddlCodeActionsProvider implements vscode.CodeActionProvider {
    public static readonly providedCodeActionKinds = [
        vscode.CodeActionKind.QuickFix,
        vscode.CodeActionKind.Refactor,
    ];

    /**
     * Provide code actions for the given range
     */
    public provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range | vscode.Selection,
        context: vscode.CodeActionContext,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _token: vscode.CancellationToken
    ): vscode.CodeAction[] | undefined {
        const actions: vscode.CodeAction[] = [];

        // Check for MCP service availability
        const mcpService = getMcpService();
        if (!mcpService.isEnabled()) {
            return actions;
        }

        // Check for empty blocks (???) at cursor position
        const emptyBlockActions = this.getEmptyBlockActions(document, range);
        actions.push(...emptyBlockActions);

        // Check for diagnostic-based actions
        const diagnosticActions = this.getDiagnosticActions(document, context);
        actions.push(...diagnosticActions);

        return actions.length > 0 ? actions : undefined;
    }

    /**
     * Get code actions for empty blocks { ??? }
     */
    private getEmptyBlockActions(
        document: vscode.TextDocument,
        range: vscode.Range | vscode.Selection
    ): vscode.CodeAction[] {
        const actions: vscode.CodeAction[] = [];
        const lineText = document.lineAt(range.start.line).text;

        // Check if cursor is in or near an empty block marker
        if (lineText.includes('???') || lineText.includes('{ }') || lineText.includes('{}')) {
            // Find the context around the empty block
            const context = this.findEmptyBlockContext(document, range.start.line);

            if (context) {
                // Create action to generate content
                const generateAction = new vscode.CodeAction(
                    `Generate RIDDL content for ${context.definitionType}`,
                    vscode.CodeActionKind.QuickFix
                );
                generateAction.command = {
                    command: 'riddl.codeAction.generateContent',
                    title: 'Generate RIDDL Content',
                    arguments: [document.uri, range.start.line, context],
                };
                generateAction.isPreferred = true;
                actions.push(generateAction);
            }
        }

        return actions;
    }

    /**
     * Find the context around an empty block
     */
    private findEmptyBlockContext(
        document: vscode.TextDocument,
        line: number
    ): { definitionType: string; definitionName: string; startLine: number } | undefined {
        // Search backward for the definition that contains this empty block
        const definitionKeywords = [
            'domain', 'context', 'entity', 'adaptor', 'repository',
            'projector', 'saga', 'streamlet', 'handler', 'function',
            'state', 'type', 'epic', 'case', 'application',
        ];

        for (let i = line; i >= 0; i--) {
            const lineText = document.lineAt(i).text.trim();

            for (const keyword of definitionKeywords) {
                // Match pattern like "domain MyDomain is {" or "entity User {"
                const pattern = new RegExp(`^${keyword}\\s+(\\w+)`, 'i');
                const match = lineText.match(pattern);

                if (match) {
                    return {
                        definitionType: keyword,
                        definitionName: match[1],
                        startLine: i,
                    };
                }
            }
        }

        return undefined;
    }

    /**
     * Get code actions for diagnostics (errors/warnings)
     */
    private getDiagnosticActions(
        document: vscode.TextDocument,
        context: vscode.CodeActionContext
    ): vscode.CodeAction[] {
        const actions: vscode.CodeAction[] = [];

        for (const diagnostic of context.diagnostics) {
            // Only handle RIDDL diagnostics
            if (diagnostic.source?.startsWith('RIDDL')) {
                // Create "Explain Error" action for errors
                if (diagnostic.severity === vscode.DiagnosticSeverity.Error) {
                    const explainAction = new vscode.CodeAction(
                        'Explain this error with AI',
                        vscode.CodeActionKind.QuickFix
                    );
                    explainAction.command = {
                        command: 'riddl.codeAction.explainError',
                        title: 'Explain Error',
                        arguments: [document.uri, diagnostic],
                    };
                    explainAction.diagnostics = [diagnostic];
                    actions.push(explainAction);

                    // For syntax errors, also offer to fix
                    if (diagnostic.source === 'RIDDL (syntax)') {
                        const fixAction = new vscode.CodeAction(
                            'Suggest fix for this error',
                            vscode.CodeActionKind.QuickFix
                        );
                        fixAction.command = {
                            command: 'riddl.codeAction.suggestFix',
                            title: 'Suggest Fix',
                            arguments: [document.uri, diagnostic],
                        };
                        fixAction.diagnostics = [diagnostic];
                        actions.push(fixAction);
                    }
                }

                // For warnings, also offer explanation
                if (diagnostic.severity === vscode.DiagnosticSeverity.Warning) {
                    const explainAction = new vscode.CodeAction(
                        'Explain this warning with AI',
                        vscode.CodeActionKind.QuickFix
                    );
                    explainAction.command = {
                        command: 'riddl.codeAction.explainError',
                        title: 'Explain Warning',
                        arguments: [document.uri, diagnostic],
                    };
                    explainAction.diagnostics = [diagnostic];
                    actions.push(explainAction);
                }
            }
        }

        return actions;
    }
}

/**
 * Register code action commands
 */
export function registerCodeActionCommands(
    context: vscode.ExtensionContext
): void {
    // Command to generate content for empty blocks
    context.subscriptions.push(
        vscode.commands.registerCommand(
            'riddl.codeAction.generateContent',
            async (
                uri: vscode.Uri,
                line: number,
                blockContext: { definitionType: string; definitionName: string }
            ) => {
                const mcpService = getMcpService();

                // Build a description for the AI
                const description = `Generate the body for a RIDDL ${blockContext.definitionType} named "${blockContext.definitionName}". Include appropriate child definitions, handlers, and documentation.`;

                const result = await vscode.window.withProgress(
                    {
                        location: vscode.ProgressLocation.Notification,
                        title: 'RIDDL MCP: Generating content...',
                        cancellable: false,
                    },
                    async () => {
                        return await mcpService.mapDomainToRiddl(description);
                    }
                );

                if (result.success) {
                    // Extract text from result
                    const generated = result.data.content
                        .filter(c => c.type === 'text' && c.text)
                        .map(c => c.text)
                        .join('\n');

                    if (generated) {
                        // Open the document and insert generated content
                        const document = await vscode.workspace.openTextDocument(uri);
                        const editor = await vscode.window.showTextDocument(document);

                        // Find the empty block and replace it
                        const lineText = document.lineAt(line).text;
                        const emptyBlockMatch = lineText.match(/(\{)\s*(\?\?\?|\s*)\s*(\})/);

                        if (emptyBlockMatch) {
                            const startCol = lineText.indexOf(emptyBlockMatch[0]) + 1;
                            const endCol = startCol + emptyBlockMatch[0].length - 2;
                            const range = new vscode.Range(line, startCol, line, endCol);

                            await editor.edit((editBuilder) => {
                                editBuilder.replace(range, `\n${generated}\n`);
                            });

                            vscode.window.showInformationMessage('RIDDL MCP: Content generated successfully');
                        } else {
                            // Fallback: open in new document
                            const newDoc = await vscode.workspace.openTextDocument({
                                language: 'riddl',
                                content: generated,
                            });
                            await vscode.window.showTextDocument(newDoc);
                        }
                    }
                } else {
                    vscode.window.showErrorMessage(`RIDDL MCP: ${result.error}`);
                }
            }
        )
    );

    // Command to explain an error
    context.subscriptions.push(
        vscode.commands.registerCommand(
            'riddl.codeAction.explainError',
            async (uri: vscode.Uri, diagnostic: vscode.Diagnostic) => {
                const mcpService = getMcpService();

                // Get the document for context
                const document = await vscode.workspace.openTextDocument(uri);
                const lineText = document.lineAt(diagnostic.range.start.line).text;
                const context = `${lineText}\n\nSource: ${diagnostic.source}`;

                const result = await vscode.window.withProgress(
                    {
                        location: vscode.ProgressLocation.Notification,
                        title: 'RIDDL MCP: Explaining error...',
                        cancellable: false,
                    },
                    async () => {
                        return await mcpService.explainError(diagnostic.message, context);
                    }
                );

                if (result.success) {
                    // Show explanation in output channel
                    mcpService.showOutput();
                    mcpService.log('='.repeat(60));
                    mcpService.log('MCP Error Explanation');
                    mcpService.log('='.repeat(60));
                    mcpService.log('');
                    mcpService.log('Error:');
                    mcpService.log(diagnostic.message);
                    mcpService.log('');
                    mcpService.log('Context:');
                    mcpService.log(lineText);
                    mcpService.log('');
                    mcpService.log('Explanation:');

                    const explanation = result.data.content
                        .filter(c => c.type === 'text' && c.text)
                        .map(c => c.text)
                        .join('\n');
                    mcpService.log(explanation);
                    mcpService.log('');
                    mcpService.log('='.repeat(60));
                } else {
                    vscode.window.showErrorMessage(`RIDDL MCP: ${result.error}`);
                }
            }
        )
    );

    // Command to suggest a fix for an error
    context.subscriptions.push(
        vscode.commands.registerCommand(
            'riddl.codeAction.suggestFix',
            async (uri: vscode.Uri, diagnostic: vscode.Diagnostic) => {
                const mcpService = getMcpService();

                // Get the document for context
                const document = await vscode.workspace.openTextDocument(uri);

                // Get surrounding context (few lines before and after)
                const startLine = Math.max(0, diagnostic.range.start.line - 3);
                const endLine = Math.min(document.lineCount - 1, diagnostic.range.end.line + 3);

                const contextLines: string[] = [];
                for (let i = startLine; i <= endLine; i++) {
                    const prefix = i === diagnostic.range.start.line ? '>>> ' : '    ';
                    contextLines.push(`${prefix}${document.lineAt(i).text}`);
                }
                const context = contextLines.join('\n');

                const description = `Fix this RIDDL error:\n\nError: ${diagnostic.message}\n\nContext:\n${context}`;

                const result = await vscode.window.withProgress(
                    {
                        location: vscode.ProgressLocation.Notification,
                        title: 'RIDDL MCP: Generating fix suggestion...',
                        cancellable: false,
                    },
                    async () => {
                        return await mcpService.mapDomainToRiddl(description);
                    }
                );

                if (result.success) {
                    // Show suggestion in output channel
                    mcpService.showOutput();
                    mcpService.log('='.repeat(60));
                    mcpService.log('MCP Fix Suggestion');
                    mcpService.log('='.repeat(60));
                    mcpService.log('');
                    mcpService.log('Error:');
                    mcpService.log(diagnostic.message);
                    mcpService.log('');
                    mcpService.log('Suggested Fix:');

                    const suggestion = result.data.content
                        .filter(c => c.type === 'text' && c.text)
                        .map(c => c.text)
                        .join('\n');
                    mcpService.log(suggestion);
                    mcpService.log('');
                    mcpService.log('='.repeat(60));
                } else {
                    vscode.window.showErrorMessage(`RIDDL MCP: ${result.error}`);
                }
            }
        )
    );
}
