# Enrichment Pipeline - Quick Start Guide

This guide will help you get started with the complete enrichment pipeline orchestration.

---

## Prerequisites

1. **Environment Variables** configured in `.env.local`:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

2. **Database Migrations** applied:
   - Enrichment tracking columns exist in `conversations` table
   - All scaffolding tables (personas, emotional_arcs, training_topics, templates) populated

3. **Supabase Storage** bucket `conversation-files` exists and is configured

---

## How It Works

### Automatic Enrichment (Default)

When you generate a conversation, the enrichment pipeline **automatically runs in the background**:

```typescript
// Generate a conversation (as usual)
const result = await generationService.generateSingleConversation({
  templateId: 'template-001',
  userId: 'user-123',
  tier: 'template',
  parameters: {
    persona_id: 'persona-001',
    emotional_arc_id: 'arc-001',
    training_topic_id: 'topic-001'
  }
});

// ✅ Generation completes immediately
// 🚀 Enrichment pipeline starts automatically in background
// ⏱️  Pipeline completes in ~3-5 seconds
```

### Pipeline Stages

```
1. Fetch Raw JSON     (from storage)
2. Validate          (check structure)
3. Enrich            (add database metadata)
4. Normalize         (format & encoding)
5. Store             (save enriched.json)
```

### Status Tracking

Check the `enrichment_status` field in the database:

- `not_started` - Raw response stored, enrichment not triggered yet
- `validated` - Validation passed, ready for enrichment
- `enrichment_in_progress` - Currently enriching
- `enriched` - Enrichment complete, normalization pending
- `completed` - ✅ Full pipeline complete, enriched file available
- `validation_failed` - ❌ Validation errors, see `validation_report`
- `normalization_failed` - ❌ Normalization errors, see `enrichment_error`

---

## Usage Examples

### 1. Check Enrichment Status (SQL)

```sql
SELECT 
  conversation_id,
  enrichment_status,
  enriched_file_path,
  enriched_at,
  enrichment_error
FROM conversations
WHERE conversation_id = 'your-conversation-id';
```

### 2. Check Enrichment Status (API)

```bash
curl http://localhost:3000/api/conversations/your-conversation-id/enrich
```

### 3. Download Enriched JSON (API)

```bash
curl http://localhost:3000/api/conversations/your-conversation-id/download/enriched
```

### 4. Manual Enrichment Trigger (API)

```bash
curl -X POST http://localhost:3000/api/conversations/your-conversation-id/enrich
```

### 5. Manual Enrichment Trigger (Code)

```typescript
import { getPipelineOrchestrator } from '@/lib/services/enrichment-pipeline-orchestrator';

const orchestrator = getPipelineOrchestrator();
const result = await orchestrator.runPipeline(
  'conversation-id',
  'user-id'
);

if (result.success) {
  console.log('✅ Enriched:', result.enrichedPath);
} else {
  console.error('❌ Failed:', result.error);
}
```

---

## Testing

### Test Single Conversation

```bash
# Test enrichment for an existing conversation
npx tsx test-pipeline.ts <conversation_id> <user_id>

# Example
npx tsx test-pipeline.ts test-conv-001 00000000-0000-0000-0000-000000000001
```

### Test Complete Integration

```bash
# Generate conversation + wait for enrichment to complete
npx tsx test-pipeline-integration.ts
```

---

## Monitoring

### View Recent Enrichments

```sql
SELECT 
  conversation_id,
  enrichment_status,
  enriched_at,
  EXTRACT(EPOCH FROM (enriched_at - raw_stored_at)) as duration_seconds
FROM conversations
WHERE enriched_at IS NOT NULL
ORDER BY enriched_at DESC
LIMIT 10;
```

### Check Success Rate

```sql
SELECT 
  enrichment_status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM conversations
WHERE raw_stored_at IS NOT NULL
GROUP BY enrichment_status
ORDER BY count DESC;
```

### Find Failed Enrichments

```sql
SELECT 
  conversation_id,
  enrichment_status,
  enrichment_error,
  validation_report
FROM conversations
WHERE enrichment_status IN ('validation_failed', 'normalization_failed')
ORDER BY updated_at DESC;
```

---

## Troubleshooting

### Enrichment Not Starting

**Symptoms:** `enrichment_status` stays at `not_started`

**Causes:**
- Pipeline trigger not configured in generation service
- Raw response not stored (`raw_response_path` is null)
- Service error (check logs)

**Solution:**
```sql
-- Check if raw response exists
SELECT conversation_id, raw_response_path, enrichment_status
FROM conversations
WHERE conversation_id = 'your-id';

-- If raw response exists, manually trigger
curl -X POST http://localhost:3000/api/conversations/your-id/enrich
```

### Validation Failed

**Symptoms:** `enrichment_status` = `validation_failed`

**Causes:**
- Invalid JSON structure from Claude
- Missing required fields
- Malformed turn data

**Solution:**
```sql
-- View validation report
SELECT validation_report
FROM conversations
WHERE conversation_id = 'your-id';
```

