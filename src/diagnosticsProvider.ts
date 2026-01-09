/**
 * Diagnostics Provider for RIDDL language
 *
 * Provides real-time parse error diagnostics with squiggly underlines.
 */

import * as vscode from 'vscode';
import { RiddlAPI, RiddlError, ValidationResult } from '@ossuminc/riddl-lib';

/**
 * Map RIDDL error severity to VSCode diagnostic severity
 */
function getErrorSeverity(kind: string): vscode.DiagnosticSeverity {
    switch (kind.toLowerCase()) {
        case 'error':
            return vscode.DiagnosticSeverity.Error;
        case 'warning':
            return vscode.DiagnosticSeverity.Warning;
        case 'info':
        case 'information':
            return vscode.DiagnosticSeverity.Information;
        case 'hint':
            return vscode.DiagnosticSeverity.Hint;
        default:
            return vscode.DiagnosticSeverity.Error;
    }
}

/**
 * Convert RIDDL error to VSCode diagnostic
 */
function riddlErrorToDiagnostic(error: RiddlError, document: vscode.TextDocument): vscode.Diagnostic {
    // RIDDL uses 1-based line/column, VSCode uses 0-based
    const line = Math.max(0, error.location.line - 1);
    const col = Math.max(0, error.location.col - 1);

    // Try to determine the end position
    let endLine = line;
    let endCol = col + 1; // Default to highlighting one character

    // If we have endOffset, calculate the end position
    if (error.location.endOffset !== undefined && error.location.offset !== undefined) {
        const length = error.location.endOffset - error.location.offset;
        endCol = col + Math.max(1, length);
    } else {
        // Otherwise, try to highlight the word at this position
        const lineText = document.lineAt(line).text;
        const wordRange = document.getWordRangeAtPosition(
            new vscode.Position(line, col),
            /[a-zA-Z0-9_-]+/
        );
        if (wordRange) {
            endCol = wordRange.end.character;
        } else if (col < lineText.length) {
            // Highlight at least one character
            endCol = col + 1;
        }
    }

    const range = new vscode.Range(
        new vscode.Position(line, col),
        new vscode.Position(endLine, endCol)
    );

    const diagnostic = new vscode.Diagnostic(
        range,
        error.message,
        getErrorSeverity(error.kind)
    );

    diagnostic.source = 'RIDDL';
    diagnostic.code = error.kind;

    return diagnostic;
}

/**
 * RIDDL Diagnostics Provider
 *
 * Provides real-time error checking using the RIDDL parser.
 */
export class RiddlDiagnosticsProvider {
    private diagnosticCollection: vscode.DiagnosticCollection;
    private parseTimeout: NodeJS.Timeout | undefined;
    private readonly debounceDelay = 500; // ms

    constructor() {
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('riddl');
    }

    /**
     * Update diagnostics for a document
     */
    public updateDiagnostics(document: vscode.TextDocument): void {
        // Only process RIDDL files
        if (document.languageId !== 'riddl') {
            return;
        }

        // Clear existing timeout
        if (this.parseTimeout) {
            clearTimeout(this.parseTimeout);
        }

        // Debounce parsing to avoid excessive processing while typing
        this.parseTimeout = setTimeout(() => {
            this.parseDiagnostics(document);
        }, this.debounceDelay);
    }

