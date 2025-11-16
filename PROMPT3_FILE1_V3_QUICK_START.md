# Prompt 3 File 1 v3 Quick Start Guide
## Conversation Storage Service Enhancements

**Status**: ✅ Ready to Use  
**Last Updated**: November 16, 2025

---

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
npm install
```

The `ajv` package has already been installed for JSON schema validation.

### 2. Compile TypeScript (if needed)

```bash
npx tsc
# or
npm run build
```

---

## 📖 Usage Examples

### Example 1: Single Upload with Validation

```typescript
import { conversationStorageService } from '@/lib/services/conversation-storage-service';

try {
  const conversation = await conversationStorageService.createConversation({
    conversation_id: 'my-conversation-001',
    file_content: conversationJSON, // Your conversation JSON object or string
    created_by: userId,
    persona_id: personaId,        // Optional
    emotional_arc_id: arcId,      // Optional
    training_topic_id: topicId    // Optional
  });

  console.log('✓ Uploaded:', conversation.conversation_id);
  console.log('Quality Score:', conversation.quality_score);
  console.log('Emotional Arc:', 
    `${conversation.starting_emotion} → ${conversation.ending_emotion}`
  );
} catch (error) {
  console.error('Upload failed:', error.message);
  // Error message will include validation errors if JSON is invalid
}
```

---

### Example 2: Batch Upload

```typescript
import { conversationStorageService } from '@/lib/services/conversation-storage-service';

const conversationsToUpload = [
  { conversation_id: 'conv-001', file_content: json1, created_by: userId },
  { conversation_id: 'conv-002', file_content: json2, created_by: userId },
  { conversation_id: 'conv-003', file_content: json3, created_by: userId },
];

const { successful, failed } = await conversationStorageService.batchCreateConversations(
  conversationsToUpload
);

console.log(`✓ Successful: ${successful.length}`);
console.log(`✗ Failed: ${failed.length}`);

// Handle failures
if (failed.length > 0) {
  failed.forEach(({ input, error }) => {
    console.error(`Failed ${input.conversation_id}: ${error}`);
  });
}

// Process successful uploads
successful.forEach(conv => {
  console.log(`Uploaded: ${conv.conversation_id} (${conv.turn_count} turns)`);
});
```

---

### Example 3: Generate Presigned Download URL

```typescript
import { conversationStorageService } from '@/lib/services/conversation-storage-service';

// Method 1: By conversation ID (recommended)
const url = await conversationStorageService.getPresignedDownloadUrlByConversationId(
  'my-conversation-001'
);

// Method 2: By file path (if you have it)
const url2 = await conversationStorageService.getPresignedDownloadUrl(
  'user-id/conversation-id/conversation.json'
);

console.log('Download URL (valid for 1 hour):', url);

// Use the URL to download
const response = await fetch(url);
const conversationData = await response.json();
```

---

### Example 4: Validate JSON Before Upload

```typescript
import { validateConversationJSON } from '@/lib/validators/conversation-schema';

// Validate without throwing
const result = validateConversationJSON(myConversationJSON);

if (!result.valid) {
  console.error('Validation errors:');
  result.errors.forEach(error => console.error('  -', error));
  // Example errors:
  //   - /dataset_metadata: must have required property 'version'
  //   - /training_pairs: must NOT have fewer than 1 items
} else {
  console.log('✓ JSON is valid');
  // Proceed with upload
}
```

---

## 🧪 Testing

### Run Test Suite

```bash
# Compile TypeScript first
npx tsc

# Run tests
node scripts/test-conversation-storage-enhancements.js
```

### Expected Test Output

```
========================================
CONVERSATION STORAGE ENHANCEMENTS TEST
========================================

TEST 1: JSON Schema Validation
✓ Valid JSON structure created
✓ Invalid JSON structure created

TEST 2: Batch Upload
✓ Batch upload completed
  - Successful: 2
  - Failed: 1
