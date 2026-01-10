/**
 * Diagnostics Provider for RIDDL language
 *
 * Provides real-time parse error diagnostics with squiggly underlines.
 */

import * as vscode from 'vscode';
import { RiddlAPI, RiddlError, ValidationResult } from '@ossuminc/riddl-lib';

/**
 * Strip ANSI color codes from a string
 * VSCode diagnostics only support plain text, so we remove all ANSI formatting codes
 */
function stripAnsiCodes(text: string): string {
    // Remove ANSI escape sequences (with ESC character: \x1b[...m)
    // eslint-disable-next-line no-control-regex
    let cleaned = text.replace(/\x1b\[[0-9;]*m/g, '');

    // Also remove sequences without ESC character (just [<number>m, [<number>;<number>m, etc.)
    // This handles cases where ESC was stripped but codes remain
    cleaned = cleaned.replace(/\[([0-9]+;)*[0-9]*m/g, '');

    return cleaned;
}

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
    let col = Math.max(0, error.location.col - 1);

    // Try to determine the end position
    let endLine = line;
    let endCol = col + 1; // Default to highlighting one character

    const lineText = document.lineAt(line).text;

    // Try to extract the identifier name from the error message
    // Look for patterns like "Record 'fields'" or "Type 'someId'"
    const identifierMatch = error.message.match(/(?:Record|Type|Entity|Command|Event|Domain|Context|Field|State|Handler|Function)\s+'([^']+)'/i);

    if (identifierMatch && identifierMatch[1]) {
        // Found the identifier in the error message
        const identifier = identifierMatch[1];

        // Search for this identifier in the line text, starting near the reported column
        const searchStart = Math.max(0, col - 20); // Look a bit before the reported position
        const searchText = lineText.substring(searchStart);
        const identifierIndex = searchText.indexOf(identifier);

        if (identifierIndex >= 0) {
            // Found the identifier - highlight it specifically
            col = searchStart + identifierIndex;
            endCol = col + identifier.length;
        } else {
            // Fallback to original logic
            col = Math.max(0, error.location.col - 1);
            endCol = col + identifier.length;
        }
    } else {
        // No identifier found in message, use original location logic
        if (error.location.endOffset !== undefined && error.location.offset !== undefined) {
            const length = error.location.endOffset - error.location.offset;
            endCol = col + Math.max(1, length);
        } else {
            // Try to highlight the word at this position
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
    }

    const range = new vscode.Range(
        new vscode.Position(line, col),
        new vscode.Position(endLine, endCol)
    );

    // Strip ANSI codes - VSCode diagnostics only support plain text
    const cleanMessage = stripAnsiCodes(error.message);

    const diagnostic = new vscode.Diagnostic(
        range,
        cleanMessage,
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
            // noANSIMessages=false to preserve ANSI codes, which we'll convert to Markdown
            const result: ValidationResult = RiddlAPI.validateString(text, origin, false, false);

            const diagnostics: vscode.Diagnostic[] = [];
            // Track seen messages to avoid duplicates
            const seen = new Set<string>();

            // Process parse errors (syntax errors) - shown in red
            if (result.parseErrors && result.parseErrors.length > 0) {
                console.log(`[Diagnostics] Found ${result.parseErrors.length} parse error(s)`);

                for (const error of result.parseErrors) {
                    try {
                        // Create unique key to avoid duplicates
                        const key = `${error.location.line}:${error.location.col}:${error.message}`;
                        if (seen.has(key)) {
                            continue; // Skip duplicate
                        }
                        seen.add(key);

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
                            // Create unique key to avoid duplicates
                            const key = `${error.location.line}:${error.location.col}:${error.message}`;
                            if (seen.has(key)) {
                                continue; // Skip duplicate
                            }
                            seen.add(key);

                            const diagnostic = riddlErrorToDiagnostic(error, document);
                            diagnostic.source = 'RIDDL (validation)';
                            diagnostic.severity = vscode.DiagnosticSeverity.Error;
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
                            // Create unique key to avoid duplicates
                            const key = `${warning.location.line}:${warning.location.col}:${warning.message}`;
                            if (seen.has(key)) {
                                continue; // Skip duplicate
                            }
                            seen.add(key);

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
                            // Create unique key to avoid duplicates
                            const key = `${info.location.line}:${info.location.col}:${info.message}`;
                            if (seen.has(key)) {
                                continue; // Skip duplicate
                            }
                            seen.add(key);

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
