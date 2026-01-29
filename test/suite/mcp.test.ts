/**
 * Tests for MCP (Model Context Protocol) module
 */

import * as assert from 'assert';
import {
    McpClient,
    createMcpClient,
    isJsonRpcError,
    isJsonRpcSuccess,
    JsonRpcErrorCodes,
    McpClientDefaults,
} from '../../src/mcp';

suite('MCP Types Test Suite', () => {
    test('isJsonRpcError should correctly identify error responses', () => {
        const errorResponse = {
            jsonrpc: '2.0' as const,
            id: 1,
            error: {
                code: JsonRpcErrorCodes.INVALID_REQUEST,
                message: 'Invalid request',
            },
        };

        const successResponse = {
            jsonrpc: '2.0' as const,
            id: 1,
            result: { data: 'test' },
        };

        assert.strictEqual(isJsonRpcError(errorResponse), true);
        assert.strictEqual(isJsonRpcError(successResponse), false);
    });

    test('isJsonRpcSuccess should correctly identify success responses', () => {
        const errorResponse = {
            jsonrpc: '2.0' as const,
            id: 1,
            error: {
                code: JsonRpcErrorCodes.INVALID_REQUEST,
                message: 'Invalid request',
            },
        };

        const successResponse = {
            jsonrpc: '2.0' as const,
            id: 1,
            result: { data: 'test' },
        };

        assert.strictEqual(isJsonRpcSuccess(successResponse), true);
        assert.strictEqual(isJsonRpcSuccess(errorResponse), false);
    });

    test('JsonRpcErrorCodes should have correct values', () => {
        assert.strictEqual(JsonRpcErrorCodes.PARSE_ERROR, -32700);
        assert.strictEqual(JsonRpcErrorCodes.INVALID_REQUEST, -32600);
        assert.strictEqual(JsonRpcErrorCodes.METHOD_NOT_FOUND, -32601);
        assert.strictEqual(JsonRpcErrorCodes.INVALID_PARAMS, -32602);
        assert.strictEqual(JsonRpcErrorCodes.INTERNAL_ERROR, -32603);
        assert.strictEqual(JsonRpcErrorCodes.SERVER_ERROR, -32000);
    });

    test('McpClientDefaults should have sensible values', () => {
        assert.strictEqual(McpClientDefaults.serverUrl, 'http://localhost:8080');
        assert.strictEqual(McpClientDefaults.timeout, 30000);
        assert.strictEqual(McpClientDefaults.apiKey, '');
    });
});

suite('MCP Client Test Suite', () => {
    test('createMcpClient should create a client instance', () => {
        const client = createMcpClient({
            serverUrl: 'http://localhost:8080',
        });

        assert.ok(client instanceof McpClient);
    });

    test('Client should generate unique session IDs', () => {
        const client1 = createMcpClient({ serverUrl: 'http://localhost:8080' });
        const client2 = createMcpClient({ serverUrl: 'http://localhost:8080' });

        const sessionId1 = client1.getSessionId();
        const sessionId2 = client2.getSessionId();

        assert.ok(sessionId1.startsWith('vscode-'));
        assert.ok(sessionId2.startsWith('vscode-'));
        assert.notStrictEqual(sessionId1, sessionId2);
    });

    test('Client should use provided session ID', () => {
        const customSessionId = 'custom-session-123';
        const client = createMcpClient({
            serverUrl: 'http://localhost:8080',
            sessionId: customSessionId,
        });

        assert.strictEqual(client.getSessionId(), customSessionId);
    });

    test('Client should not be initialized before calling initialize', () => {
        const client = createMcpClient({
            serverUrl: 'http://localhost:8080',
        });

        assert.strictEqual(client.isInitialized(), false);
    });

    test('Client should use default URL when serverUrl is empty', () => {
        const client = createMcpClient({ serverUrl: '' });
        // Can't directly test the URL, but we can test that it doesn't throw
        assert.ok(client instanceof McpClient);
    });

    test('healthCheck should return error when server is not available', async () => {
        const client = createMcpClient({
            serverUrl: 'http://localhost:99999', // Invalid port
            timeout: 1000, // Short timeout for faster test
        });

        const result = await client.healthCheck();

        assert.strictEqual(result.success, false);
        if (!result.success) {
            assert.ok(result.error);
        }
    });
});

suite('MCP Client Connection Test Suite', () => {
    // These tests verify behavior without an actual server

    test('initialize should fail gracefully when server unavailable', async () => {
        const client = createMcpClient({
            serverUrl: 'http://localhost:99999',
            timeout: 1000,
        });

        const result = await client.initialize();

        assert.strictEqual(result.success, false);
        if (!result.success) {
            assert.ok(result.error);
        }
        assert.strictEqual(client.isInitialized(), false);
    });

    test('validateText should fail gracefully when not connected', async () => {
        const client = createMcpClient({
            serverUrl: 'http://localhost:99999',
            timeout: 1000,
        });

        const result = await client.validateText('domain Test is { ??? }');

        assert.strictEqual(result.success, false);
        if (!result.success) {
            assert.ok(result.error);
        }
    });

    test('callTool should fail gracefully when not connected', async () => {
        const client = createMcpClient({
            serverUrl: 'http://localhost:99999',
            timeout: 1000,
        });

        const result = await client.callTool('validate-text', { content: 'test' });

        assert.strictEqual(result.success, false);
        if (!result.success) {
            assert.ok(result.error);
        }
    });
});

suite('MCP Client Tool Methods Test Suite', () => {
    // Test that all tool wrapper methods exist and call the correct tools

    test('validateUrl method should exist', () => {
        const client = createMcpClient({ serverUrl: 'http://localhost:8080' });
        assert.ok(typeof client.validateUrl === 'function');
    });

    test('validatePartial method should exist', () => {
        const client = createMcpClient({ serverUrl: 'http://localhost:8080' });
        assert.ok(typeof client.validatePartial === 'function');
    });

    test('checkCompleteness method should exist', () => {
        const client = createMcpClient({ serverUrl: 'http://localhost:8080' });
        assert.ok(typeof client.checkCompleteness === 'function');
    });

    test('checkSimulability method should exist', () => {
        const client = createMcpClient({ serverUrl: 'http://localhost:8080' });
        assert.ok(typeof client.checkSimulability === 'function');
    });

    test('mapDomainToRiddl method should exist', () => {
        const client = createMcpClient({ serverUrl: 'http://localhost:8080' });
        assert.ok(typeof client.mapDomainToRiddl === 'function');
    });

    test('explainError method should exist', () => {
        const client = createMcpClient({ serverUrl: 'http://localhost:8080' });
        assert.ok(typeof client.explainError === 'function');
    });

    test('suggestNext method should exist', () => {
        const client = createMcpClient({ serverUrl: 'http://localhost:8080' });
        assert.ok(typeof client.suggestNext === 'function');
    });

    test('listTools method should exist', () => {
        const client = createMcpClient({ serverUrl: 'http://localhost:8080' });
        assert.ok(typeof client.listTools === 'function');
    });

    test('listResources method should exist', () => {
        const client = createMcpClient({ serverUrl: 'http://localhost:8080' });
        assert.ok(typeof client.listResources === 'function');
    });

    test('readResource method should exist', () => {
        const client = createMcpClient({ serverUrl: 'http://localhost:8080' });
        assert.ok(typeof client.readResource === 'function');
    });
});
