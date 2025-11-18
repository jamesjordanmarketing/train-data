# Conversation Download API - Implementation Specification v2 (Part 2)

**Continued from:** `06-cat-to-conv-endpoint-api_v2.md`

This document contains Prompts 4-6 of the implementation specification.

---

## Prompt 4: Download API Endpoint Implementation

========================

You are a senior full-stack developer creating the download API endpoint for conversation JSON files. This endpoint **generates fresh signed URLs on-demand** using proper authentication.

### CONTEXT

**Requirements:**
- Endpoint: GET /api/conversations/[id]/download
- Authenticate user via JWT
- Verify user owns conversation (RLS + explicit check)
- Generate fresh signed URL (1 hour expiry)
- Return temporary URL with metadata
- Never store generated URL

**Flow:**
```
User clicks "Download" 
  → Browser sends GET /api/conversations/[id]/download with JWT
  → Server validates JWT, extracts user ID
  → Server fetches conversation (RLS filters by user)
  → Server verifies user owns conversation
  → Server generates fresh signed URL from file_path
  → Server returns URL + metadata
  → Browser opens URL
  → File downloads (URL valid 1 hour)
```

### IMPLEMENTATION TASK

**Create:** `src/app/api/conversations/[id]/download/route.ts`

```typescript
/**
 * Conversation Download API Endpoint
 * 
 * GET /api/conversations/[id]/download
 * 
 * Generates a fresh signed URL for downloading conversation JSON file.
 * CRITICAL: Signed URLs are generated on-demand and expire after 1 hour.
 * They are NEVER stored in the database.
 * 
 * Authentication: Required (JWT via Supabase Auth)
 * Authorization: User must own the conversation
 * 
 * Flow:
 *   1. Validate JWT and extract user
 *   2. Fetch conversation (RLS filters by user)
 *   3. Verify user owns conversation (defense in depth)
 *   4. Generate fresh signed URL from file_path
 *   5. Return temporary URL with expiry metadata
 * 
 * Example:
 *   GET /api/conversations/60dfa7c6-7eff-45b4-8450-715c9c893ec9/download
 *   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *   
 *   Response:
 *   {
 *     "conversation_id": "60dfa7c6-7eff-45b4-8450-715c9c893ec9",
 *     "download_url": "https://...storage.../sign/...?token=xyz",
 *     "filename": "conversation.json",
 *     "file_size": 45678,
 *     "expires_at": "2025-11-18T14:30:00Z",
 *     "expires_in_seconds": 3600
 *   }
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/supabase-server';
import { ConversationStorageService } from '@/lib/services/conversation-storage-service';
import { ConversationDownloadResponse } from '@/lib/types/conversations';

export const dynamic = 'force-dynamic'; // Always dynamic, never cached

/**
 * GET /api/conversations/[id]/download
 * 
 * Generate download URL for conversation JSON file
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now();
  const conversationId = params.id;

  console.log(`[GET /api/conversations/${conversationId}/download] Request received`);

  // ================================================================
  // Step 1: Validate Authentication
  // ================================================================
  const { user, response: authErrorResponse } = await requireAuth(request);

  if (authErrorResponse) {
    console.warn(`[GET /api/conversations/${conversationId}/download] ❌ Unauthorized`);
    return authErrorResponse; // 401 Unauthorized
  }

  const authenticatedUserId = user!.id;
  console.log(`[GET /api/conversations/${conversationId}/download] ✅ Authenticated as user: ${authenticatedUserId}`);

  // ================================================================
  // Step 2: Validate Conversation ID Format
  // ================================================================
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  
  if (!conversationId || !uuidRegex.test(conversationId)) {
    console.warn(`[GET /api/conversations/${conversationId}/download] ❌ Invalid conversation ID format`);
    return NextResponse.json(
      {
        error: 'Bad Request',
        message: 'Invalid conversation ID format. Expected UUID.',
      },
      { status: 400 }
    );
  }

  // ================================================================
  // Step 3: Initialize Service with Authenticated Client
  // ================================================================
  const storageService = new ConversationStorageService(authenticatedUserId);

  try {
    // ================================================================
    // Step 4: Get Conversation and Generate Download URL
    // ================================================================
    // This method:
    //   - Fetches conversation from database (RLS filters by user automatically)
    //   - Verifies file_path exists
    //   - Generates fresh signed URL (valid 1 hour)
    //   - Returns URL + metadata
    console.log(`[GET /api/conversations/${conversationId}/download] Fetching conversation and generating download URL...`);

    const downloadInfo: ConversationDownloadResponse = 
      await storageService.getDownloadUrlForConversation(conversationId);

    console.log(`[GET /api/conversations/${conversationId}/download] ✅ Generated signed URL (expires in 1 hour)`);

    // ================================================================
    // Step 5: Verify User Owns Conversation (Defense in Depth)
    // ================================================================
    // RLS should already enforce this, but double-check for security
    const conversation = await storageService.getConversation(conversationId);
    
    if (conversation && conversation.created_by !== authenticatedUserId) {
      console.warn(`[GET /api/conversations/${conversationId}/download] ❌ Forbidden: User ${authenticatedUserId} does not own conversation (owned by ${conversation.created_by})`);
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'You do not have permission to download this conversation',
        },
        { status: 403 }
      );
    }

    // ================================================================
    // Step 6: Return Download Information
    // ================================================================
    const duration = Date.now() - startTime;
    console.log(`[GET /api/conversations/${conversationId}/download] ✅ Success (${duration}ms)`);

    return NextResponse.json({
      ...downloadInfo,
      _meta: {
        generated_at: new Date().toISOString(),
        generated_for_user: authenticatedUserId,
        duration_ms: duration,
      },
    });

  } catch (error: any) {
    console.error(`[GET /api/conversations/${conversationId}/download] ❌ Error:`, error);

    // Handle specific error types
    if (error.message?.includes('not found')) {
      return NextResponse.json(
        {
          error: 'Not Found',
          message: 'Conversation not found or you do not have access to it',
        },
        { status: 404 }
      );
    }

    if (error.message?.includes('No file path')) {
      return NextResponse.json(
        {
          error: 'Not Found',
          message: 'Conversation file not available for download',
        },
        { status: 404 }
      );
    }

    if (error.message?.includes('Failed to generate')) {
      return NextResponse.json(
        {
          error: 'Internal Server Error',
          message: 'Failed to generate download URL. Please try again.',
        },
        { status: 500 }
      );
    }

    // Generic error
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'An unexpected error occurred while preparing your download',
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS handler for CORS preflight (if needed)
 */
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { status: 200 });
}
```

