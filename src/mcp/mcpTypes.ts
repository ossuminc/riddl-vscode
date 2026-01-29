/**
 * Type definitions for MCP (Model Context Protocol) client
 *
 * Implements JSON-RPC 2.0 protocol for communication with riddl-mcp-server.
 * See NOTEBOOK.md for protocol details and design decisions.
 */

// ============================================================================
// JSON-RPC 2.0 Base Types
// ============================================================================

/**
 * JSON-RPC 2.0 request object
 */
export interface JsonRpcRequest {
    jsonrpc: '2.0';
    id: number | string;
    method: string;
    params?: JsonRpcParams;
}

/**
 * JSON-RPC 2.0 parameters - can be object or array
 */
export type JsonRpcParams = Record<string, unknown> | unknown[];

/**
 * JSON-RPC 2.0 success response
 */
export interface JsonRpcSuccessResponse<T = unknown> {
    jsonrpc: '2.0';
    id: number | string | null;
    result: T;
}

/**
 * JSON-RPC 2.0 error response
 */
export interface JsonRpcErrorResponse {
    jsonrpc: '2.0';
    id: number | string | null;
    error: JsonRpcError;
}

/**
 * JSON-RPC 2.0 error object
 */
export interface JsonRpcError {
    code: number;
    message: string;
    data?: unknown;
}

/**
 * JSON-RPC 2.0 response (success or error)
 */
export type JsonRpcResponse<T = unknown> = JsonRpcSuccessResponse<T> | JsonRpcErrorResponse;

/**
 * Standard JSON-RPC 2.0 error codes
 */
export const JsonRpcErrorCodes = {
    PARSE_ERROR: -32700,
    INVALID_REQUEST: -32600,
    METHOD_NOT_FOUND: -32601,
    INVALID_PARAMS: -32602,
    INTERNAL_ERROR: -32603,
    // Server errors: -32000 to -32099
    SERVER_ERROR: -32000,
} as const;

// ============================================================================
// MCP Protocol Types
// ============================================================================

/**
 * MCP tool call parameters
 */
export interface McpToolCallParams {
    name: string;
    arguments: Record<string, unknown>;
}

/**
 * MCP content item in response
 */
export interface McpContentItem {
    type: 'text' | 'image' | 'resource';
    text?: string;
    data?: string;
    mimeType?: string;
}

/**
 * MCP tool call result
 */
export interface McpToolResult {
    content: McpContentItem[];
    isError?: boolean;
}

/**
 * MCP tool definition
 */
export interface McpToolDefinition {
    name: string;
    description: string;
    inputSchema: {
        type: 'object';
        properties: Record<string, unknown>;
        required?: string[];
    };
}

/**
 * MCP resource definition
 */
export interface McpResourceDefinition {
    uri: string;
    name: string;
    description?: string;
    mimeType?: string;
}

/**
 * MCP prompt definition
 */
export interface McpPromptDefinition {
    name: string;
    description?: string;
    arguments?: Array<{
        name: string;
        description?: string;
        required?: boolean;
    }>;
}

/**
 * MCP initialization result
 */
export interface McpInitializeResult {
    protocolVersion: string;
    capabilities: {
        tools?: Record<string, unknown>;
        resources?: Record<string, unknown>;
        prompts?: Record<string, unknown>;
    };
    serverInfo: {
        name: string;
        version: string;
    };
}

// ============================================================================
// RIDDL MCP Tool Types
// ============================================================================

/**
 * Available RIDDL MCP tools
 */
export type RiddlMcpToolName =
    | 'validate-text'
    | 'validate-url'
    | 'validate-partial'
    | 'check-completeness'
    | 'check-simulability'
    | 'map-domain-to-riddl'
    | 'explain-error'
    | 'suggest-next'
    | 'generate-test-cases';

/**
 * Arguments for validate-text tool
 */
export interface ValidateTextArgs {
    content: string;
}

/**
 * Arguments for validate-url tool
 */
export interface ValidateUrlArgs {
    url: string;
}

/**
 * Arguments for validate-partial tool
 */
export interface ValidatePartialArgs {
    content: string;
}

/**
 * Arguments for check-completeness tool
 */
export interface CheckCompletenessArgs {
    content: string;
}

/**
 * Arguments for check-simulability tool
 */
export interface CheckSimulabilityArgs {
    content: string;
}

/**
 * Arguments for map-domain-to-riddl tool
 */
export interface MapDomainToRiddlArgs {
    description: string;
}

/**
 * Arguments for explain-error tool
 */
export interface ExplainErrorArgs {
    errorMessage: string;
    context?: string;
}

/**
 * Arguments for suggest-next tool
 */
export interface SuggestNextArgs {
    content: string;
}

/**
 * Union type for all tool arguments
 */
export type RiddlMcpToolArgs =
    | ValidateTextArgs
    | ValidateUrlArgs
    | ValidatePartialArgs
    | CheckCompletenessArgs
    | CheckSimulabilityArgs
    | MapDomainToRiddlArgs
    | ExplainErrorArgs
    | SuggestNextArgs;

// ============================================================================
// MCP Client Types
// ============================================================================

/**
 * MCP connection state
 */
export type McpConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

/**
 * MCP client configuration
 */
export interface McpClientConfig {
    serverUrl: string;
    apiKey?: string;
    timeout?: number;
    sessionId?: string;
}

/**
 * MCP client options with defaults applied
 */
export interface McpClientOptions {
    serverUrl: string;
    apiKey: string;
    timeout: number;
    sessionId: string;
}

/**
 * Default MCP client configuration values
 */
export const McpClientDefaults = {
    serverUrl: 'http://localhost:8080',
    timeout: 30000, // 30 seconds
    apiKey: '',
} as const;

/**
 * Result of an MCP operation
 */
export type McpResult<T> =
    | { success: true; data: T }
    | { success: false; error: string; code?: number };

/**
 * Type guard to check if response is an error
 */
export function isJsonRpcError(response: JsonRpcResponse): response is JsonRpcErrorResponse {
    return 'error' in response;
}

/**
 * Type guard to check if response is successful
 */
export function isJsonRpcSuccess<T>(response: JsonRpcResponse<T>): response is JsonRpcSuccessResponse<T> {
    return 'result' in response;
}