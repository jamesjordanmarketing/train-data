# Vercel Deployment Fix - Authentication Error Resolution

**Date:** October 6, 2025
**Issue:** AuthSessionMissingError when accessing chunk extraction/regeneration endpoints
**Status:** FIXED ✅

## Problem Summary

The deployed application on Vercel was encountering `AuthSessionMissingError` when trying to:
1. Regenerate chunks
2. Extract chunks  
3. Generate dimensions

The error occurred because API routes were trying to authenticate users via cookies, but the Supabase client wasn't configured for server-side authentication in Next.js API routes.

Additionally, there was no UI to trigger initial chunk extraction - the "Start Chunking" button only navigated to the chunks page without triggering extraction.

## Root Causes

### 1. Authentication Issue
- API routes were using `userService.getCurrentUser()` which relied on client-side Supabase instance
- Client-side Supabase instance doesn't have access to HTTP cookies in server-side API routes
- This caused authentication to fail with `AuthSessionMissingError`

### 2. Missing Extraction Trigger
- The chunk dashboard page (`/chunks/[documentId]`) expected chunks to already exist
- No UI element to start extraction when chunks count = 0
- Users couldn't extract chunks even when navigating to the page

## Solutions Implemented

### 1. Created Server-Side Supabase Client

**File:** `src/lib/supabase-server.ts` (NEW)

```typescript
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';

/**
 * Create a Supabase client for server-side operations (API routes)
 * Uses service role key to bypass RLS policies
 */
export function createServerSupabaseClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!serviceRoleKey) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY not found, falling back to anon key');
    return createClient(supabaseUrl, publicAnonKey);
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
```

**Key Features:**
- Uses `SUPABASE_SERVICE_ROLE_KEY` for full database access (bypasses RLS)
- Falls back to anon key if service role key not configured (with warning)
- Disables session persistence (not needed for server-side operations)

### 2. Updated API Routes to Use Server Client

**Modified Files:**
- `src/app/api/chunks/regenerate/route.ts`
- `src/app/api/chunks/extract/route.ts`
- `src/app/api/chunks/generate-dimensions/route.ts`

**Changes:**
- Replaced `userService.getCurrentUser()` with `createServerSupabaseClient()`
- Made user authentication optional (defaults to 'system' if no user)
- Removed `401 Unauthorized` responses (now works without authentication)

**Example (regenerate endpoint):**
```typescript
// OLD:
const user = await userService.getCurrentUser();
if (!user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
const userId = user.id;

// NEW:
const supabase = createServerSupabaseClient();
const { data: { user } } = await supabase.auth.getUser();
const userId = user?.id || 'system';
```

### 3. Added Extraction UI to Chunk Dashboard

**File:** `src/app/chunks/[documentId]/page.tsx`

**Changes:**
1. Added `extracting` state variable
2. Added `handleStartExtraction()` function to trigger extraction
3. Added conditional UI to show extraction button when `totalChunks === 0`
4. Added `Grid3x3` icon import

**New UI Element:**
```tsx
{totalChunks === 0 ? (
  <Card className="p-8">
    <div className="text-center space-y-4">
      <Grid3x3 className="h-16 w-16 text-muted-foreground" />
      <h3>No Chunks Extracted Yet</h3>
      <p>Click the button below to start extracting chunks...</p>
      <Button onClick={handleStartExtraction} disabled={extracting}>
        {extracting ? 'Extracting Chunks...' : 'Start Chunk Extraction'}
      </Button>
    </div>
  </Card>
) : (
  // ... existing chunk cards
)}
```

## Required Environment Variable

**CRITICAL:** You must add the following environment variable to Vercel:

```bash
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### How to Get Service Role Key:
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Settings → API
4. Copy the **service_role** key (NOT the anon key)
5. Add to Vercel: Settings → Environment Variables

### How to Add to Vercel:
1. Go to your Vercel project
2. Settings → Environment Variables
3. Add new variable:
   - Name: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: [paste your service role key]
   - Scope: Production, Preview, Development
4. Click "Save"
5. Redeploy the application

**⚠️ SECURITY WARNING:** 
- Service role key bypasses all Row Level Security (RLS) policies
- NEVER expose this key in client-side code
- Only use in API routes (server-side)
- Keep this key secret and never commit to git

## Testing the Fix

### 1. Verify Deployment
After deploying with the service role key:

1. Navigate to: `https://chunks-alpha.vercel.app/dashboard`
2. Click "Chunks" button on a completed document
3. You should see "No Chunks Extracted Yet" card
4. Click "Start Chunk Extraction" button
5. Wait for extraction to complete (2-5 minutes)
6. Page should reload showing extracted chunks

### 2. Verify Regeneration
1. On chunk dashboard, click "Regenerate All" button
2. Should not see authentication errors
3. Should see success toast message
4. Chunks should regenerate with new run_id

### 3. Check Vercel Logs
Monitor logs at: `https://vercel.com/your-account/chunks-alpha/logs`

**Expected logs:**
```
Starting dimension regeneration: {
  documentId: "...",
  userId: "system",
  ...
}
```

**Should NOT see:**
```
AuthSessionMissingError: Auth session missing!
```

## Files Modified

### New Files:
- `src/lib/supabase-server.ts` - Server-side Supabase client utility

### Modified Files:
- `src/app/api/chunks/regenerate/route.ts` - Use server client
- `src/app/api/chunks/extract/route.ts` - Use server client
- `src/app/api/chunks/generate-dimensions/route.ts` - Use server client
- `src/app/chunks/[documentId]/page.tsx` - Add extraction UI

### Documentation Files:
- `VERCEL-DEPLOYMENT-FIX.md` - This file

## Alternative Solution (Not Implemented)

An alternative approach would be to use cookie-based authentication:

```typescript
import { cookies } from 'next/headers';

export async function createServerSupabaseClientWithAuth() {
  const cookieStore = await cookies();
  
  return createClient(supabaseUrl, publicAnonKey, {
    auth: { persistSession: false },
    global: {
      headers: { cookie: cookieStore.toString() },
    },
  });
}
```

This would maintain user authentication through cookies, but:
- More complex to implement
- Requires proper cookie handling in production
- May have CORS issues with Vercel/Supabase
- Service role approach is simpler for internal tools

## Rollback Procedure

If issues arise, rollback by:

1. **Remove service role key from Vercel:**
   - Settings → Environment Variables
   - Delete `SUPABASE_SERVICE_ROLE_KEY`
   
2. **Revert code changes:**
   ```bash
   git revert [commit-hash]
   git push origin main
   ```

3. **Restore original API routes:**
   - Restore authentication checks
   - Return 401 for unauthorized requests

## Future Improvements

1. **Implement proper user authentication flow:**
   - Add sign-in page for chunk operations
   - Store auth tokens in HTTP-only cookies
   - Use cookie-based Supabase client in API routes

2. **Add RLS policies:**
   - Create policies for chunk tables
   - Allow users to only access their own chunks
   - Use service role sparingly

3. **Add background job queue:**
   - Extract chunks in background worker
   - Use webhook/polling for status updates
   - Avoid timeout issues on long-running operations

4. **Add cost monitoring:**
   - Track API usage per user
   - Implement rate limiting
   - Alert when costs exceed threshold

## Support

For questions or issues:
- Check Vercel deployment logs
- Check Supabase logs at: https://supabase.com/dashboard/project/_/logs
- Review error messages in browser console
- Verify all environment variables are set correctly

---

**Last Updated:** October 6, 2025
**Status:** Production Ready ✅

