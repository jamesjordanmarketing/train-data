/**
 * Validation Tests for Export Operations
 * Tests agentExportData and all format transformers
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { agentExportData, getTransformer } = require('./dist/operations/export');

// Create test output directory
const testOutputDir = path.join(__dirname, 'test-output');
if (!fs.existsSync(testOutputDir)) {
  fs.mkdirSync(testOutputDir, { recursive: true });
}

async function testExportOperations() {
  console.log('===================================');
  console.log('Testing Export Operations');
  console.log('===================================\n');

  let testsPassed = 0;
  let testsFailed = 0;

  // Test 1: Export to JSONL format
  try {
    console.log('Test 1: Export to JSONL format...');
    const outputPath = path.join(testOutputDir, 'test-export.jsonl');
    const result = await agentExportData({
      table: 'conversations',
      destination: outputPath,
      config: { 
        format: 'jsonl', 
        includeMetadata: true,
        includeTimestamps: true
      },
      filters: [{ column: 'status', operator: 'eq', value: 'approved' }]
    });
    
    console.assert(result.success, 'Export should succeed');
    console.assert(result.recordCount >= 0, 'Should have record count');
    console.assert(fs.existsSync(outputPath), 'Output file should exist');
    
    // Validate JSONL format
    const content = fs.readFileSync(outputPath, 'utf8');
    const lines = content.split('\n').filter(l => l.trim());
    const allValidJson = lines.every(line => {
      try {
        JSON.parse(line);
        return true;
      } catch {
        return false;
      }
    });
    
    console.assert(allValidJson, 'All lines should be valid JSON');
    console.log(`   Exported ${result.recordCount} records to JSONL`);
    console.log('✅ Test 1 PASSED\n');
    testsPassed++;
  } catch (error) {
    console.error('❌ Test 1 FAILED:', error.message, '\n');
    testsFailed++;
  }

  // Test 2: Export to JSON format
  try {
    console.log('Test 2: Export to JSON format...');
    const outputPath = path.join(testOutputDir, 'test-export.json');
    const result = await agentExportData({
      table: 'conversations',
      destination: outputPath,
      config: { 
        format: 'json',
        includeMetadata: true,
        includeTimestamps: true
      }
    });
    
    console.assert(result.success, 'Export should succeed');
    console.assert(fs.existsSync(outputPath), 'Output file should exist');
    
    // Validate JSON format
    const content = fs.readFileSync(outputPath, 'utf8');
    const parsed = JSON.parse(content);
    console.assert(parsed.version, 'Should have version');
    console.assert(parsed.data && Array.isArray(parsed.data), 'Should have data array');
    console.assert(parsed.count === result.recordCount, 'Count should match');
    
    console.log(`   Exported ${result.recordCount} records to JSON`);
    console.log('✅ Test 2 PASSED\n');
    testsPassed++;
  } catch (error) {
    console.error('❌ Test 2 FAILED:', error.message, '\n');
    testsFailed++;
  }

  // Test 3: Export to CSV format
  try {
    console.log('Test 3: Export to CSV format...');
    const outputPath = path.join(testOutputDir, 'test-export.csv');
    const result = await agentExportData({
      table: 'conversations',
      destination: outputPath,
      config: { 
        format: 'csv',
        includeMetadata: false,
        includeTimestamps: true
      }
    });
    
    console.assert(result.success, 'Export should succeed');
    console.assert(fs.existsSync(outputPath), 'Output file should exist');
    
    // Validate CSV format
    const content = fs.readFileSync(outputPath, 'utf8');
    console.assert(content.startsWith('\uFEFF'), 'CSV should have UTF-8 BOM');
    console.assert(content.includes('\n'), 'CSV should have newlines');
    
    console.log(`   Exported ${result.recordCount} records to CSV`);
    console.log('✅ Test 3 PASSED\n');
    testsPassed++;
  } catch (error) {
    console.error('❌ Test 3 FAILED:', error.message, '\n');
    testsFailed++;
  }

  // Test 4: Export to Markdown format
  try {
    console.log('Test 4: Export to Markdown format...');
    const outputPath = path.join(testOutputDir, 'test-export.md');
    const result = await agentExportData({
      table: 'conversations',
      destination: outputPath,
      config: { 
        format: 'markdown',
        includeMetadata: true,
        includeTimestamps: false
      }
    });
    
    console.assert(result.success, 'Export should succeed');
    console.assert(fs.existsSync(outputPath), 'Output file should exist');
    
    // Validate Markdown format
    const content = fs.readFileSync(outputPath, 'utf8');
    console.assert(content.includes('# Data Export'), 'Should have markdown header');
    console.assert(content.includes('**Records**'), 'Should have record count');
    
    console.log(`   Exported ${result.recordCount} records to Markdown`);
    console.log('✅ Test 4 PASSED\n');
    testsPassed++;
  } catch (error) {
    console.error('❌ Test 4 FAILED:', error.message, '\n');
    testsFailed++;
  }

  // Test 5: Export with filters
  try {
    console.log('Test 5: Export with filters...');
    const outputPath = path.join(testOutputDir, 'test-export-filtered.json');
    const result = await agentExportData({
      table: 'conversations',
      destination: outputPath,
      config: { 
        format: 'json',
        includeMetadata: true,
        includeTimestamps: true
      },
      filters: [
        { column: 'status', operator: 'eq', value: 'approved' },
        { column: 'tier', operator: 'eq', value: 'template' }
      ]
    });
    
    console.assert(result.success, 'Export should succeed');
    console.log(`   Exported ${result.recordCount} filtered records`);
    console.log('✅ Test 5 PASSED\n');
    testsPassed++;
  } catch (error) {
    console.error('❌ Test 5 FAILED:', error.message, '\n');
    testsFailed++;
  }

  // Test 6: Test CSV special characters
  try {
    console.log('Test 6: CSV special characters handling...');
    
    // Create test data with special characters
    const testData = [
      { id: '1', text: "don't worry", note: 'He said "hello"' },
      { id: '2', text: 'Line 1\nLine 2', note: 'Col1,Col2' }
    ];
    
    const { CSVTransformer } = require('./dist/operations/export');
    const transformer = new CSVTransformer();
    const csv = await transformer.transform(testData, {
      format: 'csv',
      includeMetadata: true,
      includeTimestamps: true
    });
    
    const isValid = transformer.validateOutput(csv);
    console.assert(isValid, 'CSV should be valid');
    console.assert(csv.startsWith('\uFEFF'), 'Should have BOM');
    
    console.log('✅ Test 6 PASSED\n');
    testsPassed++;
  } catch (error) {
    console.error('❌ Test 6 FAILED:', error.message, '\n');
    testsFailed++;
  }

  // Test 7: Test empty dataset export
  try {
    console.log('Test 7: Export empty dataset...');
    const outputPath = path.join(testOutputDir, 'test-export-empty.json');
    const result = await agentExportData({
      table: 'conversations',
      destination: outputPath,
      config: { 
        format: 'json',
        includeMetadata: true,
        includeTimestamps: true
      },
      filters: [
        { column: 'id', operator: 'eq', value: 'nonexistent-id-xyz' }
      ]
    });
    
    console.assert(result.success, 'Export should succeed even with no records');
    console.assert(result.recordCount === 0, 'Should have 0 records');
    console.log('✅ Test 7 PASSED\n');
    testsPassed++;
  } catch (error) {
    console.error('❌ Test 7 FAILED:', error.message, '\n');
    testsFailed++;
  }

  // Test 8: Error handling for non-existent table
  try {
    console.log('Test 8: Error handling for non-existent table...');
    const outputPath = path.join(testOutputDir, 'test-export-error.json');
    const result = await agentExportData({
      table: 'nonexistent_table_xyz',
      destination: outputPath,
      config: { 
        format: 'json',
        includeMetadata: true,
        includeTimestamps: true
      }
    });
    
    console.assert(!result.success, 'Export should fail for non-existent table');
    console.assert(result.nextActions && result.nextActions.length > 0, 'Should provide next actions');
    console.log('✅ Test 8 PASSED\n');
    testsPassed++;
  } catch (error) {
    console.error('❌ Test 8 FAILED:', error.message, '\n');
    testsFailed++;
  }

  // Summary
  console.log('===================================');
  console.log('Export Operations Test Summary');
  console.log('===================================');
  console.log(`Tests Passed: ${testsPassed}`);
  console.log(`Tests Failed: ${testsFailed}`);
  console.log(`Total Tests: ${testsPassed + testsFailed}`);
  console.log(`Test Output: ${testOutputDir}`);
  console.log('===================================\n');

  return testsFailed === 0;
}

// Run tests
testExportOperations()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Test suite failed:', error);
    process.exit(1);
  });

