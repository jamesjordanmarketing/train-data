# Conversation Download API Endpoint - Implementation Specification v2

**Project:** Bright Run LoRA Training Data Platform  
**Module:** Conversation Storage & Download  
**Version:** 2.0  
**Date:** November 18, 2025  
**Type:** API Endpoint Implementation + Authentication Fix  
**Priority:** HIGH - Blocks user workflow

---

## Executive Summary

This specification details the implementation of a conversation download API endpoint (`GET /api/conversations/[id]/download`) that resolves the current 404 storage bucket access error. **Critically, this spec also addresses the broken authentication system** that currently uses placeholder headers instead of proper Supabase Auth.

**Problem Statement:**
- Conversation generation working end-to-end ✅
- Files successfully stored in Supabase Storage ✅  
- Dashboard displays conversations correctly ✅
- **Download JSON button returns 404 error** ❌
- **Authentication system is placeholder/incomplete** ❌

**Root Causes:**
1. **Storage Access**: `conversation-files` bucket is private, code attempts public URLs
2. **Authentication**: Placeholder `x-user-id` header instead of real Supabase Auth
3. **RLS Policies**: Expect `auth.uid()` but system uses UUID strings
4. **URL Storage**: Current design stores URLs (wrong) instead of paths

**Solution Architecture:**

### 1. Storage Strategy: **On-Demand Signed URL Generation**

**NEVER store signed URLs** - they expire and become invalid.

**What We Store in Database:**
```sql
conversations table:
  - file_path (TEXT) - e.g., "00000000.../abc123.../conversation.json"
  - raw_response_path (TEXT) - e.g., "raw/00000000.../abc123.json"
  - file_url (TEXT) - DEPRECATED, will be NULL
  - storage_bucket (VARCHAR) - "conversation-files"
```

**What We Generate on Request:**
```typescript
// User clicks "Download" button
// → API endpoint receives conversation_id
// → Fetch conversation.file_path from database
// → Generate signed URL from file_path (1 hour expiry)
// → Return signed URL to client
// → Client opens signed URL
// → File downloads (signed URL valid for 1 hour)
```

### 2. Authentication Strategy: **Fix Placeholder Auth System**

**Current Broken State:**
- All API routes use `x-user-id` header (client can send any value)
- No session management or JWT validation
- RLS policies expect `auth.uid()` which doesn't exist
- All conversations created by system user: `00000000-0000-0000-0000-000000000000`

**Target Working State:**
- Use Supabase Auth with proper session management
- JWT token in Authorization header
- Server validates token and extracts real user ID
- RLS policies work correctly with `auth.uid()`
- Each user owns their conversations

---

## Critical Architecture Decisions

### Decision 1: URL Generation Timing

**ALWAYS generate signed URLs on-demand, NEVER store them.**

**Rationale:**
- Signed URLs expire (1 hour in our case)
- Storing expired URLs creates 404 errors
- On-demand generation ensures fresh, valid URLs
- Minimal performance overhead (< 100ms to generate)

**Implementation:**
```typescript
// ❌ WRONG - Never do this
const signedUrl = await supabase.storage.createSignedUrl(...);
await db.update({ file_url: signedUrl }); // Don't store!

// ✅ CORRECT - Store path, generate URL on request
await db.update({ file_path: 'path/to/file.json' }); // Store path

// Later, when user downloads:
const conversation = await db.get(id);
const signedUrl = await supabase.storage.createSignedUrl(
  conversation.file_path,
  3600 // Generate fresh URL
);
return { download_url: signedUrl };
```

### Decision 2: Authentication Approach

**Two Options:**

**Option A: Implement Real Supabase Auth (RECOMMENDED)**
- Use Supabase Auth with proper JWT validation
- Server-side session management
- RLS policies work correctly
- Multi-tenant security enforced
- Effort: Medium (2-3 hours)

**Option B: Continue with Placeholder Auth (NOT RECOMMENDED)**
- Keep `x-user-id` header approach
- Document as development-only
- RLS policies won't work
- Single-tenant assumption
- Effort: Low (no changes)

**This spec implements Option A** because:
1. RLS policies require `auth.uid()` to function
2. Signed URLs require proper authentication context
3. Production system needs real security
4. Test data is disposable (no backward compatibility needed)

### Decision 3: Database Schema Changes

**Changes Required:**
1. **Remove/Deprecate `file_url` column** - No longer storing URLs
2. **Keep `file_path` column** - Store storage paths only
3. **Keep `created_by` column** - Will store real user IDs (not system UUID)
4. **Update RLS policies** - Ensure they work with proper auth

---

## Authentication System Deep Dive

### Current State Analysis

**What's Actually Happening:**

1. **Client Side:**
   ```typescript
   // src/app/(dashboard)/conversations/page.tsx
   const response = await fetch('/api/conversations', {
     headers: {
       'x-user-id': '00000000-0000-0000-0000-000000000000' // Hardcoded!
     }
   });
   ```

2. **API Route:**
   ```typescript
   // src/app/api/conversations/route.ts
   const userId = request.headers.get('x-user-id') || 'test-user';
   // No validation, no session check, just trusts the header
   ```

3. **Database:**
   ```sql
   -- All conversations have same created_by
   SELECT created_by FROM conversations;
   -- Result: 00000000-0000-0000-0000-000000000000 (all rows)
   ```

4. **RLS Policies:**
   ```sql
   -- Policy expects auth.uid() which doesn't exist
   CREATE POLICY "Users can view own conversations"
     ON conversations FOR SELECT
     USING (auth.uid() = created_by);
   
   -- This policy NEVER works because auth.uid() is NULL
   ```

**Why It's Broken:**
- No authentication middleware
- Client can impersonate any user by changing header
- RLS policies are bypassed (service role key ignores RLS)
- Security is completely open

