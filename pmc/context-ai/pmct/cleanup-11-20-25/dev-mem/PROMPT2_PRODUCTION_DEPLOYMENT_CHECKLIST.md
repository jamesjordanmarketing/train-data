# Prompt 2: Production Deployment Checklist

**Feature**: Raw Response Storage (Zero Data Loss)  
**Risk Level**: Low (additive changes only)  
**Rollback Required**: No (backwards compatible)

## Pre-Deployment Checklist

### Development Environment Verification
- [x] All code changes committed
- [x] No linter errors
- [x] Test script passes
- [x] Database migration tested locally
- [x] Storage bucket verified

### Code Review
- [ ] ConversationStorageService changes reviewed
- [ ] ConversationGenerationService changes reviewed
- [ ] Database migration reviewed
- [ ] Test coverage adequate

### Documentation
- [x] Implementation summary created
- [x] Quick start guide created
- [x] Test scripts documented
- [x] Verification queries documented

---

## Deployment Steps

### Step 1: Database Backup (CRITICAL)
**Before making ANY changes, backup the database**

```bash
# Via Supabase CLI
supabase db dump -f backup-before-prompt2-$(date +%Y%m%d).sql

# Or via Supabase Dashboard
# Settings → Database → Create backup
```

- [ ] Database backup completed
- [ ] Backup file downloaded and saved
- [ ] Backup verified (can be restored if needed)

---

### Step 2: Apply Database Migration

**Staging Environment First** (if available)

1. Open Supabase Dashboard (Staging) → SQL Editor
2. Copy migration: `supabase/migrations/20251117_add_raw_response_storage_columns.sql`
3. Paste and execute
4. Verify success: Run Part 1 verification query

**Production Environment**

1. Open Supabase Dashboard (Production) → SQL Editor
2. Copy migration: `supabase/migrations/20251117_add_raw_response_storage_columns.sql`
3. Paste and execute
4. Verify success

**Verification Query**:
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'conversations'
  AND column_name IN (
    'raw_response_url', 'raw_response_path', 'raw_response_size',
    'raw_stored_at', 'parse_attempts', 'last_parse_attempt_at',
    'parse_error_message', 'parse_method_used', 'requires_manual_review'
  )
ORDER BY column_name;
```

**Expected**: 9 rows

- [ ] Staging migration applied successfully
- [ ] Production migration applied successfully
- [ ] Verification query returns 9 rows

---

### Step 3: Verify Storage Bucket

**Check Existing Bucket**:
```sql
SELECT * FROM storage.buckets WHERE id = 'conversation-files';
```

**If bucket doesn't exist**:
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('conversation-files', 'conversation-files', false);
```

**Verify RLS Policies** (if using Row Level Security):
- Users can upload to their own folder: `raw/{user_id}/`
- Users can read from their own folder
- Service role has full access

- [ ] Storage bucket exists
- [ ] RLS policies configured (if needed)
- [ ] Test upload/download works

---

### Step 4: Deploy Code Changes

**Files to Deploy**:
- `src/lib/services/conversation-storage-service.ts`
- `src/lib/services/conversation-generation-service.ts`

**Deployment Method** (choose one):

**Option A: Git Deploy (Vercel/Netlify)**
```bash
git add src/lib/services/
git commit -m "feat: implement raw response storage (Phase 2)"
git push origin main
```

**Option B: Manual Deploy**
- Upload modified files to production server
- Restart application server

**Option C: CI/CD Pipeline**
- Merge to main branch
- Wait for automated deployment
- Monitor deployment logs

- [ ] Code deployed to staging
- [ ] Code deployed to production
- [ ] Application restarted successfully
- [ ] No deployment errors

---

### Step 5: Smoke Test

**Test 1: Generate Single Conversation**

Via API:
```bash
curl -X POST https://your-domain.com/api/conversations/generate-with-scaffolding \
  -H "Content-Type: application/json" \
  -H "x-user-id: test-user" \
  -d '{
    "persona_id": "test-persona-id",
    "emotional_arc_id": "test-arc-id",
    "training_topic_id": "test-topic-id",
    "tier": "template"
  }'
```

**Check**:
```sql
SELECT 
  conversation_id,
  raw_response_url,
  raw_response_path,
  raw_stored_at,
  processing_status
FROM conversations
WHERE created_at > NOW() - INTERVAL '5 minutes'
ORDER BY created_at DESC
LIMIT 1;
```

**Expected**:
- `raw_response_url` is NOT NULL
- `raw_response_path` starts with `raw/`
- `raw_stored_at` is recent timestamp
- `processing_status` is 'completed' (if parse succeeded) or 'raw_stored' (if not yet parsed)

