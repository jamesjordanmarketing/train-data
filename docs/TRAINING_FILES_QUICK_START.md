# Training Files System - Quick Start Guide

**Last Updated**: December 1, 2025

This guide helps you get started with the LoRA Training Files system for aggregating enriched conversations into production training files.

---

## 📋 Prerequisites

- ✅ Supabase project configured
- ✅ Environment variables set:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
- ✅ At least one enriched conversation with:
  - `enrichment_status = 'completed'`
  - Non-null `enriched_file_path`

---

## 🚀 Setup (One-Time)

### Step 1: Run Database Migration

**Method 1: SQL Paste (Recommended)**
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `supa-agent-ops/migrations/01-create-training-files-tables.sql`
3. Paste and click "Run"

**Method 2: TypeScript Script**
```bash
npx tsx src/scripts/migrations/create-training-files-table.ts
```

**Creates**:
- `training_files` table
- `training_file_conversations` table
- Indexes and RLS policies

### Step 2: Create Storage Bucket

**Method 1: SQL Paste (Recommended)**
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `supa-agent-ops/migrations/02-create-training-files-bucket.sql`
3. Paste and click "Run"

**Method 2: TypeScript Script**
```bash
npx tsx src/scripts/setup-training-files-bucket.ts
```

**Creates**:
- `training-files` bucket (private)
- Storage policies for authenticated users

### Step 3: Verify Setup

```bash
node supa-agent-ops/migrations/test-training-files.js
```

**Tests**:
- Database schema
- Storage bucket
- Service layer
- Table structure

---

## 📝 Usage Examples

### Example 1: Create Training File (API)

```bash
curl -X POST http://localhost:3000/api/training-files \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "production_training_batch_001",
    "description": "First production training batch",
    "conversation_ids": [
      "uuid-1",
      "uuid-2",
      "uuid-3"
    ]
  }'
```

**Response**:
```json
{
  "trainingFile": {
    "id": "uuid",
    "name": "production_training_batch_001",
    "conversation_count": 3,
    "total_training_pairs": 18,
    "json_file_path": "uuid/training.json",
    "jsonl_file_path": "uuid/training.jsonl",
    "scaffolding_distribution": {
      "personas": { "pragmatic_optimist": 2, "anxious_planner": 1 },
      "emotional_arcs": { "confusion_to_clarity": 3 },
      "training_topics": { "mortgage_payoff_strategy": 2, "estate_planning_basics": 1 }
    },
    "status": "active",
    "created_at": "2025-12-01T12:00:00Z"
  }
}
```

### Example 2: Add Conversations to Existing File

```bash
curl -X POST http://localhost:3000/api/training-files/YOUR_FILE_ID/add-conversations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "conversation_ids": ["uuid-4", "uuid-5"]
  }'
```

### Example 3: Download Training File

```bash
# Get JSON download URL
curl http://localhost:3000/api/training-files/YOUR_FILE_ID/download?format=json \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Get JSONL download URL
curl http://localhost:3000/api/training-files/YOUR_FILE_ID/download?format=jsonl \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response**:
```json
{
  "download_url": "https://your-project.supabase.co/storage/v1/object/sign/...",
  "filename": "production_training_batch_001.json",
  "expires_in_seconds": 3600
}
```

### Example 4: Using TrainingFileService Directly

```typescript
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { createTrainingFileService } from '@/lib/services/training-file-service';

// In your API route or server action
export async function createTrainingFileAction(
  name: string,
  conversationIds: string[]
) {
  const supabase = await createServerSupabaseClient();
  const service = createTrainingFileService(supabase);
  
  const trainingFile = await service.createTrainingFile({
    name,
    conversation_ids: conversationIds,
    created_by: userId, // from auth
  });
  
  return trainingFile;
}
```

---

## 🔍 Validation & Testing

### Check Training File Quality

```typescript
import { createTrainingFileService } from '@/lib/services/training-file-service';

const service = createTrainingFileService(supabase);

// Get training file details
const file = await service.getTrainingFile(fileId);

console.log('Quality Summary:', file.quality_summary);
console.log('Scaffolding Distribution:', file.scaffolding_distribution);

// Get conversations in file
const conversationIds = await service.getTrainingFileConversations(fileId);
```

### Download and Inspect Files

```typescript
// Get download URL
const downloadUrl = await service.getDownloadUrl(file.json_file_path);

