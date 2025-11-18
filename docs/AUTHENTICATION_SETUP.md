# Authentication System Setup Guide

## Overview

This document describes the proper Supabase Authentication implementation for the Bright Run LoRA Training Data Platform. The system uses JWT-based authentication with cookie storage, proper RLS policies, and multi-tenant security.

## Architecture

### Authentication Flow

```
Client Browser                 Next.js Server              Supabase
      |                              |                         |
      |------ Sign In Request ------>|                         |
      |                              |---- Auth Request ------>|
      |                              |<--- JWT Token ---------|
      |<-- Set Cookie (JWT) ---------|                         |
      |                              |                         |
      |--- API Request + Cookie ---->|                         |
      |                              |--- Verify JWT --------->|
      |                              |<-- User Context --------|
      |                              |--- Query with RLS ----->|
      |                              |<-- User's Data Only ----|
      |<---- Response ---------------|                         |
```

## Key Components

### 1. Server-Side Auth (`src/lib/supabase-server.ts`)

**Purpose:** Handle authentication on the server with proper cookie management

**Key Functions:**

- `createServerSupabaseClient()` - For Server Components with cookie-based auth
- `createServerSupabaseClientFromRequest(request)` - For API Routes with request context
- `getAuthenticatedUser(request)` - Extract user from JWT, returns null if not authenticated
- `requireAuth(request)` - Require authentication or return 401
- `createServerSupabaseAdminClient()` - Admin client with service role key (use carefully)

**Usage in API Routes:**

```typescript
import { requireAuth } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  const { user, response } = await requireAuth(request);
  
  if (response) {
    return response; // 401 Unauthorized
  }

  // User is authenticated, user.id contains the UUID
  const data = await fetchUserData(user!.id);
  return NextResponse.json(data);
}
```

### 2. Client-Side Auth (`src/lib/supabase-client.ts`)

**Purpose:** Provide Supabase client for browser-side operations

**Key Functions:**

- `getSupabaseClient()` - Get singleton Supabase client for client-side use
- `createClientSupabaseClient()` - Create new client instance

**Usage in Components:**

```typescript
'use client';

import { getSupabaseClient } from '@/lib/supabase-client';

export function MyComponent() {
  const supabase = getSupabaseClient();
  
  const handleSignIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.error('Sign in error:', error);
    }
  };
  
  return <button onClick={() => handleSignIn('test@example.com', 'password')}>Sign In</button>;
}
```

### 3. Auth Context (`src/lib/auth-context.tsx`)

**Purpose:** Provide React context for authentication state across the app

**Features:**

- Tracks current user and session
- Loads user profile from database
- Provides sign in, sign up, sign out functions
- Automatically refreshes session

**Usage:**

```typescript
'use client';

import { useAuth } from '@/lib/auth-context';

export function ProfileComponent() {
  const { user, isLoading, isAuthenticated, signOut } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <div>Please sign in</div>;
  }
  
  return (
    <div>
      <p>Welcome, {user?.email}</p>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

**Wrapping Your App:**

```typescript
// In your layout.tsx or _app.tsx
import { AuthProvider } from '@/lib/auth-context';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

### 4. Middleware (`src/middleware.ts`)

**Purpose:** Automatically refresh JWT tokens on every request

**What it does:**

- Intercepts all requests
- Refreshes Supabase session if needed
- Updates cookies with new JWT
- Optional: Can redirect unauthenticated users to login

**Configuration:**

The middleware runs on all routes except:
- Static files (`_next/static`, `_next/image`)
- Public assets (`.svg`, `.png`, etc.)
- `favicon.ico`

To enable protected route redirects, uncomment the redirect logic in `src/middleware.ts`.

### 5. Auth Service (`src/lib/auth-service.ts`)

**Purpose:** Utility class for common auth operations

**Methods:**

- `getCurrentUser()` - Get current authenticated user
- `getSession()` - Get current session
- `getAuthToken()` - Get JWT access token
- `signOut()` - Sign out current user

## Setup Instructions

### Step 1: Verify Supabase Configuration

1. Go to your Supabase Dashboard → Authentication → Settings
2. Verify **Email provider** is enabled
3. Check JWT expiry settings (default: 1 hour)
4. Note your Project URL and Anon Key

### Step 2: Environment Variables

Ensure these are set in your `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key  # Server-side only, never expose!
```

### Step 3: Create Test User

**Option 1: Via Supabase Dashboard**

1. Go to Authentication → Users → Add User
2. Email: `test@example.com`
3. Password: `TestPassword123!`
4. Auto Confirm: Yes (for testing)
5. Click "Create User"

**Option 2: Via API**

```bash
curl -X POST 'https://YOUR_PROJECT.supabase.co/auth/v1/signup' \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!"
  }'
```

### Step 4: Test Authentication

**Test Endpoint:** `GET /api/test-auth`

```bash
# Should return 401 (not authenticated)
curl http://localhost:3000/api/test-auth

# After logging in via browser UI:
# 1. Open DevTools → Application → Cookies
# 2. Copy the cookie string
# 3. Test with authentication:

curl http://localhost:3000/api/test-auth \
  -H "Cookie: YOUR_COOKIE_STRING"

# Should return 200 with user info:
# {
#   "success": true,
#   "message": "Authentication successful!",
#   "user": {
#     "id": "uuid-here",
#     "email": "test@example.com",
#     ...
#   }
# }
```

## Migration from Placeholder Auth

### Old Pattern (Broken)

