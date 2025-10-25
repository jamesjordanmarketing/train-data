# Categ-Module Integration Guide

## Overview

This guide shows how to integrate the auth module with the document categorization system using the SAME Supabase database.

## Required Changes

### 1. Install Auth Module

In `categ-module` directory:

```bash
cd C:\Users\james\Master\BrightHub\BRun\categ-module
npm install file:../auth-module
```

### 2. Environment Variables

Ensure `categ-module/.env.local` has:

```env
NEXT_PUBLIC_SUPABASE_URL=https://hqhtbxlgzysfbekexwku.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxaHRieGxnenlzZmJla2V4d2t1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY4NzEwOTgsImV4cCI6MjA0MjQ0NzA5OH0.sb_publishable_6sdMa51JJEd5E68_5eg2dA_yig9a6_i
```

### 3. Update Layout

Modify `categ-module/src/app/layout.tsx`:

```typescript
import { AuthProvider } from '@brighthub/auth-module'

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
          redirectTo="/signin"
        >
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
```

### 4. Protect Dashboard Routes

Modify `categ-module/src/app/(dashboard)/layout.tsx`:

```typescript
import { ProtectedRoute } from '@brighthub/auth-module'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute redirectTo="/signin">
      {children}
    </ProtectedRoute>
  )
}
```

### 5. Update Workflow Service

**CRITICAL**: Update `categ-module/src/lib/database.ts` to use authenticated users:

```typescript
import { useAuth } from '@brighthub/auth-module'

// Create a hook version for use in React components
export const useWorkflowService = () => {
  const { user } = useAuth()
  
  return {
    async createSession(documentId: string) {
      if (!user) throw new Error('User not authenticated')
      
      const { data, error } = await supabase
        .from('workflow_sessions')
        .insert({
          document_id: documentId,
          user_id: user.id, // Use authenticated user ID
          step: 'A',
          selected_tags: {},
          custom_tags: [],
          is_draft: true,
          completed_steps: []
        })
        .select()
        .single()
      
      if (error) throw error
      return data
    },

    async updateSession(sessionId: string, updates: any) {
      if (!user) throw new Error('User not authenticated')
      
      const { data, error } = await supabase
        .from('workflow_sessions')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .eq('user_id', user.id) // Ensure user owns the session
        .select()
        .single()
      
      if (error) throw error
      return data
    }

    // Add other methods...
  }
}
```

### 6. Create Auth Pages

Create `categ-module/src/app/(auth)/signin/page.tsx`:

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
        showOAuth={true}
        showMagicLink={true}
      />
    </div>
  )
}
```

Create `categ-module/src/app/(auth)/signup/page.tsx`:

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