- [ ] Test conversation generated successfully
- [ ] Raw response stored
- [ ] Database fields populated
- [ ] File exists in storage

---

### Step 6: Monitor Production

**Monitor for 1 hour after deployment**

**Check Application Logs**:
```bash
# Look for raw storage log messages
[storeRawResponse] Storing raw response for conversation...
[storeRawResponse] ✅ Raw file uploaded to raw/...
[parseAndStoreFinal] Parsing conversation...
[parseAndStoreFinal] ✅ Direct parse succeeded
```

**Check Error Rate**:
```sql
-- Should be 0 or very low
SELECT COUNT(*) FROM conversations 
WHERE requires_manual_review = true 
  AND created_at > NOW() - INTERVAL '1 hour';
```

**Check Parse Success Rate**:
```sql
SELECT 
  parse_method_used,
  COUNT(*) as count,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) as percentage
FROM conversations
WHERE created_at > NOW() - INTERVAL '1 hour'
  AND parse_method_used IS NOT NULL
GROUP BY parse_method_used;
```

**Expected**: ~100% 'direct' parse method

**Check Storage Usage**:
```sql
SELECT 
  COUNT(*) as conversations,
  SUM(raw_response_size) / 1024 / 1024 as raw_mb,
  AVG(raw_response_size) as avg_raw_bytes
FROM conversations
WHERE created_at > NOW() - INTERVAL '1 hour'
  AND raw_response_path IS NOT NULL;
```

- [ ] No unusual errors in logs
- [ ] Parse success rate is high (>95%)
- [ ] Storage files being created
- [ ] Performance metrics stable

---

### Step 7: Set Up Monitoring Alerts (Optional)

**Recommended Alerts**:

1. **Manual Review Queue Alert**
   - Trigger: `requires_manual_review = true` count > 10
   - Action: Notify DevOps/Engineering team

2. **Parse Failure Rate Alert**
   - Trigger: Parse failure rate > 10% in last hour
   - Action: Investigate prompt/schema issues

3. **Storage Growth Alert**
   - Trigger: Raw storage growth > 1GB/day
   - Action: Review if cleanup is needed

**Example SQL for Monitoring**:
```sql
-- Create view for monitoring
CREATE OR REPLACE VIEW raw_storage_health AS
SELECT 
  COUNT(*) as total_conversations,
  COUNT(CASE WHEN requires_manual_review THEN 1 END) as manual_review_count,
  COUNT(CASE WHEN parse_method_used = 'direct' THEN 1 END) as direct_parse_count,
  COUNT(CASE WHEN parse_method_used = 'jsonrepair' THEN 1 END) as jsonrepair_count,
  SUM(raw_response_size) / 1024 / 1024 as raw_storage_mb,
  AVG(parse_attempts) as avg_parse_attempts
FROM conversations
WHERE created_at > NOW() - INTERVAL '24 hours'
  AND raw_response_path IS NOT NULL;
```

- [ ] Monitoring alerts configured
- [ ] Alert thresholds set appropriately
- [ ] Team notified of new alerts

---

## Post-Deployment Validation

### 24-Hour Check

**Run After 24 Hours**:

1. **Parse Success Rate**
```sql
SELECT 
  DATE_TRUNC('hour', created_at) as hour,
  COUNT(*) as total,
  COUNT(CASE WHEN parse_method_used = 'direct' THEN 1 END) as direct,
  COUNT(CASE WHEN requires_manual_review THEN 1 END) as failed
FROM conversations
WHERE created_at > NOW() - INTERVAL '24 hours'
  AND raw_response_path IS NOT NULL
GROUP BY DATE_TRUNC('hour', created_at)
ORDER BY hour DESC;
```

2. **Storage Growth**
```sql
SELECT 
  DATE_TRUNC('hour', created_at) as hour,
  COUNT(*) as conversations,
  SUM(raw_response_size) / 1024 / 1024 as mb_per_hour
FROM conversations
WHERE created_at > NOW() - INTERVAL '24 hours'
  AND raw_response_path IS NOT NULL
GROUP BY DATE_TRUNC('hour', created_at)
ORDER BY hour DESC;
```

3. **Error Patterns**
```sql
SELECT 
  parse_error_message,
  COUNT(*) as count
FROM conversations
WHERE requires_manual_review = true
  AND created_at > NOW() - INTERVAL '24 hours'
GROUP BY parse_error_message
ORDER BY count DESC;
```

