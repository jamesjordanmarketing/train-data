# Supabase Read/Write: AI Agent Access & Schema Analysis (v3)

## 1. Setup for Trae Chat Panel Access from /brun/

### .env.local Location (Project Root)
```bash
# Place at: c:\Users\james\Master\BrightHub\brun\.env.local
# This enables Trae chat panel to access Supabase from /brun/ directory
```

### Required Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=https://hqhtbxlgzysfbekexwku.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

### Test Trae Chat Panel Access
```bash
# From /brun/ directory, test if env vars are loaded:
cd c:\Users\james\Master\BrightHub\brun
node -e "
require('dotenv').config();
console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING');
console.log('SERVICE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING');
"

# Test actual Supabase connection from train-data/src (where modules are installed):
cd train-data/src
node -e "
require('dotenv').config({ path: '../../.env.local' });
const { createClient } = require('@supabase/supabase-js');
const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
client.from('conversations').select('id').limit(1).then(r => console.log('Trae Access OK:', r.data)).catch(e => console.error('Trae Access FAIL:', e.message));
"
```

## 2. App Functionality (Keep Unchanged)

### src/lib/supabase.ts
- **DO NOT MODIFY** - Leave as-is for app functionality
- Uses hardcoded projectId and embedded keys
- Handles app's database operations and user sessions

### src/lib/supabase-server.ts  
- **DO NOT MODIFY** - Leave as-is for server operations
- Handles server-side app operations

## 3. Schema Inspection for AI Agent

### Run These SQL Commands in Supabase Dashboard
Copy output and provide to Trae chat panel for conflict-free SQL generation:

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

## 4. Provide Schema Info to Trae Chat Panel

When asking Trae to generate SQL for wireframe execution (04-FR-wireframes-execution-E09.md lines 176-260):

1. **Run all 5 SQL queries above in Supabase Dashboard**
2. **Copy all outputs**
3. **Ask Trae:** "Generate idempotent SQL to add parent_chunk_id, chunk_context, dimension_source columns to conversations table, plus indexes and helper functions. Here's my current schema: [paste all query outputs]"

## 5. Troubleshooting

**If you see "SERVICE_KEY: MISSING":**
Your `.env.local` file is missing the `SUPABASE_SERVICE_ROLE_KEY`. Add it to `c:\Users\james\Master\BrightHub\brun\.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

The service role key is required for the Trae chat panel to perform schema inspection and generate conflict-free SQL.

## 6. Quick Reference

### Verify Trae Access

**Step 1: Install dependencies (if not already done):**
```bash
cd c:\Users\james\Master\BrightHub\brun\train-data\src
npm install
```

**Step 2: Test connection:**
```bash
cd c:\Users\james\Master\BrightHub\brun\train-data\src
node -e "
const fs = require('fs');
const path = require('path');
const envPath = path.resolve('../../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) envVars[key.trim()] = value.trim();
});
console.log('ENV loaded:', Object.keys(envVars));
console.log('SUPABASE_URL:', envVars.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING');
console.log('SERVICE_KEY:', envVars.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING');
if (envVars.NEXT_PUBLIC_SUPABASE_URL && envVars.SUPABASE_SERVICE_ROLE_KEY) {
  const { createClient } = require('@supabase/supabase-js');
  const client = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY);
  client.from('conversations').select('id').limit(1).then(r => console.log('✅ Trae Access OK')).catch(e => console.error('❌ Trae Access FAIL:', e.message));
} else {
  console.error('❌ Missing required environment variables');
}
"
```

### App Dev Server (Separate from Trae access)
```bash
cd c:\Users\james\Master\BrightHub\brun\train-data\src
npm run dev
```

### Safe SQL Pattern for Trae-Generated Code
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

## Summary

- **App functionality:** Keep src/lib/supabase.ts unchanged
- **Trae access:** Place .env.local in /brun/ for AI agent queries
- **Schema analysis:** Run 5 SQL queries, provide output to Trae
- **Two separate purposes:** App operations vs AI agent analysis