/**
 * Test file to verify RIDDL library can be imported and used
 */

import * as riddlLib from '@ossuminc/riddl-lib';

// Test that we can access the exported modules
console.log('RIDDL Library loaded');
console.log('Available exports:', Object.keys(riddlLib));

// Try to access the parser
if (riddlLib.TopLevelParser$) {
    console.log('TopLevelParser$ found');
}

console.log('RiddlParserInput:', typeof riddlLib.RiddlParserInput);

if (riddlLib.Messages) {
    console.log('Messages found');
}

if (riddlLib.AST) {
    console.log('AST found');
}

export { riddlLib };
