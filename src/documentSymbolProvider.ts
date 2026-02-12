/**
 * Document Symbol Provider for RIDDL language
 *
 * Provides hierarchical document symbols using RiddlAPI.getTree().
 * Enables Outline view, Breadcrumbs, and Go to Symbol (Cmd+Shift+O).
 */

import * as vscode from 'vscode';
import { RiddlAPI, TreeNode } from '@ossuminc/riddl-lib';

/**
 * Map RIDDL definition kind to VSCode SymbolKind
 */
function getSymbolKind(riddlKind: string): vscode.SymbolKind {
    switch (riddlKind) {
        case 'Domain':
            return vscode.SymbolKind.Module;
        case 'Context':
            return vscode.SymbolKind.Namespace;
        case 'Entity':
        case 'Adaptor':
        case 'Repository':
        case 'Projector':
        case 'Saga':
        case 'Streamlet':
            return vscode.SymbolKind.Class;
        case 'Type':
            return vscode.SymbolKind.Struct;
        case 'Handler':
            return vscode.SymbolKind.Method;
        case 'Function':
            return vscode.SymbolKind.Function;
        case 'State':
            return vscode.SymbolKind.Property;
        case 'Command':
        case 'Event':
            return vscode.SymbolKind.Event;
        case 'Query':
        case 'Result':
            return vscode.SymbolKind.Interface;
        case 'Epic':
        case 'Story':
            return vscode.SymbolKind.Module;
        case 'Author':
        case 'User':
            return vscode.SymbolKind.Object;
        case 'Inlet':
        case 'Outlet':
        case 'Connector':
            return vscode.SymbolKind.Field;
        case 'Invariant':
            return vscode.SymbolKind.Boolean;
        case 'Term':
        case 'Constant':
            return vscode.SymbolKind.Constant;
        default:
            return vscode.SymbolKind.Variable;
    }
}

/**
 * Convert a TreeNode to a VSCode DocumentSymbol, recursively.
 */
function treeNodeToDocumentSymbol(
    node: TreeNode,
    document: vscode.TextDocument
): vscode.DocumentSymbol {
    // RIDDL uses 1-based coordinates, VSCode uses 0-based
    const line = Math.max(0, node.line - 1);
    const col = Math.max(0, node.col - 1);

    // Selection range covers just the identifier name
    const selectionStart = new vscode.Position(line, col);
    const selectionEnd = new vscode.Position(line, col + node.id.length);
    const selectionRange = new vscode.Range(selectionStart, selectionEnd);

    // Full range: from node start to end of line (approximation)
    const lineEnd = document.lineAt(Math.min(line, document.lineCount - 1)).range.end;
    const range = new vscode.Range(selectionStart, lineEnd);

    const symbol = new vscode.DocumentSymbol(
        node.id,
        node.kind,
        getSymbolKind(node.kind),
        range,
        selectionRange
    );

    // Recursively add children
    for (const child of node.children) {
        symbol.children.push(treeNodeToDocumentSymbol(child, document));
    }

    return symbol;
}

/**
 * RIDDL Document Symbol Provider
 */
export class RiddlDocumentSymbolProvider implements vscode.DocumentSymbolProvider {

    provideDocumentSymbols(
        document: vscode.TextDocument,
        _token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.DocumentSymbol[]> {
        const text = document.getText();
        const origin = document.uri.fsPath || 'untitled.riddl';

        try {
            const result = RiddlAPI.getTree(text, origin);

            if (!result.succeeded || !result.value) {
                return [];
            }

            const symbols: vscode.DocumentSymbol[] = [];
            for (const node of result.value) {
                symbols.push(treeNodeToDocumentSymbol(node, document));
            }
            return symbols;

        } catch (error) {
            console.error('[DocumentSymbol] Error:', error);
            return [];
        }
    }
}
