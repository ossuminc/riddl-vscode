/**
 * Test to explore Scala.js List structure and conversion to JavaScript arrays
 */

import { RiddlAPI } from '@ossuminc/riddl-lib';

console.log('\n=== Testing Scala List Conversion ===\n');

const testCode = 'domain TestDomain is { ??? }';
const tokenResult = RiddlAPI.parseToTokens(testCode, 'test.riddl') as any;

if (tokenResult.succeeded) {
    const scalaList = tokenResult.value;

    console.log('Scala List type:', typeof scalaList);
    console.log('Scala List constructor:', scalaList?.constructor?.name);
    console.log('Scala List properties:', Object.keys(scalaList));

    // Explore the properties
    console.log('\nExploring properties:');
    console.log('  Cx type:', typeof scalaList.Cx);
    console.log('  Cx value:', scalaList.Cx);
    console.log('  nb type:', typeof scalaList.nb);
    console.log('  nb value:', scalaList.nb);

    // Check if Cx is iterable or array-like
    if (scalaList.Cx) {
        console.log('  Cx constructor:', scalaList.Cx?.constructor?.name);
        console.log('  Cx is array:', Array.isArray(scalaList.Cx));
        console.log('  Cx keys:', Object.keys(scalaList.Cx).slice(0, 10));
        if ('length' in scalaList.Cx) {
            console.log('  Cx length:', scalaList.Cx.length);
        }
    }

    // Check all methods on the object
    console.log('\nAll methods on object:');
    const allProps = Object.getOwnPropertyNames(Object.getPrototypeOf(scalaList));
    const methods: string[] = [];
    allProps.forEach(prop => {
        if (typeof (scalaList as any)[prop] === 'function' && prop !== 'constructor') {
            methods.push(prop);
            console.log(`  ${prop}(): function`);
        }
    });

    // Test each method to see what it returns
    console.log('\nTesting methods:');
    methods.forEach(method => {
        try {
            const result = (scalaList as any)[method]();
            const resultType = typeof result;
            console.log(`  ${method}() returns:`, {
                type: resultType,
                value: resultType === 'boolean' || resultType === 'number' ? result : resultType,
                constructor: result?.constructor?.name
            });
        } catch (e: any) {
            console.log(`  ${method}() error:`, e.message);
        }
    });

    // Try common Scala List methods
    console.log('\nTrying Scala List methods:');
    const expectedMethods = ['head', 'tail', 'isEmpty', 'length', 'size', 'toArray', 'toList'];
    expectedMethods.forEach(method => {
        const fn = (scalaList as any)[method];
        if (fn) {
            console.log(`  ${method}():`, typeof fn === 'function' ? 'function exists' : fn);
            if (typeof fn === 'function' && method !== 'tail') {
                try {
                    const result = fn.call(scalaList);
                    console.log(`    Result:`, result);
                } catch (e: any) {
                    console.log(`    Error: ${e.message}`);
                }
            }
        } else {
            console.log(`  ${method}: not found`);
        }
    });

    // Try to iterate
    console.log('\nTrying to iterate:');

    // Method 1: Check if it has Symbol.iterator
    if (scalaList[Symbol.iterator]) {
        console.log('  Has Symbol.iterator - trying for...of:');
        let count = 0;
        for (const item of scalaList) {
            console.log(`    Item ${count}:`, item);
            count++;
            if (count > 5) break; // Limit output
        }
    } else {
        console.log('  No Symbol.iterator');
    }

    // Method 2: Check if it's array-like
    if ('length' in scalaList) {
        console.log(`  Has length property: ${scalaList.length}`);
        console.log(`  Trying array access:`);
        for (let i = 0; i < Math.min(5, scalaList.length); i++) {
            console.log(`    scalaList[${i}]:`, scalaList[i]);
        }
    }

    // Method 3: Try manual iteration with minified head/tail methods
    console.log('\nTrying manual iteration with minified methods W()/aa():');
    let current = scalaList;
    let count = 0;
    const maxTokens = 15;

    while (current && count < maxTokens) {
        // Check if this is an empty list (try different ways)
        const lengthVal = typeof (current as any).y === 'function' ? (current as any).y() : 0;
        if (lengthVal === 0) {
            console.log('  Reached empty list');
            break;
        }

        // Get head using W()
        if (typeof (current as any).W === 'function') {
            const token = (current as any).W();
            console.log(`\n  Token ${count}:`, {
                constructor: token?.constructor?.name,
                keys: Object.keys(token || {})
            });

            // Try to extract token properties
            if (token) {
                // Check for common token properties
                const commonProps = ['text', 'kind', 'value', 'type', 'Ay', 'zy', 'Iy'];
                commonProps.forEach(prop => {
                    if (prop in token) {
                        const val = (token as any)[prop];
                        console.log(`    ${prop}:`, val);
                    }
                });

                // Try calling toString if available
                if (typeof token.toString === 'function') {
                    try {
                        console.log(`    toString():`, token.toString());
                    } catch (e) {
                        // ignore
                    }
                }

                // Try all methods on the token
                const tokenMethods = Object.getOwnPropertyNames(Object.getPrototypeOf(token))
                    .filter(m => typeof (token as any)[m] === 'function' && m !== 'constructor');
                console.log(`    Token methods:`, tokenMethods.slice(0, 10));
            }
        }

        // Get tail using aa()
        if (typeof (current as any).aa === 'function') {
            current = (current as any).aa();
        } else {
            console.log('  No more elements (no aa() method)');
            break;
        }
        count++;
    }

    if (count >= maxTokens) {
        console.log(`  ... (limited to ${maxTokens} tokens)`);
    }

} else {
    console.error('Tokenization failed:', tokenResult.errors);
}

console.log('\n=== Test complete! ===\n');