    /**
     * Parse and validate document, extracting both syntax and semantic diagnostics
     */
    private parseDiagnostics(document: vscode.TextDocument): void {
        const text = document.getText();
        const origin = document.uri.fsPath || 'untitled.riddl';

        console.log(`[Diagnostics] Validating document: ${origin}`);

        try {
            // Run full validation (parse + semantic validation)
            const result: ValidationResult = RiddlAPI.validateString(text, origin, false);

            const diagnostics: vscode.Diagnostic[] = [];

            // Process parse errors (syntax errors) - shown in red
            if (result.parseErrors && result.parseErrors.length > 0) {
                console.log(`[Diagnostics] Found ${result.parseErrors.length} parse error(s)`);

                for (const error of result.parseErrors) {
                    try {
                        const diagnostic = riddlErrorToDiagnostic(error, document);
                        diagnostic.source = 'RIDDL (syntax)';
                        diagnostic.severity = vscode.DiagnosticSeverity.Error;
                        diagnostics.push(diagnostic);
                    } catch (e) {
                        console.error('[Diagnostics] Error converting parse error to diagnostic:', e);
                    }
                }
            }

            // Process validation messages (semantic errors/warnings) if validation ran
            if (result.validationMessages) {
                const valMsgs = result.validationMessages;

                // Validation errors - shown with different visual (still Error severity but different source)
                if (valMsgs.errors && valMsgs.errors.length > 0) {
                    console.log(`[Diagnostics] Found ${valMsgs.errors.length} validation error(s)`);

                    for (const error of valMsgs.errors) {
                        try {
                            const diagnostic = riddlErrorToDiagnostic(error, document);
                            diagnostic.source = 'RIDDL (validation)';
                            diagnostic.severity = vscode.DiagnosticSeverity.Error;
                            // TODO: Could use tags to visually distinguish
                            // diagnostic.tags = [vscode.DiagnosticTag.Unnecessary]; // Makes it faded
                            diagnostics.push(diagnostic);
                        } catch (e) {
                            console.error('[Diagnostics] Error converting validation error to diagnostic:', e);
                        }
                    }
                }

                // Validation warnings - shown in yellow
                if (valMsgs.warnings && valMsgs.warnings.length > 0) {
                    console.log(`[Diagnostics] Found ${valMsgs.warnings.length} validation warning(s)`);

                    for (const warning of valMsgs.warnings) {
                        try {
                            const diagnostic = riddlErrorToDiagnostic(warning, document);
                            diagnostic.source = 'RIDDL (validation)';
                            diagnostic.severity = vscode.DiagnosticSeverity.Warning;
                            diagnostics.push(diagnostic);
                        } catch (e) {
                            console.error('[Diagnostics] Error converting validation warning to diagnostic:', e);
                        }
                    }
                }

                // Validation info messages - shown in blue
                if (valMsgs.info && valMsgs.info.length > 0) {
                    console.log(`[Diagnostics] Found ${valMsgs.info.length} validation info message(s)`);

                    for (const info of valMsgs.info) {
                        try {
                            const diagnostic = riddlErrorToDiagnostic(info, document);
                            diagnostic.source = 'RIDDL (info)';
                            diagnostic.severity = vscode.DiagnosticSeverity.Information;
                            diagnostics.push(diagnostic);
                        } catch (e) {
                            console.error('[Diagnostics] Error converting validation info to diagnostic:', e);
                        }
                    }
                }
            }

            if (diagnostics.length === 0) {
                console.log('[Diagnostics] No errors or warnings found');
            }

            // Update the diagnostic collection
            this.diagnosticCollection.set(document.uri, diagnostics);

        } catch (error) {
            console.error('[Diagnostics] Validation exception:', error);
            if (error instanceof Error) {
                console.error('[Diagnostics] Error message:', error.message);
            }

            // When validation crashes, create a generic error diagnostic
            const diagnostics: vscode.Diagnostic[] = [];

            const diagnostic = new vscode.Diagnostic(
                new vscode.Range(0, 0, 0, 1),
                `Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
                vscode.DiagnosticSeverity.Error
            );
            diagnostic.source = 'RIDDL (exception)';
            diagnostic.code = 'validation-exception';
            diagnostics.push(diagnostic);

            this.diagnosticCollection.set(document.uri, diagnostics);
        }
    }

    /**
     * Clear diagnostics for a document
     */
    public clearDiagnostics(document: vscode.TextDocument): void {
        // Cancel any pending parse timeout
        if (this.parseTimeout) {
            clearTimeout(this.parseTimeout);
            this.parseTimeout = undefined;
        }
        this.diagnosticCollection.delete(document.uri);
    }

    /**
     * Clear all diagnostics
     */
    public clearAll(): void {
        this.diagnosticCollection.clear();
    }

    /**
     * Dispose the diagnostic collection
     */
    public dispose(): void {
        if (this.parseTimeout) {
            clearTimeout(this.parseTimeout);
        }
        this.diagnosticCollection.dispose();
    }
}
