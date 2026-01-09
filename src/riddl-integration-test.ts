/**
 * Final integration test for RiddlAPI with TypeScript types
 */

import { RiddlAPI, Token, TokenResult, ParseResult, RiddlError } from '@ossuminc/riddl-lib';

console.log('\n=== RIDDL API Integration Test ===\n');
console.log('Version:', RiddlAPI.version);

// Test 1: Parse valid RIDDL code
console.log('\n--- Test 1: Parse valid domain ---');
const validCode = 'domain TestDomain is { ??? }';
const parseResult: ParseResult = RiddlAPI.parseString(validCode, 'test.riddl');

if (parseResult.succeeded) {
    console.log('✓ Parse successful');
    console.log('  Root AST node:', parseResult.value);
} else {
    console.log('✗ Parse failed');
    if (parseResult.errors) {
        parseResult.errors.forEach((err: RiddlError) => {
            console.log(`  [${err.kind}] ${err.message}`);
        });
    }
}

// Test 2: Tokenize for syntax highlighting
console.log('\n--- Test 2: Tokenize for syntax highlighting ---');
const tokenResult: TokenResult = RiddlAPI.parseToTokens(validCode, 'test.riddl');

if (tokenResult.succeeded && tokenResult.value) {
    console.log('✓ Tokenization successful');
    console.log(`  Found ${tokenResult.value.length} tokens:`);

    tokenResult.value.forEach((token: Token, index: number) => {
        console.log(`    ${index}. "${token.text}" [${token.kind}] at line ${token.location.line}, col ${token.location.col}`);
    });
} else {
    console.log('✗ Tokenization failed');
    if (tokenResult.errors) {
        tokenResult.errors.forEach((err: RiddlError) => {
            console.log(`  [${err.kind}] ${err.message}`);
        });
    }
}

// Test 3: Parse complex code
console.log('\n--- Test 3: Parse complex RIDDL ---');
const complexCode = `
domain ECommerce is {
  type OrderId is Id(Order)

  context Ordering is {
    entity Order is {
      option aggregate
    }
  }
}
`;

const complexResult: ParseResult = RiddlAPI.parseString(complexCode.trim(), 'complex.riddl');

if (complexResult.succeeded) {
    console.log('✓ Complex code parsed successfully');
    console.log('  AST:', complexResult.value);
} else {
    console.log('✗ Complex code parsing failed');
    if (complexResult.errors) {
        console.log(`  ${complexResult.errors.length} error(s):`);
        complexResult.errors.forEach((err: RiddlError, index: number) => {
            console.log(`    ${index + 1}. [${err.kind}] at ${err.location.line}:${err.location.col}`);
            console.log(`       ${err.message.split('\n')[0]}`);
        });
    }
}

// Test 4: Tokenize complex code
console.log('\n--- Test 4: Tokenize complex code ---');
const complexTokens: TokenResult = RiddlAPI.parseToTokens(complexCode.trim(), 'complex.riddl');

if (complexTokens.succeeded && complexTokens.value) {
    console.log(`✓ Found ${complexTokens.value.length} tokens`);

    // Show first 10 tokens
    console.log('  First 10 tokens:');
    complexTokens.value.slice(0, 10).forEach((token: Token, index: number) => {
        console.log(`    ${index}. "${token.text}" [${token.kind}]`);
    });

    // Count token types
    const tokenCounts: Record<string, number> = {};
    complexTokens.value.forEach((token: Token) => {
        tokenCounts[token.kind] = (tokenCounts[token.kind] || 0) + 1;
    });

    console.log('\n  Token type summary:');
    Object.entries(tokenCounts).forEach(([kind, count]) => {
        console.log(`    ${kind}: ${count}`);
    });
} else {
    console.log('✗ Complex tokenization failed');
}

console.log('\n=== All integration tests complete! ===\n');
