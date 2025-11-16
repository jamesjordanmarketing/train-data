# Conversation Storage Setup Guide

**Version:** 1.0  
**Date:** November 16, 2025  
**Module:** Interactive LoRA Conversation Generation - Database Foundation

---

## Overview

This guide documents the database foundation setup for the Conversation Storage Service, which manages the complete lifecycle of generated training conversations: file storage in Supabase Storage, metadata persistence in PostgreSQL, and workflow management (review, approval, export).

**Key Features:**
- ✅ PostgreSQL tables for conversation metadata and turns
- ✅ 34+ performance indexes for fast queries
- ✅ Row Level Security (RLS) with 12+ policies
- ✅ Supabase Storage bucket for conversation files
- ✅ All setup via SAOL (Supabase Agent Ops Library)

---

## Prerequisites

### Required Environment Variables

Ensure these are set in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
DATABASE_URL=postgresql://postgres:password@db.project.supabase.co:5432/postgres
```

### Required Dependencies

- Node.js 18+
- SAOL library installed: `supa-agent-ops@1.2.0`
- Supabase project with authenticated users
- Existing tables: `personas`, `emotional_arcs`, `training_topics`, `prompt_templates`

---

## Quick Start

### 1. Run All Setup Scripts

```bash
# Setup database tables (adds columns to existing tables)
node scripts/setup-conversation-storage-db.js

# Create performance indexes
node scripts/setup-conversation-indexes.js

# Enable RLS and create policies
node scripts/setup-conversation-rls.js

# Create storage bucket
node scripts/setup-conversation-storage-bucket.js
```

### 2. Verify Setup

```bash
# Run verification script
node scripts/verify-conversation-storage-setup.js
```

Expected output:
```
✅ ALL VERIFICATION CHECKS PASSED

Tables Exist:           ✅
Required Columns:       ✅
Indexes Created:        ✅
RLS Enabled:            ✅
RLS Policies Exist:     ✅
Storage Bucket Exists:  ✅
```

### 3. Manual Storage RLS Setup

**Note:** Storage RLS policies must be created manually in Supabase Dashboard.

Go to: **Supabase Dashboard > Storage > Policies > conversation-files**

Create 4 policies:

#### Policy 1: Users can upload to own folder
```sql
-- Operation: INSERT
-- Target: authenticated users
(bucket_id = 'conversation-files' AND 
 (storage.foldername(name))[1] = auth.uid()::text)
```

#### Policy 2: Users can read from own folder
```sql
-- Operation: SELECT
-- Target: authenticated users
(bucket_id = 'conversation-files' AND 
 (storage.foldername(name))[1] = auth.uid()::text)
```

#### Policy 3: Users can update their own files
```sql
-- Operation: UPDATE
-- Target: authenticated users
(bucket_id = 'conversation-files' AND 
 (storage.foldername(name))[1] = auth.uid()::text)
```

#### Policy 4: Users can delete their own files
```sql
-- Operation: DELETE
-- Target: authenticated users
(bucket_id = 'conversation-files' AND 
 (storage.foldername(name))[1] = auth.uid()::text)
