/**
 * MCP Service - VS Code integration layer for MCP client
 *
 * Handles:
 * - Configuration from VS Code settings
 * - Connection state management
 * - Status bar updates
 * - Auto-connect behavior
 * - Error notifications
 */

import * as vscode from 'vscode';
import { McpClient, createMcpClient } from './mcpClient';
import {
    McpConnectionState,
    McpResult,
    McpToolResult,
    McpToolDefinition,
    McpInitializeResult,
} from './mcpTypes';

/**
 * Event emitter for connection state changes
 */
export type McpConnectionStateChangeHandler = (state: McpConnectionState) => void;

/**
 * MCP Service configuration from VS Code settings
 */
export interface McpServiceConfig {
    enabled: boolean;
    serverUrl: string;
    apiKey: string;
    autoConnect: boolean;
}

/**
 * MCP Service - manages connection to riddl-mcp-server
 */
export class McpService implements vscode.Disposable {
    private client: McpClient | null = null;
    private connectionState: McpConnectionState = 'disconnected';
    private statusBarItem: vscode.StatusBarItem;
    private stateChangeHandlers: McpConnectionStateChangeHandler[] = [];
    private outputChannel: vscode.OutputChannel;
    private disposables: vscode.Disposable[] = [];

    constructor() {
        // Create status bar item
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            100
        );
        this.statusBarItem.command = 'riddl.mcp.toggleConnection';
        this.updateStatusBar();
        this.disposables.push(this.statusBarItem);

        // Create output channel for MCP messages
        this.outputChannel = vscode.window.createOutputChannel('RIDDL MCP');
        this.disposables.push(this.outputChannel);

