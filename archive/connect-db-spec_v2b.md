# Document Categorization System - Live Database Integration Specification (Part B)

**Date:** 2025-09-20  
**Target Location:** `C:\Users\james\Master\BrightHub\BRun\categ-module\`  
**Implementation Agent:** Next Coding Session  
**Purpose:** API Integration & Live Database Operations  
**Part:** B of 2 (Integration Phase)

---

## IMPLEMENTATION DIRECTIVE FOR CODING AGENT

You are implementing **Phase B** of live Supabase database integration for a Next.js document categorization application. Part A has established the authentication foundation and database schema. Part B now connects all application functionality to live database operations.

### PROJECT CONTEXT
- **Current Location**: You are working in `C:\Users\james\Master\BrightHub\BRun\categ-module\`
- **Part A Status**: Authentication foundation complete, routes protected, database schema applied
- **Part B Goal**: Replace all mock operations with live Supabase database operations
- **Authentication Available**: Full user authentication and route protection from Part A
- **Database Ready**: Complete schema and user management system active

### CRITICAL REQUIREMENTS FOR PART B
1. **Replace Mock APIs**: Convert all API endpoints to real Supabase operations
2. **User Context Integration**: All operations must be user-specific
3. **Workflow Store Update**: Connect store to real API calls with authentication
4. **Database Service Layer**: Replace mock services with live Supabase clients
5. **Component Integration**: Update components to use authenticated user context
6. **Complete Testing**: Verify entire workflow works end-to-end

### PART A COMPLETED
- ✅ Complete authentication system integration
- ✅ Full database schema setup in Supabase
- ✅ Protected routes for dashboard and workflow areas
- ✅ Authentication pages (signin/signup)
- ✅ Verified database connectivity and user management

### PART B WILL DELIVER
- Live API endpoints replacing mock responses
- User-specific workflow data persistence
- Real-time database operations for all features
- Complete integration testing
- Production-ready Vercel deployment

---

## CURRENT APPLICATION STATUS

### ✅ **Working from Part A**:
- User authentication and registration
- Route protection and session management
- Database schema and user management
- Protected dashboard and workflow areas

### ❌ **Issues Part B Will Fix**:
- API endpoints return mock responses ← **PART B**
- Workflow data not persisted to database ← **PART B**
- Using mock data throughout the application ← **PART B**
- No user-specific data isolation ← **PART B**
- Components not using authenticated user context ← **PART B**

---

## PHASE 4: API ENDPOINTS INTEGRATION

### Step 4.1: Update Workflow API with Authentication

**File**: `src/app/api/workflow/route.ts`

**Current Issue**: Returns mock responses
**Required**: Replace with real Supabase operations using authenticated users

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const { 
      documentId, 
      belongingRating, 
      selectedCategory, 
      selectedTags, 
      customTags,
      action,
      step
    } = body

    // Get user from auth header or session
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authentication required', success: false },
        { status: 401 }
      )
    }

    // Extract user from token (simplified - in production use proper JWT validation)
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Invalid authentication', success: false },
        { status: 401 }
      )
    }

    if (!documentId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields', success: false },
        { status: 400 }
      )
    }

    switch (action) {
      case 'save_draft':
        // Save workflow as draft with real database operations
        const { data: draftData, error: draftError } = await supabase
          .from('workflow_sessions')
          .upsert({
            document_id: documentId,
            user_id: user.id,
            step: step || 'A',
            belonging_rating: belongingRating,
            selected_category_id: selectedCategory?.id,
            selected_tags: selectedTags || {},
            custom_tags: customTags || [],
            is_draft: true,
            completed_steps: [step || 'A'],
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'document_id,user_id'
          })
          .select()
          .single()

        if (draftError) {
          return NextResponse.json(
            { error: 'Failed to save draft', success: false },
            { status: 500 }
          )
        }

        return NextResponse.json({
          message: 'Draft saved successfully',
          workflowId: draftData.id,
          savedAt: new Date().toISOString(),
          success: true
        })

      case 'submit':
        // Validate all required fields for submission
        if (!belongingRating || !selectedCategory || !selectedTags) {
          return NextResponse.json(
            { error: 'Incomplete workflow data', success: false },
            { status: 400 }
          )
        }

        // Submit complete workflow
        const { data: submitData, error: submitError } = await supabase
          .from('workflow_sessions')
          .upsert({
            document_id: documentId,
            user_id: user.id,
            step: 'complete',
            belonging_rating: belongingRating,
            selected_category_id: selectedCategory.id,
            selected_tags: selectedTags,
            custom_tags: customTags || [],
            is_draft: false,
            completed_steps: ['A', 'B', 'C'],
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'document_id,user_id'
          })
          .select()
          .single()

        if (submitError) {
          return NextResponse.json(
            { error: 'Failed to submit workflow', success: false },
            { status: 500 }
          )
        }

        return NextResponse.json({
          message: 'Workflow submitted successfully',
          workflowId: submitData.id,
          submittedAt: new Date().toISOString(),
          success: true
        })

      case 'validate':
        // Validate workflow step
        const errors: Record<string, string> = {}
        
        if (body.step === 'A' && !belongingRating) {
          errors.belongingRating = 'Please provide a relationship rating'
        }
        
        if (body.step === 'B' && !selectedCategory) {
          errors.selectedCategory = 'Please select a primary category'
        }
        
        if (body.step === 'C') {
          const requiredDimensions = ['authorship', 'disclosure-risk', 'intended-use']
          requiredDimensions.forEach(dim => {
            if (!selectedTags || !selectedTags[dim] || selectedTags[dim].length === 0) {
              errors[dim] = `Please select at least one ${dim.replace('-', ' ')} tag`
            }
          })
        }

        return NextResponse.json({
          valid: Object.keys(errors).length === 0,
          errors,
          success: true
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action', success: false },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Workflow API Error:', error)
    return NextResponse.json(
      { error: 'Workflow operation failed', success: false },
      { status: 500 }
    )
  }
}
```

