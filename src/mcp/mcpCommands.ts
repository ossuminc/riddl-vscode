/**
 * MCP Commands - Commands for invoking MCP server tools
 *
 * Provides commands for AI-assisted RIDDL development:
 * - riddl.mcp.validate: Validate via MCP server
 * - riddl.mcp.validatePartial: Validate incomplete model
 * - riddl.mcp.checkCompleteness: Find missing elements
 * - riddl.mcp.checkSimulability: Check riddlsim compatibility
 * - riddl.mcp.explainError: Explain validation error with AI
 * - riddl.mcp.suggestNext: AI-powered next steps suggestion
 * - riddl.mcp.generateRiddl: Generate RIDDL from description
 */

import * as vscode from 'vscode';
import { getMcpService } from './mcpService';
import { McpToolResult } from './mcpTypes';

/**
 * Strip ANSI color codes from text
 */
function stripAnsiCodes(text: string): string {
    // eslint-disable-next-line no-control-regex
    let cleaned = text.replace(/\x1b\[[0-9;]*m/g, '');
    cleaned = cleaned.replace(/\[([0-9]+;)*[0-9]*m/g, '');
    return cleaned;
}

/**
 * Get the active RIDDL editor or show error
 */
function getActiveRiddlEditor(): vscode.TextEditor | undefined {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
        vscode.window.showErrorMessage('No active editor found. Please open a RIDDL file.');
        return undefined;
    }

    if (editor.document.languageId !== 'riddl') {
        vscode.window.showErrorMessage('Current file is not a RIDDL file.');
        return undefined;
    }

    return editor;
}

/**
 * Format MCP tool result for output
 */
function formatToolResult(result: McpToolResult): string {
    const lines: string[] = [];

    for (const content of result.content) {
        if (content.type === 'text' && content.text) {
            lines.push(stripAnsiCodes(content.text));
        }
    }

    return lines.join('\n');
}

/**
 * Execute MCP command with progress indicator
 */
async function executeWithProgress<T>(
    title: string,
    task: () => Promise<T>
): Promise<T> {
    return vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Notification,
            title: `RIDDL MCP: ${title}`,
            cancellable: false,
        },
        async () => {
            return await task();
        }
    );
}

/**
 * Validate current file via MCP server
 */
export async function mcpValidate(): Promise<void> {
    const editor = getActiveRiddlEditor();
    if (!editor) return;

    const mcpService = getMcpService();

    const result = await executeWithProgress('Validating...', async () => {
        return await mcpService.validateText(editor.document.getText());
    });

    mcpService.showOutput();

    if (result.success) {
        const formatted = formatToolResult(result.data);
        mcpService.log('='.repeat(60));
        mcpService.log('MCP Validation Results');
        mcpService.log('='.repeat(60));
        mcpService.log('');
        mcpService.log(`File: ${editor.document.fileName}`);
        mcpService.log('');
        mcpService.log(formatted);
        mcpService.log('');
        mcpService.log('='.repeat(60));

        if (result.data.isError) {
            vscode.window.showWarningMessage('RIDDL MCP: Validation found issues');
        } else {
            vscode.window.showInformationMessage('RIDDL MCP: Validation successful');
        }
    } else {
        vscode.window.showErrorMessage(`RIDDL MCP: ${result.error}`);
    }
}

/**
 * Validate partial/incomplete RIDDL model via MCP
 */
export async function mcpValidatePartial(): Promise<void> {
    const editor = getActiveRiddlEditor();
    if (!editor) return;

    const mcpService = getMcpService();

    const result = await executeWithProgress('Validating partial model...', async () => {
        return await mcpService.validatePartial(editor.document.getText());
    });

    mcpService.showOutput();

    if (result.success) {
        const formatted = formatToolResult(result.data);
        mcpService.log('='.repeat(60));
        mcpService.log('MCP Partial Validation Results');
        mcpService.log('='.repeat(60));
        mcpService.log('');
        mcpService.log(`File: ${editor.document.fileName}`);
        mcpService.log('');
        mcpService.log(formatted);
        mcpService.log('');
        mcpService.log('='.repeat(60));
    } else {
        vscode.window.showErrorMessage(`RIDDL MCP: ${result.error}`);
    }
}

/**
 * Check model completeness via MCP
 */
export async function mcpCheckCompleteness(): Promise<void> {
    const editor = getActiveRiddlEditor();
    if (!editor) return;

    const mcpService = getMcpService();

    const result = await executeWithProgress('Checking completeness...', async () => {
        return await mcpService.checkCompleteness(editor.document.getText());
    });

    mcpService.showOutput();

    if (result.success) {
        const formatted = formatToolResult(result.data);
        mcpService.log('='.repeat(60));
        mcpService.log('MCP Completeness Check Results');
        mcpService.log('='.repeat(60));
        mcpService.log('');
        mcpService.log(`File: ${editor.document.fileName}`);
        mcpService.log('');
        mcpService.log(formatted);
        mcpService.log('');
        mcpService.log('='.repeat(60));
    } else {
        vscode.window.showErrorMessage(`RIDDL MCP: ${result.error}`);
    }
}