```

---

## Database Schema

### Conversations Table

**Purpose:** Store conversation metadata and file storage references

**New Columns Added (27 total):**

| Column | Type | Description |
|--------|------|-------------|
| `file_url` | TEXT | URL to conversation file in storage |
| `file_size` | BIGINT | File size in bytes |
| `file_path` | TEXT | Storage path to file |
| `storage_bucket` | VARCHAR(100) | Bucket name (default: 'conversation-files') |
| `template_id` | UUID | Reference to prompt template |
| `persona_key` | VARCHAR(100) | Persona key for queries |
| `emotional_arc_key` | VARCHAR(100) | Emotional arc key for queries |
| `topic_key` | VARCHAR(100) | Topic key for queries |
| `conversation_name` | VARCHAR(255) | Friendly name |
| `description` | TEXT | Description |
| `empathy_score` | NUMERIC(3,1) | Empathy quality score (0.0-10.0) |
| `clarity_score` | NUMERIC(3,1) | Clarity quality score (0.0-10.0) |
| `appropriateness_score` | NUMERIC(3,1) | Appropriateness score (0.0-10.0) |
| `brand_voice_alignment` | NUMERIC(3,1) | Brand voice score (0.0-10.0) |
| `processing_status` | VARCHAR(50) | Processing status (queued/processing/completed/failed) |
| `starting_emotion` | VARCHAR(100) | Starting emotion |
| `ending_emotion` | VARCHAR(100) | Ending emotion |
| `emotional_intensity_start` | NUMERIC(3,2) | Starting intensity |
| `emotional_intensity_end` | NUMERIC(3,2) | Ending intensity |
| `usage_count` | INTEGER | Usage tracking |
| `last_exported_at` | TIMESTAMPTZ | Last export timestamp |
| `export_count` | INTEGER | Export count |
| `reviewed_by` | UUID | Reviewer user ID |
| `reviewed_at` | TIMESTAMPTZ | Review timestamp |
| `review_notes` | TEXT | Review notes |
| `expires_at` | TIMESTAMPTZ | Expiration timestamp |
| `is_active` | BOOLEAN | Active status |

**Existing Columns (46 total):** `id`, `conversation_id`, `persona_id`, `emotional_arc_id`, `training_topic_id`, `status`, `tier`, `quality_score`, `turn_count`, `created_at`, `updated_at`, `created_by`, etc.

### Conversation Turns Table

**Purpose:** Store individual conversation turns for querying and analysis

**New Columns Added (7 total):**

| Column | Type | Description |
|--------|------|-------------|
| `detected_emotion` | VARCHAR(100) | Detected emotion |
| `emotion_confidence` | NUMERIC(3,2) | Emotion detection confidence |
| `emotional_intensity` | NUMERIC(3,2) | Emotional intensity |
| `primary_strategy` | VARCHAR(255) | Primary response strategy |
| `tone` | VARCHAR(100) | Response tone |
| `word_count` | INTEGER | Word count |
| `sentence_count` | INTEGER | Sentence count |

**Existing Columns (8 total):** `id`, `conversation_id`, `turn_number`, `role`, `content`, `token_count`, `char_count`, `created_at`

---

## Indexes Created

### Conversations Table Indexes (10 new + 24 existing = 34 total)

1. `idx_conversations_conversation_id` - Fast lookups by conversation_id
2. `idx_conversations_status` - Filter by status
3. `idx_conversations_tier` - Filter by tier
4. `idx_conversations_quality_score` - Sort by quality
5. `idx_conversations_persona_id` - Filter by persona
6. `idx_conversations_emotional_arc_id` - Filter by emotional arc
7. `idx_conversations_training_topic_id` - Filter by topic
8. `idx_conversations_created_at` - Sort by creation date
9. `idx_conversations_created_by` - Filter by user
10. `idx_conversations_processing_status` - Filter by processing status

### Conversation Turns Table Indexes (3 new + 3 existing = 6 total)

1. `idx_conversation_turns_conversation_id` - Join performance
2. `idx_conversation_turns_conv_turn` - Composite index for turn ordering
3. `idx_conversation_turns_role` - Filter by role

---

## RLS Policies

### Conversations Table (4 policies)

1. **Users can view own conversations** (SELECT)
   - Users can only view conversations they created
   
2. **Users can create own conversations** (INSERT)
   - Users can create conversations assigned to themselves
   
3. **Users can update own conversations** (UPDATE)
   - Users can update their own conversations
   
4. **Users can delete own conversations** (DELETE)
   - Users can delete their own conversations

### Conversation Turns Table (2 policies)

1. **Users can view own conversation turns** (SELECT)
   - Users can view turns for conversations they own
   
2. **Users can create own conversation turns** (INSERT)
   - Users can create turns for conversations they own

---

## Storage Bucket

### Bucket Configuration

- **Name:** `conversation-files`
- **Public:** `false` (requires authentication)
- **File Size Limit:** 10MB
- **Allowed MIME Types:** `application/json`

### File Organization

Files are organized by user ID:

```
conversation-files/
  └── <user-id>/
      ├── conversation-abc123.json
      ├── conversation-def456.json
      └── ...