### Step 4.2: Update Categories API

**File**: `src/app/api/categories/route.ts`

**Required**: Replace mock data with real Supabase operations

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch categories', success: false },
        { status: 500 }
      )
    }

    return NextResponse.json({
      categories: categories || [],
      success: true
    })
  } catch (error) {
    console.error('Categories API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories', success: false },
      { status: 500 }
    )
  }
}
```

### Step 4.3: Update Tags API

**File**: `src/app/api/tags/route.ts`

**Required**: Replace mock data with real Supabase operations

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    const { data: tagDimensions, error } = await supabase
      .from('tag_dimensions')
      .select(`
        *,
        tags (*)
      `)
      .order('sort_order', { ascending: true })

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch tags', success: false },
        { status: 500 }
      )
    }

    return NextResponse.json({
      tagDimensions: tagDimensions || [],
      success: true
    })
  } catch (error) {
    console.error('Tags API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tags', success: false },
      { status: 500 }
    )
  }
}
```

### Step 4.4: Update Documents API

**File**: `src/app/api/documents/route.ts`

**Required**: Replace mock data with real Supabase operations

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    const { data: documents, error } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch documents', success: false },
        { status: 500 }
      )
    }

    return NextResponse.json({
      documents: documents || [],
      success: true
    })
  } catch (error) {
    console.error('Documents API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch documents', success: false },
      { status: 500 }
    )
  }
}
```

---

## PHASE 5: WORKFLOW STORE INTEGRATION

### Step 5.1: Update Workflow Store with Real API Calls

**File**: `src/stores/workflow-store.ts`

**Current Issue**: Simulates API calls with delays
**Required**: Replace with real API calls using authentication

Find the `submitWorkflow` function and replace the simulation with real API calls:

```typescript
// Find this section (around lines 198-227) and replace:
submitWorkflow: async () => {
  const state = get();
  
  // Get auth token for API calls (you'll need to import useAuth or get token from context)
  const token = localStorage.getItem('supabase.auth.token'); // This is simplified
  
  try {
    // Make real API call instead of simulation
    const response = await fetch('/api/workflow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ 
        action: 'submit',
        documentId: state.currentDocument?.id,
        belongingRating: state.belongingRating,
        selectedCategory: state.selectedCategory,
        selectedTags: state.selectedTags,
        customTags: state.customTags,
        step: state.currentStep
      })
    });

    if (!response.ok) {
      throw new Error('Failed to submit workflow');
    }

    const data = await response.json();
    
    if (data.success) {
      // Mark as complete
      set({ 
        currentStep: 'complete',
        isDraft: false,
        completedSteps: ['A', 'B', 'C'],
        lastSaved: new Date().toISOString()
      });
    } else {
      throw new Error(data.error || 'Submission failed');
    }
  } catch (error) {
    console.error('Failed to submit workflow:', error);
    // Handle error appropriately
    throw error;
  }
},
```

### Step 5.2: Add Authentication Context to Store

**Required**: The workflow store needs access to authentication context. Update the store to use the auth context:

```typescript
// Add this import at the top
import { useAuth } from '@brighthub/auth-module'

