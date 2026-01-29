/**
 * RIDDL Folding Range Provider
 *
 * Provides code folding for:
 * - Definitions: domain, context, entity, adaptor, repository, projector,
 *   saga, streamlet, handler, function, state, type, epic, case, application
 * - Handlers: on command, on event, on query
 * - Comments: multi-line /* ... * / blocks
 * - String literals: triple-quoted strings
 */

import * as vscode from 'vscode';

/**
 * RIDDL Folding Range Provider
 */
export class RiddlFoldingRangeProvider implements vscode.FoldingRangeProvider {
    /**
     * Provide folding ranges for the document
     */
    public provideFoldingRanges(
        document: vscode.TextDocument,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _context: vscode.FoldingContext,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _token: vscode.CancellationToken
    ): vscode.FoldingRange[] | undefined {
        const ranges: vscode.FoldingRange[] = [];
        const text = document.getText();

        // Find brace-based folding (for definitions)
        const braceRanges = this.findBraceFoldingRanges(document, text);
        ranges.push(...braceRanges);

        // Find comment folding
        const commentRanges = this.findCommentFoldingRanges(document, text);
        ranges.push(...commentRanges);

        // Find region markers (optional)
        const regionRanges = this.findRegionFoldingRanges(document);
        ranges.push(...regionRanges);

        return ranges.length > 0 ? ranges : undefined;
    }

    /**
     * Find folding ranges based on matching braces { }
     */
    private findBraceFoldingRanges(
        document: vscode.TextDocument,
        text: string
    ): vscode.FoldingRange[] {
        const ranges: vscode.FoldingRange[] = [];
        const stack: { line: number; char: number }[] = [];

        // Track if we're in a string or comment
        let inString = false;
        let inMultiLineComment = false;
        let inSingleLineComment = false;
        let stringChar = '';

        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const prevChar = i > 0 ? text[i - 1] : '';
            const nextChar = i < text.length - 1 ? text[i + 1] : '';

            // Track line number
            const pos = document.positionAt(i);
            const line = pos.line;

            // Handle newlines (reset single-line comment)
            if (char === '\n') {
                inSingleLineComment = false;
                continue;
            }

            // Handle single-line comments
            if (!inString && !inMultiLineComment && char === '/' && nextChar === '/') {
                inSingleLineComment = true;
                continue;
            }

            // Skip if in single-line comment
            if (inSingleLineComment) {
                continue;
            }

            // Handle multi-line comment start
            if (!inString && !inMultiLineComment && char === '/' && nextChar === '*') {
                inMultiLineComment = true;
                continue;
            }

            // Handle multi-line comment end
            if (inMultiLineComment && char === '*' && nextChar === '/') {
                inMultiLineComment = false;
                i++; // Skip the closing /
                continue;
            }

            // Skip if in multi-line comment
            if (inMultiLineComment) {
                continue;
            }

            // Handle string start/end (both single and double quotes)
            if ((char === '"' || char === "'") && prevChar !== '\\') {
                if (!inString) {
                    inString = true;
                    stringChar = char;
                } else if (char === stringChar) {
                    inString = false;
                    stringChar = '';
                }
                continue;
            }

            // Skip if in string
            if (inString) {
                continue;
            }

            // Handle opening brace
            if (char === '{') {
                stack.push({ line, char: pos.character });
            }

            // Handle closing brace
            if (char === '}' && stack.length > 0) {
                const open = stack.pop()!;

                // Only create folding range if it spans multiple lines
                if (line > open.line) {
                    ranges.push(new vscode.FoldingRange(
                        open.line,
                        line,
                        vscode.FoldingRangeKind.Region
                    ));
                }
            }
        }

        return ranges;
    }

    /**
     * Find folding ranges for multi-line comments
     */
    private findCommentFoldingRanges(
        document: vscode.TextDocument,
        text: string
    ): vscode.FoldingRange[] {
        const ranges: vscode.FoldingRange[] = [];

        // Find /* ... */ comments
        const commentRegex = /\/\*[\s\S]*?\*\//g;
        let match;

        while ((match = commentRegex.exec(text)) !== null) {
            const startPos = document.positionAt(match.index);
            const endPos = document.positionAt(match.index + match[0].length);

            // Only create folding range if comment spans multiple lines
            if (endPos.line > startPos.line) {
                ranges.push(new vscode.FoldingRange(
                    startPos.line,
                    endPos.line,
                    vscode.FoldingRangeKind.Comment
                ));
            }
        }

        // Find consecutive single-line comments
        let commentStart = -1;
        let lastCommentLine = -1;

        for (let i = 0; i < document.lineCount; i++) {
            const lineText = document.lineAt(i).text.trim();

            if (lineText.startsWith('//')) {
                if (commentStart === -1) {
                    commentStart = i;
                }
                lastCommentLine = i;
            } else {
                // End of consecutive comments
                if (commentStart !== -1 && lastCommentLine > commentStart) {
                    ranges.push(new vscode.FoldingRange(
                        commentStart,
                        lastCommentLine,
                        vscode.FoldingRangeKind.Comment
                    ));
                }
                commentStart = -1;
                lastCommentLine = -1;
            }
        }

        // Handle comments at end of file
        if (commentStart !== -1 && lastCommentLine > commentStart) {
            ranges.push(new vscode.FoldingRange(
                commentStart,
                lastCommentLine,
                vscode.FoldingRangeKind.Comment
            ));
        }

        return ranges;
    }

    /**
     * Find folding ranges for #region / #endregion markers
     */
    private findRegionFoldingRanges(
        document: vscode.TextDocument
    ): vscode.FoldingRange[] {
        const ranges: vscode.FoldingRange[] = [];
        const stack: number[] = [];

        for (let i = 0; i < document.lineCount; i++) {
            const lineText = document.lineAt(i).text.trim();

            // Check for region start
            if (lineText.match(/^\/\/\s*#region/i) || lineText.match(/^\/\*\s*#region/i)) {
                stack.push(i);
            }

            // Check for region end
            if (lineText.match(/^\/\/\s*#endregion/i) || lineText.match(/^\/\*\s*#endregion/i)) {
                if (stack.length > 0) {
                    const startLine = stack.pop()!;
                    ranges.push(new vscode.FoldingRange(
                        startLine,
                        i,
                        vscode.FoldingRangeKind.Region
                    ));
                }
            }
        }

        return ranges;
    }
}
