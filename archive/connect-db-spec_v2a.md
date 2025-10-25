# Document Categorization System - Live Database Integration Specification (Part A)

**Date:** 2025-09-20  
**Target Location:** `C:\Users\james\Master\BrightHub\BRun\categ-module\`  
**Implementation Agent:** Next Coding Session  
**Purpose:** Authentication Foundation & Database Schema Setup  
**Part:** A of 2 (Foundation Phase)

---

## IMPLEMENTATION DIRECTIVE FOR CODING AGENT

You are implementing **Phase A** of live Supabase database integration for a Next.js document categorization application. This phase establishes the authentication foundation and database schema that Part B will build upon.

### PROJECT CONTEXT
- **Current Location**: You are working in `C:\Users\james\Master\BrightHub\BRun\categ-module\`
- **App Status**: Fully functional UI, deployed to Vercel, but using mock data
- **Database Strategy**: Connect to existing Supabase project with user authentication
- **Authentication Module**: Available at `C:\Users\james\Master\BrightHub\BRun\auth-module\`
- **Deployment Target**: Vercel with live Supabase integration

### CRITICAL REQUIREMENTS FOR PART A
1. **Install Authentication Module**: Integrate existing auth module for user management
2. **Setup Database Schema**: Apply complete database structure in Supabase
3. **Implement Route Protection**: Secure all protected routes with authentication
4. **Create Authentication Flow**: Build signin/signup pages and navigation
5. **Verify Foundation**: Ensure authentication and database connectivity work

### PART A DELIVERS
- Complete authentication system integration
- Full database schema setup in Supabase
- Protected routes for dashboard and workflow areas
- Authentication pages (signin/signup)
- Verified database connectivity and user management

### PART B WILL CONTINUE WITH
- API endpoints replacement (mock → real Supabase operations)
- Workflow store integration with authentication
- Database service layer updates
- Component updates for user context
- Complete testing and validation

---

## CURRENT APPLICATION ANALYSIS

### ✅ **Working Components**:
- UI/UX fully functional with Tailwind CSS
- Document selection workflow (Steps A, B, C)  
- Category and tag selection interfaces
- Navigation and state management
- Vercel deployment: https://categ-module.vercel.app/dashboard

### ❌ **Issues Part A Will Fix**:
- No user authentication system ← **PART A**
- No route protection ← **PART A**
- Database schema not applied ← **PART A**
- No user registration/login flow ← **PART A**

### ⏳ **Issues Part B Will Fix**:
- API endpoints return mock responses ← **PART B**
- Workflow data not persisted to database ← **PART B**
- Using mock data throughout the application ← **PART B**
- No user-specific data isolation ← **PART B**

---

## AUTHENTICATION MODULE INTEGRATION

### Authentication Module Details
- **Location**: `C:\Users\james\Master\BrightHub\BRun\auth-module\`
- **Capabilities**: Complete Supabase authentication with user management
- **Database**: Uses same Supabase project as this application
- **Components**: SignIn/SignUp forms, route protection, user profiles
- **Integration Method**: File dependency installation

### Supabase Database Configuration
- **URL**: `https://hqhtbxlgzysfbekexwku.supabase.co`
- **Anonymous Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxaHRieGxnenlzZmJla2V4d2t1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY4NzEwOTgsImV4cCI6MjA0MjQ0NzA5OH0.sb_publishable_6sdMa51JJEd5E68_5eg2dA_yig9a6_i`
- **Database Strategy**: Extend existing user_profiles table with auth features

---

## PHASE 1: AUTHENTICATION MODULE INSTALLATION AND SETUP

### Step 1.1: Install Authentication Module

Navigate to the categ-module directory and install the auth module:

```bash
cd C:\Users\james\Master\BrightHub\BRun\categ-module
npm install file:../auth-module
```

### Step 1.2: Environment Configuration

Ensure `.env.local` exists with the correct Supabase configuration:

```env
NEXT_PUBLIC_SUPABASE_URL=https://hqhtbxlgzysfbekexwku.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxaHRieGxnenlzZmJla2V4d2t1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY4NzEwOTgsImV4cCI6MjA0MjQ0NzA5OH0.sb_publishable_6sdMa51JJEd5E68_5eg2dA_yig9a6_i
```

### Step 1.3: Wrap Application with AuthProvider

**File**: `src/app/layout.tsx`

**CRITICAL**: Replace the existing layout with authentication provider:

```typescript
import { AuthProvider } from '@brighthub/auth-module'
import './globals.css'

export const metadata = {
  title: 'Document Categorization System',
  description: 'Categorize and tag documents efficiently',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider
          supabaseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL!}
          supabaseKey={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}
          redirectTo="/dashboard"
        >
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
```

---

## PHASE 2: DATABASE SCHEMA SETUP

### Step 2.1: Run Main Database Schema

The original database setup script needs to be run in Supabase SQL Editor.

**Action**: Copy contents of `setup-database.sql` and execute in Supabase SQL Editor.

### Step 2.2: Run Authentication Extensions

The auth module includes database extensions that need to be applied.

**Action**: Copy and execute the auth module's database extensions in Supabase SQL Editor:

```sql
-- Authentication Module Database Extensions
-- Run this AFTER the main setup-database.sql

-- Enhanced user_profiles table for authentication
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS auth_provider TEXT DEFAULT 'email';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS email_confirmed BOOLEAN DEFAULT false;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'en';
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS privacy_accepted_at TIMESTAMPTZ;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS last_sign_in_at TIMESTAMPTZ;