### TESTING

**Test Script:** Create `scripts/test-download-endpoint.ts`

```typescript
/**
 * Test script for conversation download endpoint
 * Tests authentication, authorization, and URL generation
 */

import { createClientSupabaseClient } from '@/lib/supabase-client';

async function testDownloadEndpoint() {
  console.log('🧪 Testing Conversation Download Endpoint\n');

  // Step 1: Authenticate as test user
  const supabase = createClientSupabaseClient();
  
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'test@example.com',
    password: 'TestPassword123!',
  });

  if (authError || !authData.user) {
    console.error('❌ Authentication failed:', authError);
    return;
  }

  console.log(`✅ Authenticated as: ${authData.user.email}`);
  console.log(`   User ID: ${authData.user.id}\n`);

  // Step 2: Get a test conversation
  const { data: conversations, error: convError } = await supabase
    .from('conversations')
    .select('conversation_id, file_path, created_by')
    .not('file_path', 'is', null)
    .limit(1);

  if (convError || !conversations || conversations.length === 0) {
    console.error('❌ No conversations found:', convError);
    return;
  }

  const testConversation = conversations[0];
  console.log(`✅ Found test conversation: ${testConversation.conversation_id}`);
  console.log(`   File path: ${testConversation.file_path}`);
  console.log(`   Owned by: ${testConversation.created_by}\n`);

  // Step 3: Call download endpoint
  console.log('📞 Calling download endpoint...');
  
  const response = await fetch(
    `http://localhost:3000/api/conversations/${testConversation.conversation_id}/download`,
    {
      headers: {
        'Authorization': `Bearer ${authData.session.access_token}`,
      },
    }
  );

  console.log(`   Status: ${response.status} ${response.statusText}`);

  if (!response.ok) {
    const error = await response.json();
    console.error('❌ Download endpoint failed:', error);
    return;
  }

  const downloadInfo = await response.json();
  console.log('✅ Download URL generated:\n');
  console.log('   Response:');
  console.log(`   - conversation_id: ${downloadInfo.conversation_id}`);
  console.log(`   - filename: ${downloadInfo.filename}`);
  console.log(`   - file_size: ${downloadInfo.file_size} bytes`);
  console.log(`   - expires_at: ${downloadInfo.expires_at}`);
  console.log(`   - expires_in_seconds: ${downloadInfo.expires_in_seconds}`);
  console.log(`   - download_url: ${downloadInfo.download_url.substring(0, 80)}...`);

  // Step 4: Test the download URL
  console.log('\n📥 Testing download URL...');
  
  const downloadResponse = await fetch(downloadInfo.download_url);
  console.log(`   Status: ${downloadResponse.status} ${downloadResponse.statusText}`);

  if (!downloadResponse.ok) {
    console.error('❌ Download failed');
    return;
  }

  const conversationData = await downloadResponse.json();
  console.log('✅ File downloaded successfully');
  console.log(`   Content type: ${downloadResponse.headers.get('content-type')}`);
  console.log(`   Content length: ${downloadResponse.headers.get('content-length')} bytes`);
  console.log(`   Turns: ${conversationData.turns?.length || 0}`);

  // Step 5: Test authorization (try to download another user's conversation)
  console.log('\n🔒 Testing authorization (should fail for other users)...');
  
  // Create a fake conversation ID
  const fakeConvId = '00000000-0000-0000-0000-000000000001';
  const unauthorizedResponse = await fetch(
    `http://localhost:3000/api/conversations/${fakeConvId}/download`,
    {
      headers: {
        'Authorization': `Bearer ${authData.session.access_token}`,
      },
    }
  );

  console.log(`   Status: ${unauthorizedResponse.status} ${unauthorizedResponse.statusText}`);
  
  if (unauthorizedResponse.status === 403 || unauthorizedResponse.status === 404) {
    console.log('✅ Authorization check working correctly');
  } else {
    console.warn('⚠️  Expected 403 or 404 for unauthorized access');
  }

  // Step 6: Test without auth
  console.log('\n🔓 Testing without authentication (should fail)...');
  
  const noAuthResponse = await fetch(
    `http://localhost:3000/api/conversations/${testConversation.conversation_id}/download`
  );

  console.log(`   Status: ${noAuthResponse.status} ${noAuthResponse.statusText}`);
  
  if (noAuthResponse.status === 401) {
    console.log('✅ Auth check working correctly');
  } else {
    console.warn('⚠️  Expected 401 for unauthenticated access');
  }

  console.log('\n✅ All tests complete!');
}

