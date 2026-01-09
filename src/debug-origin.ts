/**
 * Debug test to isolate the origin parameter issue
 */

import { RiddlAPI } from '@ossuminc/riddl-lib';

console.log('\n=== Debug Origin Parameter ===\n');

console.log('RIDDL version:', RiddlAPI.version);

// Test 1: Try with no origin (should use default)
console.log('\n--- Test 1: No origin parameter ---');
try {
    const result1 = RiddlAPI.parseString('domain Test is { ??? }') as any;
    console.log('Success! Result:', result1.succeeded);
} catch (error: any) {
    console.error('Error:', error.message);
    console.error('Stack (first 5 lines):', error.stack?.split('\n').slice(0, 5).join('\n'));
}

// Test 2: Try with undefined origin
console.log('\n--- Test 2: Undefined origin ---');
try {
    const result2 = RiddlAPI.parseString('domain Test is { ??? }', undefined) as any;
    console.log('Success! Result:', result2.succeeded);
} catch (error: any) {
    console.error('Error:', error.message);
    console.error('Stack (first 5 lines):', error.stack?.split('\n').slice(0, 5).join('\n'));
}

// Test 3: Try with string origin
console.log('\n--- Test 3: String origin "test.riddl" ---');
try {
    const result3 = RiddlAPI.parseString('domain Test is { ??? }', 'test.riddl') as any;
    console.log('Success! Result:', result3.succeeded);
} catch (error: any) {
    console.error('Error:', error.message);
    console.error('Stack (first 5 lines):', error.stack?.split('\n').slice(0, 5).join('\n'));
}

// Test 4: Try with empty string origin
console.log('\n--- Test 4: Empty string origin ---');
try {
    const result4 = RiddlAPI.parseString('domain Test is { ??? }', '') as any;
    console.log('Success! Result:', result4.succeeded);
} catch (error: any) {
    console.error('Error:', error.message);
    console.error('Stack (first 5 lines):', error.stack?.split('\n').slice(0, 5).join('\n'));
}

// Test 5: Try parseToTokens
console.log('\n--- Test 5: parseToTokens with string origin ---');
try {
    const result5 = RiddlAPI.parseToTokens('domain Test is { ??? }', 'test.riddl') as any;
    console.log('Success! Result:', result5.succeeded);
    if (result5.succeeded) {
        console.log('Tokens type:', typeof result5.value);
        console.log('Is array:', Array.isArray(result5.value));
        if (Array.isArray(result5.value)) {
            console.log('Number of tokens:', result5.value.length);
            if (result5.value.length > 0) {
                console.log('First token:', result5.value[0]);
            }
        }
    }
} catch (error: any) {
    console.error('Error:', error.message);
    console.error('Stack (first 5 lines):', error.stack?.split('\n').slice(0, 5).join('\n'));
}

console.log('\n=== Debug complete! ===\n');
