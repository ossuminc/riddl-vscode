/**
 * Test the updated RiddlAPI facade with JavaScript-friendly return types
 */

import { RiddlAPI } from '@ossuminc/riddl-lib';

console.log('\n=== Testing Updated RiddlAPI Facade ===\n');

// Test 1: Version
console.log('RIDDL version:', RiddlAPI.version);

// Test 2: Parse valid RIDDL code
console.log('\n--- Test 1: Parse valid domain ---');
const validCode = 'domain TestDomain is { ??? }';
console.log('Source:', validCode);

const result1 = RiddlAPI.parseString(validCode, 'test.riddl');
console.log('Result type:', typeof result1);
console.log('Result keys:', Object.keys(result1));
console.log('Has succeeded property:', 'succeeded' in result1);
console.log('succeeded value:', (result1 as any).succeeded);

if ((result1 as any).succeeded) {
    console.log('✓ Parse successful');
    console.log('  Value type:', typeof (result1 as any).value);
    console.log('  Value constructor:', (result1 as any).value?.constructor?.name);
} else {
    console.log('✗ Parse failed:');
    console.log('  Errors:', (result1 as any).errors);
}

// Test 3: Parse invalid RIDDL code
console.log('\n--- Test 2: Parse invalid code ---');
const invalidCode = 'domain is { ??? }'; // Missing domain name
console.log('Source:', invalidCode);

const result2 = RiddlAPI.parseString(invalidCode, 'invalid.riddl');
console.log('succeeded:', (result2 as any).succeeded);

if ((result2 as any).succeeded) {
    console.log('⚠️  Unexpectedly succeeded');
} else {
    console.log('✓ Correctly detected error');
    console.log('  Has errors:', 'errors' in result2);
    console.log('  Has messages:', 'messages' in result2);
    console.log('  Error message:', (result2 as any).errors?.split('\n')[0]);
}

// Test 4: Parse to tokens
console.log('\n--- Test 3: Parse to tokens ---');
const tokenResult = RiddlAPI.parseToTokens(validCode, 'test.riddl');
console.log('succeeded:', (tokenResult as any).succeeded);

if ((tokenResult as any).succeeded) {
    console.log('✓ Tokenization successful');
    const tokens = (tokenResult as any).value;
    console.log('  Tokens type:', typeof tokens);
    console.log('  Is array:', Array.isArray(tokens));

    if (Array.isArray(tokens)) {
        console.log('  Number of tokens:', tokens.length);
        tokens.slice(0, 5).forEach((token: any, i: number) => {
            console.log(`  Token ${i}:`, JSON.stringify(token, null, 2));
        });
    } else {
        // Might be a Scala List - try to inspect
        console.log('  Token structure:', Object.keys(tokens).slice(0, 10));
    }
} else {
    console.log('✗ Tokenization failed:', (tokenResult as any).errors);
}

// Test 5: Parse nebula
console.log('\n--- Test 4: Parse nebula ---');
const nebulaResult = RiddlAPI.parseNebula(validCode, 'test.riddl');
console.log('succeeded:', (nebulaResult as any).succeeded);

if ((nebulaResult as any).succeeded) {
    console.log('✓ Nebula parse successful');
    console.log('  Value type:', (nebulaResult as any).value?.constructor?.name);
} else {
    console.log('✗ Nebula parse failed:', (nebulaResult as any).errors);
}

// Test 6: Complex valid code
console.log('\n--- Test 5: Parse complex valid code ---');
const complexCode = `
domain ECommerce is {
  type OrderId is Id(Order)

  context Ordering is {
    entity Order is {
      state OrderState is {
        orderId: OrderId
      }
    }
  }
}
`;

const result3 = RiddlAPI.parseString(complexCode.trim(), 'complex.riddl');
if ((result3 as any).succeeded) {
    console.log('✓ Complex code parsed successfully');
} else {
    console.log('✗ Complex code failed');
    const errors = (result3 as any).errors;
    if (Array.isArray(errors) && errors.length > 0) {
        console.log('  First error:', errors[0]);
    } else if (typeof errors === 'string') {
        console.log('  Errors:', errors.split('\n')[0]);
    }
}

console.log('\n=== All tests complete! ===\n');
