# Auth Module Integration Guide

## Full Path to Codebase
C:\Users\james\Master\BrightHub\BRun\auth-module


## Installation

```bash
npm install file:../auth-module
```

## Basic Setup

### 1. Environment Variables

Add to your `.env.local` (use SAME project as categ-module):

```env
NEXT_PUBLIC_SUPABASE_URL=https://hqhtbxlgzysfbekexwku.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxaHRieGxnenlzZmJla2V4d2t1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjY4NzEwOTgsImV4cCI6MjA0MjQ0NzA5OH0.sb_publishable_6sdMa51JJEd5E68_5eg2dA_yig9a6_i
```

### 2. Wrap Your App with AuthProvider

In your `app/layout.tsx`:

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
          redirectTo="/dashboard"
        >
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
```

### 3. Use Authentication in Components

```typescript
import { useAuth } from '@brighthub/auth-module'

export default function Dashboard() {
  const { user, isLoading, isAuthenticated, signOut } = useAuth()
  
  if (isLoading) return <div>Loading...</div>
  if (!isAuthenticated) return <div>Please sign in</div>
  
  return (
    <div>
      <h1>Welcome, {user?.email}</h1>
      <button onClick={signOut}>Sign Out</button>
    </div>
  )
}
```

### 4. Protect Routes

```typescript
import { ProtectedRoute } from '@brighthub/auth-module'

export default function AdminPage() {
  return (
    <ProtectedRoute requiredRoles={['admin']}>
      <AdminDashboard />
    </ProtectedRoute>
  )
}
```

### 5. Authentication Forms

```typescript
import { SignInForm, SignUpForm } from '@brighthub/auth-module'

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  
  return (
    <div>
      {isSignUp ? (
        <SignUpForm
          onSuccess={() => router.push('/dashboard')}
          onSignInClick={() => setIsSignUp(false)}
        />
      ) : (
        <SignInForm
          onSuccess={() => router.push('/dashboard')}
          onSignUpClick={() => setIsSignUp(true)}
          showOAuth={true}
          showMagicLink={true}
        />
      )}
    </div>
  )
}
```

## Advanced Usage

### Route Protection with Role Guards

```typescript
import { useAuthGuard } from '@brighthub/auth-module'

export default function AdminPanel() {
  const { isLoading, hasRequiredRole } = useAuthGuard({
    requiredRoles: ['admin', 'owner'],
    requireEmailConfirmation: true
  })
  
  if (isLoading) return <div>Loading...</div>
  if (!hasRequiredRole) return <div>Access denied</div>
  
  return <AdminDashboard />
}
```

### Profile Management

```typescript
import { useProfile, ProfileForm } from '@brighthub/auth-module'

export default function ProfilePage() {
  const { profile, isLoading } = useProfile()
  
  if (isLoading) return <div>Loading...</div>
  
  return (
    <div>
      <h1>{profile?.full_name}'s Profile</h1>
      <ProfileForm onSuccess={() => alert('Profile updated!')} />
    </div>
  )
}
```