### Target State: Proper Supabase Auth

**Flow:**

1. **User Login:**
   ```typescript
   // User authenticates via Supabase Auth
   const { data, error } = await supabase.auth.signInWithPassword({
     email: 'user@example.com',
     password: 'password'
   });
   // Supabase returns JWT token in session
   ```

2. **Client Requests:**
   ```typescript
   // Supabase client automatically includes JWT in requests
   const { data } = await supabase
     .from('conversations')
     .select('*'); // JWT sent in Authorization header
   ```

3. **Server Validation:**
   ```typescript
   // API route validates JWT and extracts user
   import { createServerSupabaseClient } from '@/lib/supabase-server';
   
   const supabase = createServerSupabaseClient(request);
   const { data: { user }, error } = await supabase.auth.getUser();
   
   if (!user) {
     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
   }
   
   // user.id is the real authenticated user ID
   ```

4. **RLS Enforcement:**
   ```sql
   -- Policy now works correctly
   CREATE POLICY "Users can view own conversations"
     ON conversations FOR SELECT
     USING (auth.uid() = created_by);
   
   -- auth.uid() extracts user ID from JWT, matches created_by
   ```

### Implementation Requirements

**For this spec to work, we must:**

1. ✅ **Verify Supabase Auth is configured** in project settings
2. ✅ **Create auth helper functions** for server-side validation
3. ✅ **Update all API routes** to validate JWT and extract user
4. ✅ **Test RLS policies** work with real user IDs
5. ✅ **Update frontend** to use Supabase client (not fetch with headers)

---

## Technical Requirements

### Database Schema

**Required Columns (Existing):**
```sql
conversations table:
  - id (UUID, PK) - Database primary key
  - conversation_id (UUID, UNIQUE) - Application identifier
  - file_path (TEXT) - Storage path, e.g., "user-id/conv-id/conversation.json"
  - raw_response_path (TEXT) - Raw file path, e.g., "raw/user-id/conv-id.json"
  - storage_bucket (VARCHAR) - Always "conversation-files"
  - created_by (UUID, FK) - User who created (will be real user ID)
  - created_at (TIMESTAMPTZ)
  - updated_at (TIMESTAMPTZ)
```

**Deprecated Columns (Set to NULL):**
```sql
  - file_url (TEXT) - DEPRECATED: Don't use, signed URLs expire
  - raw_response_url (TEXT) - DEPRECATED: Don't use, signed URLs expire
  - storage_url (TEXT) - DEPRECATED: Don't use
```

**Migration Required:**
```sql
-- Clean up deprecated URL columns
UPDATE conversations SET 
  file_url = NULL,
  raw_response_url = NULL,
  storage_url = NULL;

-- Add comment documenting deprecation
COMMENT ON COLUMN conversations.file_url IS 
  'DEPRECATED: Signed URLs expire. Use file_path and generate on-demand.';
```

### Service Layer Updates

**ConversationStorageService Changes:**

**REMOVE these methods (they encourage bad patterns):**
```typescript
// ❌ Don't provide methods that return stored URLs
async getConversation() {
  // Should NOT return file_url
}
```

**KEEP/UPDATE these methods:**
```typescript
class ConversationStorageService {
  /**
   * Get conversation with file path (NOT URL)
   */
  async getConversation(conversationId: string): Promise<{
    file_path: string;
    raw_response_path: string;
    // ... other fields but NOT file_url
  }>;

  /**
   * Generate fresh signed URL from path
   * ALWAYS call this on-demand, never cache result
   */
  async getPresignedDownloadUrl(filePath: string): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from('conversation-files')
      .createSignedUrl(filePath, 3600); // 1 hour

    if (error) {
      throw new Error(`Failed to generate signed URL: ${error.message}`);
    }

    return data.signedUrl; // Fresh URL, valid for 1 hour
  }

  /**
   * Convenience method: get conversation and generate signed URL
   */
  async getDownloadUrlForConversation(conversationId: string): Promise<{
    conversation_id: string;
    download_url: string; // Generated on-demand
    filename: string;
    expires_at: string;
  }> {
    const conversation = await this.getConversation(conversationId);
    
    if (!conversation.file_path) {
      throw new Error('No file path for conversation');
    }

    const signedUrl = await this.getPresignedDownloadUrl(conversation.file_path);
    
    return {
      conversation_id: conversationId,
      download_url: signedUrl,
      filename: conversation.file_path.split('/').pop() || 'conversation.json',
      expires_at: new Date(Date.now() + 3600000).toISOString()
    };
  }
}
```

### API Endpoint Specification

**Route:** `GET /api/conversations/[id]/download`  
**File:** `src/app/api/conversations/[id]/download/route.ts` (NEW)

#### Authentication Flow

```typescript
// 1. Extract and validate JWT from request
const supabase = createServerSupabaseClient(request);
const { data: { user }, error } = await supabase.auth.getUser();

if (!user) {
  return NextResponse.json(
    { error: 'Unauthorized', message: 'Please log in to download conversations' },
    { status: 401 }
  );
}

// 2. user.id is the authenticated user's ID
const authenticatedUserId = user.id;

// 3. Fetch conversation (RLS automatically filters by user)
const conversation = await service.getConversation(conversationId);

// 4. Verify user owns conversation (double-check beyond RLS)
if (conversation.created_by !== authenticatedUserId) {
  return NextResponse.json(
    { error: 'Forbidden', message: 'You do not own this conversation' },
    { status: 403 }
  );
}

// 5. Generate signed URL on-demand
const signedUrl = await service.getPresignedDownloadUrl(conversation.file_path);

// 6. Return temporary URL (valid 1 hour)
return NextResponse.json({
  conversation_id: conversationId,
  download_url: signedUrl, // Fresh, temporary URL
  expires_at: new Date(Date.now() + 3600000).toISOString()
});
```

