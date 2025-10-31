# Export Transformers - Quick Start Guide

## 5-Minute Setup

### 1. Basic Import

```typescript
import { getTransformer } from '@/lib/export-transformers';
import type { Conversation, ConversationTurn, ExportConfig } from '@/lib/types';
```

### 2. Prepare Your Data

```typescript
// Sample conversation
const conversations: Conversation[] = [
  {
    id: '1',
    conversation_id: 'conv-001',
    title: 'Investment Advice',
    status: 'approved',
    tier: 'template',
    qualityScore: 8.5,
    totalTurns: 4,
    tokenCount: 500,
    // ... other required fields
  }
];

// Sample turns - map conversation_id to turns array
const turns = new Map<string, ConversationTurn[]>();
turns.set('conv-001', [
  { role: 'user', content: 'How should I invest?' },
  { role: 'assistant', content: 'Here are some strategies...' }
]);
```

### 3. Configure Export

```typescript
const config: ExportConfig = {
  scope: 'all',
  format: 'jsonl',  // or 'json'
  includeMetadata: true,
  includeQualityScores: true,
  includeTimestamps: true,
  includeApprovalHistory: false,
  includeParentReferences: true,
  includeFullContent: true,
};
```

### 4. Transform and Export

```typescript
// Get transformer
const transformer = getTransformer('jsonl');

// Transform data
const output = await transformer.transform(conversations, turns, config);

// Validate (optional but recommended)
try {
  transformer.validateOutput(output);
  console.log('✅ Export valid');
} catch (error) {
  console.error('❌ Export invalid:', error.message);
}

// Save to file or return in API
console.log(output);
```

## Common Use Cases

### Use Case 1: Export for OpenAI Fine-tuning

```typescript
const openaiConfig: ExportConfig = {
  scope: 'all',
  format: 'jsonl',
  includeMetadata: false,  // OpenAI only needs messages
  includeQualityScores: false,
  includeTimestamps: false,
  includeApprovalHistory: false,
  includeParentReferences: false,
  includeFullContent: true,
};

const transformer = getTransformer('jsonl');
const output = await transformer.transform(conversations, turns, openaiConfig);

// Save to file
const fs = require('fs');
fs.writeFileSync('training-data.jsonl', output);
```

### Use Case 2: Export for Data Analysis

```typescript
const analysisConfig: ExportConfig = {
  scope: 'all',
  format: 'json',
  includeMetadata: true,
  includeQualityScores: true,
  includeTimestamps: true,
  includeApprovalHistory: true,
  includeParentReferences: true,
  includeFullContent: true,
};

const transformer = getTransformer('json');
const output = await transformer.transform(conversations, turns, analysisConfig);

// Parse and analyze
const data = JSON.parse(output);
console.log(`Total conversations: ${data.conversation_count}`);
console.log(`Average quality: ${data.summary.average_quality_score}`);
```

### Use Case 3: API Endpoint

```typescript
// pages/api/export.ts
export default async function handler(req, res) {
  const { format, config } = req.body;
  
  // Fetch data
  const conversations = await fetchConversations();
  const turns = await fetchTurns(conversations);
  
  // Transform
  const transformer = getTransformer(format);
  const output = await transformer.transform(conversations, turns, config);
  
  // Return file
  res.setHeader('Content-Type', transformer.getMimeType());
  res.setHeader('Content-Disposition', `attachment; filename="export.${transformer.getFileExtension()}"`);
  res.send(output);
}
```

## Configuration Presets

### Minimal (Training Only)

```typescript
const minimal: ExportConfig = {
  scope: 'all',
  format: 'jsonl',
  includeMetadata: false,
  includeQualityScores: false,
  includeTimestamps: false,
  includeApprovalHistory: false,
  includeParentReferences: false,
  includeFullContent: true,
};
```

### Standard (With Metadata)

```typescript
const standard: ExportConfig = {
  scope: 'all',
  format: 'json',
  includeMetadata: true,
  includeQualityScores: true,
  includeTimestamps: false,
  includeApprovalHistory: false,
  includeParentReferences: false,
  includeFullContent: true,
};
```

### Complete (All Data)

```typescript
const complete: ExportConfig = {
  scope: 'all',
  format: 'json',
  includeMetadata: true,
  includeQualityScores: true,
  includeTimestamps: true,
  includeApprovalHistory: true,
  includeParentReferences: true,
  includeFullContent: true,
};
```

## Quick Validation

### Validate JSONL

```typescript
const transformer = getTransformer('jsonl');
try {
  transformer.validateOutput(jsonlString);
  console.log('✅ Valid JSONL');
} catch (error) {
  console.error('❌ Invalid:', error.message);
}
```

### Validate JSON

```typescript
const transformer = getTransformer('json');
try {
  transformer.validateOutput(jsonString);
  console.log('✅ Valid JSON export');
} catch (error) {
  console.error('❌ Invalid:', error.message);
}
```

## Error Handling

### Handle Individual Errors

```typescript
// Transformers automatically continue on individual errors
const output = await transformer.transform(conversations, turns, config);

// Check console for warnings:
// "Error transforming conversation conv-123: Missing turns"
```

### Handle Validation Errors

```typescript
try {
  transformer.validateOutput(output);
} catch (error) {
  // Error includes specific details:
  // "Line 5: Invalid role: moderator"
  // "Conversation 3, Turn 2: Missing content"
  console.error('Validation failed:', error.message);
}
```

## Testing

### Run Tests

```bash
npx tsx src/lib/export-transformers/test-transformers.ts
```

### View Sample Output

```bash
# JSONL format (one line per conversation)
cat src/lib/export-transformers/test-output.jsonl

# JSON format (pretty-printed)
cat src/lib/export-transformers/test-output.json
```

## Next Steps

1. ✅ Read the [README](./README.md) for complete documentation
2. ✅ Review [test-transformers.ts](./test-transformers.ts) for examples
3. ✅ Check [IMPLEMENTATION-SUMMARY.md](./IMPLEMENTATION-SUMMARY.md) for technical details
4. ✅ Integrate with your API or service layer

## Need Help?

- **Format Questions**: See README.md → Format Specifications
- **Configuration**: See README.md → Configuration Options
- **Integration**: See IMPLEMENTATION-SUMMARY.md → Integration Guide
- **Errors**: See README.md → Troubleshooting

