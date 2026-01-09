/**
 * Test file to verify RIDDL parsing functionality
 */

import * as riddlLib from '@ossuminc/riddl-lib';

console.log('\n=== Testing RIDDL Parser ===\n');

// Test code
const testCode = 'domain TestDomain is { ??? }';
console.log('Test RIDDL code:', testCode);

try {
    // Create parser input
    const parserInputObj = riddlLib.RiddlParserInput as any;
    const parserInput = parserInputObj.createTestInput(testCode, 'test.riddl');
    console.log('✓ Created parser input');

    // Try using TopLevelParser constructor
    const TopLevelParser = (riddlLib as any).TopLevelParser;
    console.log('\nTopLevelParser type:', typeof TopLevelParser);

    if (typeof TopLevelParser === 'function') {
        // It's a constructor - create an instance
        // Based on Scala source: TopLevelParser(input, withVerboseFailures, maxParallelism)
        const parser = new TopLevelParser(parserInput, false, 1);
        console.log('✓ Created parser instance');

        // Check what methods are available
        const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(parser))
            .filter(k => typeof (parser as any)[k] === 'function' && !k.startsWith('_') && k !== 'constructor');
        console.log('Parser instance methods:', methods);

        // Try calling methods
        if (methods.length > 0) {
            console.log('\nTrying first method:', methods[0]);
            const result = (parser as any)[methods[0]]();
            console.log('Result:', result);
        }
    }

    console.log('\n✓ RIDDL library testing complete!');

} catch (error) {
    console.error('\n✗ Error:', error);
    if (error instanceof Error) {
        console.error('  Message:', error.message);
        console.error('  Stack:', error.stack?.split('\n').slice(0, 8).join('\n'));
    }
}