#### Request

**Path Parameters:**
- `id` (UUID) - conversation_id

**Headers:**
- `Authorization: Bearer <jwt_token>` - Supabase auth token (automatic from client)

**Example:**
```http
GET /api/conversations/60dfa7c6-7eff-45b4-8450-715c9c893ec9/download
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Response

**Success (200 OK):**
```json
{
  "conversation_id": "60dfa7c6-7eff-45b4-8450-715c9c893ec9",
  "download_url": "https://...storage.../sign/conversation-files/path?token=xyz",
  "filename": "conversation.json",
  "file_size": 45678,
  "expires_at": "2025-11-18T14:30:00Z",
  "expires_in_seconds": 3600
}
```

**Key Points:**
- `download_url` is generated fresh on this request
- URL is valid for exactly 1 hour from generation
- URL includes JWT token for Supabase Storage access
- Client should use URL immediately (don't cache it)

**Error Responses:**

| Status | Error | Message | When |
|--------|-------|---------|------|
| 401 | Unauthorized | Please log in | No JWT or invalid JWT |
| 403 | Forbidden | You do not own this conversation | User doesn't own resource |
| 404 | Not Found | Conversation not found | Invalid conversation_id |
| 404 | Not Found | File path not found | No file_path in record |
| 500 | Internal Server Error | Failed to generate download URL | Storage error |

---

## Implementation Plan

### Prompt 1: Authentication System Setup (NEW)

**Scope:** Implement proper Supabase Auth throughout the application  
**Time Estimate:** 2-3 hours  
**Priority:** CRITICAL - Must be done first

**Files:**
- `src/lib/supabase-server.ts` (NEW) - Server-side auth helpers
- `src/lib/supabase-client.ts` (MODIFY) - Ensure client configured correctly
- `src/middleware.ts` (NEW or MODIFY) - Auth middleware for protected routes

**Implementation Steps:**
1. Verify Supabase Auth enabled in project
2. Create server-side auth helper functions
3. Create auth middleware for API routes
4. Test JWT extraction and validation
5. Verify RLS policies work with real user IDs

**Acceptance Criteria:**
- ✅ Can create authenticated Supabase client on server
- ✅ Can extract user from JWT token
- ✅ Returns 401 for requests without valid JWT
- ✅ RLS policies correctly filter data by user
- ✅ Test user can only see their own conversations

### Prompt 2: Database Schema Cleanup (NEW)

**Scope:** Remove URL storage, keep only file paths  
**Time Estimate:** 1 hour  
**Priority:** HIGH - Prevents future bugs

**Files:**
- `supabase/migrations/20251118_deprecate_url_columns.sql` (NEW)
- `src/lib/types/conversations.ts` (MODIFY) - Remove URL fields from types

**Implementation Steps:**
1. Create migration to NULL out deprecated URL columns
2. Add database comments documenting deprecation
3. Update TypeScript types to exclude deprecated fields
4. Verify nothing tries to read deprecated columns

**Acceptance Criteria:**
- ✅ All `file_url`, `raw_response_url`, `storage_url` columns set to NULL
- ✅ TypeScript types don't include deprecated fields
- ✅ No code references deprecated columns
- ✅ Database comments clearly mark deprecation

### Prompt 3: Service Layer Updates

**Scope:** Update ConversationStorageService for on-demand URL generation  
**Time Estimate:** 2 hours  
**Priority:** HIGH

**Files:**
- `src/lib/services/conversation-storage-service.ts` (MODIFY)

**Implementation Steps:**
1. Remove methods that return stored URLs
2. Ensure getConversation() returns file_path only
3. Update getPresignedDownloadUrl() with clear documentation
4. Add getDownloadUrlForConversation() convenience method
5. Add JSDoc warnings about never storing URLs

**Acceptance Criteria:**
- ✅ Service never returns stored URLs from database
- ✅ All URL generation happens on-demand
- ✅ Methods clearly documented with warnings
- ✅ getDownloadUrlForConversation() returns fresh URLs only

### Prompt 4: Download API Endpoint

**Scope:** Create download endpoint with proper auth and on-demand URLs  
**Time Estimate:** 2-3 hours  
**Priority:** HIGH

**Files:**
- `src/app/api/conversations/[id]/download/route.ts` (NEW)

**Implementation Steps:**
1. Create API route with proper auth middleware
2. Validate JWT and extract user
3. Fetch conversation with file_path
4. Verify user owns conversation
5. Generate fresh signed URL on-demand
6. Return temporary URL with expiry info

**Acceptance Criteria:**
- ✅ Endpoint validates JWT before processing
- ✅ Returns 401 for unauthenticated requests
- ✅ Returns 403 if user doesn't own conversation
- ✅ Generates fresh signed URL each time
- ✅ Never stores or caches signed URLs
- ✅ Returns expiry timestamp with URL

### Prompt 5: Dashboard Integration

**Scope:** Update dashboard to use Supabase client and new endpoint  
**Time Estimate:** 1-2 hours  
**Priority:** HIGH

**Files:**
- `src/app/(dashboard)/conversations/page.tsx` (MODIFY)

**Implementation Steps:**
1. Replace fetch() with Supabase client calls
2. Update download button to call new API endpoint
3. Add loading state during URL generation
4. Add error handling for auth failures
5. Test with real authenticated user

**Acceptance Criteria:**
- ✅ Dashboard uses Supabase client (not raw fetch)
- ✅ Auth token automatically included in requests
- ✅ Download button calls API endpoint
- ✅ Shows auth error if not logged in
- ✅ Loading indicator during URL generation
- ✅ Works only for conversations user owns

### Prompt 6: End-to-End Testing & Validation

**Scope:** Comprehensive testing with real auth  
**Time Estimate:** 2-3 hours  
**Priority:** HIGH

**Implementation Steps:**
1. Create test user accounts
2. Test complete workflow with auth
3. Verify RLS policies work
4. Test cross-user isolation
5. Document any remaining issues

**Acceptance Criteria:**
- ✅ User A can only see their conversations
- ✅ User A cannot download User B's conversations
- ✅ Signed URLs work and expire correctly
- ✅ No stored URLs in database
- ✅ Auth flows through entire pipeline

---

## Prompt 1: Authentication System Setup

========================

You are a senior full-stack developer implementing proper Supabase Authentication for the Bright Run LoRA Training Data Platform. **This is a critical prerequisite** - the current system uses placeholder auth headers which breaks RLS policies and security.

### CONTEXT

**Current Broken State:**

The application currently uses a placeholder authentication system with hardcoded headers:

```typescript
// Client sends arbitrary user ID in header
fetch('/api/conversations', {
  headers: { 'x-user-id': '00000000-0000-0000-0000-000000000000' }
});

