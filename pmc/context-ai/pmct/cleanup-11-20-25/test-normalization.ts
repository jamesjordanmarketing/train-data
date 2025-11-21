import { getNormalizationService } from './src/lib/services/conversation-normalization-service';

async function testNormalization() {
  const service = getNormalizationService();
  
  console.log('='.repeat(60));
  console.log('Testing Conversation Normalization Service');
  console.log('='.repeat(60));
  console.log();

  // Test 1: Valid enriched JSON
  console.log('TEST 1: Valid enriched JSON');
  console.log('-'.repeat(60));
  const validJson = JSON.stringify({
    dataset_metadata: {
      dataset_name: "test_dataset",
      version: "1.0.0",
      created_date: "2025-11-19",
      vertical: "financial_planning",
      consultant_persona: "Elena Morales",
      target_use: "LoRA fine-tuning",
      conversation_source: "synthetic",
      quality_tier: "production",
      total_conversations: 1,
      total_turns: 4,
      notes: "Test"
    },
    consultant_profile: {
      name: "Elena Morales",
      business: "Pathways Financial Planning",
      expertise: "financial planning",
      years_experience: 15,
      core_philosophy: {},
      communication_style: { tone: "warm", techniques: [], avoid: [] }
    },
    training_pairs: [
      { id: "test1", conversation_id: "test", turn_number: 1 }
    ]
  });
  
  const result1 = await service.normalizeJson(validJson);
  
  console.log('✓ Success:', result1.success);
  console.log('✓ File size:', result1.fileSize, 'bytes');
  console.log('✓ Issues found:', result1.issues.length);
  result1.issues.forEach(issue => {
    console.log(`  - [${issue.severity.toUpperCase()}] ${issue.message} (fixed: ${issue.fixed})`);
  });
  console.log();

  // Test 2: JSON with control characters
  console.log('TEST 2: JSON with control characters');
  console.log('-'.repeat(60));
  const jsonWithControlChars = JSON.stringify({
    dataset_metadata: {
      dataset_name: "test\x00dataset", // null character
      version: "1.0.0"
    },
    consultant_profile: { name: "Test" },
    training_pairs: []
  });
  
  const result2 = await service.normalizeJson(jsonWithControlChars);
  
  console.log('✓ Success:', result2.success);
  console.log('✓ File size:', result2.fileSize, 'bytes');
  console.log('✓ Issues found:', result2.issues.length);
  result2.issues.forEach(issue => {
    console.log(`  - [${issue.severity.toUpperCase()}] ${issue.message} (fixed: ${issue.fixed})`);
  });
  console.log();

  // Test 3: Invalid JSON (missing required fields)
  console.log('TEST 3: Missing required fields');
  console.log('-'.repeat(60));
  const invalidSchema = JSON.stringify({
    consultant_profile: { name: "Test" }
    // Missing dataset_metadata and training_pairs
  });
  
  const result3 = await service.normalizeJson(invalidSchema);
  
  console.log('✓ Success:', result3.success);
  console.log('✓ File size:', result3.fileSize, 'bytes');
  console.log('✓ Issues found:', result3.issues.length);
  result3.issues.forEach(issue => {
    console.log(`  - [${issue.severity.toUpperCase()}] ${issue.message} (fixed: ${issue.fixed})`);
  });
  if (result3.error) {
    console.log('✗ Error:', result3.error);
  }
  console.log();

  // Test 4: Malformed JSON
  console.log('TEST 4: Malformed JSON syntax');
  console.log('-'.repeat(60));
  const malformedJson = '{ "invalid": json }'; // Invalid syntax
  
  const result4 = await service.normalizeJson(malformedJson);
  
  console.log('✓ Success:', result4.success);
  console.log('✓ File size:', result4.fileSize, 'bytes');
  console.log('✓ Issues found:', result4.issues.length);
  result4.issues.forEach(issue => {
    console.log(`  - [${issue.severity.toUpperCase()}] ${issue.message} (fixed: ${issue.fixed})`);
  });
  if (result4.error) {
    console.log('✗ Error:', result4.error);
  }
  console.log();

  // Test 5: Very small JSON (should warn)
  console.log('TEST 5: Very small JSON file');
  console.log('-'.repeat(60));
  const tinyJson = JSON.stringify({ dataset_metadata: {}, consultant_profile: {}, training_pairs: [] });
  
  const result5 = await service.normalizeJson(tinyJson);
  
  console.log('✓ Success:', result5.success);
  console.log('✓ File size:', result5.fileSize, 'bytes');
  console.log('✓ Issues found:', result5.issues.length);
  result5.issues.forEach(issue => {
    console.log(`  - [${issue.severity.toUpperCase()}] ${issue.message} (fixed: ${issue.fixed})`);
  });
  console.log();

  console.log('='.repeat(60));
  console.log('All tests completed!');
  console.log('='.repeat(60));
}

testNormalization().catch(console.error);

