# Supabase Read/Write: Connection, Troubleshooting, and Safe Migrations (v2)

## 1. Concise Setup Instructions

### .env.local Location (Project Root)
```bash
# Place .env.local at: c:\Users\james\Master\BrightHub\brun\.env.local
# This allows searching from /brun/ and all subfolders including /brun/train-data/src
```

### Required Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=https://hqhtbxlgzysfbekexwku.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

### Update Code to Read from Project Root
1. **Modify src/lib/supabase.ts** - Add env loading:
```ts
import { config } from 'dotenv';
import path from 'path';

// Load from project root
config({ path: path.resolve(process.cwd(), '../.env.local') });
```

2. **Modify src/lib/supabase-server.ts** - Same env loading pattern
3. **Update all service files** in `src/lib/services/` to use the same pattern

### Test Connection
```bash
cd c:\Users\james\Master\BrightHub\brun\train-data\src
node -e "
require('dotenv').config({ path: '../../.env.local' });
const { createClient } = require('@supabase/supabase-js');
const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
client.from('conversations').select('id').limit(1).then(r => console.log('OK:', r.data)).catch(e => console.error('FAIL:', e.message));
"
```

## 2. Schema Inspection for Conflict Prevention

### Run These SQL Commands in Supabase Dashboard
Copy output and provide to agent before implementing new SQL:

#### A. Check conversations table structure
```sql
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default,
  character_maximum_length
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'conversations'
ORDER BY ordinal_position;
```

#### B. Check existing indexes on conversations
```sql
SELECT 
  indexname, 
  indexdef,
  tablename
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename = 'conversations'
ORDER BY indexname;
```

#### C. Check foreign key constraints
```sql
SELECT 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'conversations';
```

#### D. Check if chunks table exists and its structure
```sql
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'chunks'
ORDER BY ordinal_position;
```

#### E. Check existing functions and views
```sql
-- Check for existing functions
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name LIKE '%conversation%';

-- Check for existing views
SELECT 
  table_name,
  view_definition
FROM information_schema.views
WHERE table_schema = 'public'
  AND table_name LIKE '%conversation%';
```

### 3. Provide This Output to Agent

When requesting SQL generation for the wireframe execution (04-FR-wireframes-execution-E09.md lines 176-260), include:

1. **All output from the 5 SQL queries above**
2. **Specify the exact changes needed:**
   - Add `parent_chunk_id`, `chunk_context`, `dimension_source` columns to conversations
   - Create indexes for performance
   - Create helper view and function
   - Ensure no conflicts with existing schema

3. **Request format:** "Generate idempotent SQL that adds these columns/indexes/functions only if they don't already exist, based on this current schema: [paste query outputs]"

## 4. Quick Reference

### Connection Test (No Dev Server)
```bash
cd c:\Users\james\Master\BrightHub\brun
node -e "require('dotenv').config(); console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)"
```

### Dev Server (If Needed)
```bash
cd c:\Users\james\Master\BrightHub\brun\train-data\src
npm run dev
```

### Migration Safety Pattern
```sql
-- Always use IF NOT EXISTS
ALTER TABLE conversations 
  ADD COLUMN IF NOT EXISTS parent_chunk_id UUID;

-- Wrap complex changes
DO $$ BEGIN
  ALTER TABLE conversations ADD COLUMN IF NOT EXISTS chunk_context TEXT;
EXCEPTION WHEN duplicate_column THEN
  NULL;
END $$;
```