// Modify the store to accept auth context or create a hook version:
export const useWorkflowStore = () => {
  const { user, session } = useAuth()
  const store = useWorkflowStoreBase()

  // Override methods that need authentication
  const submitWorkflow = async () => {
    if (!user || !session) {
      throw new Error('User not authenticated')
    }

    const state = store.getState()
    
    try {
      const response = await fetch('/api/workflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ 
          action: 'submit',
          documentId: state.currentDocument?.id,
          belongingRating: state.belongingRating,
          selectedCategory: state.selectedCategory,
          selectedTags: state.selectedTags,
          customTags: state.customTags,
          step: state.currentStep
        })
      })

      if (!response.ok) {
        throw new Error('Failed to submit workflow')
      }

      const data = await response.json()
      
      if (data.success) {
        store.setState({ 
          currentStep: 'complete',
          isDraft: false,
          completedSteps: ['A', 'B', 'C'],
          lastSaved: new Date().toISOString()
        })
      } else {
        throw new Error(data.error || 'Submission failed')
      }
    } catch (error) {
      console.error('Failed to submit workflow:', error)
      throw error
    }
  }

  return {
    ...store,
    submitWorkflow
  }
}
```

---

## PHASE 6: DATABASE SERVICE LAYER UPDATE

### Step 6.1: Replace Mock Database Services

**File**: `src/lib/database.ts`

**Current Issue**: Uses mock data from `supabase-mock.ts`
**Required**: Replace with real Supabase operations

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Document operations
export const documentService = {
  async getAll() {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  }
}

// Category operations
export const categoryService = {
  async getAll() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true })
    
    if (error) throw error
    return data
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  }
}

// Tag operations  
export const tagService = {
  async getDimensions() {
    const { data, error } = await supabase
      .from('tag_dimensions')
      .select(`
        *,
        tags (*)
      `)
      .order('sort_order', { ascending: true })
    
    if (error) throw error
    return data
  },

  async getTagsByDimension(dimensionId: string) {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .eq('dimension_id', dimensionId)
      .order('sort_order', { ascending: true })
    
    if (error) throw error
    return data
  }
}

// Workflow session operations - WITH USER CONTEXT
export const workflowService = {
  async createSession(documentId: string, userId: string) {
    const { data, error } = await supabase
      .from('workflow_sessions')
      .insert({
        document_id: documentId,
        user_id: userId,
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

  async getSession(documentId: string, userId: string) {
    const { data, error } = await supabase
      .from('workflow_sessions')
      .select('*')
      .eq('document_id', documentId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  async updateSession(sessionId: string, updates: any) {
    const { data, error } = await supabase
      .from('workflow_sessions')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async completeSession(sessionId: string, finalData: any) {
    const { data, error } = await supabase
      .from('workflow_sessions')
      .update({
        ...finalData,
        step: 'complete',
        is_draft: false,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  // Get user's workflow sessions
  async getUserSessions(userId: string) {
    const { data, error } = await supabase
      .from('workflow_sessions')
      .select(`
        *,
        documents (*)
      `)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
    
    if (error) throw error
    return data
  }
}
```

---

## PHASE 7: COMPONENT INTEGRATION WITH AUTHENTICATION

### Step 7.1: Update Components to Use Authentication

**File**: `src/components/server/DocumentSelectorServer.tsx`

**Required**: Update to use authenticated user context

```typescript
import { useAuth } from '@brighthub/auth-module'
import { documentService, workflowService } from '@/lib/database'

export default async function DocumentSelectorServer() {
  const { user } = useAuth()
  
  if (!user) {
    return <div>Authentication required</div>
  }

  try {
    const documents = await documentService.getAll()
    const userSessions = await workflowService.getUserSessions(user.id)
    
    return (
      <div>
        {/* Document selector with user-specific sessions */}
        {documents.map(document => {
          const userSession = userSessions.find(s => s.document_id === document.id)
          return (
            <DocumentCard 
              key={document.id}
              document={document}
              session={userSession}
              userId={user.id}
            />
          )
        })}
      </div>
    )
  } catch (error) {
    console.error('Failed to load documents:', error)
    return <div>Failed to load documents</div>
  }
}
```

### Step 7.2: Update Dashboard to Show User Information

**File**: `src/app/(dashboard)/dashboard/page.tsx`

**Required**: Add user information and sign out functionality