        // Listen for configuration changes
        this.disposables.push(
            vscode.workspace.onDidChangeConfiguration((e) => {
                if (e.affectsConfiguration('riddl.mcp')) {
                    this.handleConfigurationChange();
                }
            })
        );
    }

    /**
     * Get current configuration from VS Code settings
     */
    public getConfig(): McpServiceConfig {
        const config = vscode.workspace.getConfiguration('riddl.mcp');
        return {
            enabled: config.get<boolean>('enabled', true),
            serverUrl: config.get<string>('serverUrl', 'http://localhost:8080'),
            apiKey: config.get<string>('apiKey', ''),
            autoConnect: config.get<boolean>('autoConnect', true),
        };
    }

    /**
     * Get current connection state
     */
    public getConnectionState(): McpConnectionState {
        return this.connectionState;
    }

    /**
     * Check if connected to MCP server
     */
    public isConnected(): boolean {
        return this.connectionState === 'connected';
    }

    /**
     * Check if MCP features are enabled
     */
    public isEnabled(): boolean {
        return this.getConfig().enabled;
    }

    /**
     * Add handler for connection state changes
     */
    public onConnectionStateChange(handler: McpConnectionStateChangeHandler): vscode.Disposable {
        this.stateChangeHandlers.push(handler);
        return {
            dispose: () => {
                const index = this.stateChangeHandlers.indexOf(handler);
                if (index >= 0) {
                    this.stateChangeHandlers.splice(index, 1);
                }
            },
        };
    }

    /**
     * Set connection state and notify handlers
     */
    private setConnectionState(state: McpConnectionState): void {
        if (this.connectionState !== state) {
            this.connectionState = state;
            this.updateStatusBar();
            this.stateChangeHandlers.forEach((handler) => handler(state));
        }
    }

    /**
     * Update status bar based on connection state
     */
    private updateStatusBar(): void {
        const config = this.getConfig();

        if (!config.enabled) {
            this.statusBarItem.text = '$(circle-slash) MCP Disabled';
            this.statusBarItem.tooltip = 'RIDDL MCP: Disabled in settings';
            this.statusBarItem.backgroundColor = undefined;
            this.statusBarItem.show();
            return;
        }

        switch (this.connectionState) {
            case 'disconnected':
                this.statusBarItem.text = '$(debug-disconnect) MCP';
                this.statusBarItem.tooltip = 'RIDDL MCP: Disconnected (click to connect)';
                this.statusBarItem.backgroundColor = undefined;
                break;
            case 'connecting':
                this.statusBarItem.text = '$(sync~spin) MCP';
                this.statusBarItem.tooltip = 'RIDDL MCP: Connecting...';
                this.statusBarItem.backgroundColor = undefined;
                break;
            case 'connected':
                this.statusBarItem.text = '$(check) MCP';
                this.statusBarItem.tooltip = 'RIDDL MCP: Connected (click to disconnect)';
                this.statusBarItem.backgroundColor = undefined;
                break;
            case 'error':
                this.statusBarItem.text = '$(error) MCP';
                this.statusBarItem.tooltip = 'RIDDL MCP: Connection error (click to retry)';
                this.statusBarItem.backgroundColor = new vscode.ThemeColor(
                    'statusBarItem.errorBackground'
                );
                break;
        }

        this.statusBarItem.show();
    }

    /**
     * Handle configuration changes
     */
    private async handleConfigurationChange(): Promise<void> {
        const config = this.getConfig();

        if (!config.enabled && this.isConnected()) {
            await this.disconnect();
        } else if (config.enabled && config.autoConnect && !this.isConnected()) {
            await this.connect();
        }

        this.updateStatusBar();
    }

    /**
     * Log message to output channel
     */
    public log(message: string): void {
        const timestamp = new Date().toISOString();
        this.outputChannel.appendLine(`[${timestamp}] ${message}`);
    }

    /**
     * Show output channel
     */
    public showOutput(): void {
        this.outputChannel.show();
    }

    /**
     * Connect to MCP server
     */
    public async connect(): Promise<McpResult<McpInitializeResult>> {
        const config = this.getConfig();

        if (!config.enabled) {
            return {
                success: false,
                error: 'MCP features are disabled in settings',
            };
        }

        if (this.connectionState === 'connecting') {
            return {
                success: false,
                error: 'Connection already in progress',
            };
        }

        if (this.connectionState === 'connected' && this.client) {
            return {
                success: true,
                data: {
                    protocolVersion: '2024-11-05',
                    capabilities: {},
                    serverInfo: { name: 'cached', version: 'cached' },
                },
            };
        }

        this.setConnectionState('connecting');
        this.log(`Connecting to MCP server at ${config.serverUrl}...`);

        try {
            this.client = createMcpClient({
                serverUrl: config.serverUrl,
                apiKey: config.apiKey,
            });

            const result = await this.client.initialize();

            if (result.success) {
                this.setConnectionState('connected');
                this.log(`Connected successfully. Server: ${result.data.serverInfo.name} v${result.data.serverInfo.version}`);
                vscode.window.showInformationMessage('RIDDL MCP: Connected to server');
                return result;
            } else {
                this.setConnectionState('error');
                this.log(`Connection failed: ${result.error}`);
                vscode.window.showErrorMessage(`RIDDL MCP: ${result.error}`);
                return result;
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            this.setConnectionState('error');
            this.log(`Connection error: ${message}`);
            vscode.window.showErrorMessage(`RIDDL MCP: ${message}`);
            return {
                success: false,
                error: message,
            };
        }
    }

    /**
     * Disconnect from MCP server
     */
    public async disconnect(): Promise<void> {
        this.client = null;
        this.setConnectionState('disconnected');
        this.log('Disconnected from MCP server');
        vscode.window.showInformationMessage('RIDDL MCP: Disconnected');
    }

    /**
     * Toggle connection state
     */
    public async toggleConnection(): Promise<void> {
        if (this.isConnected()) {
            await this.disconnect();
        } else {
            await this.connect();
        }
    }

    /**
     * Ensure connected before making requests
     */
    private async ensureConnected(): Promise<McpResult<void>> {
        if (!this.isEnabled()) {
            return {
                success: false,
                error: 'MCP features are disabled',
            };
        }

        if (!this.isConnected()) {
            const result = await this.connect();
            if (!result.success) {
                return {
                    success: false,
                    error: result.error,
                };
            }
        }

        return { success: true, data: undefined };
    }

    // ========================================================================
    // Tool Wrapper Methods
    // ========================================================================

    /**
     * List available tools
     */
    public async listTools(): Promise<McpResult<McpToolDefinition[]>> {
        const connected = await this.ensureConnected();
        if (!connected.success) {
            return { success: false, error: connected.error };
        }

        const result = await this.client!.listTools();
        if (result.success) {
            return { success: true, data: result.data.tools };
        }
        return { success: false, error: result.error };
    }

    /**
     * Validate RIDDL text
     */
    public async validateText(content: string): Promise<McpResult<McpToolResult>> {
        const connected = await this.ensureConnected();
        if (!connected.success) {
            return { success: false, error: connected.error };
        }

        this.log('Calling validate-text...');
        const result = await this.client!.validateText(content);
        if (result.success) {
            this.log('Validation completed');
        } else {
            this.log(`Validation failed: ${result.error}`);
        }
        return result;
    }

    /**
     * Validate partial RIDDL model
     */
    public async validatePartial(content: string): Promise<McpResult<McpToolResult>> {
        const connected = await this.ensureConnected();
        if (!connected.success) {
            return { success: false, error: connected.error };
        }

        this.log('Calling validate-partial...');
        return this.client!.validatePartial(content);
    }

    /**
     * Check model completeness
     */
    public async checkCompleteness(content: string): Promise<McpResult<McpToolResult>> {
        const connected = await this.ensureConnected();
        if (!connected.success) {
            return { success: false, error: connected.error };
        }

        this.log('Calling check-completeness...');
        return this.client!.checkCompleteness(content);
    }

    /**
     * Check model simulability
     */
    public async checkSimulability(content: string): Promise<McpResult<McpToolResult>> {
        const connected = await this.ensureConnected();
        if (!connected.success) {
            return { success: false, error: connected.error };
        }

        this.log('Calling check-simulability...');
        return this.client!.checkSimulability(content);
    }

    /**
     * Map domain description to RIDDL
     */
    public async mapDomainToRiddl(description: string): Promise<McpResult<McpToolResult>> {
        const connected = await this.ensureConnected();
        if (!connected.success) {
            return { success: false, error: connected.error };
        }

        this.log('Calling map-domain-to-riddl...');
        return this.client!.mapDomainToRiddl(description);
    }

    /**
     * Explain a validation error
     */
    public async explainError(errorMessage: string, context?: string): Promise<McpResult<McpToolResult>> {
        const connected = await this.ensureConnected();
        if (!connected.success) {
            return { success: false, error: connected.error };
        }

        this.log('Calling explain-error...');
        return this.client!.explainError(errorMessage, context);
    }

    /**
     * Suggest next steps
     */
    public async suggestNext(content: string): Promise<McpResult<McpToolResult>> {
        const connected = await this.ensureConnected();
        if (!connected.success) {
            return { success: false, error: connected.error };
        }

        this.log('Calling suggest-next...');
        return this.client!.suggestNext(content);
    }

    /**
     * Dispose resources
     */
    public dispose(): void {
        this.client = null;
        this.disposables.forEach((d) => d.dispose());
        this.disposables = [];
    }
}

// Singleton instance
let mcpServiceInstance: McpService | null = null;

/**
 * Get the MCP service instance
 */
export function getMcpService(): McpService {
    if (!mcpServiceInstance) {
        mcpServiceInstance = new McpService();
    }
    return mcpServiceInstance;
}

/**
 * Dispose the MCP service instance
 */
export function disposeMcpService(): void {
    if (mcpServiceInstance) {
        mcpServiceInstance.dispose();
        mcpServiceInstance = null;
    }
}
