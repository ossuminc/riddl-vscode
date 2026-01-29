/**
 * MCP Client - HTTP client for JSON-RPC 2.0 communication with riddl-mcp-server
 *
 * Handles:
 * - HTTP POST requests to /mcp/v1 endpoint
 * - JSON-RPC 2.0 protocol compliance
 * - Session management
 * - Timeout handling
 * - Error handling and response parsing
 */

import * as http from 'http';
import * as https from 'https';
import { URL } from 'url';
import {
    JsonRpcRequest,
    JsonRpcResponse,
    McpToolResult,
    McpInitializeResult,
    McpToolDefinition,
    McpResourceDefinition,
    McpClientConfig,
    McpClientOptions,
    McpClientDefaults,
    McpResult,
    isJsonRpcError,
    isJsonRpcSuccess,
} from './mcpTypes';

/**
 * MCP Client for communicating with riddl-mcp-server
 */
export class McpClient {
    private readonly options: McpClientOptions;
    private requestId: number = 0;
    private initialized: boolean = false;

    constructor(config: McpClientConfig) {
        this.options = {
            serverUrl: config.serverUrl || McpClientDefaults.serverUrl,
            apiKey: config.apiKey || McpClientDefaults.apiKey,
            timeout: config.timeout || McpClientDefaults.timeout,
            sessionId: config.sessionId || this.generateSessionId(),
        };
    }

    /**
     * Generate a unique session ID for this client
     */
    private generateSessionId(): string {
        const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
        return `vscode-${uuid}`;
    }

    /**
     * Get the next request ID
     */
    private nextRequestId(): number {
        return ++this.requestId;
    }

    /**
     * Get the current session ID
     */
    public getSessionId(): string {
        return this.options.sessionId;
    }

    /**
     * Check if client has been initialized
     */
    public isInitialized(): boolean {
        return this.initialized;
    }

    /**
     * Send a JSON-RPC request to the MCP server
     */
    private async sendRequest<T>(method: string, params?: Record<string, unknown>): Promise<McpResult<T>> {
        const request: JsonRpcRequest = {
            jsonrpc: '2.0',
            id: this.nextRequestId(),
            method,
            params,
        };

        try {
            const response = await this.httpPost<JsonRpcResponse<T>>(request);

            if (isJsonRpcError(response)) {
                return {
                    success: false,
                    error: response.error.message,
                    code: response.error.code,
                };
            }

            if (isJsonRpcSuccess(response)) {
                return {
                    success: true,
                    data: response.result,
                };
            }

            return {
                success: false,
                error: 'Invalid JSON-RPC response',
            };
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            return {
                success: false,
                error: message,
            };
        }
    }

    /**
     * Perform HTTP POST request
     */
    private httpPost<T>(body: unknown): Promise<T> {
        return new Promise((resolve, reject) => {
            const url = new URL('/mcp/v1', this.options.serverUrl);
            const isHttps = url.protocol === 'https:';
            const httpModule = isHttps ? https : http;

            const requestBody = JSON.stringify(body);

            const requestOptions: http.RequestOptions = {
                hostname: url.hostname,
                port: url.port || (isHttps ? 443 : 80),
                path: url.pathname,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(requestBody),
                    'X-Session-ID': this.options.sessionId,
                    ...(this.options.apiKey ? { 'X-API-KEY': this.options.apiKey } : {}),
                },
                timeout: this.options.timeout,
            };

            const req = httpModule.request(requestOptions, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    try {
                        const parsed = JSON.parse(data) as T;
                        resolve(parsed);
                    } catch {
                        reject(new Error(`Invalid JSON response: ${data.substring(0, 100)}`));
                    }
                });
            });

            req.on('error', (error) => {
                reject(new Error(`HTTP request failed: ${error.message}`));
            });

            req.on('timeout', () => {
                req.destroy();
                reject(new Error(`Request timed out after ${this.options.timeout}ms`));
            });

            req.write(requestBody);
            req.end();
        });
    }

    // ========================================================================
    // MCP Protocol Methods
    // ========================================================================

    /**
     * Initialize connection with MCP server
     */
    async initialize(): Promise<McpResult<McpInitializeResult>> {
        const result = await this.sendRequest<McpInitializeResult>('initialize', {
            protocolVersion: '2024-11-05',
            capabilities: {},
            clientInfo: {
                name: 'riddl-vscode',
                version: '0.1.0',
            },
        });

        if (result.success) {
            this.initialized = true;
        }

        return result;
    }

    /**
     * List available tools
     */
    async listTools(): Promise<McpResult<{ tools: McpToolDefinition[] }>> {
        return this.sendRequest<{ tools: McpToolDefinition[] }>('tools/list');
    }

    /**
     * List available resources
     */
    async listResources(): Promise<McpResult<{ resources: McpResourceDefinition[] }>> {
        return this.sendRequest<{ resources: McpResourceDefinition[] }>('resources/list');
    }

    /**
     * Read a resource by URI
     */
    async readResource(uri: string): Promise<McpResult<{ contents: Array<{ uri: string; text?: string; blob?: string }> }>> {
        return this.sendRequest<{ contents: Array<{ uri: string; text?: string; blob?: string }> }>('resources/read', { uri });
    }

    /**
     * Call an MCP tool
     */
    async callTool(name: string, args: Record<string, unknown>): Promise<McpResult<McpToolResult>> {
        return this.sendRequest<McpToolResult>('tools/call', {
            name,
            arguments: args,
        });
    }

    // ========================================================================
    // RIDDL-Specific Tool Methods
    // ========================================================================

    /**
     * Validate RIDDL text content
     */
    async validateText(content: string): Promise<McpResult<McpToolResult>> {
        return this.callTool('validate-text', { content });
    }

    /**
     * Validate RIDDL from URL
     */
    async validateUrl(url: string): Promise<McpResult<McpToolResult>> {
        return this.callTool('validate-url', { url });
    }

    /**
     * Validate partial/incomplete RIDDL model
     */
    async validatePartial(content: string): Promise<McpResult<McpToolResult>> {
        return this.callTool('validate-partial', { content });
    }

    /**
     * Check model completeness
     */
    async checkCompleteness(content: string): Promise<McpResult<McpToolResult>> {
        return this.callTool('check-completeness', { content });
    }

    /**
     * Check if model is simulable
     */
    async checkSimulability(content: string): Promise<McpResult<McpToolResult>> {
        return this.callTool('check-simulability', { content });
    }

    /**
     * Map natural language description to RIDDL
     */
    async mapDomainToRiddl(description: string): Promise<McpResult<McpToolResult>> {
        return this.callTool('map-domain-to-riddl', { description });
    }

    /**
     * Explain a validation error
     */
    async explainError(errorMessage: string, context?: string): Promise<McpResult<McpToolResult>> {
        return this.callTool('explain-error', { errorMessage, context });
    }

    /**
     * Suggest next steps for model development
     */
    async suggestNext(content: string): Promise<McpResult<McpToolResult>> {
        return this.callTool('suggest-next', { content });
    }

    // ========================================================================
    // Health Check
    // ========================================================================

    /**
     * Check if server is reachable (simple ping)
     */
    async healthCheck(): Promise<McpResult<boolean>> {
        try {
            const result = await this.listTools();
            if (result.success) {
                return {
                    success: true,
                    data: true,
                };
            } else {
                return {
                    success: false,
                    error: result.error,
                };
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            return {
                success: false,
                error: message,
            };
        }
    }
}

/**
 * Create a new MCP client instance
 */
export function createMcpClient(config: McpClientConfig): McpClient {
    return new McpClient(config);
}