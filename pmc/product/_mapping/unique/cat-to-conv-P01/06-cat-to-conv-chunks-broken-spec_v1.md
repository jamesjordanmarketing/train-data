# Chunks Module Bug Analysis & Fix Specification

**Document Version:** 1.0  
**Date:** November 21, 2025  
**Status:** ✅ DIAGNOSTIC COMPLETE - Ready for Implementation  
**Module:** chunks-alpha (Document Upload & Chunk Viewing)

---

## 🎯 Executive Summary

The chunks-alpha module has **two critical bugs** preventing document upload and chunk viewing functionality:

1. **Upload Bug**: `TypeError: Cannot read properties of null (reading 'auth')` - 100% failure rate on document uploads
2. **View Chunks Bug**: "Error loading data: Failed to fetch document" - Prevents viewing chunk dashboards

**Root Cause Analysis Complete**: Both issues stem from the same architectural problem - use of deprecated legacy `supabase` client export that returns `null` on server-side.

**Impact**: Complete module failure - users cannot upload new documents or view existing chunks.

---

## 🔍 Diagnostic Process & Findings

### <thinking_process>

#### 1. Hypothesis Generation

**Upload Error Analysis:**
- Error: `TypeError: Cannot read properties of null (reading 'auth')`
- Location: `/var/task/src/.next/server/app/api/documents/upload/route.js:1:2251`
- **Hypothesis A**: The `supabase` client being imported is `null` at runtime
- **Hypothesis B**: Environment variables are missing
- **Hypothesis C**: Auth configuration is incorrect

**View Chunks Error Analysis:**
- Error: "Error loading data: Failed to fetch document"
- Occurs when clicking "View Chunks" button
- **Hypothesis A**: API endpoint authentication failing
- **Hypothesis B**: Document ID is invalid (archaic data)
- **Hypothesis C**: Same root cause as upload error (supabase client)

#### 2. Validation Strategy - Smoking Guns Found

**🚨 SMOKING GUN #1: Legacy Supabase Client Export**

File: `src/lib/supabase.ts` (Lines 1-18)

```typescript
/**
 * Legacy Supabase client export
 * 
 * IMPORTANT: This file is deprecated for direct auth operations
 * - For client-side: use getSupabaseClient() from '@/lib/supabase-client'
 * - For server-side: use createServerSupabaseClient() from '@/lib/supabase-server'
 * - For API routes: use requireAuth() or getAuthenticatedUser() from '@/lib/supabase-server'
 */

import { getSupabaseClient } from './supabase-client';

// Export singleton client for backward compatibility
// This will work on client-side; server-side code should use server helpers
export const supabase = typeof window !== 'undefined' 
  ? getSupabaseClient() 
  : null as unknown as ReturnType<typeof getSupabaseClient>;
  //  ^^^^^ SERVER-SIDE RETURNS NULL!
```

**Problem**: When code runs on the server (API routes), `typeof window !== 'undefined'` evaluates to `false`, so `supabase` is set to `null`.

**🚨 SMOKING GUN #2: Broken Import Pattern**

File: `src/app/api/documents/upload/route.ts` (Line 2)

```typescript
import { supabase } from '../../../../lib/supabase';
```

File: `src/lib/chunk-service.ts` (Line 1)

```typescript
import { supabase } from './supabase';
```

File: `src/app/api/documents/[id]/route.ts` (Line 2)

```typescript
import { supabase } from '../../../../lib/supabase';
```

**All these server-side files import the deprecated `supabase` export that returns `null` on the server.**

**🚨 SMOKING GUN #3: Database Evidence via SAOL**

Used SAOL (Supabase Agent Ops Library) to confirm:
- ✅ Documents table exists with 12 records
- ✅ Chunks table exists with proper schema
- ✅ Sample documents have valid structure
- ✅ Old documents have `chunk_extraction_status: 'completed'` with `total_chunks_extracted: 15`
- ❌ No RLS policies enabled (security concern, but not causing current bugs)

**Conclusion**: The data is fine. The code is broken.

#### 3. Fix Evaluation

**Proposed Fix**: Replace all `import { supabase }` with proper server-side client creation

**Self-Correction Questions:**
- ❓ Does this fix break anything else? 
  - ✅ NO - The deprecation notice explicitly tells us to use server helpers
- ❓ Is this just a band-aid?
  - ✅ NO - This aligns with the project's existing patterns (see conversation storage service)
- ❓ What about auth token handling?
  - ✅ Server helpers handle this properly via cookies and headers

**Pattern Alignment**: This fix matches the established pattern in the conversation generation module:
- File: `src/lib/services/conversation-storage-service.ts` uses `createClient()` from `@supabase/supabase-js` with `SUPABASE_SERVICE_ROLE_KEY`
- File: `src/app/api/conversations/[id]/download/enriched/route.ts` uses proper server client creation