- [ ] Parse success rate > 95%
- [ ] Storage growth is predictable
- [ ] No unexpected error patterns
- [ ] Performance metrics stable

---

## Rollback Plan

**If Critical Issues Arise**

### Option 1: Rollback Code Only (Preferred)
If issues are with application code:

1. Revert code changes:
```bash
git revert <commit-hash>
git push origin main
```

2. Database changes can stay (backwards compatible)
3. Monitor for stability

### Option 2: Rollback Database + Code
If issues are with database schema:

1. Revert code changes first
2. Remove new columns (CAUTION: Data loss):
```sql
BEGIN;

-- Remove indexes
DROP INDEX IF EXISTS idx_conversations_requires_review;
DROP INDEX IF EXISTS idx_conversations_parse_attempts;

-- Remove columns
ALTER TABLE conversations 
DROP COLUMN IF EXISTS raw_response_url,
DROP COLUMN IF EXISTS raw_response_path,
DROP COLUMN IF EXISTS raw_response_size,
DROP COLUMN IF EXISTS raw_stored_at,
DROP COLUMN IF EXISTS parse_attempts,
DROP COLUMN IF EXISTS last_parse_attempt_at,
DROP COLUMN IF EXISTS parse_error_message,
DROP COLUMN IF EXISTS parse_method_used,
DROP COLUMN IF EXISTS requires_manual_review;

COMMIT;
```

3. Restore from backup if needed:
```bash
psql -h <host> -U <user> -d <database> -f backup-before-prompt2-YYYYMMDD.sql
```

---

## Success Criteria

### Functional
- [x] Every Claude response is stored before parsing
- [x] Parse failures don't lose data
- [x] Database records track raw response metadata
- [x] Manual review queue functions correctly

### Performance
- [ ] Response time increase < 500ms
- [ ] Parse success rate > 95%
- [ ] Storage growth predictable
- [ ] No memory leaks or resource issues

### Operational
- [ ] Monitoring alerts working
- [ ] Team trained on new flow
- [ ] Documentation accessible
- [ ] Rollback plan tested (dry run)

---

## Known Issues & Workarounds

### Issue: High Manual Review Queue
**Symptom**: Many conversations marked `requires_manual_review = true`

**Investigation**:
```sql
SELECT parse_error_message, COUNT(*)
FROM conversations
WHERE requires_manual_review = true
GROUP BY parse_error_message;
```

**Workaround**: This is expected until Prompt 3 (jsonrepair) is deployed. Monitor queue but don't panic.

### Issue: Storage Growth Faster Than Expected
**Symptom**: Raw storage growing quickly

**Investigation**:
```sql
SELECT 
  AVG(raw_response_size) as avg_bytes,
  MAX(raw_response_size) as max_bytes
FROM conversations
WHERE created_at > NOW() - INTERVAL '24 hours';
```

**Workaround**: Implement cleanup job to delete raw files after successful parse (future enhancement).

---

## Communication Plan

### Internal Announcement (Before Deployment)
```
Subject: [Release] Phase 2: Raw Response Storage

Team,

We're deploying Phase 2 of the JSON handling strategy today:
- Feature: Zero data loss - all Claude responses preserved
- Impact: Minimal (additive changes only)
- Downtime: None expected
- Rollback: Available if needed

What to watch:
- Parse success rates (should be ~100%)
- Manual review queue (expected to have some entries)
- Storage growth (predictable increase)

Questions? Check: dev-mem/PROMPT2_RAW_STORAGE_QUICK_START.md
```

### Post-Deployment Update (After 24 Hours)
```
Subject: [Release Update] Phase 2 Deployed Successfully

Team,

Phase 2 has been live for 24 hours. Metrics:
- Parse success rate: XX%
- Conversations stored: XXX
- Manual review queue: XX items
- Storage used: XX MB

Status: ✅ Stable

Next: Phase 3 (JSON Repair) coming soon.
```

---

## Maintenance Tasks

### Weekly
- [ ] Review manual review queue
- [ ] Check parse success rates
- [ ] Monitor storage growth

### Monthly
- [ ] Analyze parse error patterns
- [ ] Review storage cleanup policies
- [ ] Update documentation if needed

### Quarterly
- [ ] Evaluate need for cleanup job
- [ ] Review monitoring alert thresholds
- [ ] Assess Phase 3 (JSON Repair) impact

---

**Deployment Date**: _____________  
**Deployed By**: _____________  
**Production Verification**: [ ] Complete  
**24-Hour Check**: [ ] Complete  
**Status**: _____________