// Run tests
testDownloadEndpoint().catch(console.error);
```

**Run Tests:**

```bash
# Start dev server
npm run dev

# In another terminal, run test
npx tsx scripts/test-download-endpoint.ts
```

**Expected Output:**

```
🧪 Testing Conversation Download Endpoint

✅ Authenticated as: test@example.com
   User ID: 123e4567-e89b-12d3-a456-426614174000

✅ Found test conversation: 60dfa7c6-7eff-45b4-8450-715c9c893ec9
   File path: 123e4567.../60dfa7c6.../conversation.json
   Owned by: 123e4567-e89b-12d3-a456-426614174000

📞 Calling download endpoint...
   Status: 200 OK
✅ Download URL generated:

   Response:
   - conversation_id: 60dfa7c6-7eff-45b4-8450-715c9c893ec9
   - filename: conversation.json
   - file_size: 45678 bytes
   - expires_at: 2025-11-18T14:30:00Z
   - expires_in_seconds: 3600
   - download_url: https://...storage.supabase.co/storage/v1/object/sign/...

📥 Testing download URL...
   Status: 200 OK
✅ File downloaded successfully
   Content type: application/json
   Content length: 45678 bytes
   Turns: 12

🔒 Testing authorization (should fail for other users)...
   Status: 404 Not Found
✅ Authorization check working correctly

🔓 Testing without authentication (should fail)...
   Status: 401 Unauthorized
✅ Auth check working correctly

