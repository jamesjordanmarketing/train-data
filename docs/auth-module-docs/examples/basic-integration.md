# Basic Integration Example

This example shows the minimal setup required to integrate the auth module into a Next.js application.

## Step 1: Install the Module

```bash
npm install file:../auth-module
```

## Step 2: Environment Setup

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://hqhtbxlgzysfbekexwku.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxaHRieGxnenlzZmJla2V4d2t1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY4NzEwOTgsImV4cCI6MjA0MjQ0NzA5OH0.sb_publishable_6sdMa51JJEd5E68_5eg2dA_yig9a6_i
```

## Step 3: Root Layout

`app/layout.tsx`:

```typescript
import { AuthProvider } from '@brighthub/auth-module'
import './globals.css'

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
        >
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
```

## Step 4: Public Landing Page

`app/page.tsx`:

```typescript
'use client'

import { useAuth } from '@brighthub/auth-module'
import Link from 'next/link'

export default function HomePage() {
  const { isAuthenticated, user, signOut } = useAuth()

  if (isAuthenticated) {
    return (
      <div className="p-8">
        <h1 className="text-2xl mb-4">Welcome back, {user?.email}!</h1>
        <div className="space-x-4">
          <Link href="/dashboard" className="bg-blue-500 text-white px-4 py-2 rounded">
            Go to Dashboard
          </Link>
          <button onClick={signOut} className="bg-gray-500 text-white px-4 py-2 rounded">
            Sign Out
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Welcome to Our App</h1>
      <div className="space-x-4">
        <Link href="/signin" className="bg-blue-500 text-white px-4 py-2 rounded">
          Sign In
        </Link>
        <Link href="/signup" className="bg-green-500 text-white px-4 py-2 rounded">
          Sign Up
        </Link>
      </div>
    </div>
  )
}
```

## Step 5: Authentication Pages

`app/signin/page.tsx`:

```typescript
'use client'

import { SignInForm } from '@brighthub/auth-module'
import { useRouter } from 'next/navigation'

export default function SignInPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center">
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

`app/signup/page.tsx`:

```typescript
'use client'

import { SignUpForm } from '@brighthub/auth-module'
import { useRouter } from 'next/navigation'

export default function SignUpPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center">
      <SignUpForm
        onSuccess={() => router.push('/dashboard')}
        onSignInClick={() => router.push('/signin')}
      />
    </div>
  )
}
```

## Step 6: Protected Dashboard

`app/dashboard/page.tsx`:

```typescript
'use client'

import { ProtectedRoute, useAuth } from '@brighthub/auth-module'

function DashboardContent() {
  const { user, profile } = useAuth()

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Dashboard</h1>
      <div className="bg-gray-100 p-4 rounded">
        <h2 className="font-bold">User Info:</h2>
        <p>Email: {user?.email}</p>
        <p>Name: {profile?.full_name}</p>
        <p>Role: {profile?.role}</p>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute redirectTo="/signin">
      <DashboardContent />
    </ProtectedRoute>
  )
}
```

## Step 7: Profile Management

`app/profile/page.tsx`:

```typescript
'use client'

import { ProtectedRoute, ProfileForm } from '@brighthub/auth-module'

function ProfileContent() {
  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Profile Settings</h1>
      <ProfileForm onSuccess={() => alert('Profile updated!')} />
    </div>
  )
}

export default function ProfilePage() {
  return (
    <ProtectedRoute redirectTo="/signin">
      <ProfileContent />
    </ProtectedRoute>
  )
}
```

## Complete Folder Structure

```
your-app/
├── app/
│   ├── dashboard/
│   │   └── page.tsx
│   ├── profile/
│   │   └── page.tsx
│   ├── signin/
│   │   └── page.tsx
│   ├── signup/
│   │   └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── .env.local
├── next.config.js
├── package.json
└── tailwind.config.js
```

This basic setup provides:
- User registration and authentication
- Protected routes
- Profile management
- OAuth and magic link support
- Proper TypeScript typing throughout