✓ Expected 2 successes - PASS
✓ Expected 1 failure - PASS

TEST 3: Presigned URL Generation
✓ Generated URL: https://...
✓ URL structure valid - PASS
✓ URL is accessible (Status: 200) - PASS

TEST 4: Enhanced Metadata Extraction
✓ Conversation created successfully
✓ quality_score: 8.5
✓ empathy_score: 9.0
✓ starting_emotion: confusion
✓ ending_emotion: clarity
...
✓ All metadata extraction checks passed

========================================
TEST SUMMARY
========================================
Test 1 (JSON Validation): PASS
Test 2 (Batch Upload): PASS
Test 3 (Presigned URLs): PASS
Test 4 (Enhanced Metadata): PASS

Overall: ✓ ALL TESTS PASSED
```

---

## 📊 Extracted Metadata

The service now extracts these fields automatically:

### Basic Metadata
- `conversation_name` - From dataset_name
- `description` - From notes
- `turn_count` - Number of turns
- `tier` - Mapped from quality_tier
- `category` - From vertical

### Quality Scores
- `quality_score` - Overall quality (0-10)
- `empathy_score` - Empathy rating (0-10)
- `clarity_score` - Clarity rating (0-10)
- `appropriateness_score` - Appropriateness rating (0-10)
- `brand_voice_alignment` - Brand alignment (0-10)

### Emotional Progression
- `starting_emotion` - Initial emotion (e.g., "confusion")
- `ending_emotion` - Final emotion (e.g., "clarity")
- `emotional_intensity_start` - Initial intensity (0-1)
- `emotional_intensity_end` - Final intensity (0-1)

---

## 📋 Conversation JSON Schema

Your conversation JSON must include:

```typescript
{
  dataset_metadata: {
    dataset_name: string,      // Required
    version: string,           // Required
    total_turns: number,       // Required
    created_date: string,
    vertical: string,
    consultant_persona: string,
    target_use: string,
    conversation_source: string,
    quality_tier: string,
    total_conversations: number,
    notes: string
  },
  consultant_profile: {
    name: string,              // Required
    business: string,          // Required
    expertise: string,
    years_experience: number,
    core_philosophy: object,
    communication_style: {
      tone: string,
      techniques: string[],
      avoid: string[]
    }
  },
  training_pairs: [            // Required, min 1 item
    {
      id: string,              // Required
      conversation_id: string, // Required
      turn_number: number,     // Required
      target_response: string, // Required
      emotional_context: {
        detected_emotions: {
          primary: string,
          intensity: number,
          primary_confidence: number
        }
      },
      training_metadata: {
        quality_score: number,
        quality_criteria: {
          empathy_score: number,
          clarity_score: number,
          appropriateness_score: number,
          brand_voice_alignment: number
        }
      },
      // ... other fields
    }
  ]
}
```

---

## 🔧 Common Issues & Solutions

### Issue: "Invalid conversation JSON: missing required fields"

**Cause**: Your JSON is missing required fields.

**Solution**:
```typescript
import { validateConversationJSON } from '@/lib/validators/conversation-schema';

const result = validateConversationJSON(yourJSON);
console.log('Errors:', result.errors);
// Fix the missing fields shown in errors
```

---

### Issue: Presigned URL returns 403 Forbidden

**Cause**: URL has expired (1-hour limit).

**Solution**:
```typescript
// Regenerate the URL
const newUrl = await conversationStorageService.getPresignedDownloadUrlByConversationId(
  conversationId
);
```

---

### Issue: Batch upload is slow

**Cause**: Sequential processing for large batches.

**Solution**:
```typescript
// Break into smaller batches
const batchSize = 10;
for (let i = 0; i < conversations.length; i += batchSize) {
  const batch = conversations.slice(i, i + batchSize);
  const results = await conversationStorageService.batchCreateConversations(batch);
  console.log(`Batch ${i / batchSize + 1}: ${results.successful.length} uploaded`);
}
```

---

### Issue: Metadata fields are null

**Cause**: Your conversation JSON is missing nested metadata fields.

**Solution**:
```typescript
import { validateQualityMetrics } from '@/lib/validators/conversation-schema';