// Server trusts whatever client sends
const userId = request.headers.get('x-user-id') || 'test-user';
```

**Why This Breaks Everything:**

1. **No Security**: Client can impersonate any user
2. **RLS Doesn't Work**: Policies expect `auth.uid()` from JWT, not header string
3. **Signed URLs Fail**: Supabase Storage needs proper auth context
4. **Single User**: All conversations created by system user UUID

**What We're Implementing:**

Proper Supabase Authentication with:
- JWT token validation
- Server-side user extraction
- RLS policies that actually work
- Multi-tenant security

### IMPLEMENTATION TASK

**Step 1: Verify Supabase Auth Configuration**

First, check that Supabase Auth is enabled:

1. Go to Supabase Dashboard → Authentication → Settings
2. Verify Email provider is enabled
3. Verify JWT Secret is configured
4. Note the JWT expiry settings

If not configured, enable it now.

**Step 2: Create Server-Side Auth Helper**

Create `src/lib/supabase-server.ts`:

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Create Supabase client for Server Components
 * Automatically handles cookie-based auth
 */
export function createServerSupabaseClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // Called from Server Component, ignore
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // Called from Server Component, ignore
          }
        },
      },
    }
  );
}

/**
 * Create Supabase client for API Routes
 * Handles both cookies and Authorization header
 */
export function createServerSupabaseClientFromRequest(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  return { supabase, response };
}

/**
 * Get authenticated user from request
 * Returns user object or null if not authenticated
 */
export async function getAuthenticatedUser(request: NextRequest) {
  const { supabase } = createServerSupabaseClientFromRequest(request);
  
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

/**
 * Require authenticated user or return 401 response
 * Use in API routes that need authentication
 */
export async function requireAuth(request: NextRequest) {
  const user = await getAuthenticatedUser(request);

  if (!user) {
    return {
      user: null,
      response: NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Please log in to access this resource',
        },
        { status: 401 }
      ),
    };
  }

  return { user, response: null };
}
```

**Step 3: Update Client-Side Supabase Configuration**

Verify `src/lib/supabase-client.ts` (or create if missing):

```typescript
import { createBrowserClient } from '@supabase/ssr';

export function createClientSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Singleton instance for client-side use
let supabaseClient: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createClientSupabaseClient();
  }
  return supabaseClient;
}
```

**Step 4: Create Auth Context Provider (Optional but Recommended)**

Create `src/contexts/AuthContext.tsx`:

```typescript
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { getSupabaseClient } from '@/lib/supabase-client';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = getSupabaseClient();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

**Step 5: Add Auth Middleware for Protected Routes**

Create `src/middleware.ts`:

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // Refresh session if needed
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

**Step 6: Create Test Users**

For testing, create test user accounts:

```bash
# Option 1: Via Supabase Dashboard
# Go to Authentication → Users → Add User
# Email: test@example.com
# Password: TestPassword123!
# Auto Confirm: Yes

# Option 2: Via API
curl -X POST 'https://YOUR_PROJECT.supabase.co/auth/v1/signup' \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!"
  }'
```

**Step 7: Test Authentication**

Create test file `src/app/api/test-auth/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  const { user, response } = await requireAuth(request);

  if (response) {
    return response; // 401 Unauthorized
  }

  return NextResponse.json({
    message: 'Authentication successful!',
    user: {
      id: user!.id,
      email: user!.email,
    },
  });
}
```

Test it:
```bash
# Should return 401 (not authenticated)
curl http://localhost:3000/api/test-auth

# Log in via browser, get JWT from DevTools → Application → Cookies
# Copy the sb-*-auth-token cookie value

# Test with JWT
curl http://localhost:3000/api/test-auth \
  -H "Cookie: sb-xxx-auth-token=YOUR_JWT_TOKEN"

