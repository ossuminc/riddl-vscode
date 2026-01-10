/**
 * RIDDL Commands
 *
 * Provides commands for working with RIDDL files:
 * - riddl.info: Show RIDDL version and build information
 * - riddl.parse: Parse the current RIDDL file
 * - riddl.validate: Validate the current RIDDL file
 * - riddl.translate: Translate RIDDL to output format
 */

import * as vscode from 'vscode';
import { RiddlAPI } from '@ossuminc/riddl-lib';

/**
 * Output channel for RIDDL command results
 */
let outputChannel: vscode.OutputChannel | undefined;

/**
 * Get or create the RIDDL output channel
 */
function getOutputChannel(): vscode.OutputChannel {
    if (!outputChannel) {
        outputChannel = vscode.window.createOutputChannel('RIDDL');
    }
    return outputChannel;
}

/**
 * Strip ANSI color codes from text
 */
function stripAnsiCodes(text: string): string {
    // Remove ANSI escape sequences
    // eslint-disable-next-line no-control-regex
    let cleaned = text.replace(/\x1b\[[0-9;]*m/g, '');
    // Also remove any remaining bracket-style codes
    cleaned = cleaned.replace(/\[([0-9]+;)*[0-9]*m/g, '');
    return cleaned;
}

/**
 * Show RIDDL version and build information
 */
export function riddlInfo(): void {
    const channel = getOutputChannel();
    channel.clear();
    channel.show(true); // Show and preserve focus

    try {
        // Try to use formatInfo if available (from newer RIDDL library)
        if (typeof RiddlAPI.formatInfo === 'string') {
            channel.appendLine(RiddlAPI.formatInfo);
        } else {
            // Fallback: format using buildInfo directly
            const buildInfo = RiddlAPI.buildInfo;
            channel.appendLine('About RIDDL:');
            channel.appendLine(`           name: ${buildInfo.name}`);
            channel.appendLine(`        version: ${buildInfo.version}`);
            channel.appendLine(`  documentation: ${buildInfo.projectHomepage}`);
            channel.appendLine(`      copyright: ${buildInfo.copyright}`);
            channel.appendLine(`       built at: ${buildInfo.builtAtString}`);
            channel.appendLine(`       licenses: ${buildInfo.licenses}`);
            channel.appendLine(`   organization: ${buildInfo.organizationName}`);
            channel.appendLine(`  scala version: ${buildInfo.scalaVersion}`);
            channel.appendLine(`    sbt version: ${buildInfo.sbtVersion}`);
        }

        channel.appendLine('');
        channel.appendLine('VSCode Extension Features:');
        channel.appendLine('  ✓ Syntax Highlighting (TextMate + Semantic)');
        channel.appendLine('  ✓ Hover Documentation');
        channel.appendLine('  ✓ Real-time Diagnostics (Syntax + Semantic)');
        channel.appendLine('  ✓ Code Completion');
        channel.appendLine('  ✓ Go to Definition');
        channel.appendLine('  ✓ Find All References');
    } catch (error) {
        channel.appendLine('Error retrieving RIDDL build information:');
        channel.appendLine(String(error));
    }
}

/**
 * Parse the current RIDDL file
 */
export function riddlParse(): void {
    const channel = getOutputChannel();
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
        vscode.window.showErrorMessage('No active editor found. Please open a RIDDL file.');
        return;
    }

    if (editor.document.languageId !== 'riddl') {
        vscode.window.showErrorMessage('Current file is not a RIDDL file.');
        return;
    }

    const document = editor.document;
    const source = document.getText();
    const origin = document.fileName;

    channel.clear();
    channel.show(true);

    channel.appendLine('='.repeat(60));
    channel.appendLine('RIDDL Parse Results');
    channel.appendLine('='.repeat(60));
    channel.appendLine('');
    channel.appendLine(`File: ${origin}`);
    channel.appendLine(`Size: ${source.length} characters`);
    channel.appendLine('');

    // Parse the RIDDL file
    const result = RiddlAPI.parseString(source, origin, false);

    if (result.succeeded && result.value) {
        channel.appendLine('✓ Parse succeeded');
        channel.appendLine('');
        channel.appendLine('AST Structure:');
        channel.appendLine(JSON.stringify(result.value, null, 2));
        channel.appendLine('');
        channel.appendLine('='.repeat(60));
    } else if (result.errors && result.errors.length > 0) {
        channel.appendLine('✗ Parse failed');
        channel.appendLine('');
        channel.appendLine('Errors:');
        result.errors.forEach((error, index) => {
            channel.appendLine(`${index + 1}. [${error.kind}] at line ${error.location.line}, column ${error.location.col}`);
            channel.appendLine(`   ${stripAnsiCodes(error.message)}`);
        });
        channel.appendLine('');
        channel.appendLine('='.repeat(60));
    } else {
        channel.appendLine('✗ Parse failed with no error information');
        channel.appendLine('='.repeat(60));
    }
}

/**
 * Validate the current RIDDL file
 */
export function riddlValidate(): void {
    const channel = getOutputChannel();
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
        vscode.window.showErrorMessage('No active editor found. Please open a RIDDL file.');
        return;
    }

    if (editor.document.languageId !== 'riddl') {
        vscode.window.showErrorMessage('Current file is not a RIDDL file.');
        return;
    }

    const document = editor.document;
    const source = document.getText();
    const origin = document.fileName;

    channel.clear();
    channel.show(true);

    channel.appendLine('='.repeat(60));
    channel.appendLine('RIDDL Validation Results');
    channel.appendLine('='.repeat(60));
    channel.appendLine('');
    channel.appendLine(`File: ${origin}`);
    channel.appendLine(`Size: ${source.length} characters`);
    channel.appendLine('');

    // Validate the RIDDL file
    const result = RiddlAPI.validateString(source, origin, false, true);

    if (result.succeeded) {
        channel.appendLine('✓ Validation succeeded');
        channel.appendLine('');

        // Show validation messages (warnings and info)
        if (result.validationMessages) {
            const { warnings, info } = result.validationMessages;

            if (warnings && warnings.length > 0) {
                channel.appendLine(`Warnings (${warnings.length}):`);
                warnings.forEach((warning, index) => {
                    channel.appendLine(`${index + 1}. [${warning.kind}] at line ${warning.location.line}, column ${warning.location.col}`);
                    channel.appendLine(`   ${stripAnsiCodes(warning.message)}`);
                });
                channel.appendLine('');
            }

            if (info && info.length > 0) {
                channel.appendLine(`Info Messages (${info.length}):`);
                info.forEach((msg, index) => {
                    channel.appendLine(`${index + 1}. [${msg.kind}] at line ${msg.location.line}, column ${msg.location.col}`);
                    channel.appendLine(`   ${stripAnsiCodes(msg.message)}`);
                });
                channel.appendLine('');
            }

            if ((!warnings || warnings.length === 0) && (!info || info.length === 0)) {
                channel.appendLine('No warnings or info messages.');
                channel.appendLine('');
            }
        }

        channel.appendLine('='.repeat(60));
    } else {
        channel.appendLine('✗ Validation failed');
        channel.appendLine('');

        // Show parse errors
        if (result.parseErrors && result.parseErrors.length > 0) {
            channel.appendLine(`Parse Errors (${result.parseErrors.length}):`);
            result.parseErrors.forEach((error, index) => {
                channel.appendLine(`${index + 1}. [${error.kind}] at line ${error.location.line}, column ${error.location.col}`);
                channel.appendLine(`   ${stripAnsiCodes(error.message)}`);
            });
            channel.appendLine('');
        }

        // Show validation errors
        if (result.validationMessages && result.validationMessages.errors) {
            const errors = result.validationMessages.errors;
            if (errors.length > 0) {
                channel.appendLine(`Validation Errors (${errors.length}):`);
                errors.forEach((error, index) => {
                    channel.appendLine(`${index + 1}. [${error.kind}] at line ${error.location.line}, column ${error.location.col}`);
                    channel.appendLine(`   ${stripAnsiCodes(error.message)}`);
                });
                channel.appendLine('');
            }
        }

        // Show warnings even when validation fails
        if (result.validationMessages && result.validationMessages.warnings) {
            const warnings = result.validationMessages.warnings;
            if (warnings.length > 0) {
                channel.appendLine(`Warnings (${warnings.length}):`);
                warnings.forEach((warning, index) => {
                    channel.appendLine(`${index + 1}. [${warning.kind}] at line ${warning.location.line}, column ${warning.location.col}`);
                    channel.appendLine(`   ${stripAnsiCodes(warning.message)}`);
                });
                channel.appendLine('');
            }
        }

        channel.appendLine('='.repeat(60));
    }
}