-- Create trigger to sync Supabase auth.users with user_profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, email_confirmed, auth_provider, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email_confirmed_at IS NOT NULL,
    COALESCE(NEW.raw_app_meta_data->>'provider', 'email'),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    email_confirmed = EXCLUDED.email_confirmed,
    auth_provider = EXCLUDED.auth_provider,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enhanced RLS policies for auth integration
DROP POLICY IF EXISTS "Users can view their own profile via auth" ON user_profiles;
CREATE POLICY "Users can view their own profile via auth" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile via auth" ON user_profiles;
CREATE POLICY "Users can update their own profile via auth" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);
```

---

## PHASE 3: ROUTE PROTECTION IMPLEMENTATION

### Step 3.1: Protect Dashboard Routes

**File**: `src/app/(dashboard)/layout.tsx`

**Current**: Basic layout with no protection
**Required**: Add authentication protection

```typescript
import { ProtectedRoute } from '@brighthub/auth-module'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute redirectTo="/signin">
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    </ProtectedRoute>
  )
}
```

### Step 3.2: Protect Workflow Routes

**File**: `src/app/(workflow)/layout.tsx`

**Current**: Basic layout with no protection
**Required**: Add authentication protection

```typescript
import { ProtectedRoute } from '@brighthub/auth-module'

export default function WorkflowLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute redirectTo="/signin">
      <div className="min-h-screen bg-white">
        {children}
      </div>
    </ProtectedRoute>
  )
}
```

### Step 3.3: Create Authentication Pages

**File**: `src/app/(auth)/signin/page.tsx` (NEW FILE)

```typescript
'use client'

import { SignInForm } from '@brighthub/auth-module'
import { useRouter } from 'next/navigation'

export default function SignInPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <SignInForm
        onSuccess={() => router.push('/dashboard')}
        onSignUpClick={() => router.push('/signup')}
        showOAuth={false}
        showMagicLink={false}
      />
    </div>
  )
}
```

**File**: `src/app/(auth)/signup/page.tsx` (NEW FILE)

```typescript
'use client'

import { SignUpForm } from '@brighthub/auth-module'
import { useRouter } from 'next/navigation'

export default function SignUpPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <SignUpForm
        onSuccess={() => router.push('/dashboard')}
        onSignInClick={() => router.push('/signin')}
      />
    </div>
  )
}
```

**File**: `src/app/(auth)/layout.tsx` (NEW FILE)

```typescript
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="auth-layout">
      {children}
    </div>
  )
}
```

### Step 3.4: Update Home Page for Authentication Flow

**File**: `src/app/page.tsx`

**Required**: Update to redirect authenticated users to dashboard

```typescript
'use client'

import { useAuth } from '@brighthub/auth-module'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.push('/dashboard')
      } else {
        router.push('/signin')
      }
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return null
}
```

---

## PART A VALIDATION REQUIREMENTS

### ✅ **Part A Complete When:**

1. **Authentication Module Installed**: Module successfully installed and imported
2. **Environment Configured**: Supabase environment variables set correctly
3. **AuthProvider Active**: App wrapped with authentication provider
4. **Database Schema Applied**: All tables and triggers created in Supabase
5. **Routes Protected**: Dashboard and workflow routes require authentication
6. **Auth Pages Created**: Sign-in and sign-up pages functional
7. **Navigation Flow**: Users can register, login, and access protected areas

### 🔧 **Part A Validation Commands:**

```bash
# Install auth module
npm install file:../auth-module

# Type check
npm run type-check

# Build for production
npm run build

# Test database connectivity
node test-database.js

# Start development server
npm run dev
```

### 📋 **Part A Success Criteria Checklist:**

- [ ] Authentication module successfully installed
- [ ] Environment variables configured correctly
- [ ] Database schema and extensions applied in Supabase
- [ ] AuthProvider wraps the entire application
- [ ] Dashboard routes protected with authentication
- [ ] Workflow routes protected with authentication
- [ ] Authentication pages (signin/signup) created and working
- [ ] Home page redirects based on authentication status
- [ ] Database connectivity test passes
- [ ] Users can register and sign in successfully
- [ ] Protected routes redirect unauthenticated users

### 🔄 **Handoff to Part B:**

When Part A is complete, Part B will continue with:
- Replacing mock API endpoints with real Supabase operations
- Updating workflow store to use authentication context
- Replacing database service layer mock data
- Updating components to use authenticated user context
- Complete end-to-end testing and validation

### 🚨 **Common Issues and Solutions:**

1. **Authentication Module Installation Issues:**
   - Ensure you're in the correct directory: `C:\Users\james\Master\BrightHub\BRun\categ-module\`
   - Verify the auth module exists at: `C:\Users\james\Master\BrightHub\BRun\auth-module\`

2. **Database Connection Issues:**
   - Verify Supabase URL and key are correct in `.env.local`
   - Ensure database schema has been applied in Supabase SQL Editor

3. **Route Protection Issues:**
   - Check that ProtectedRoute component is imported correctly
   - Verify AuthProvider is wrapping the entire application

---

## POST-PART A VERIFICATION

After completing Part A, verify the authentication foundation:

1. **Authentication Flow**: Users can register and login
2. **Route Protection**: Protected routes redirect to signin
3. **Database Schema**: All tables and triggers exist in Supabase
4. **User Management**: New users appear in user_profiles table
5. **Session Management**: Users remain logged in across page refreshes

**Part A Success Message**: When all validation criteria are met, the authentication foundation is complete and ready for Part B implementation which will connect the workflow system to live database operations.

---

**IMPLEMENTATION AGENT**: Complete Part A step-by-step to establish the authentication foundation. Focus on proper installation of the auth module, database schema setup, and route protection. Verify each step works before proceeding to the next. Part B will build upon this foundation to complete the full integration.