```typescript
'use client'

import { useAuth } from '@brighthub/auth-module'
import DocumentSelectorClient from '@/components/client/DocumentSelectorClient'

export default function DashboardPage() {
  const { user, profile, signOut, isLoading } = useAuth()

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return <div>Please sign in to continue</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with user info */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Document Categorization
              </h1>
              <p className="text-gray-600">
                Welcome back, {profile?.full_name || user.email}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user.email}</span>
              <button
                onClick={signOut}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <DocumentSelectorClient />
      </div>
    </div>
  )
}
```

---

## PHASE 8: TESTING AND VALIDATION

### Step 8.1: Database Connectivity Test

**Action**: Run the existing test script to verify database connectivity:

```bash
node test-database.js
```

### Step 8.2: Authentication Flow Test

**Required**: Test the complete authentication flow:

1. Navigate to `/dashboard` (should redirect to `/signin`)
2. Sign up with a new account
3. Verify user appears in `user_profiles` table
4. Sign in with the account
5. Access protected dashboard routes
6. Test workflow creation and persistence

### Step 8.3: Workflow Integration Test

**Required**: Test the complete workflow with authentication:

1. Sign in as authenticated user
2. Select a document
3. Complete Step A (belonging rating) - verify saves to database
4. Complete Step B (category selection) - verify saves to database  
5. Complete Step C (tag selection) - verify saves to database
6. Submit workflow - verify final submission saves to database
7. Sign out and sign back in - verify workflow state persists

### Step 8.4: Vercel Deployment Test

**Required**: Verify the application works correctly on Vercel:

1. Deploy to Vercel with updated environment variables
2. Test authentication flow in production
3. Verify database operations work in production environment
4. Test workflow persistence across sessions

---

## PART B VALIDATION REQUIREMENTS

### ✅ **Part B Complete When:**

1. **API Integration**: All endpoints use real Supabase operations with user context
2. **Workflow Store**: Store uses real API calls with authentication tokens
3. **Database Services**: All services replaced with live Supabase clients
4. **Component Integration**: Components use authenticated user context
5. **User Isolation**: All data operations are user-specific
6. **End-to-End Testing**: Complete workflow works from authentication to data persistence
7. **Production Deployment**: Application works correctly on Vercel with live database

### 🔧 **Part B Validation Commands:**

```bash
# Type check
npm run type-check

# Build for production
npm run build

# Test database connectivity
node test-database.js

# Start development server
npm run dev

# Run any existing tests
npm test
```

### 📋 **Part B Success Criteria Checklist:**

- [ ] All API endpoints updated to use real Supabase operations with user context
- [ ] Workflow store updated to make real API calls with authentication
- [ ] Database services replaced with real Supabase operations
- [ ] Components updated to use authenticated user context
- [ ] Dashboard shows user information and sign-out functionality
- [ ] User data isolation working correctly
- [ ] Complete authentication flow tested successfully
- [ ] End-to-end workflow testing completed
- [ ] Database connectivity test passes
- [ ] Application builds and runs correctly
- [ ] Vercel deployment works with live database
- [ ] Workflow state persists across user sessions

### 🚨 **Common Issues and Solutions:**

1. **Authentication Token Issues:**
   - Ensure proper token handling in API endpoints
   - Verify session management works correctly
   - Check token extraction and validation

2. **Database Operation Issues:**
   - Verify all RLS policies are correctly applied
   - Ensure user context is properly passed to database operations
   - Check for proper error handling in database calls

3. **Component Integration Issues:**
   - Verify auth context is available in all components
   - Check for proper loading and error states
   - Ensure user-specific data is correctly filtered

4. **Vercel Deployment Issues:**
   - Ensure all environment variables are set in Vercel dashboard
   - Verify build process includes authentication module correctly
   - Check production database connectivity

---

## POST-PART B VERIFICATION

After completing Part B, verify the complete integration:

1. **Full Authentication Flow**: Users can register, login, and access protected content
2. **Database Operations**: All CRUD operations work with real Supabase data
3. **User Isolation**: Each user only sees their own workflow sessions
4. **State Persistence**: User sessions and workflow progress persist correctly
5. **Production Deployment**: Application works correctly on Vercel with live database

**Part B Success Message**: When all validation criteria are met, the document categorization system will be fully integrated with live Supabase database operations, complete user authentication, and ready for production use on Vercel. The application now provides complete workflow persistence, user-specific data isolation, and real-time database operations.

---

**IMPLEMENTATION AGENT**: Complete Part B step-by-step to achieve full database integration. Focus on replacing all mock operations with real Supabase database operations while maintaining user context and authentication. Test each component thoroughly before proceeding to the next. The goal is a production-ready application with complete database integration and user authentication.