# Should return 200 with user info
```

### ACCEPTANCE CRITERIA

**Server-Side Auth:**
- ✅ createServerSupabaseClient() creates client with cookie handling
- ✅ getAuthenticatedUser() extracts user from JWT
- ✅ requireAuth() returns 401 for unauthenticated requests
- ✅ requireAuth() returns user object for authenticated requests

**Client-Side Auth:**
- ✅ getSupabaseClient() returns configured client
- ✅ AuthProvider tracks auth state
- ✅ useAuth() hook provides user and loading state

**Middleware:**
- ✅ Middleware refreshes auth session on each request
- ✅ Cookies updated correctly
- ✅ No auth errors in console

**Testing:**
- ✅ Can create test user via Supabase Dashboard
- ✅ Can log in with test credentials
- ✅ JWT token stored in cookies
- ✅ /api/test-auth returns 401 when not logged in
- ✅ /api/test-auth returns 200 when logged in
- ✅ user.id matches user UUID in Supabase

**RLS Verification:**
- ✅ Can query database with authenticated client
- ✅ RLS policies correctly filter by auth.uid()
- ✅ User can only see their own data

### DELIVERABLES

1. **Source Files:**
   - `src/lib/supabase-server.ts` - Server auth helpers
   - `src/lib/supabase-client.ts` - Client configuration
   - `src/contexts/AuthContext.tsx` - React auth context
   - `src/middleware.ts` - Auth middleware
   - `src/app/api/test-auth/route.ts` - Test endpoint

2. **Test Results:**
   - Screenshot of test user created in Supabase Dashboard
   - Console output showing successful JWT extraction
   - Browser DevTools showing JWT cookie
   - Test endpoint returning correct user info

3. **Documentation:**
   - Comment in code explaining auth flow
   - README section on how to create test users

Once this prompt is complete and auth is working, proceed to Prompt 2 for database cleanup.

+++++++++++++++++




---

## Prompt 2: Database Schema Cleanup

========================

You are a senior full-stack developer cleaning up the conversation storage schema to properly support on-demand signed URL generation. **Critical: We must never store signed URLs in the database** as they expire.

### CONTEXT

**Problem:**
The current database schema has columns for storing URLs (`file_url`, `raw_response_url`, `storage_url`) which leads to storing expired signed URLs, causing 404 errors.

**Solution:**
- Deprecate all URL storage columns
- Keep only file path columns
- Update types to prevent accidental URL storage
- Document the pattern clearly

### IMPLEMENTATION TASK

**Step 1: Create Migration to Deprecate URL Columns**

Create `supabase/migrations/20251118_deprecate_url_columns.sql`:

```sql
-- Migration: Deprecate URL Storage Columns
-- Date: 2025-11-18
-- Purpose: Remove stored URLs, keep only file paths for on-demand signed URL generation
-- 
-- CRITICAL: Signed URLs expire. We must NEVER store them in the database.
-- Instead:
--   - Store file_path (e.g., "user-id/conv-id/conversation.json")
--   - Generate signed URLs on-demand when user requests download
--   - Signed URLs valid for 1 hour, then expire

BEGIN;