const result = validateQualityMetrics(yourConversationJSON);
if (!result.valid) {
  console.log('Missing metadata fields:', result.missing);
  // Add the missing fields to your JSON
}
```

---

## 🎯 Best Practices

### 1. Always Validate Before Upload
```typescript
const validation = validateConversationJSON(json);
if (!validation.valid) {
  throw new Error(`Invalid JSON: ${validation.errors.join(', ')}`);
}
await conversationStorageService.createConversation({ ... });
```

### 2. Use Batch Upload for Multiple Conversations
```typescript
// ✓ Good - batch upload
const results = await service.batchCreateConversations(inputs);

// ✗ Avoid - multiple single uploads
for (const input of inputs) {
  await service.createConversation(input); // Slower
}
```

### 3. Handle Partial Failures in Batch
```typescript
const { successful, failed } = await service.batchCreateConversations(inputs);

// Log successes
successful.forEach(c => logger.info(`Uploaded: ${c.conversation_id}`));

// Retry or alert on failures
failed.forEach(({ input, error }) => {
  logger.error(`Failed ${input.conversation_id}: ${error}`);
  // Optional: queue for retry
});
```

### 4. Cache Presigned URLs (with expiration check)
```typescript
const cache = new Map();

async function getCachedUrl(conversationId) {
  const cached = cache.get(conversationId);
  
  // Regenerate if not cached or near expiration (55 minutes)
  if (!cached || Date.now() - cached.timestamp > 55 * 60 * 1000) {
    const url = await service.getPresignedDownloadUrlByConversationId(conversationId);
    cache.set(conversationId, { url, timestamp: Date.now() });
    return url;
  }
  
  return cached.url;
}
```

---

## 📚 Additional Resources

- **Full Documentation**: `PROMPT3_FILE1_V3_IMPLEMENTATION_SUMMARY.md`
- **Service Code**: `src/lib/services/conversation-storage-service.ts`
- **Validator Code**: `src/lib/validators/conversation-schema.ts`
- **Test Script**: `scripts/test-conversation-storage-enhancements.js`
- **Type Definitions**: `src/lib/types/conversations.ts`

---

## ⚡ Quick Reference

### Import Paths

```typescript
// Service
import { conversationStorageService } from '@/lib/services/conversation-storage-service';

// Validator
import { validateConversationJSON, validateAndParseConversationJSON } 
  from '@/lib/validators/conversation-schema';

// Types
import type { 
  ConversationJSONFile,
  CreateStorageConversationInput,
  StorageConversation 
} from '@/lib/types/conversations';
```

### Key Methods

| Method | Purpose | Returns |
|--------|---------|---------|
| `createConversation()` | Single upload with validation | `StorageConversation` |
| `batchCreateConversations()` | Multiple uploads | `{ successful, failed }` |
| `getPresignedDownloadUrl()` | Generate URL by path | `string` (URL) |
| `getPresignedDownloadUrlByConversationId()` | Generate URL by ID | `string` (URL) |
| `validateConversationJSON()` | Validate without throwing | `{ valid, errors }` |

---

## ✅ Checklist for Production Use

- [ ] Dependencies installed (`npm install`)
- [ ] TypeScript compiled (if needed)
- [ ] Environment variables set (Supabase credentials)
- [ ] Test script passed (`node scripts/test-conversation-storage-enhancements.js`)
- [ ] Error handling implemented in your application
- [ ] Batch size limits configured (10-20 per batch recommended)
- [ ] URL expiration handled (regenerate after 1 hour)
- [ ] Validation added before uploads

---

**Ready to use!** 🎉

For detailed implementation notes, see `PROMPT3_FILE1_V3_IMPLEMENTATION_SUMMARY.md`.