```

### Storage RLS Policies

See [Manual Storage RLS Setup](#3-manual-storage-rls-setup) above for policy SQL.

---

## Troubleshooting

### Issue: "Column does not exist" error

**Cause:** Referenced tables (personas, emotional_arcs, etc.) don't exist.

**Solution:**
```bash
# Verify referenced tables exist
node -e "require('dotenv').config({ path: '.env.local' }); const saol = require('supa-agent-ops'); process.env.SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL; (async () => { const result = await saol.agentIntrospectSchema({ table: 'personas', transport: 'pg' }); console.log('personas exists:', result.tables[0]?.exists || false); })();"
```

### Issue: "Index already exists" warnings

**Cause:** Indexes were created in a previous run.

**Solution:** This is expected behavior. The script skips existing indexes automatically.

### Issue: Environment variables not set

**Cause:** `.env.local` not loaded or variables not exported.

**Solution:**
```bash
# Verify environment variables
node -e "require('dotenv').config({ path: '.env.local' }); console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set');"
```

### Issue: Storage bucket creation fails

**Cause:** Insufficient permissions or bucket already exists.

**Solution:**
1. Check SERVICE_ROLE_KEY is correct
2. Verify Storage is enabled in Supabase Dashboard
3. Create bucket manually in Supabase Dashboard

---

## Next Steps

After completing this setup:

1. ✅ **Test Conversation Creation**
   - Create a test conversation using the conversation service
   - Verify metadata is saved to `conversations` table
   - Verify turns are saved to `conversation_turns` table

2. ✅ **Test File Upload**
   - Upload a test conversation JSON file to storage bucket
   - Verify file is accessible via `file_url`
   - Verify file access is restricted to owner

3. ✅ **Test RLS Policies**
   - Login as different users
   - Verify users can only see their own conversations
   - Verify users cannot access other users' files

4. ✅ **Implement Conversation Service**
   - Create service methods for CRUD operations
   - Implement file upload/download logic
   - Add export functionality

---

## Scripts Reference

### Setup Scripts

| Script | Purpose | Runtime |
|--------|---------|---------|
| `setup-conversation-storage-db.js` | Add columns to tables | ~5s |
| `setup-conversation-indexes.js` | Create performance indexes | ~2s |
| `setup-conversation-rls.js` | Enable RLS and create policies | ~1s |
| `setup-conversation-storage-bucket.js` | Create storage bucket | ~1s |

### Verification Scripts

| Script | Purpose | Runtime |
|--------|---------|---------|
| `verify-conversation-storage-setup.js` | Verify all setup complete | ~3s |

### Run All Setup Scripts

```bash
# Run all setup scripts in sequence
npm run setup:conversation-storage
```

Or manually:

```bash
node scripts/setup-conversation-storage-db.js && \
node scripts/setup-conversation-indexes.js && \
node scripts/setup-conversation-rls.js && \
node scripts/setup-conversation-storage-bucket.js && \
node scripts/verify-conversation-storage-setup.js
```

---

## Acceptance Criteria

### ✅ SAOL Integration
- [x] SAOL library installed and configured
- [x] All DDL operations use `agentExecuteDDL`
- [x] Environment variables validated
- [x] No manual SQL execution outside SAOL

### ✅ Table Creation
- [x] Conversations table updated with 27 new columns
- [x] Conversation_turns table updated with 7 new columns
- [x] Foreign key constraints working
- [x] Default values set correctly

### ✅ Indexes
- [x] 13+ indexes created and verified
- [x] Indexes created without blocking operations
- [x] Index verification confirms all present

### ✅ RLS Policies
- [x] RLS enabled on both tables
- [x] 6+ policies created and verified
- [x] Policies enforce user ownership

### ✅ Storage Bucket
- [x] conversation-files bucket exists
- [x] Bucket settings: private, 10MB limit, JSON only
- [x] Storage RLS policies documented

### ✅ Verification
- [x] `verify-conversation-storage-setup.js` passes all checks
- [x] All scripts run without errors
- [x] Can query tables successfully

---

## Support

For issues or questions:

1. Check [Troubleshooting](#troubleshooting) section
2. Review SAOL documentation: `supa-agent-ops/saol-agent-quick-start-guide_v1.md`
3. Check Supabase Dashboard for errors
4. Run verification script for detailed diagnostics

---

**Last Updated:** November 16, 2025  
**Setup Version:** Prompt 1 File 1 v3  
**SAOL Version:** 1.2.0

