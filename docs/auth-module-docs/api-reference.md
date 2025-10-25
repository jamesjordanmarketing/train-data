# Auth Module API Reference

## Components

### AuthProvider

Main authentication context provider.

**Props:**
- `children: ReactNode` - Child components
- `supabaseUrl: string` - Supabase project URL
- `supabaseKey: string` - Supabase anonymous key
- `redirectTo?: string` - Default redirect after login (default: '/dashboard')

**Usage:**
```typescript
<AuthProvider
  supabaseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL!}
  supabaseKey={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}
  redirectTo="/dashboard"
>
  <App />
</AuthProvider>
```

### ProtectedRoute

Route protection component with role-based access control.

**Props:**
- `children: ReactNode` - Protected content
- `requiredRoles?: string[]` - Required user roles
- `fallbackComponent?: React.ComponentType` - Component to show if access denied
- `redirectTo?: string` - Where to redirect if not authenticated

**Usage:**
```typescript
<ProtectedRoute requiredRoles={['admin', 'user']}>
  <DashboardContent />
</ProtectedRoute>
```

### SignInForm

Pre-built sign-in form component.

**Props:**
- `onSuccess?: () => void` - Callback on successful sign in
- `onSignUpClick?: () => void` - Callback when sign up link clicked
- `showOAuth?: boolean` - Show OAuth buttons (default: false)
- `showMagicLink?: boolean` - Show magic link button (default: false)

### SignUpForm

Pre-built sign-up form component.

**Props:**
- `onSuccess?: () => void` - Callback on successful sign up
- `onSignInClick?: () => void` - Callback when sign in link clicked

### ProfileForm

User profile management form.

**Props:**
- `onSuccess?: () => void` - Callback on successful profile update

## Hooks

### useAuth

Main authentication hook providing auth state and methods.

**Returns:**
```typescript
{
  // State
  user: User | null
  profile: UserProfile | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  isEmailConfirmed: boolean
  
  // Methods
  signUp: (email: string, password: string, profile?: Partial<UserProfile>) => Promise<AuthResult>
  signIn: (email: string, password: string) => Promise<AuthResult>
  signInWithProvider: (provider: 'google' | 'github') => Promise<AuthResult>
  signInWithMagicLink: (email: string) => Promise<AuthResult>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<UserProfile>
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  refreshSession: () => Promise<void>
  getCurrentUser: () => Promise<User | null>
}
```

### useAuthGuard

Route protection hook with redirect logic.

**Parameters:**
```typescript
{
  requiredRoles?: string[]
  redirectTo?: string
  requireEmailConfirmation?: boolean
}
```

**Returns:**
```typescript
{
  isAuthenticated: boolean
  isLoading: boolean
  profile: UserProfile | null
  isEmailConfirmed: boolean
  hasRequiredRole: boolean
}
```

### useProfile

Profile management hook.

**Returns:**
```typescript
{
  profile: UserProfile | null
  updateProfile: (updates: Partial<UserProfile>) => Promise<UserProfile>
  isLoading: boolean
  isAuthenticated: boolean
  hasProfile: boolean
}
```

### useSupabase

Direct Supabase client access hook.

**Returns:**
```typescript
{
  supabase: SupabaseClient | null
  session: Session | null
  isInitialized: boolean
}
```

## Types

### UserProfile

```typescript
interface UserProfile {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'user' | 'viewer'
  organization_id?: string
  avatar_url?: string
  phone?: string
  timezone: string
  locale: string
  is_active: boolean
  auth_provider: string
  email_confirmed: boolean
  terms_accepted_at?: string
  privacy_accepted_at?: string
  last_sign_in_at?: string
  preferences: Record<string, any>
  created_at: string
  updated_at: string
}
```

### AuthResult

```typescript
interface AuthResult {
  success: boolean
  user?: User
  session?: Session
  error?: AuthError
}
```

### AuthError

```typescript
class AuthError extends Error {
  code: AuthErrorCode
  details?: any
  
  constructor(code: AuthErrorCode, message: string, details?: any)
}

enum AuthErrorCode {
  INVALID_CREDENTIALS = 'invalid_credentials',
  EMAIL_NOT_CONFIRMED = 'email_not_confirmed',
  USER_NOT_FOUND = 'user_not_found',
  WEAK_PASSWORD = 'weak_password',
  EMAIL_ALREADY_TAKEN = 'email_already_taken',
  RATE_LIMITED = 'rate_limited',
  NETWORK_ERROR = 'network_error',
  UNKNOWN_ERROR = 'unknown_error'
}
```