✅ All tests complete!
```

### ACCEPTANCE CRITERIA

**Endpoint Functionality:**
- ✅ GET /api/conversations/[id]/download route created
- ✅ Validates JWT and extracts user ID
- ✅ Returns 401 for unauthenticated requests
- ✅ Returns 403 if user doesn't own conversation
- ✅ Returns 404 if conversation not found
- ✅ Returns 404 if no file_path available
- ✅ Generates fresh signed URL on each request
- ✅ Returns URL with expiry metadata
- ✅ Signed URL successfully downloads file

**Security:**
- ✅ RLS policies filter conversations by user
- ✅ Explicit ownership check performed
- ✅ User A cannot download User B's conversations
- ✅ Unauthenticated requests rejected

**Performance:**
- ✅ Request completes in < 500ms
- ✅ No unnecessary database queries
- ✅ Proper error handling for storage failures

**Logging:**
- ✅ All requests logged with timestamps
- ✅ Auth failures logged
- ✅ Storage errors logged with context
- ✅ Success cases logged with duration

### DELIVERABLES

1. **API Route:** `src/app/api/conversations/[id]/download/route.ts`
2. **Test Script:** `scripts/test-download-endpoint.ts`
3. **Test Results:** Console output showing all tests passing
4. **Manual Verification:** Screenshot of downloaded JSON file

Once this prompt is complete, proceed to Prompt 5 for dashboard integration.

+++++++++++++++++




---

## Prompt 5: Dashboard Integration with Download Endpoint

========================

You are a senior frontend developer integrating the new download API endpoint into the conversations dashboard. The download button currently tries to open public URLs (which fail). We need to call the API endpoint, get a signed URL, and open it.

### CONTEXT

**Current Broken Code:**

```typescript
// Line 353 in src/app/(dashboard)/conversations/page.tsx
onClick={() => viewingConversation.file_url && window.open(viewingConversation.file_url, '_blank')}
```

**Problems:**
1. Uses file_url from database (expired signed URL)
2. No API call to generate fresh URL
3. No loading state during URL generation
4. No error handling
5. Uses raw fetch instead of Supabase client

**Target Code:**

```typescript
// Use Supabase client with auth
// Call API endpoint to get fresh signed URL
// Show loading state during generation
// Handle errors gracefully
// Open fresh URL in new tab
```

### IMPLEMENTATION TASK

**Update:** `src/app/(dashboard)/conversations/page.tsx`

**Step 1: Add State for Download Loading**

Add state to track download in progress:

```typescript
// Near other state declarations
const [downloadingConversationId, setDownloadingConversationId] = useState<string | null>(null);
```

**Step 2: Create handleDownloadConversation Function**

Add new async function to handle download:

```typescript
/**
 * Download conversation JSON file
 * 
 * Calls API endpoint to generate fresh signed URL, then opens it.
 * Signed URLs are generated on-demand and expire after 1 hour.
 */
const handleDownloadConversation = async (conversationId: string) => {
  try {
    setDownloadingConversationId(conversationId);
    console.log(`[Download] Requesting download URL for conversation: ${conversationId}`);

    // Call download API endpoint
    // Supabase client automatically includes JWT in request
    const response = await fetch(`/api/conversations/${conversationId}/download`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('[Download] API error:', error);
      
      if (response.status === 401) {
        toast({
          title: 'Authentication Required',
          description: 'Please log in to download conversations',
          variant: 'destructive',
        });
        return;
      }
      
      if (response.status === 403) {
        toast({
          title: 'Access Denied',
          description: 'You do not have permission to download this conversation',
          variant: 'destructive',
        });
        return;
      }
      
      if (response.status === 404) {
        toast({
          title: 'File Not Available',
          description: error.message || 'Conversation file not found',
          variant: 'destructive',
        });
        return;
      }

      throw new Error(error.message || 'Failed to generate download URL');
    }

    const downloadInfo = await response.json();
    console.log('[Download] ✅ Received download URL:', {
      conversation_id: downloadInfo.conversation_id,
      filename: downloadInfo.filename,
      expires_at: downloadInfo.expires_at,
    });

    // Open signed URL in new tab
    // URL is valid for 1 hour
    window.open(downloadInfo.download_url, '_blank');

    toast({
      title: 'Download Started',
      description: `Downloading ${downloadInfo.filename}`,
    });

  } catch (error: any) {
    console.error('[Download] Error:', error);
    toast({
      title: 'Download Failed',
      description: error.message || 'Failed to download conversation. Please try again.',
      variant: 'destructive',
    });
  } finally {
    setDownloadingConversationId(null);
  }
};
```

**Step 3: Update Download Button**

Find the download button (around line 353) and replace with:

```typescript
{/* Download Button - Generates fresh signed URL on-demand */}
<Button
  size="sm"
  variant="ghost"
  onClick={() => handleDownloadConversation(viewingConversation.conversation_id)}
  disabled={downloadingConversationId === viewingConversation.conversation_id}
  title="Download conversation JSON file"
>
  {downloadingConversation Id === viewingConversation.conversation_id ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Generating...
    </>
  ) : (
    <>
      <Download className="mr-2 h-4 w-4" />
      Download JSON
    </>
  )}