Fix the issues in the raw JSON, then retry:
```bash
curl -X POST http://localhost:3000/api/conversations/your-id/enrich
```

### Enrichment Errors

**Symptoms:** `enrichment_status` = `enrichment_in_progress` (stuck) or error message

**Causes:**
- Database metadata missing (persona, arc, topic not found)
- Database connection issues
- Service error

**Solution:**
```sql
-- Check enrichment error
SELECT enrichment_error
FROM conversations
WHERE conversation_id = 'your-id';

-- Verify scaffolding data exists
SELECT 
  c.conversation_id,
  c.persona_id,
  c.emotional_arc_id,
  c.training_topic_id,
  p.name as persona_name,
  ea.name as arc_name,
  tt.name as topic_name
FROM conversations c
LEFT JOIN personas p ON c.persona_id = p.id
LEFT JOIN emotional_arcs ea ON c.emotional_arc_id = ea.id
LEFT JOIN training_topics tt ON c.training_topic_id = tt.id
WHERE c.conversation_id = 'your-id';
```

### Normalization Failed

**Symptoms:** `enrichment_status` = `normalization_failed`

**Causes:**
- Invalid characters in JSON
- File size exceeds limits
- Encoding issues

**Solution:**
```sql
-- Check error details
SELECT enrichment_error
FROM conversations
WHERE conversation_id = 'your-id';
```

Usually auto-fixable by retrying:
```bash
curl -X POST http://localhost:3000/api/conversations/your-id/enrich
```

---

## Common Queries

### List All Completed Enrichments

```sql
SELECT 
  conversation_id,
  enriched_file_path,
  enriched_file_size,
  enriched_at
FROM conversations
WHERE enrichment_status = 'completed'
ORDER BY enriched_at DESC;
```

### Find Conversations Needing Retry

```sql
SELECT 
  conversation_id,
  enrichment_status,
  enrichment_error
FROM conversations
WHERE enrichment_status IN ('validation_failed', 'normalization_failed')
  AND raw_response_path IS NOT NULL
ORDER BY updated_at DESC;
```

### Calculate Average Enrichment Time

```sql
SELECT 
  AVG(EXTRACT(EPOCH FROM (enriched_at - raw_stored_at))) as avg_seconds,
  MIN(EXTRACT(EPOCH FROM (enriched_at - raw_stored_at))) as min_seconds,
  MAX(EXTRACT(EPOCH FROM (enriched_at - raw_stored_at))) as max_seconds
FROM conversations
WHERE enriched_at IS NOT NULL
  AND raw_stored_at IS NOT NULL;
```

---

## API Reference

### GET /api/conversations/[id]/enrich

Check if conversation can be enriched and view current status.

**Response:**
```json
{
  "conversation_id": "abc-123",
  "enrichment_status": "not_started",
  "can_enrich": true,
  "needs_retry": false,
  "has_raw_response": true,
  "has_validation_report": false,
  "enrichment_error": null,
  "message": "Conversation can be enriched"
}
```

### POST /api/conversations/[id]/enrich

Manually trigger enrichment pipeline.

**Response (Success):**
```json
{
  "success": true,
  "conversation_id": "abc-123",
  "final_status": "completed",
  "stages_completed": ["validation", "enrichment", "normalization"],
  "enriched_path": "user-id/abc-123/enriched.json",
  "enriched_size": 14523,
  "message": "Enrichment pipeline completed successfully"
}
```

**Response (Failure):**
```json
{
  "success": false,
  "conversation_id": "abc-123",
  "final_status": "validation_failed",
  "stages_completed": [],
  "error": "Validation failed: Missing required fields",
  "validation_report": { /* detailed report */ },
  "message": "Enrichment pipeline failed"
}
```

### GET /api/conversations/[id]/validation-report

View detailed validation report.

### GET /api/conversations/[id]/download/raw

Download raw minimal JSON.

### GET /api/conversations/[id]/download/enriched

Download enriched JSON (only available if `enrichment_status` = 'completed').

---

## Best Practices

### 1. Monitor Enrichment Status
Always check `enrichment_status` after generating conversations to ensure pipeline completed.

### 2. Handle Failures Gracefully
Validation failures are expected for some generations. Review validation reports and retry if needed.

### 3. Use Raw Response as Source of Truth
Raw response is always stored, even if enrichment fails. You can always retry enrichment later.

### 4. Don't Block on Enrichment
Generation returns immediately. Don't wait for enrichment in user-facing flows.

### 5. Set Up Alerts
Monitor failed enrichments and set up alerts for high failure rates.

---

## Next Steps

1. ✅ Generate a test conversation
2. ✅ Wait for enrichment to complete (~3-5 seconds)
3. ✅ Check enrichment status in database
4. ✅ Download enriched JSON via API
5. ✅ Verify enriched structure matches training format

---

## Support

For issues or questions:

1. Check `enrichment_error` field in database
2. Review `validation_report` if validation failed
3. Run test scripts to isolate the issue
4. Check server logs for detailed error messages

---

**🎉 You're ready to use the enrichment pipeline!**

