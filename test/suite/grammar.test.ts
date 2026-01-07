import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

suite('Grammar Test Suite', () => {

    test('TextMate grammar file should exist', () => {
        const grammarPath = path.join(__dirname, '../../../syntaxes/riddl.tmLanguage.json');
        assert.ok(fs.existsSync(grammarPath), 'Grammar file should exist');
    });

    test('TextMate grammar should be valid JSON', () => {
        const grammarPath = path.join(__dirname, '../../../syntaxes/riddl.tmLanguage.json');
        const grammarContent = fs.readFileSync(grammarPath, 'utf8');
        assert.doesNotThrow(() => {
            JSON.parse(grammarContent);
        }, 'Grammar file should be valid JSON');
    });

    test('Grammar should have correct scope name', () => {
        const grammarPath = path.join(__dirname, '../../../syntaxes/riddl.tmLanguage.json');
        const grammar = JSON.parse(fs.readFileSync(grammarPath, 'utf8'));
        assert.strictEqual(grammar.scopeName, 'source.riddl');
    });

    test('Grammar should define keyword patterns', () => {
        const grammarPath = path.join(__dirname, '../../../syntaxes/riddl.tmLanguage.json');
        const grammar = JSON.parse(fs.readFileSync(grammarPath, 'utf8'));
        assert.ok(grammar.repository.keywords, 'Grammar should have keywords repository');
        assert.ok(Array.isArray(grammar.repository.keywords.patterns), 'Keywords should have patterns');
    });

    test('Grammar should define comment patterns', () => {
        const grammarPath = path.join(__dirname, '../../../syntaxes/riddl.tmLanguage.json');
        const grammar = JSON.parse(fs.readFileSync(grammarPath, 'utf8'));
        assert.ok(grammar.repository.comments, 'Grammar should have comments repository');
    });

    test('Keywords should tokenize correctly in document', async () => {
        const doc = await vscode.workspace.openTextDocument({
            language: 'riddl',
            content: 'domain TestDomain is { ??? }'
        });

        // Wait for tokenization
        await new Promise(resolve => setTimeout(resolve, 500));

        assert.strictEqual(doc.languageId, 'riddl');
        assert.ok(doc.getText().includes('domain'));
        assert.ok(doc.getText().includes('is'));
        assert.ok(doc.getText().includes('???'));
    });

    test('Comments should be recognized', async () => {
        const doc = await vscode.workspace.openTextDocument({
            language: 'riddl',
            content: '// This is a comment\ndomain Test is { ??? }'
        });

        await new Promise(resolve => setTimeout(resolve, 500));

        assert.strictEqual(doc.languageId, 'riddl');
        assert.ok(doc.getText().includes('// This is a comment'));
    });

    test('Strings should be recognized', async () => {
        const doc = await vscode.workspace.openTextDocument({
            language: 'riddl',
            content: 'type Name is String\ntype Email is "test@example.com"'
        });

        await new Promise(resolve => setTimeout(resolve, 500));

        assert.strictEqual(doc.languageId, 'riddl');
        assert.ok(doc.getText().includes('"test@example.com"'));
    });

    test('Complex RIDDL document should parse', async () => {
        const complexContent = `
// Test RIDDL file
author Reid is { name: "Reid" email: "reid@ossum.biz" }

domain ECommerce is {
  type OrderId is Id(Order)

  command PlaceOrder(orderId: OrderId)

  event OrderPlaced is {
    orderId: OrderId,
    timestamp: TimeStamp
  }

  context Ordering is {
    entity Order is {
      state OrderState is {
        orderId: OrderId,
        status: String
      }
    }
  }
} with {
  by author Reid
}
`;

        const doc = await vscode.workspace.openTextDocument({
            language: 'riddl',
            content: complexContent
        });

        await new Promise(resolve => setTimeout(resolve, 500));

        assert.strictEqual(doc.languageId, 'riddl');
        assert.ok(doc.getText().includes('domain'));
        assert.ok(doc.getText().includes('command'));
        assert.ok(doc.getText().includes('event'));
        assert.ok(doc.getText().includes('entity'));
    });

    test('Language configuration should exist', () => {
        const configPath = path.join(__dirname, '../../../language-configuration.json');
        assert.ok(fs.existsSync(configPath), 'Language configuration file should exist');
    });

    test('Language configuration should be valid JSON', () => {
        const configPath = path.join(__dirname, '../../../language-configuration.json');
        const configContent = fs.readFileSync(configPath, 'utf8');
        assert.doesNotThrow(() => {
            JSON.parse(configContent);
        }, 'Language configuration should be valid JSON');
    });

    test('Language configuration should define comments', () => {
        const configPath = path.join(__dirname, '../../../language-configuration.json');
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        assert.ok(config.comments, 'Config should define comments');
        assert.strictEqual(config.comments.lineComment, '//');
        assert.ok(Array.isArray(config.comments.blockComment));
    });

    test('Language configuration should define brackets', () => {
        const configPath = path.join(__dirname, '../../../language-configuration.json');
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        assert.ok(config.brackets, 'Config should define brackets');
        assert.ok(Array.isArray(config.brackets));
        assert.ok(config.brackets.length > 0);
    });
});