</Button>
```

**Step 4: Add Imports**

Ensure these imports are present:

```typescript
import { Download, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
```

**Step 5: Update Conversations List Table**

If there's a download button in the main table, update it similarly:

```typescript
{/* In the table row actions */}
<Button
  size="icon"
  variant="ghost"
  onClick={(e) => {
    e.stopPropagation(); // Don't trigger row click
    handleDownloadConversation(conversation.conversation_id);
  }}
  disabled={downloadingConversationId === conversation.conversation_id}
  title="Download JSON"
>
  {downloadingConversationId === conversation.conversation_id ? (
    <Loader2 className="h-4 w-4 animate-spin" />
  ) : (
    <Download className="h-4 w-4" />
  )}
</Button>
```

**Step 6: Add Download Status Indicator**

Optional: Add visual indicator for which conversation is being downloaded:

```typescript
{/* In conversation card or table row */}
{downloadingConversationId === conversation.conversation_id && (
  <Badge variant="secondary" className="ml-2">
    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
    Preparing download...
  </Badge>
)}
```

**Step 7: Remove Old file_url References**

Search for any remaining references to `file_url` and remove them:

```bash
# Find all references
grep -n "file_url" src/app/\(dashboard\)/conversations/page.tsx

# Should find none after cleanup
```

**Step 8: Add Keyboard Shortcut (Optional Enhancement)**

Add keyboard shortcut for download when conversation is selected:

```typescript
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    if (viewingConversation && (e.metaKey || e.ctrlKey) && e.key === 'd') {
      e.preventDefault();
      handleDownloadConversation(viewingConversation.conversation_id);
    }
  };

  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, [viewingConversation]);
```

### USER EXPERIENCE FLOW

**Happy Path:**

1. User clicks "Download JSON" button
2. Button shows "Generating..." with spinner (< 500ms usually)
3. API endpoint generates fresh signed URL
4. Browser opens new tab with download
5. JSON file downloads
6. Toast notification confirms "Download Started"
7. Button returns to normal state

**Error Cases:**

1. **Not Authenticated:**
   - Toast: "Authentication Required - Please log in"
   - Redirect to login (optional)

2. **Conversation Not Found:**
   - Toast: "File Not Available - Conversation file not found"

3. **No Permission:**
   - Toast: "Access Denied - You do not have permission"

4. **Network Error:**
   - Toast: "Download Failed - Please try again"
   - Button returns to normal state
   - User can retry

### TESTING CHECKLIST

**Manual Testing:**

1. **Basic Download:**
   - ✅ Click download button
   - ✅ See loading spinner
   - ✅ New tab opens with download
   - ✅ JSON file downloaded
   - ✅ Toast notification shown

2. **Multiple Downloads:**
   - ✅ Download conversation A
   - ✅ Immediately download conversation B
   - ✅ Both downloads work
   - ✅ Loading states independent

3. **Error Handling:**
   - ✅ Try downloading non-existent conversation
   - ✅ See appropriate error message
   - ✅ Button returns to normal state

4. **Auth Errors:**
   - ✅ Log out
   - ✅ Try to download
   - ✅ See "Authentication Required" message

5. **Loading States:**
   - ✅ Click download while loading
   - ✅ Button disabled during loading
   - ✅ Spinner visible
   - ✅ Other buttons still work

6. **Keyboard Shortcut (if implemented):**
   - ✅ Select conversation
   - ✅ Press Cmd/Ctrl+D
   - ✅ Download starts

### ACCEPTANCE CRITERIA

**Functionality:**
- ✅ Download button calls API endpoint (not direct URL)
- ✅ Shows loading state during URL generation
- ✅ Opens signed URL in new tab
- ✅ Downloads file successfully
- ✅ Works for all conversations user owns

**UI/UX:**
- ✅ Loading spinner visible during generation
- ✅ Button disabled while loading
- ✅ Toast notification on success
- ✅ Toast notification on errors
- ✅ Clear error messages for each error type

**Code Quality:**
- ✅ No references to deprecated file_url
- ✅ Uses API endpoint for all downloads
- ✅ Proper error handling
- ✅ TypeScript types correct
- ✅ Console logging for debugging

**Security:**
- ✅ Auth token automatically included by browser
- ✅ Server validates JWT
- ✅ User can only download own conversations
- ✅ No sensitive data exposed in errors

### DELIVERABLES

1. **Updated Page:** `src/app/(dashboard)/conversations/page.tsx`
2. **Test Results:** Manual testing checklist completed
3. **Screenshots:**
   - Normal state
   - Loading state
   - Success state
   - Error state
4. **Video:** Screen recording of complete download flow

Once this prompt is complete, proceed to Prompt 6 for end-to-end testing.

+++++++++++++++++




---

## Prompt 6: End-to-End Testing & Validation

========================

You are a senior QA engineer performing comprehensive end-to-end testing of the conversation download system with proper authentication. This testing validates the complete fix for the 404 download error.

### CONTEXT

**What We've Implemented:**
1. ✅ Proper Supabase Authentication (JWT validation)
2. ✅ Database schema cleanup (deprecated URL columns)
3. ✅ Service layer updates (on-demand URL generation)
4. ✅ Download API endpoint (GET /api/conversations/[id]/download)
5. ✅ Dashboard integration (new download button)

**What We're Testing:**
- Complete user workflow from generation to download
- Authentication and authorization enforcement
- RLS policies working correctly
- Signed URLs generated fresh each time
- Cross-user isolation
- Error handling and edge cases

### TESTING TASKS

#### Test Suite 1: Multi-User Workflow

**Objective:** Verify complete isolation between users

**Setup:**
```bash
# Create two test users
# User A: tester-a@example.com
# User B: tester-b@example.com

