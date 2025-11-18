# Authentication Quick Start Guide

## TL;DR

**For API Routes:**
```typescript
import { requireAuth } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  const { user, response } = await requireAuth(request);
  if (response) return response; // 401 if not authenticated
  
  // Use user!.id - it's validated from JWT
  const data = await fetchUserData(user!.id);
  return NextResponse.json(data);
}
```

**For Client Components:**
```typescript
'use client';
import { useAuth } from '@/lib/auth-context';

export function MyComponent() {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated) return <div>Please sign in</div>;
  
  return <div>Welcome, {user?.email}</div>;
}
```

## 5-Minute Setup

### 1. Create Test User

**Via Supabase Dashboard:**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Authentication → Users → Add User
4. Email: `test@example.com`, Password: `TestPassword123!`
5. Check "Auto Confirm User"
6. Click "Create User"

### 2. Test Authentication

**Run the app:**
```bash
cd src
npm run dev
```

**Test the endpoint:**
```bash
# Should return 401
curl http://localhost:3000/api/test-auth

# Returns:
# {"error":"Unauthorized","message":"Please log in to access this resource"}
```

### 3. Sign In

**Option A: Use existing sign-in page**
- Navigate to http://localhost:3000/signin
- Enter: `test@example.com` / `TestPassword123!`

**Option B: Sign in via API**
```bash
curl -X POST http://localhost:3000/auth/v1/token?grant_type=password \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!"
  }'
```

### 4. Test Authenticated Request

After signing in via the UI:

1. Open DevTools (F12)
2. Go to Application → Cookies
3. Copy the cookie string
4. Test the API:

```bash
curl http://localhost:3000/api/test-auth \
  -H "Cookie: YOUR_COOKIE_STRING"

# Should return 200:
# {
#   "success": true,
#   "message": "Authentication successful!",
#   "user": {
#     "id": "uuid-here",
#     "email": "test@example.com"
#   }
# }
```

## Common Patterns

### Pattern 1: Protected API Route

```typescript
import { requireAuth } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Require authentication
  const { user, response } = await requireAuth(request);
  if (response) return response;

  // User is authenticated - fetch their data
  // RLS policies will automatically filter by user.id
  const { data } = await supabase
    .from('conversations')
    .select('*');

  return NextResponse.json(data);
}
```

### Pattern 2: Optional Authentication

```typescript
import { getAuthenticatedUser } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Get user if authenticated, null otherwise
  const user = await getAuthenticatedUser(request);

  if (user) {
    // Show personalized data
    return NextResponse.json({ message: `Welcome back, ${user.email}` });
  } else {
    // Show public data
    return NextResponse.json({ message: 'Welcome, guest' });
  }
}
```

### Pattern 3: Client-Side Auth Check

```typescript
'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function ProtectedPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/signin');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return null;

  return <div>Protected content</div>;
}
```

### Pattern 4: Making Authenticated API Calls

```typescript
'use client';

import { getSupabaseClient } from '@/lib/supabase-client';

export function MyComponent() {
  const handleFetch = async () => {
    const supabase = getSupabaseClient();
    
    // This will automatically include the auth cookie
    const { data, error } = await supabase
      .from('conversations')
      .select('*');

    if (error) {
      console.error('Error:', error);
    } else {
      console.log('Data:', data);
    }
  };

  return <button onClick={handleFetch}>Fetch Data</button>;
}
```

## Migrating Existing Routes

### Before (Broken):

```typescript
// ❌ OLD - Using placeholder header
export async function GET(request: NextRequest) {
  const userId = request.headers.get('x-user-id') || 'test-user';
  
  const data = await db.conversations.findMany({
    where: { created_by: userId }
  });
  
  return NextResponse.json(data);
}
```

### After (Secure):

```typescript
// ✅ NEW - Using JWT authentication
import { requireAuth } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  const { user, response } = await requireAuth(request);
  if (response) return response;
  
  // user.id is verified from JWT
  const data = await db.conversations.findMany({
    where: { created_by: user!.id }
  });
  
  return NextResponse.json(data);
}
```

## Environment Variables

Create `.env.local` in your project root:

```bash
# Get these from: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# Get this from: https://supabase.com/dashboard/project/YOUR_PROJECT/settings/api
# WARNING: Never expose this to the client!
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
```

## Verify Setup

Run this checklist:

- [ ] `@supabase/ssr` package installed
- [ ] Environment variables set
- [ ] Test user created in Supabase
- [ ] Can access `/api/test-auth` endpoint
- [ ] `/api/test-auth` returns 401 without auth
- [ ] Can sign in via UI
- [ ] JWT cookie appears in DevTools
- [ ] `/api/test-auth` returns 200 with auth
- [ ] RLS policies enabled on tables
- [ ] Middleware running (check Next.js logs)

## Next Steps

1. **Enable RLS on your tables:**
   ```sql
   ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
   
   CREATE POLICY "Users can view own conversations"
   ON conversations FOR SELECT
   USING (auth.uid() = created_by);
   ```

2. **Update all API routes** to use `requireAuth()`

3. **Add AuthProvider** to your root layout:
   ```typescript
   import { AuthProvider } from '@/lib/auth-context';
   
   export default function RootLayout({ children }) {
     return (
       <html>
         <body>
           <AuthProvider>{children}</AuthProvider>
         </body>
       </html>
     );
   }
   ```

4. **Test thoroughly** - Try accessing routes as different users

## Troubleshooting

### "Module not found: Can't resolve '@supabase/ssr'"
```bash
cd src
npm install @supabase/ssr
```

### "NEXT_PUBLIC_SUPABASE_URL is not defined"
Add to `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### "Unauthorized" on all requests
1. Check you're signed in (look for JWT cookie in DevTools)
2. Cookie should be named `sb-[projectid]-auth-token`
3. Try signing out and back in

### Can see other users' data
1. Check RLS is enabled: `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`
2. Add policy: `CREATE POLICY ... USING (auth.uid() = user_column)`
3. Verify using admin client, not user client

## Reference

**Files Created:**
- `src/lib/supabase-server.ts` - Server-side auth helpers
- `src/lib/supabase-client.ts` - Client-side Supabase client
- `src/lib/auth-context.tsx` - React auth context (already exists, updated)
- `src/middleware.ts` - Auth middleware
- `src/app/api/test-auth/route.ts` - Test endpoint

**Key Functions:**
- `requireAuth(request)` - Require auth or return 401
- `getAuthenticatedUser(request)` - Get user or null
- `getSupabaseClient()` - Get client-side Supabase client
- `useAuth()` - React hook for auth state

For detailed documentation, see [AUTHENTICATION_SETUP.md](./AUTHENTICATION_SETUP.md)