</thinking_process>

---

## 🐛 Bug #1: Document Upload Failure

### Symptoms
- **User Action**: Navigate to `/upload`, select file, click upload
- **Error**: `TypeError: Cannot read properties of null (reading 'auth')`
- **Impact**: 100% upload failure rate
- **Production Log**:
```
2025-11-22 01:26:11.926 [error] Upload API unexpected error: 
TypeError: Cannot read properties of null (reading 'auth')
```

### Root Cause

**File**: `src/app/api/documents/upload/route.ts`  
**Lines**: 2, 114

```typescript
// Line 2 - BROKEN IMPORT
import { supabase } from '../../../../lib/supabase';

// Line 114 - ATTEMPTS TO USE NULL CLIENT
const { data: { user }, error: userError } = await supabase.auth.getUser(token);
//                                                         ^^^^ 
//                                                    supabase is null
```

**Why It Fails**:
1. API route runs on server (Node.js runtime)
2. `typeof window !== 'undefined'` evaluates to `false`
3. `supabase` export resolves to `null`
4. Calling `null.auth.getUser()` throws `TypeError`

### Evidence Chain

1. ✅ **Code Trace**: Import → null export → runtime error
2. ✅ **Runtime Evidence**: Production logs show exact error
3. ✅ **Schema Validation**: SAOL confirms DB is accessible
4. ✅ **Environment Check**: Service role key exists in `.env.local`

### Why Legacy Pattern Was Used

**Historical Context**: The `src/lib/supabase.ts` file was created early in the project for client-side use. The chunks module was developed before the auth patterns were standardized. The deprecation notice was added later, but existing code wasn't updated.

---

## 🐛 Bug #2: View Chunks Failure

### Symptoms
- **User Action**: Navigate to `/dashboard`, click "View Chunks (N)"
- **Error**: "Error loading data: Failed to fetch document"
- **Impact**: Cannot access chunk dashboard for any document

### Root Cause

**Multiple Files Using Broken Pattern**:

1. **File**: `src/lib/chunk-service.ts` (Line 1)
```typescript
import { supabase } from './supabase';  // ← Returns null on server
```

2. **File**: `src/app/api/documents/[id]/route.ts` (Line 2)
```typescript
import { supabase } from '../../../../lib/supabase';  // ← Returns null on server
```

3. **File**: `src/app/chunks/[documentId]/page.tsx` (Lines 18, 55-60)
```typescript
import { supabase } from '../../../lib/supabase';  // ← This one works (client-side)

// BUT server-side API calls fail:
const docRes = await fetch(`/api/documents/${params.documentId}`, {
  headers: authHeaders
});
// ↑ This calls the broken API route
```

### Error Flow

```
User clicks "View Chunks" 
  → Navigate to /chunks/[documentId]
  → Client-side React component loads
  → Fetches /api/documents/[documentId] (server-side API)
  → API imports broken supabase client (null)
  → Database query fails
  → Returns 500 error
  → Client shows "Failed to fetch document"
```

### Evidence

1. ✅ **SAOL Query**: Documents exist with valid chunk data
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440012",
  "chunk_extraction_status": "completed",
  "total_chunks_extracted": 15
}
```

2. ✅ **Code Trace**: Client → API → Null Client → Error
3. ✅ **API Endpoint Check**: `/api/documents/[id]/route.ts` uses broken import

---

## 🔧 Detailed Fix Specification

### Architecture Pattern to Follow

**Established Pattern from Conversation Module** (WORKING):

```typescript
// From: src/lib/services/conversation-storage-service.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
```

**Alternative Pattern for Request-Scoped Auth** (ALSO WORKING):

```typescript
// From: src/lib/supabase-server.ts
import { createServerClient } from '@supabase/ssr';

export function createServerSupabaseClientFromRequest(request: NextRequest) {
  // ... cookie handling
  const supabase = createServerClient(supabaseUrl, publicAnonKey, { cookies });
  return { supabase, response };
}
```

### Fix #1: Update Upload Route

**File**: `src/app/api/documents/upload/route.ts`

**Current Code** (Lines 1-3):
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';  // ← BROKEN
import { 
```

