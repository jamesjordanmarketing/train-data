# Storage Access Fix - Download 404 Issue

## Date
2025-01-19

## Issue
After fixing authentication in the generation endpoint, users could create conversations but still couldn't download them. The error was:
```
StorageApiError: Object not found (status: 404)
```

## Root Cause Analysis

### Investigation Process
1. **Verified files exist in storage** using `check-storage-files.js`:
   - Files ARE present in Supabase Storage at correct paths
   - Both conversation.json and raw response files confirmed present

2. **Tested storage access permissions** using `check-storage-access.js`:
   - ✅ Service role key: Can access files (admin bypass)
   - ❌ Anon key: Gets 403 "signature verification failed"
   - Bucket is **PRIVATE** (public: false)

### Root Cause
The download endpoint was using `createServerSupabaseClientFromRequest()` which creates an **authenticated client with anon key**. Private storage buckets in Supabase require the **service role key** to generate signed URLs.

**Why this failed:**
- Bucket: `conversation-files` is set to private
- Authenticated users use anon key + JWT
- Private buckets reject signed URL generation from anon key
- Service role key is required to bypass bucket privacy

## Solution

### Change Summary
Modified `src/app/api/conversations/[id]/download/route.ts` to use **two Supabase clients**:

1. **Authenticated Client** (anon key + user JWT):
   - Used for database queries to verify conversation ownership
   - Respects RLS policies
   - Ensures user can only download their own conversations

2. **Admin Client** (service role key):
   - Used for storage operations only
   - Required to generate signed URLs for private bucket
   - Bypasses bucket privacy restrictions

### Code Changes

**Before:**
```typescript
// Only used authenticated client
const { supabase } = createServerSupabaseClientFromRequest(request);
const storageService = new ConversationStorageService(supabase);
```

**After:**
```typescript
// Use authenticated client for database (RLS)
const { supabase: authenticatedClient } = createServerSupabaseClientFromRequest(request);

// Use admin client for storage (private bucket)
const adminClient = createServerSupabaseAdminClient();

// Storage operations use admin client
const storageService = new ConversationStorageService(adminClient);

// Database operations use authenticated client
const authenticatedStorageService = new ConversationStorageService(authenticatedClient);
const conversation = await authenticatedStorageService.getConversation(conversationId);
```

### Security Considerations

**Critical Security Pattern:**
Since the admin client bypasses RLS, we MUST verify ownership manually:

1. Authenticate user via JWT
2. Query conversation using authenticated client (respects RLS)
3. Verify conversation exists and user owns it
4. Only then use admin client to generate signed URL

This ensures users can only download their own conversations even though we're using service role key for storage.

## Testing Plan

### Local Testing
1. Start dev server: `npm run dev`
2. Navigate to `/conversations/generate`
3. Generate a new conversation
4. Click "Download Conversation" button
5. Verify file downloads successfully

### Production Testing
1. Deploy changes to Vercel
2. Generate conversation as authenticated user
3. Verify download works
4. Test with different users to ensure isolation

## Files Modified
- `src/app/api/conversations/[id]/download/route.ts`
  - Added import for `createServerSupabaseAdminClient`
  - Split client initialization into authenticated + admin
  - Enhanced ownership verification
  - Added detailed comments explaining dual-client pattern

## Investigation Scripts Created
- `supa-agent-ops/check-storage-files.js` - Verify file existence in bucket
- `supa-agent-ops/check-storage-access.js` - Test storage permissions

## Related Issues
- Issue #1: Download 404 (this fix)
- Issue #3: SAOL environment variables (fixed previously)

## Technical Details

### Supabase Storage Bucket Configuration
- Bucket: `conversation-files`
- Public: `false` (private)
- File size limit: 10 MB
- Allowed MIME types: `application/json`

### Authentication Flow
```
User Request
    ↓
JWT Validation (requireAuth)
    ↓
Database Query (authenticated client + RLS)
    ↓
Ownership Verification
    ↓
Generate Signed URL (admin client + service role)
    ↓
Return URL to User
```

## Lessons Learned

1. **Storage bucket privacy requires service role key**: Private buckets cannot generate signed URLs with anon key, even for authenticated users.

2. **Dual-client pattern for security**: When using service role key, always verify authorization separately using authenticated client.

3. **Test storage permissions directly**: Don't assume storage permissions match database RLS policies - they are separate systems.

4. **SAOL tool invaluable for debugging**: Using database investigation scripts saved hours of guesswork.

## Next Steps
1. Deploy to production
2. Test end-to-end workflow
3. Monitor for any permission errors
4. Consider adding storage policy for authenticated users (future optimization)
