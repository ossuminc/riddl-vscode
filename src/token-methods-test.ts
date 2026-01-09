/**
 * Test to explore token methods and extract text/kind
 */

import { RiddlAPI } from '@ossuminc/riddl-lib';

console.log('\n=== Testing Token Methods ===\n');

const testCode = 'domain TestDomain is { ??? }';
const tokenResult = RiddlAPI.parseToTokens(testCode, 'test.riddl') as any;

if (tokenResult.succeeded) {
    const scalaList = tokenResult.value;

    // Get first few tokens
    let current = scalaList;
    let tokenIndex = 0;
    const maxTokens = 5;

    while (current && tokenIndex < maxTokens) {
        const lengthVal = typeof (current as any).y === 'function' ? (current as any).y() : 0;
        if (lengthVal === 0) break;

        const token = (current as any).W();
        console.log(`\nToken ${tokenIndex}:`);
        console.log(`  Constructor: ${token?.constructor?.name}`);

        // Try all methods
        const methods = ['t', 'n', 'r', 'y', 'x', 'z'];
        methods.forEach(method => {
            if (typeof (token as any)[method] === 'function') {
                try {
                    const result = (token as any)[method]();
                    console.log(`  ${method}():`, result);
                } catch (e: any) {
                    console.log(`  ${method}(): error - ${e.message}`);
                }
            }
        });

        // Get the source text from the input
        // The token has location info (start/end positions)
        const locProp = Object.keys(token)[0]; // Ay, zy, Iy, etc.
        if (locProp && (token as any)[locProp]) {
            const loc = (token as any)[locProp];
            if (loc.Da && loc.Pa !== undefined && loc.xb !== undefined) {
                const input = loc.Da;
                const start = loc.Pa;
                const end = loc.xb;
                if (input.Ro) { // Ro seems to be the source string
                    const text = input.Ro.substring(start, end);
                    console.log(`  Extracted text: "${text}"`);
                }
            }
        }

        // Move to next token
        current = (current as any).aa();
        tokenIndex++;
    }

} else {
    console.error('Tokenization failed:', tokenResult.errors);
}

console.log('\n=== Test complete! ===\n');