/**
 * Translate the current RIDDL file to output format
 */
export function riddlTranslate(): void {
    const channel = getOutputChannel();
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
        vscode.window.showErrorMessage('No active editor found. Please open a RIDDL file.');
        return;
    }

    if (editor.document.languageId !== 'riddl') {
        vscode.window.showErrorMessage('Current file is not a RIDDL file.');
        return;
    }

    channel.clear();
    channel.show(true);

    channel.appendLine('='.repeat(60));
    channel.appendLine('RIDDL Translation');
    channel.appendLine('='.repeat(60));
    channel.appendLine('');
    channel.appendLine('Translation functionality is not yet available in the VSCode extension.');
    channel.appendLine('');
    channel.appendLine('The riddlc compiler supports several translation commands:');
    channel.appendLine('  • hugo     - Generate Hugo documentation site');
    channel.appendLine('  • from     - Translate from other formats to RIDDL');
    channel.appendLine('  • dump     - Dump AST in various formats');
    channel.appendLine('  • prettify - Reformat RIDDL source code');
    channel.appendLine('');
    channel.appendLine('To use these features, please use the riddlc command-line tool.');
    channel.appendLine('');
    channel.appendLine('Future versions of this extension will include translation support.');
    channel.appendLine('='.repeat(60));

    vscode.window.showInformationMessage('Translation support coming in a future release. Use riddlc command-line tool for now.');
}

/**
 * Dispose the output channel
 */
export function disposeCommands(): void {
    if (outputChannel) {
        outputChannel.dispose();
        outputChannel = undefined;
    }
}