-- Clear all stored URLs (they're expired anyway)
UPDATE conversations SET 
  file_url = NULL,
  raw_response_url = NULL
WHERE file_url IS NOT NULL OR raw_response_url IS NOT NULL;

-- Add comments documenting why these columns are deprecated
COMMENT ON COLUMN conversations.file_url IS 
  'DEPRECATED (2025-11-18): Signed URLs expire after 1 hour. Use file_path and generate signed URLs on-demand via ConversationStorageService.getPresignedDownloadUrl()';

COMMENT ON COLUMN conversations.raw_response_url IS 
  'DEPRECATED (2025-11-18): Signed URLs expire after 1 hour. Use raw_response_path and generate signed URLs on-demand via ConversationStorageService.getPresignedDownloadUrl()';

-- Add comments documenting correct usage
COMMENT ON COLUMN conversations.file_path IS 
  'Storage path relative to conversation-files bucket. Used to generate signed URLs on-demand. Example: "00000000-0000-0000-0000-000000000000/abc123.../conversation.json"';

COMMENT ON COLUMN conversations.raw_response_path IS 
  'Storage path for raw Claude response. Used to generate signed URLs on-demand. Example: "raw/00000000-0000-0000-0000-000000000000/abc123.json"';

-- Log migration
INSERT INTO schema_migrations (version, description, applied_at)
VALUES 
  ('20251118_deprecate_url_columns', 'Deprecate URL storage columns, use file paths only', NOW())
ON CONFLICT (version) DO NOTHING;

COMMIT;

-- Verify migration
SELECT 
  table_name,
  column_name,
  col_description((table_name::regclass)::oid, ordinal_position) as comment
FROM information_schema.columns
WHERE table_name = 'conversations'
  AND column_name IN ('file_url', 'raw_response_url', 'file_path', 'raw_response_path')
ORDER BY column_name;
```

**Step 2: Update TypeScript Types**

Update `src/lib/types/conversations.ts` to remove deprecated URL fields:

```typescript
/**
 * Storage-enabled conversation record matching database schema
 * 
 * CRITICAL: This type does NOT include deprecated URL fields (file_url, raw_response_url)
 * because signed URLs expire. Always use file_path and generate URLs on-demand.
 */
export interface StorageConversation {
  id: string;
  conversation_id: string;

  // Scaffolding references
  persona_id: string | null;
  emotional_arc_id: string | null;
  training_topic_id: string | null;
  template_id: string | null;

  // Metadata
  conversation_name: string | null;
  description: string | null;
  turn_count: number;
  tier: 'template' | 'scenario' | 'edge_case';

  // Quality scores
  quality_score: number | null;

  // Processing status
  status: 'pending_review' | 'approved' | 'rejected' | 'archived';
  processing_status: 'queued' | 'processing' | 'completed' | 'failed';

  // File storage - PATHS ONLY, NEVER URLS
  /**
   * Storage path for final conversation JSON
   * Use ConversationStorageService.getPresignedDownloadUrl(file_path) to get download URL
   */
  file_path: string | null;
  
  /**
   * Storage path for raw Claude API response
   * Use ConversationStorageService.getPresignedDownloadUrl(raw_response_path) to get download URL
   */
  raw_response_path: string | null;
  
  file_size: number | null;
  storage_bucket: string; // Always "conversation-files"

  // DEPRECATED FIELDS - Removed from type to prevent usage
  // file_url: REMOVED - signed URLs expire, use file_path + generate on-demand
  // raw_response_url: REMOVED - signed URLs expire, use raw_response_path + generate on-demand
  // storage_url: REMOVED - deprecated

  // Raw response storage (for zero data loss)
  raw_response_size: number | null;
  raw_stored_at: string | null;
  parse_attempts: number;
  last_parse_attempt_at: string | null;
  parse_error_message: string | null;
  parse_method_used: string | null;
  requires_manual_review: boolean;

  // Audit
  created_by: string | null;
  created_at: string;
  updated_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;

  // Retention
  expires_at: string | null;
  is_active: boolean;
}

/**
 * Response type for download endpoint
 * Contains temporary signed URL generated on-demand
 */
export interface ConversationDownloadResponse {
  conversation_id: string;
  download_url: string; // Signed URL, valid for 1 hour
  filename: string;
  file_size: number | null;
  expires_at: string; // ISO timestamp when signed URL expires
  expires_in_seconds: number; // Always 3600 (1 hour)
}
```

**Step 3: Add Linting Rule to Prevent URL Storage**

Create `.eslintrc.storage-rules.json` (or add to existing .eslintrc):

```json
{
  "rules": {
    "no-restricted-syntax": [
      "error",
      {
        "selector": "MemberExpression[object.name='conversation'][property.name='file_url']",
        "message": "Don't use file_url - it's deprecated. Use file_path and generate signed URLs on-demand."
      },
      {
        "selector": "MemberExpression[object.name='conversation'][property.name='raw_response_url']",
        "message": "Don't use raw_response_url - it's deprecated. Use raw_response_path and generate signed URLs on-demand."
      },
      {
        "selector": "Identifier[name='file_url']",
        "message": "Don't reference file_url column - it's deprecated. Use file_path instead."
      }
    ]
  }
}
```

**Step 4: Grep for Any Existing Usage**

Search codebase for any code that references deprecated URL columns:

```bash
# Search for deprecated field usage
grep -r "file_url" src/ --include="*.ts" --include="*.tsx"
grep -r "raw_response_url" src/ --include="*.ts" --include="*.tsx"
grep -r "storage_url" src/ --include="*.ts" --include="*.tsx"

# If any found, update them to use file_path instead
```

**Step 5: Run Migration**

Apply the migration:

```bash
# Option 1: Via Supabase CLI
npx supabase migration up

# Option 2: Via Supabase Dashboard
# Go to SQL Editor → New Query → Paste migration SQL → Run

# Option 3: Via Node script
node -e "
const saol = require('./supa-agent-ops');
(async () => {
  const result = await saol.agentExecuteDDL({
    sql: `[PASTE MIGRATION SQL HERE]`,
    transport: 'pg'
  });
  console.log(result.summary);
})();
"
```

**Step 6: Verify Migration**

Check that migration applied correctly:

```sql
-- Verify all URLs are NULL
SELECT COUNT(*) as url_count
FROM conversations
WHERE file_url IS NOT NULL OR raw_response_url IS NOT NULL;
-- Expected: 0

-- Verify comments added
SELECT 
  column_name,
  col_description((table_name::regclass)::oid, ordinal_position) as comment
FROM information_schema.columns
WHERE table_name = 'conversations'
  AND column_name IN ('file_url', 'raw_response_url', 'file_path', 'raw_response_path');
-- Expected: All columns have comments

-- Verify file_path values still exist
SELECT COUNT(*) as path_count
FROM conversations
WHERE file_path IS NOT NULL;
-- Expected: > 0 (at least some conversations have paths)
```

### ACCEPTANCE CRITERIA

**Migration:**
- ✅ Migration file created with clear documentation
- ✅ All `file_url` values set to NULL
- ✅ All `raw_response_url` values set to NULL
- ✅ Database comments added explaining deprecation
- ✅ Migration applied successfully to database

**Types:**
- ✅ StorageConversation type excludes file_url
- ✅ StorageConversation type excludes raw_response_url
- ✅ JSDoc comments explain to use file_path instead
- ✅ New ConversationDownloadResponse type added

**Code Cleanup:**
- ✅ No code references file_url column
- ✅ No code references raw_response_url column
- ✅ All code uses file_path for URL generation
- ✅ TypeScript compilation succeeds

**Verification:**
- ✅ SELECT COUNT(*) WHERE file_url IS NOT NULL returns 0
- ✅ SELECT COUNT(*) WHERE file_path IS NOT NULL returns > 0
- ✅ Database comments visible in pg_catalog

### DELIVERABLES

1. **Migration File:** `supabase/migrations/20251118_deprecate_url_columns.sql`
2. **Updated Types:** `src/lib/types/conversations.ts` with deprecated fields removed
3. **Verification Results:** SQL query results showing NULL URLs and existing paths
4. **Grep Results:** Output showing no code references deprecated fields

Once this prompt is complete, proceed to Prompt 3 for service layer updates.

+++++++++++++++++




---

## Prompt 3: Service Layer Updates for On-Demand URL Generation

========================

You are a senior full-stack developer updating the ConversationStorageService to enforce on-demand signed URL generation. **This service layer must never return stored URLs, only generate them fresh on each request.**

### CONTEXT

**Problem:**
The current service has methods that return stored URLs from the database, which are expired. We need to update it to:
- Only return file paths from database
- Generate signed URLs on-demand
- Make it impossible to accidentally use stored URLs

**Pattern We're Enforcing:**

```typescript
// ❌ WRONG - Never do this
const conversation = await service.getConversation(id);
const url = conversation.file_url; // Expired URL from database

// ✅ CORRECT - Always do this
const conversation = await service.getConversation(id);
const url = await service.getPresignedDownloadUrl(conversation.file_path); // Fresh URL
```

### IMPLEMENTATION TASK

**Update:** `src/lib/services/conversation-storage-service.ts`

**Changes Required:**

1. Remove stored URL fields from return types
2. Add explicit warnings in JSDoc
3. Update getConversation() to exclude URL fields
4. Ensure getPresignedDownloadUrl() is clearly documented
5. Add convenience method for common pattern

**Step 1: Update getConversation() Method**

Find the `getConversation()` method and update:

```typescript
/**
 * Get conversation by conversation_id
 * 
 * IMPORTANT: This method returns file_path, NOT file_url.
 * Signed URLs expire after 1 hour and must be generated on-demand.
 * 
 * To get download URL:
 *   const conversation = await getConversation(id);
 *   const url = await getPresignedDownloadUrl(conversation.file_path);
 * 
 * @param conversationId - Conversation UUID
 * @returns Conversation with file_path (NOT file_url)
 */
async getConversation(conversationId: string): Promise<StorageConversation | null> {
  const { data, error } = await this.supabase
    .from('conversations')
    .select(`
      id,
      conversation_id,
      persona_id,
      emotional_arc_id,
      training_topic_id,
      template_id,
      conversation_name,
      description,
      turn_count,
      tier,
      quality_score,
      status,
      processing_status,
      file_path,
      raw_response_path,
      file_size,
      storage_bucket,
      created_by,
      created_at,
      updated_at,
      reviewed_by,
      reviewed_at,
      review_notes,
      is_active
    `)
    .eq('conversation_id', conversationId)
    .single();

  // Note: Explicitly NOT selecting file_url or raw_response_url
  // Those columns are deprecated and contain expired signed URLs

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }

  return data as StorageConversation;
}
```

**Step 2: Add Clear Documentation to getPresignedDownloadUrl()**

Update the existing method with explicit warnings:

```typescript
/**
 * Generate presigned URL for file download (valid for 1 hour)
 * 
 * CRITICAL: This generates a NEW signed URL each time. The URL expires after 1 hour.
 * DO NOT store the result in the database or cache it long-term.
 * 
 * Usage pattern:
 *   // When user clicks "Download" button:
 *   const conversation = await getConversation(id);
 *   const signedUrl = await getPresignedDownloadUrl(conversation.file_path);
 *   // Return signedUrl to client immediately
 *   // Client opens URL (valid for 1 hour)
 * 
 * @param filePath - Storage path relative to bucket (e.g., "user-id/conv-id/conversation.json")
 * @returns Fresh signed URL, valid for 3600 seconds (1 hour)
 * @throws Error if file doesn't exist or storage access fails
 */