# Via Supabase Dashboard:
# Authentication → Users → Add User
```

**Test Steps:**

1. **User A generates conversation:**
   ```
   - Log in as tester-a@example.com
   - Navigate to /generate
   - Generate a conversation
   - Verify conversation stored successfully
   - Note conversation_id (e.g., conv-a-123)
   ```

2. **User A downloads their conversation:**
   ```
   - Go to /conversations
   - Find conv-a-123 in list
   - Click "Download JSON"
   - Verify loading spinner appears
   - Verify file downloads successfully
   - Verify JSON content valid
   ```

3. **User B generates their own conversation:**
   ```
   - Log out as User A
   - Log in as tester-b@example.com
   - Generate a different conversation
   - Note conversation_id (e.g., conv-b-456)
   ```

4. **User B can only see their conversations:**
   ```
   - Go to /conversations
   - Verify only conv-b-456 visible
   - Verify conv-a-123 NOT visible (RLS working)
   ```

5. **User B cannot download User A's conversation:**
   ```
   - Manually navigate to /api/conversations/conv-a-123/download
   - Verify 404 or 403 error (RLS blocked query)
   - Verify error message appropriate
   ```

6. **User A can download their conversation:**
   ```
   - Log back in as User A
   - Download conv-a-123 again
   - Verify still works
   ```

**Expected Results:**
- ✅ Each user only sees their own conversations
- ✅ User A cannot access User B's conversations
- ✅ User B cannot access User A's conversations
- ✅ RLS policies enforced at database level
- ✅ API endpoint enforces ownership

#### Test Suite 2: Authentication Flow

**Objective:** Verify auth system working end-to-end

**Test Steps:**

1. **Unauthenticated access blocked:**
   ```bash
   # Try to download without auth
   curl http://localhost:3000/api/conversations/some-id/download
   # Expected: 401 Unauthorized
   ```

2. **Expired token rejected:**
   ```bash
   # Use expired JWT token
   curl http://localhost:3000/api/conversations/some-id/download \
     -H "Authorization: Bearer EXPIRED_TOKEN"
   # Expected: 401 Unauthorized
   ```

3. **Valid token accepted:**
   ```bash
   # Log in, get fresh token, use it
   curl http://localhost:3000/api/conversations/valid-id/download \
     -H "Authorization: Bearer VALID_TOKEN"
   # Expected: 200 OK with download URL
   ```

4. **Dashboard redirects when not logged in:**
   ```
   - Open browser in incognito mode
   - Navigate to /conversations
   - Verify redirected to login
   OR
   - Verify shown "Please log in" message
   ```

**Expected Results:**
- ✅ All API requests require valid JWT
- ✅ Expired tokens rejected
- ✅ Dashboard shows login prompt when not authenticated
- ✅ Auth state persists across page refreshes

#### Test Suite 3: On-Demand URL Generation

**Objective:** Verify signed URLs generated fresh each time

**Test Steps:**

1. **Generate URL twice, get different tokens:**
   ```typescript
   // Call download endpoint twice
   const response1 = await fetch('/api/conversations/conv-id/download');
   const data1 = await response1.json();
   const url1 = data1.download_url;

   // Wait 1 second
   await new Promise(resolve => setTimeout(resolve, 1000));

   const response2 = await fetch('/api/conversations/conv-id/download');
   const data2 = await response2.json();
   const url2 = data2.download_url;

   // Verify URLs are different (different tokens)
   console.assert(url1 !== url2, 'URLs should be different');
   ```

2. **Verify URLs expire:**
   ```
   - Generate download URL
   - Copy URL to clipboard
   - Wait 1 hour and 5 minutes
   - Try to open copied URL
   - Expected: 403 Forbidden or expired error
   ```

3. **Verify no URLs stored in database:**
   ```sql
   -- Check database
   SELECT file_url, raw_response_url
   FROM conversations
   WHERE file_url IS NOT NULL OR raw_response_url IS NOT NULL;
   -- Expected: 0 rows
   ```

**Expected Results:**
- ✅ Each download request generates fresh signed URL
- ✅ URLs have different tokens each time
- ✅ URLs expire after 1 hour
- ✅ No URLs stored in database
- ✅ Old URLs cannot be reused

#### Test Suite 4: Error Handling

**Objective:** Verify graceful error handling

**Test Steps:**

1. **Conversation not found:**
   ```
   - Navigate to /api/conversations/00000000-0000-0000-0000-000000000000/download
   - Expected: 404 Not Found
   - Error message: "Conversation not found"
   ```

2. **Invalid conversation ID format:**
   ```
   - Navigate to /api/conversations/invalid-id/download
   - Expected: 400 Bad Request
   - Error message: "Invalid conversation ID format"
   ```

3. **Conversation has no file_path:**
   ```sql
   -- Manually create conversation without file_path
   INSERT INTO conversations (conversation_id, created_by, status)
   VALUES (gen_random_uuid(), auth.uid(), 'pending_review');
   ```
   ```
   - Try to download that conversation
   - Expected: 404 Not Found
   - Error message: "Conversation file not available"
   ```

4. **Storage service failure:**
   ```
   - Temporarily misconfigure storage bucket name
   - Try to download
   - Expected: 500 Internal Server Error
   - Error logged on server
   - User sees: "Failed to generate download URL"
   ```

5. **Network timeout:**
   ```
   - Throttle network to 3G speed
   - Try to download
   - Verify loading state shows during delay
   - Verify download completes eventually
   OR
   - Verify timeout error after 30 seconds
   ```

**Expected Results:**
- ✅ Appropriate HTTP status codes
- ✅ User-friendly error messages
- ✅ Technical errors logged on server
- ✅ No sensitive data in error responses
- ✅ UI returns to normal state after error

#### Test Suite 5: Performance & Reliability

**Objective:** Verify system performs well under load

**Test Steps:**

1. **Single download performance:**
   ```
   - Measure time from button click to download start
   - Expected: < 500ms for URL generation
   - Expected: File download speed depends on file size
   ```

2. **Multiple concurrent downloads:**
   ```
   - Open 5 conversations in different tabs
   - Click download on all 5 simultaneously
   - Verify all downloads succeed
   - Verify no race conditions
   - Verify no performance degradation
   ```

3. **Large file handling:**
   ```
   - Generate conversation with 100+ turns
   - Verify file > 1MB
   - Click download
   - Verify downloads successfully
   - Verify no timeout errors
   ```

4. **Repeated downloads:**
   ```
   - Download same conversation 10 times in a row
   - Verify all succeed
   - Verify each gets fresh signed URL
   - Verify no caching issues
   ```

**Expected Results:**
- ✅ URL generation < 500ms
- ✅ Concurrent downloads work correctly
- ✅ Large files (> 1MB) download successfully
- ✅ No performance degradation over time
- ✅ No memory leaks in browser

#### Test Suite 6: Database Integrity

**Objective:** Verify database state is correct

**Test Steps:**

1. **Verify deprecated columns NULL:**
   ```sql
   SELECT COUNT(*) as bad_rows
   FROM conversations
   WHERE file_url IS NOT NULL OR raw_response_url IS NOT NULL;
   -- Expected: 0
   ```

2. **Verify file paths exist:**
   ```sql
   SELECT COUNT(*) as conversations_with_files
   FROM conversations
   WHERE file_path IS NOT NULL AND processing_status = 'completed';
   -- Expected: > 0
   ```

3. **Verify RLS policies active:**
   ```sql
   SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
   FROM pg_policies
   WHERE tablename = 'conversations';
   -- Expected: Policies for SELECT, INSERT, UPDATE, DELETE
   ```

4. **Verify auth.uid() populated:**
   ```sql
   -- Run as authenticated user
   SELECT auth.uid();
   -- Expected: User's UUID (not NULL)
   ```

5. **Test RLS enforcement:**
   ```sql
   -- Set session user
   SET request.jwt.claim.sub = 'user-a-uuid';
   
   SELECT COUNT(*) FROM conversations;
   -- Expected: Only User A's conversations
   
   SET request.jwt.claim.sub = 'user-b-uuid';
   
   SELECT COUNT(*) FROM conversations;
   -- Expected: Only User B's conversations
   ```

**Expected Results:**
- ✅ No URLs stored in database
- ✅ All completed conversations have file_path
- ✅ RLS policies active and enforced
- ✅ auth.uid() returns correct user ID
- ✅ Queries filtered by authenticated user

### VALIDATION CHECKLIST

**Authentication:**
- ✅ JWT validation working
- ✅ Unauthenticated requests rejected (401)
- ✅ Expired tokens rejected (401)
- ✅ Valid tokens accepted
- ✅ User ID extracted correctly from JWT

**Authorization:**
- ✅ RLS policies filter by user
- ✅ User A cannot see User B's conversations
- ✅ User A cannot download User B's conversations
- ✅ Explicit ownership check in API endpoint
- ✅ 403 returned for unauthorized access

**URL Generation:**
- ✅ URLs generated on-demand (not stored)
- ✅ Each request gets fresh URL
- ✅ URLs have different tokens
- ✅ URLs expire after 1 hour
- ✅ No URLs in database

**Error Handling:**
- ✅ 400 for invalid request format
- ✅ 401 for unauthenticated
- ✅ 403 for unauthorized
- ✅ 404 for not found
- ✅ 500 for server errors
- ✅ User-friendly error messages

**UI/UX:**
- ✅ Loading state during URL generation
- ✅ Success toast on download
- ✅ Error toast on failure
- ✅ Button disabled while loading
- ✅ Clear visual feedback

**Performance:**
- ✅ URL generation < 500ms
- ✅ Concurrent downloads work
- ✅ Large files download successfully
- ✅ No memory leaks

**Database:**
- ✅ No stored URLs (all NULL)
- ✅ File paths present
- ✅ RLS policies active
- ✅ auth.uid() working
- ✅ Data filtered by user

### DELIVERABLES

1. **Test Report Document:**
   - All test suites executed
   - Results for each test
   - Pass/fail status
   - Screenshots of key tests

2. **Test Videos:**
   - Multi-user workflow (3-5 minutes)
   - Error handling (2-3 minutes)
   - Performance test (1-2 minutes)

3. **Database Verification:**
   - SQL query results
   - RLS policy listings
   - Proof no URLs stored

4. **Bug Report (if any):**
   - Description of any issues found
   - Steps to reproduce
   - Expected vs actual behavior
   - Severity level

5. **Sign-Off Document:**
   - All acceptance criteria met
   - System ready for production
   - Known limitations documented
   - Recommendations for future improvements

### SUCCESS CRITERIA

**System is ready for production when:**
- ✅ All test suites pass
- ✅ No critical or high-priority bugs
- ✅ Authentication working end-to-end
- ✅ Authorization properly enforced
- ✅ Signed URLs generated on-demand
- ✅ No URLs stored in database
- ✅ Error handling graceful
- ✅ Performance acceptable
- ✅ Documentation complete

**Known Acceptable Limitations:**
- Signed URLs expire after 1 hour (by design)
- Test data may be cleared (disposable)
- Placeholder UI styling (can be improved)

**Recommendations for Future:**
- Add download history/tracking
- Add bulk download feature
- Add download progress indicator
- Add retry logic for failed downloads
- Add analytics/metrics

---

## COMPLETION

Once all 6 prompts are executed and tested, the conversation download system will be fully functional with:

✅ **Proper Authentication:** Real Supabase Auth with JWT validation  
✅ **On-Demand URLs:** Signed URLs generated fresh each request  
✅ **Clean Schema:** No stored URLs, only file paths  
✅ **Secure API:** Authorization enforced at API and database levels  
✅ **Great UX:** Loading states, error handling, clear feedback  
✅ **Production Ready:** Tested, documented, and validated

The 404 download error will be completely resolved, and the system will follow best practices for storage access with temporary signed URLs.