// Download file
const response = await fetch(downloadUrl);
const json = await response.json();

// Validate structure
console.log('Total conversations:', json.training_file_metadata.total_conversations);
console.log('Total training pairs:', json.training_file_metadata.total_training_pairs);
console.log('First conversation:', json.conversations[0].conversation_metadata);
```

---

## ⚠️ Common Issues & Solutions

### Issue 1: "training_files table does not exist"

**Solution**: Run migration script
```bash
npx tsx src/scripts/migrations/create-training-files-table.ts
```

### Issue 2: "Bucket training-files does not exist"

**Solution**: Create storage bucket
```bash
npx tsx src/scripts/setup-training-files-bucket.ts
```

### Issue 3: "Conversation validation failed: enrichment_status must be 'completed'"

**Solution**: Ensure conversations are enriched before adding to training file
```sql
-- Check conversation status
SELECT conversation_id, enrichment_status, enriched_file_path
FROM conversations
WHERE conversation_id IN ('uuid-1', 'uuid-2');

-- Fix if needed
UPDATE conversations
SET enrichment_status = 'completed'
WHERE conversation_id = 'uuid-1';
```

### Issue 4: "Conversations already in training file"

**Solution**: This is expected behavior (duplicate prevention). Remove duplicates from request:
```typescript
// Get existing conversations
const existing = await service.getTrainingFileConversations(fileId);

// Filter out duplicates
const newIds = conversationIds.filter(id => !existing.includes(id));

// Add only new conversations
await service.addConversationsToTrainingFile({
  training_file_id: fileId,
  conversation_ids: newIds,
  added_by: userId,
});
```

### Issue 5: "Failed to download enriched JSON"

**Solution**: Verify enriched file exists in storage
```typescript
// Check if file exists
const { data, error } = await supabase.storage
  .from('conversation-files')
  .download(enrichedFilePath);

if (error) {
  console.error('File does not exist:', error);
  // Re-run enrichment for this conversation
}
```

---

## 📊 Quality Control Checklist

Before using a training file for LoRA fine-tuning:

- [ ] **Conversation Count**: At least 10 conversations (recommended: 20-80)
- [ ] **Quality Scores**: Average quality score ≥ 3.5 for production use
- [ ] **Scaffolding Balance**: Reasonable distribution across personas/arcs/topics
- [ ] **Training Pairs**: At least 100 training pairs (recommended: 500+)
- [ ] **JSON Validation**: Valid JSON structure (no parse errors)
- [ ] **JSONL Format**: One pair per line, no null target_response entries
- [ ] **Manual Review**: Spot-check 5-10 training pairs for quality

---

## 🔗 API Reference

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/training-files` | List all training files |
| `POST` | `/api/training-files` | Create new training file |
| `POST` | `/api/training-files/:id/add-conversations` | Add conversations to file |
| `GET` | `/api/training-files/:id/download?format=json\|jsonl` | Get download URL |

### Service Methods

| Method | Description |
|--------|-------------|
| `createTrainingFile(input)` | Create new training file |
| `addConversationsToTrainingFile(input)` | Add conversations to existing file |
| `listTrainingFiles(filters?)` | List training files |
| `getTrainingFile(id)` | Get single training file |
| `getTrainingFileConversations(id)` | Get conversation IDs in file |
| `getDownloadUrl(path, expiresIn?)` | Generate signed download URL |

---

## 📚 Additional Resources

- **Full Documentation**: `TRAINING_FILES_IMPLEMENTATION_SUMMARY.md`
- **Schema Specification**: `pmc/context-ai/pmct/iteration-2-full-production-json-file-schema-spec_v1.md`
- **Test Script**: `src/scripts/test-training-files.ts`
- **Service Code**: `src/lib/services/training-file-service.ts`

---

## 🎯 Next Steps

1. **Create your first training file** with 3-5 test conversations
2. **Download and inspect** the generated JSON and JSONL files
3. **Validate quality scores** and scaffolding distribution
4. **Scale up** to production batches (20-80 conversations)
5. **Use JSONL file** for LoRA fine-tuning with your framework of choice

---

**Need Help?**
- Review error messages in Supabase logs
- Check environment variables
- Run test script for diagnostics
- Verify conversation enrichment status