async getPresignedDownloadUrl(filePath: string): Promise<string> {
  if (!filePath) {
    throw new Error('File path is required');
  }

  console.log(`[getPresignedDownloadUrl] Generating signed URL for path: ${filePath}`);

  const { data, error } = await this.supabase.storage
    .from('conversation-files')
    .createSignedUrl(filePath, 3600); // 1 hour expiration

  if (error) {
    console.error('[getPresignedDownloadUrl] Failed to generate signed URL:', error);
    throw new Error(`Failed to generate presigned URL: ${error.message}`);
  }

  if (!data?.signedUrl) {
    throw new Error('Signed URL generation returned no URL');
  }

  console.log(`[getPresignedDownloadUrl] ✅ Generated signed URL (expires in 1 hour)`);
  
  return data.signedUrl;
}
```

**Step 3: Add Convenience Method**

Add a new method that combines fetching conversation and generating URL:

```typescript
/**
 * Get conversation and generate download URL in one call
 * 
 * This is a convenience method for the common pattern:
 *   1. Fetch conversation from database
 *   2. Verify file_path exists
 *   3. Generate fresh signed URL
 *   4. Return URL with metadata
 * 
 * Usage in API route:
 *   const downloadInfo = await service.getDownloadUrlForConversation(conversationId);
 *   return NextResponse.json(downloadInfo);
 * 
 * @param conversationId - Conversation UUID
 * @returns Object with signed URL and metadata
 * @throws Error if conversation not found or no file path
 */
async getDownloadUrlForConversation(
  conversationId: string
): Promise<ConversationDownloadResponse> {
  // Step 1: Fetch conversation
  const conversation = await this.getConversation(conversationId);
  
  if (!conversation) {
    throw new Error(`Conversation not found: ${conversationId}`);
  }

  // Step 2: Verify file path exists
  if (!conversation.file_path) {
    throw new Error(`No file path for conversation: ${conversationId}`);
  }

  // Step 3: Generate fresh signed URL
  const signedUrl = await this.getPresignedDownloadUrl(conversation.file_path);
  
  // Step 4: Extract filename from path
  const filename = conversation.file_path.split('/').pop() || 'conversation.json';

  // Step 5: Calculate expiry timestamp
  const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString();

  // Step 6: Return complete download info
  return {
    conversation_id: conversationId,
    download_url: signedUrl, // Fresh URL, valid for 1 hour
    filename: filename,
    file_size: conversation.file_size,
    expires_at: expiresAt,
    expires_in_seconds: 3600,
  };
}
```

**Step 4: Add Method for Raw Response Downloads**

Add similar method for raw response files:

```typescript
/**
 * Get download URL for raw Claude API response
 * 
 * Similar to getDownloadUrlForConversation but for raw response files.
 * Raw responses are stored in raw/ directory and contain unprocessed Claude output.
 * 
 * @param conversationId - Conversation UUID
 * @returns Object with signed URL for raw response file
 * @throws Error if conversation not found or no raw response path
 */