**Fixed Code**:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { 

// Add after imports:
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
```

**Rationale**:
- Service role key bypasses RLS (required for admin operations)
- No session persistence needed in API routes
- Matches established pattern from conversation module

### Fix #2: Update Document API Route

**File**: `src/app/api/documents/[id]/route.ts`

**Current Code** (Lines 1-2):
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';  // ← BROKEN
```

**Fixed Code**:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
```

### Fix #3: Update Chunk Service

**File**: `src/lib/chunk-service.ts`

**Current Code** (Line 1):
```typescript
import { supabase } from './supabase';  // ← BROKEN
```

**Fixed Code**:
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
```

**Why This Works for chunk-service.ts**:
- The service is called from both API routes (server) and background jobs
- Service role key ensures consistent access regardless of context
- No user-specific RLS needed - chunks are tied to documents, documents verify ownership

### Fix #4: Search for Additional Broken Imports

**Required**: Search entire codebase for other files using the broken pattern

**Search Command**:
```bash
grep -r "from.*lib/supabase" src/app/api/
grep -r "from.*lib/supabase" src/lib/
```

**Files to Check**:
- Any API route importing from `lib/supabase`
- Any service file importing from `lib/supabase`
- Check if other modules (documents, chunks, etc.) have similar issues

---

## 🛡️ Additional Issues Found (Non-Breaking)

### Issue: Missing RLS Policies

**Finding**: SAOL introspection revealed `"rlsEnabled": false` on documents table

**Impact**: 
- Security concern - any authenticated user can access any document
- Not causing current bugs, but production security risk

**Recommendation**: Add RLS policies after fixing primary bugs
```sql
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own documents"
  ON documents FOR SELECT
  USING (auth.uid() = author_id);

CREATE POLICY "Users can insert their own documents"
  ON documents FOR INSERT
  WITH CHECK (auth.uid() = author_id);
```

### Issue: Deprecated URL Fields

**Finding**: Database has deprecated fields that store presigned URLs:
- `file_url` in documents table (per context doc pattern)

**Impact**: None - not used in current code

**Recommendation**: Leave as-is for backward compatibility, document as deprecated

---

## 📋 Implementation Checklist

### Phase 1: Critical Fixes (Upload & View)
- [ ] Update `src/app/api/documents/upload/route.ts`
  - [ ] Replace supabase import with createClient
  - [ ] Add service role client initialization
  - [ ] Test file upload with authentication
  - [ ] Verify processing trigger still works

- [ ] Update `src/app/api/documents/[id]/route.ts`
  - [ ] Replace supabase import with createClient
  - [ ] Add service role client initialization
  - [ ] Test PATCH endpoint for metadata updates
  - [ ] Test GET endpoint for document fetch

- [ ] Update `src/lib/chunk-service.ts`
  - [ ] Replace supabase import with createClient
  - [ ] Add service role client initialization
  - [ ] Verify all methods still work
  - [ ] Test chunk queries, creates, deletes

### Phase 2: Search & Verify
- [ ] Run grep search for other broken imports
- [ ] Check `src/app/api/chunks/` directory
- [ ] Check `src/app/api/documents/` directory
- [ ] Update any additional files found

### Phase 3: Testing
- [ ] **Upload Test**:
  - [ ] Navigate to `/upload`
  - [ ] Select a PDF file
  - [ ] Click upload
  - [ ] Verify success message
  - [ ] Verify file appears in Supabase Storage
  - [ ] Verify document record created in DB

- [ ] **View Chunks Test**:
  - [ ] Navigate to `/dashboard`
  - [ ] Find document with `chunk_extraction_status='completed'`
  - [ ] Click "View Chunks (N)" button
  - [ ] Verify chunk dashboard loads
  - [ ] Verify chunks are displayed

- [ ] **Regression Test**:
  - [ ] Test conversation generation (ensure no side effects)
  - [ ] Test enrichment pipeline
  - [ ] Test existing downloads

### Phase 4: Security Hardening (Post-Fix)
- [ ] Enable RLS on documents table
- [ ] Add RLS policies for documents
- [ ] Enable RLS on chunks table
- [ ] Add RLS policies for chunks
- [ ] Test with non-owner users to verify isolation

---

## 🎯 Success Criteria

### Upload Functionality
- ✅ User can upload PDF, DOCX, TXT files without errors
- ✅ Files are stored in Supabase Storage
- ✅ Document records created in database
- ✅ Processing trigger fires successfully
- ✅ No authentication errors in logs

### View Chunks Functionality
- ✅ User can navigate to chunk dashboard for any document
- ✅ Chunks are loaded and displayed correctly
- ✅ Document metadata is fetched successfully
- ✅ No "Failed to fetch document" errors

### Code Quality
- ✅ No more imports from deprecated `lib/supabase` in server-side code
- ✅ All API routes use proper server client creation
- ✅ All services use proper client initialization
- ✅ TypeScript compilation passes with no errors

---

## 📚 Reference Documentation

### Established Patterns
1. **Conversation Storage Service**: `src/lib/services/conversation-storage-service.ts`
   - Shows correct service role client creation
   - Admin credentials for storage operations

2. **Enriched Download Route**: `src/app/api/conversations/[id]/download/enriched/route.ts`
   - Shows proper server-side auth handling
   - Two-layer authentication pattern

3. **Context Carryover Doc**: `pmc/system/plans/context-carries/context-carry-info-11-15-25-1114pm.md`
   - Documents the two-layer auth pattern
   - Explains why service role key is needed

### SAOL Usage
- **Location**: `supa-agent-ops/`
- **Quick Start**: `supa-agent-ops/QUICK_START.md`
- **Diagnostic Commands Used**:
```bash
# Schema introspection
node -e "require('dotenv').config({path:'.env.local'});const saol=require('./supa-agent-ops');(async()=>{const result=await saol.agentIntrospectSchema({table:'documents',transport:'pg'});console.log(JSON.stringify(result,null,2))})();"

# Data query
node -e "require('dotenv').config({path:'.env.local'});const saol=require('./supa-agent-ops');(async()=>{const result=await saol.agentQuery({table:'documents',orderBy:[{column:'created_at',ascending:false}],limit:5});console.log(JSON.stringify(result.data,null,2))})();"
```

---

## ⚠️ Implementation Warnings

### Do NOT Do These:
1. ❌ **Do NOT** try to "fix" the `lib/supabase.ts` file - it's correct for its intended use (client-side)
2. ❌ **Do NOT** use the anon key for server-side operations - RLS will block admin actions
3. ❌ **Do NOT** use `createServerSupabaseClientFromRequest()` for background jobs or services
4. ❌ **Do NOT** manually escape strings - SAOL handles this (relevant for future work)

### Do These:
1. ✅ **DO** use service role key for API routes and services
2. ✅ **DO** follow the established pattern from conversation module
3. ✅ **DO** test both upload and view after each fix
4. ✅ **DO** check for TypeScript compilation errors
5. ✅ **DO** use SAOL for any database diagnostics or schema checks

---

## 🔄 Future Improvements (Out of Scope)

### Performance Optimization
- Consider connection pooling for high-traffic scenarios
- Add caching layer for frequently accessed documents
- Optimize chunk queries with proper indexes

### Feature Enhancements
- Add real-time upload progress tracking
- Implement batch document upload
- Add chunk regeneration from dashboard
- Export chunks to various formats

### Security Enhancements
- Implement RLS policies (see Issue #3)
- Add rate limiting to upload endpoint
- Add virus scanning for uploaded files
- Implement file type validation at storage level

---

## 📊 Diagnostic Results Summary

### SAOL Validation Results

**Documents Table Schema**: ✅ Valid
- 21 columns, 12 records
- Primary key: `id` (uuid)
- Foreign key: `author_id` → `user_profiles.id`
- Status check constraint includes: 'uploaded', 'processing', 'error'
- Chunk fields present: `chunk_extraction_status`, `total_chunks_extracted`

**Chunks Table Schema**: ✅ Valid
- 17 columns
- Primary key: `id` (uuid)
- Foreign key: `document_id` → `documents.id`
- Proper structure for chunk storage and retrieval

**Sample Data**: ✅ Valid
- Documents have valid status values
- Old documents show `chunk_extraction_status='completed'`
- Chunks exist for completed documents
- No data corruption detected

**Environment**: ✅ Valid
- `NEXT_PUBLIC_SUPABASE_URL` present
- `SUPABASE_SERVICE_ROLE_KEY` present
- SAOL successfully connects and queries

---

## 🎓 Key Learnings

### For Future Agents

1. **Import Pattern Recognition**: Look for `import { supabase } from` in server-side code - this is almost always wrong

2. **SAOL Usage**: SAOL is excellent for diagnostics - use it to validate data and schema before assuming code issues

3. **Deprecation Notices**: Read code comments! The `lib/supabase.ts` file explicitly warns about server-side usage

4. **Pattern Consistency**: When one module works (conversations) and another doesn't (chunks), compare the patterns

5. **Hypothesis Testing**: Start with the simplest explanation (null export) before diving into complex scenarios

---

## 📝 Notes for Implementation Agent

### Testing Strategy
1. Fix upload route first - it's the entry point
2. Test upload immediately after fix
3. Fix document API route second - it's required for viewing
4. Fix chunk service third - it's called by API routes
5. Search for any other broken imports
6. Run comprehensive test suite

### Rollback Plan
If fixes cause issues:
1. Git revert to current commit
2. Review error logs for new issues
3. Check if service role key is missing
4. Verify environment variables are loaded

### Deployment Notes
- These fixes are safe to deploy immediately
- No database migrations required
- No breaking changes to client-side code
- API contract remains unchanged

---

**END OF SPECIFICATION**

**Status**: ✅ Ready for Implementation  
**Estimated Fix Time**: 30-60 minutes  
**Risk Level**: LOW (Simple import/initialization changes)  
**Breaking Changes**: None (API contracts unchanged)