```typescript
// ❌ DON'T DO THIS
export async function GET(request: NextRequest) {
  const userId = request.headers.get('x-user-id') || 'test-user';
  // Client can impersonate anyone!
  // RLS policies don't work!
}
```

### New Pattern (Secure)

```typescript
// ✅ DO THIS
import { requireAuth } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  const { user, response } = await requireAuth(request);
  
  if (response) {
    return response; // 401 if not authenticated
  }
  
  // user.id is validated from JWT
  // RLS policies work correctly
  const data = await fetchUserData(user!.id);
  return NextResponse.json(data);
}
```

### Migration Checklist

For each API route:

1. ❌ Remove: `request.headers.get('x-user-id')`
2. ✅ Add: `import { requireAuth } from '@/lib/supabase-server'`
3. ✅ Add: `const { user, response } = await requireAuth(request)`
4. ✅ Add: `if (response) return response;`
5. ✅ Use: `user!.id` instead of placeholder user ID

## RLS Policy Examples

### Allow users to see only their own data

```sql
-- Create policy on conversations table
CREATE POLICY "Users can view their own conversations"
ON conversations
FOR SELECT
USING (auth.uid() = created_by);

-- Create policy for inserting
CREATE POLICY "Users can create conversations"
ON conversations
FOR INSERT
WITH CHECK (auth.uid() = created_by);

-- Create policy for updating
CREATE POLICY "Users can update their own conversations"
ON conversations
FOR UPDATE
USING (auth.uid() = created_by);
```

### Verify RLS is working

```typescript
// This should only return conversations created by the authenticated user
const { data } = await supabase
  .from('conversations')
  .select('*');
  
console.log(data); // Only user's own data
```

## Testing Guide

### Manual Testing

1. **Sign Up Flow:**
   - Navigate to `/signup`
   - Create an account
   - Verify email confirmation (if enabled)
   - Check user appears in Supabase Dashboard

2. **Sign In Flow:**
   - Navigate to `/signin`
   - Sign in with test credentials
   - Verify redirect to dashboard
   - Check JWT cookie in DevTools → Application → Cookies

3. **Protected Routes:**
   - Try accessing `/api/conversations` without auth → 401
   - Sign in
   - Try accessing `/api/conversations` with auth → 200

4. **RLS Verification:**
   - Create data as User A
   - Sign out
   - Sign in as User B
   - Verify User B cannot see User A's data

### Automated Testing

```typescript
// Example test with authentication
import { createMocks } from 'node-mocks-http';
import { GET } from '@/app/api/conversations/route';

describe('Conversations API', () => {
  it('should return 401 without auth', async () => {
    const { req } = createMocks({ method: 'GET' });
    const response = await GET(req as any);
    expect(response.status).toBe(401);
  });
  
  it('should return conversations with valid auth', async () => {
    // Mock authenticated request with JWT cookie
    const { req } = createMocks({ 
      method: 'GET',
      cookies: { 
        'sb-projectid-auth-token': 'valid-jwt-token' 
      }
    });
    const response = await GET(req as any);
    expect(response.status).toBe(200);
  });
});
```

## Troubleshooting

### Issue: "Unauthorized" on all requests

**Cause:** JWT cookie not being sent or invalid

**Solution:**
1. Check cookies in DevTools → Application
2. Look for cookie named `sb-[projectid]-auth-token`
3. Verify cookie is not expired
4. Try signing out and back in

### Issue: RLS policies not working

**Cause:** Using service role key instead of user JWT

**Solution:**
1. Check you're using `createServerSupabaseClient()` not `createServerSupabaseAdminClient()`
2. Verify RLS is enabled on table: `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`
3. Check policy matches `auth.uid()` column

### Issue: Session expires too quickly

**Cause:** JWT expiry set too short

**Solution:**
1. Go to Supabase Dashboard → Authentication → Settings
2. Increase JWT expiry time (default: 3600 seconds = 1 hour)
3. Users will need to sign out and back in

### Issue: Middleware causing infinite redirects

**Cause:** Redirect logic creating loop

**Solution:**
1. Check middleware redirect conditions
2. Ensure auth routes (signin/signup) are excluded from protection
3. Add proper condition checks

## Security Best Practices

### ✅ DO

- Use `requireAuth()` for all protected API routes
- Store JWT in HTTP-only cookies (automatic with Supabase SSR)
- Enable RLS on all tables with user data
- Use `auth.uid()` in RLS policies
- Validate user owns resources before operations
- Use service role key only for admin operations

### ❌ DON'T

- Don't trust client-provided user IDs
- Don't expose service role key to client
- Don't use admin client for user operations
- Don't store JWT in localStorage (XSS risk)
- Don't disable RLS for convenience
- Don't bypass authentication checks

## Performance Considerations

### Caching

The middleware refreshes the JWT on every request. For high-traffic apps:

1. Consider caching user lookups
2. Use React Query for client-side caching
3. Implement API response caching where appropriate

### Database Queries

RLS adds a `WHERE auth.uid() = column` to all queries. To optimize:

1. Add indexes on user ID columns
2. Use `.select()` to fetch only needed columns
3. Implement pagination for large datasets

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js Middleware Documentation](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [@supabase/ssr Package](https://github.com/supabase/ssr)

## Support

For issues or questions:

1. Check Supabase Dashboard → Logs for auth errors
2. Check browser DevTools → Console for client errors
3. Check Next.js server logs for API errors
4. Verify environment variables are set correctly