async getRawResponseDownloadUrl(
  conversationId: string
): Promise<ConversationDownloadResponse> {
  const conversation = await this.getConversation(conversationId);
  
  if (!conversation) {
    throw new Error(`Conversation not found: ${conversationId}`);
  }

  if (!conversation.raw_response_path) {
    throw new Error(`No raw response path for conversation: ${conversationId}`);
  }

  const signedUrl = await this.getPresignedDownloadUrl(conversation.raw_response_path);
  const filename = conversation.raw_response_path.split('/').pop() || 'raw-response.json';
  const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString();

  return {
    conversation_id: conversationId,
    download_url: signedUrl,
    filename: filename,
    file_size: conversation.raw_response_size,
    expires_at: expiresAt,
    expires_in_seconds: 3600,
  };
}
```

**Step 5: Update storeRawResponse() and parseAndStoreFinal()**

Ensure these methods store paths only, not URLs:

```typescript
/**
 * Store raw Claude API response as "first draft" BEFORE any parsing attempts
 * 
 * IMPORTANT: Stores file_path only, NOT file_url.
 * URLs are generated on-demand when user requests download.
 */
async storeRawResponse(params: {
  conversationId: string;
  rawResponse: string;
  userId: string;
  metadata?: any;
}): Promise<{
  success: boolean;
  rawPath: string; // Path, not URL
  rawSize: number;
  conversationId: string;
  error?: string;
}> {
  // ... existing implementation ...
  
  // Upload file
  const rawPath = `raw/${userId}/${conversationId}.json`;
  const { data: uploadData, error: uploadError } = await this.supabase.storage
    .from('conversation-files')
    .upload(rawPath, rawBlob, { contentType: 'application/json', upsert: true });

  if (uploadError) {
    throw new Error(`Raw response upload failed: ${uploadError.message}`);
  }

  // ❌ DON'T generate URL here
  // const url = await this.getPresignedDownloadUrl(rawPath);
  
  // ✅ Store path only
  const conversationRecord: any = {
    conversation_id: conversationId,
    raw_response_path: rawPath, // Path only
    raw_response_size: rawBlob.size,
    raw_stored_at: new Date().toISOString(),
    processing_status: 'raw_stored',
    created_by: userId,
  };

  await this.supabase
    .from('conversations')
    .upsert(conversationRecord, { onConflict: 'conversation_id' });

  return {
    success: true,
    rawPath: rawPath, // Return path, not URL
    rawSize: rawBlob.size,
    conversationId,
  };
}
```

**Step 6: Add Type Guard to Prevent Accidents**

Add utility function to check if something looks like a signed URL:

```typescript
/**
 * Check if a string looks like a signed URL (which shouldn't be stored)
 * Use this in development to catch accidental URL storage
 * 
 * @param value - String to check
 * @returns True if value looks like a signed URL
 */
function looksLikeSignedUrl(value: string | null | undefined): boolean {
  if (!value) return false;
  
  // Signed URLs contain these patterns
  return (
    value.includes('/storage/v1/object/sign/') ||
    value.includes('?token=') ||
    value.includes('/storage/v1/object/public/')
  );
}

/**
 * Assert that value is a file path, not a URL
 * Throws in development if value looks like a URL
 * 
 * @param value - Value to check
 * @param fieldName - Field name for error message
 */
function assertIsPath(value: string | null | undefined, fieldName: string): void {
  if (looksLikeSignedUrl(value)) {
    const error = `
      ❌ CRITICAL ERROR: Attempting to store signed URL in ${fieldName}!
      
      Signed URLs expire and must NOT be stored in the database.
      Store file paths only and generate URLs on-demand.
      
      Bad value: ${value}
      
      Fix: Store the path portion only, without domain or token.
      Example: "00000000.../abc123.../conversation.json"
    `;
    console.error(error);
    
    if (process.env.NODE_ENV === 'development') {
      throw new Error(`Don't store signed URLs in ${fieldName}`);
    }
  }
}

// Use in upsert operations:
async storeExample() {
  const filePath = 'user-id/conv-id/conversation.json';
  assertIsPath(filePath, 'file_path'); // ✅ Pass
  
  // const badUrl = 'https://...storage.../sign/...?token=xyz';
  // assertIsPath(badUrl, 'file_path'); // ❌ Throws in development
}
```

### ACCEPTANCE CRITERIA

**Method Updates:**
- ✅ getConversation() returns file_path, NOT file_url
- ✅ getConversation() has JSDoc warning about on-demand URL generation
- ✅ getPresignedDownloadUrl() clearly documented with warnings
- ✅ getDownloadUrlForConversation() convenience method added
- ✅ getRawResponseDownloadUrl() method added
- ✅ All methods have comprehensive JSDoc comments

**Storage Methods:**
- ✅ storeRawResponse() stores path only, not URL
- ✅ parseAndStoreFinal() stores path only, not URL
- ✅ No method stores signed URLs in database
- ✅ assertIsPath() guard function added

**Type Safety:**
- ✅ Return types exclude file_url field
- ✅ ConversationDownloadResponse type used for URL responses
- ✅ TypeScript compilation succeeds

**Testing:**
- ✅ Can fetch conversation and get file_path
- ✅ Can generate signed URL from file_path
- ✅ Generated URL works for download
- ✅ Generated URL expires after 1 hour
- ✅ Generating URL twice gives different tokens

### DELIVERABLES

1. **Updated Service:** `src/lib/services/conversation-storage-service.ts`
2. **Test Results:** Manual test showing:
   - getConversation() returns path, not URL
   - getDownloadUrlForConversation() generates fresh URL
   - URL works for download
3. **Documentation:** Updated JSDoc comments with warnings

Once this prompt is complete, proceed to Prompt 4 for the download API endpoint.

+++++++++++++++++



(Continuing in next message due to length...)