/**
 * Check model simulability via MCP
 */
export async function mcpCheckSimulability(): Promise<void> {
    const editor = getActiveRiddlEditor();
    if (!editor) return;

    const mcpService = getMcpService();

    const result = await executeWithProgress('Checking simulability...', async () => {
        return await mcpService.checkSimulability(editor.document.getText());
    });

    mcpService.showOutput();

    if (result.success) {
        const formatted = formatToolResult(result.data);
        mcpService.log('='.repeat(60));
        mcpService.log('MCP Simulability Check Results');
        mcpService.log('='.repeat(60));
        mcpService.log('');
        mcpService.log(`File: ${editor.document.fileName}`);
        mcpService.log('');
        mcpService.log(formatted);
        mcpService.log('');
        mcpService.log('='.repeat(60));
    } else {
        vscode.window.showErrorMessage(`RIDDL MCP: ${result.error}`);
    }
}

/**
 * Explain a validation error with AI
 */
export async function mcpExplainError(): Promise<void> {
    // Get selected text or prompt for error message
    const editor = vscode.window.activeTextEditor;
    let errorMessage: string | undefined;
    let context: string | undefined;

    if (editor && editor.selection && !editor.selection.isEmpty) {
        errorMessage = editor.document.getText(editor.selection);
        context = editor.document.getText();
    } else {
        errorMessage = await vscode.window.showInputBox({
            prompt: 'Enter the error message to explain',
            placeHolder: 'Paste the validation error message here...',
        });
    }

    if (!errorMessage) {
        return;
    }

    const mcpService = getMcpService();

    const result = await executeWithProgress('Explaining error...', async () => {
        return await mcpService.explainError(errorMessage!, context);
    });

    mcpService.showOutput();

    if (result.success) {
        const formatted = formatToolResult(result.data);
        mcpService.log('='.repeat(60));
        mcpService.log('MCP Error Explanation');
        mcpService.log('='.repeat(60));
        mcpService.log('');
        mcpService.log('Error:');
        mcpService.log(errorMessage);
        mcpService.log('');
        mcpService.log('Explanation:');
        mcpService.log(formatted);
        mcpService.log('');
        mcpService.log('='.repeat(60));
    } else {
        vscode.window.showErrorMessage(`RIDDL MCP: ${result.error}`);
    }
}

/**
 * Get AI-powered suggestions for next steps
 */
export async function mcpSuggestNext(): Promise<void> {
    const editor = getActiveRiddlEditor();
    if (!editor) return;

    const mcpService = getMcpService();

    const result = await executeWithProgress('Getting suggestions...', async () => {
        return await mcpService.suggestNext(editor.document.getText());
    });

    mcpService.showOutput();

    if (result.success) {
        const formatted = formatToolResult(result.data);
        mcpService.log('='.repeat(60));
        mcpService.log('MCP Suggested Next Steps');
        mcpService.log('='.repeat(60));
        mcpService.log('');
        mcpService.log(`File: ${editor.document.fileName}`);
        mcpService.log('');
        mcpService.log(formatted);
        mcpService.log('');
        mcpService.log('='.repeat(60));
    } else {
        vscode.window.showErrorMessage(`RIDDL MCP: ${result.error}`);
    }
}

/**
 * Generate RIDDL from natural language description
 */
export async function mcpGenerateRiddl(): Promise<void> {
    const description = await vscode.window.showInputBox({
        prompt: 'Describe the RIDDL model you want to generate',
        placeHolder: 'e.g., "A user management domain with registration and authentication"',
        ignoreFocusOut: true,
    });

    if (!description) {
        return;
    }

    const mcpService = getMcpService();

    const result = await executeWithProgress('Generating RIDDL...', async () => {
        return await mcpService.mapDomainToRiddl(description);
    });

    if (result.success) {
        const formatted = formatToolResult(result.data);

        // Create a new RIDDL document with the generated content
        const document = await vscode.workspace.openTextDocument({
            language: 'riddl',
            content: formatted,
        });

        await vscode.window.showTextDocument(document);

        mcpService.log('='.repeat(60));
        mcpService.log('MCP Generated RIDDL');
        mcpService.log('='.repeat(60));
        mcpService.log('');
        mcpService.log('Description:');
        mcpService.log(description);
        mcpService.log('');
        mcpService.log('Generated RIDDL opened in new editor tab.');
        mcpService.log('='.repeat(60));

        vscode.window.showInformationMessage('RIDDL MCP: Generated RIDDL opened in new tab');
    } else {
        vscode.window.showErrorMessage(`RIDDL MCP: ${result.error}`);
    }
}
