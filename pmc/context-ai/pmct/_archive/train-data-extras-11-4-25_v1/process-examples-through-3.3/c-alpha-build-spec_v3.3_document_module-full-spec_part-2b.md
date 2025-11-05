# Document Upload Module - Part 2 Turnover (Enhanced)
**Date:** October 10, 2025  
**Status:** Prompts 1-3 Complete, Part 2 Remaining  
**Prepared For:** Next Implementation Agent  
**Version:** 2.0 (Enhanced with Agent Onboarding)

---

# 🚀 AGENT ONBOARDING GUIDE

## Welcome, Implementation Agent!

You are picking up where the previous agent left off. This comprehensive onboarding guide provides **everything you need** to create Prompts 4-6 that will complete the Document Upload Module for the Bright Run LoRA Training Data Platform.

---

## 📋 Quick Start Checklist (30-45 minutes)

Before writing any code or prompts, complete these steps:

- [ ] **Read this entire onboarding section** (15 minutes)
- [ ] **Scan the original requirements spec** linked below (10 minutes)
- [ ] **Review Prompt 1 format and structure** (5 minutes)
- [ ] **Review Prompt 2 for UI patterns** (5 minutes)
- [ ] **Review Prompt 3 for service patterns** (5 minutes)
- [ ] **Check the wireframe code** in doc-module/ (5 minutes - optional)

**After onboarding, you'll have:**
✅ Complete context on what's been built  
✅ Understanding of code patterns to follow  
✅ Clear picture of what needs to be created  
✅ All necessary reference materials

---

## 📚 Required Reading List

### CRITICAL - Must Read Before Starting

1. **This Turnover Document** (you're reading it!)
   - **File:** `pmc\context-ai\pmct\c-alpha-build-spec_v3.3_document_module-full-spec_part-2b.md`
   - **What:** Overview of remaining work, architecture context, patterns
   - **Time:** 20 minutes
   - **Focus:** Agent Onboarding section, Remaining Feature Sets

2. **Original Requirements Specification**
   - **File:** `pmc\context-ai\pmct\c-alpha-build-spec_v3.3_document_module_v3.md`
   - **What:** Complete functional and technical requirements
   - **Time:** 30 minutes (skim), refer back as needed
   - **Key Sections:**
     - FR-3: Upload Queue Management (lines 297-369)
     - FR-5: Status Reporting and Monitoring (lines 445-504)
     - FR-2: Metadata Capture (lines 242-296)
     - WF-1 through WF-5: Wireframe Functionality (lines 1038-1214)
     - TR-3: API Endpoints (lines 703-767)

3. **Completed Prompt 1** (Database & Infrastructure)
   - **File:** `pmc\context-ai\pmct\c-alpha-build-spec_v3.3_document_module-full-spec_v1-PROMPT1.md`
   - **What:** See the prompt format, SQL structure, API patterns
   - **Time:** 10 minutes
   - **Focus:** How SQL blocks are formatted, directive style, verification steps

4. **Completed Prompt 2** (Upload UI Components)
   - **File:** `pmc\context-ai\pmct\c-alpha-build-spec_v3.3_document_module-full-spec_v1-PROMPT2.md`
   - **What:** React component patterns, state management, UI structure
   - **Time:** 10 minutes
   - **Focus:** Component structure, imports, toast notifications

5. **Completed Prompt 3** (Text Extraction Engine)
   - **File:** `pmc\context-ai\pmct\c-alpha-build-spec_v3.3_document_module-full-spec_v1-PROMPT3.md`
   - **What:** Service class patterns, error handling, async processing
   - **Time:** 10 minutes
   - **Focus:** Service architecture, error types, logging patterns

### RECOMMENDED - High Value Reference

6. **Wireframe Implementation** (UI Reference)
   - **Directory:** `doc-module/src/components/`
   - **Files to Check:**
     - `queue-management.tsx` - Queue table implementation
     - `upload-interface.tsx` - Statistics cards layout
     - `content-preview.tsx` - Preview modal structure
   - **What:** See the desired UI/UX in action
   - **Time:** 10 minutes (optional but very helpful)
   - **Note:** Don't copy code directly, but use as visual reference

7. **Existing Codebase Components**
   - **Directory:** `src/components/ui/`
   - **What:** 48 pre-built Radix UI components
   - **Time:** 5 minutes (just scan available components)
   - **Purpose:** Know what's already available (don't recreate!)

---

## 🏗️ Architecture Context - What's Been Built

### System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Bright Run Platform                      │
│            LoRA Training Data Platform (Next.js 14)          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│               DOCUMENT UPLOAD MODULE (Phase 1-3)             │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────┐    ┌──────────────┐    ┌───────────────┐  │
│  │   PROMPT 1  │───▶│   PROMPT 2   │───▶│   PROMPT 3    │  │
│  │  Database   │    │  Upload UI   │    │     Text      │  │
│  │ & Storage   │    │  Components  │    │  Extraction   │  │
│  └─────────────┘    └──────────────┘    └───────────────┘  │
│         │                   │                    │           │
│         ▼                   ▼                    ▼           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Current State (Functional)               │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │ ✅ Upload files via drag-drop or file selection       │  │
│  │ ✅ Store in Supabase Storage (secure, RLS policies)   │  │
│  │ ✅ Extract text from PDF, DOCX, HTML, TXT, MD, RTF    │  │
│  │ ✅ Track processing status in database                │  │
│  │ ✅ Error handling with retry capability               │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│            YOUR WORK: Prompts 4-6 (Part 2)                   │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐  │
│  │  PROMPT 4: Status Polling & Queue Management         │  │
│  │  - Real-time status updates (2-second polling)        │  │
│  │  - Full-featured upload queue table                   │  │
│  │  - Filters, search, batch operations                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  PROMPT 5: Metadata & Preview Features               │  │
│  │  - Edit metadata after upload                         │  │
│  │  - Preview extracted content                          │  │
│  │  - Enhanced error details                             │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  PROMPT 6: Workflow Integration & Testing            │  │
│  │  - Connect to categorization workflow                 │  │
│  │  - Bulk workflow processing                           │  │
│  │  - End-to-end testing                                 │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions from Prompts 1-3

#### Decision 1: Integrated Module Approach
- ✅ **Chosen:** Build within existing `src/` Next.js app
- ❌ **Rejected:** Standalone application
- **Rationale:** Reuses 48 existing UI components, unified auth, single deployment
- **Impact:** You must use existing components from `src/components/ui/`

#### Decision 2: Server-Side Text Extraction
- ✅ **Chosen:** Text extraction happens server-side using Node.js libraries
- ❌ **Rejected:** Client-side extraction (browser limitations)
- **Rationale:** Security, reliability, handles all file types
- **Impact:** All extraction code is in `src/lib/file-processing/`

#### Decision 3: JavaScript Polling for Status
- ✅ **Chosen:** Poll status endpoint every 2 seconds
- ❌ **Rejected:** WebSockets (Vercel serverless incompatibility)
- **Rationale:** Simple, Vercel-compatible, sufficient for 2-30s processing
- **Impact:** You'll create polling endpoint + React hook in Prompt 4

#### Decision 4: Supabase for Everything
- **Database:** PostgreSQL via Supabase
- **Storage:** Supabase Storage with RLS policies
- **Auth:** Supabase Auth (JWT tokens)
- **Impact:** All your APIs must authenticate via Supabase auth tokens

#### Decision 5: Status Values
- **New statuses added:** 'uploaded', 'processing', 'error'
- **Existing statuses:** 'pending', 'categorizing', 'completed'
- **Flow:** uploaded → processing → completed (or error)
- **Impact:** Your status polling must handle all these states

---

## 💻 Code Patterns to Follow

### Pattern 1: API Endpoint Structure

**Every API endpoint you create should follow this pattern:**

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase'; // Adjust path

export const runtime = 'nodejs'; // For file/database operations
export const maxDuration = 60; // Timeout in seconds

export async function GET(request: NextRequest) {
  console.log('[EndpointName] Request received'); // Always log with prefix
  
  try {
    // Step 1: Authentication (ALWAYS FIRST)
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { success: false, error: 'Authentication required', errorCode: 'AUTH_REQUIRED' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid authentication', errorCode: 'AUTH_INVALID' },
        { status: 401 }
      );
    }

    // Step 2: Parse request (query params for GET, body for POST)
    const { searchParams } = new URL(request.url);
    const param = searchParams.get('param');

    // Step 3: Validate inputs
    if (!param) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameter', errorCode: 'INVALID_REQUEST' },
        { status: 400 }
      );
    }

    // Step 4: Execute business logic
    // ... your code here ...

    // Step 5: Return success response
    return NextResponse.json({
      success: true,
      data: { /* your data */ }
    }, { status: 200 });

  } catch (error) {
    console.error('[EndpointName] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', errorCode: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}
```

**Key Points:**
- ✅ Always authenticate first
- ✅ Always use try/catch
- ✅ Always log with `[ComponentName]` prefix
- ✅ Always return `{ success: boolean, ... }` format
- ✅ Always include errorCode for client-side handling

### Pattern 2: React Component Structure

**Every React component should follow this pattern:**

```typescript
'use client'; // For components with interactivity/state

import React, { useState } from 'react';
import { Button } from '../ui/button'; // Import from ui/
import { Card, CardContent } from '../ui/card';
import { toast } from 'sonner'; // For notifications

interface ComponentProps {
  // Define prop types
  onAction: (data: string) => void;
  currentState: string;
}

/**
 * Component Name
 * 
 * Brief description of what this component does
 * 
 * @param props - Component props
 */
export function ComponentName({ onAction, currentState }: ComponentProps) {
  // State management
  const [localState, setLocalState] = useState<string>('');

  // Event handlers
  const handleAction = () => {
    try {
      // Business logic
      onAction(localState);
      toast.success('Action completed');
    } catch (error) {
      toast.error('Action failed', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // Render
  return (
    <Card>
      <CardContent className="p-4">
        {/* Your JSX */}
        <Button onClick={handleAction}>
          Do Action
        </Button>
      </CardContent>
    </Card>
  );
}
```

**Key Points:**
- ✅ Use `'use client'` for components with state/interactivity
- ✅ Import UI components from `@/components/ui/` or `../ui/`
- ✅ Use `toast` from `sonner` for notifications
- ✅ TypeScript interfaces for all props
- ✅ JSDoc comment describing component
- ✅ Tailwind CSS for styling

### Pattern 3: React Hook Structure

```typescript
import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook description
 * 
 * @param param - Parameter description
 * @returns Hook return value description
 */
export function useCustomHook(param: string) {
  const [state, setState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Side effects
    let mounted = true;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Async work
        if (mounted) {
          setState('result');
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Unknown error');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false; // Cleanup
    };
  }, [param]);

  return { state, isLoading, error };
}
```

### Pattern 4: Database Queries

```typescript
// Query with auth and error handling
const { data: documents, error } = await supabase
  .from('documents')
  .select('*')
  .eq('author_id', user.id) // Always filter by user
  .order('created_at', { ascending: false })
  .limit(100);

if (error) {
  console.error('[Component] Database error:', error);
  throw new Error('Failed to fetch documents');
}
```

**Key Points:**
- ✅ Always filter by `author_id` for user-scoped data
- ✅ Always check for `error` after query
- ✅ Use `.select('*')` or specify columns
- ✅ Order and limit results appropriately

---

## 🗄️ Complete Database Schema (After Prompt 1)

### Documents Table (Current State)

```sql
CREATE TABLE documents (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Core document data
  title TEXT NOT NULL,
  content TEXT,                      -- Populated by text extraction
  summary TEXT,                      -- Populated later (optional)
  
  -- Ownership and timestamps
  author_id UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Document status (workflow)
  status TEXT CHECK (status IN (
    'pending',      -- Initial state (seed data)
    'categorizing', -- In categorization workflow
    'completed',    -- Workflow complete
    'uploaded',     -- NEW: File uploaded, pending processing
    'processing',   -- NEW: Text extraction in progress
    'error'         -- NEW: Processing failed
  )),
  
  -- File information
  file_path TEXT,                    -- Supabase Storage path
  file_size INTEGER,                 -- File size in bytes
  metadata JSONB DEFAULT '{}',       -- Generic metadata
  
  -- Metadata fields (added in Prompt 1)
  doc_version TEXT,                  -- User-provided version (v1.0, Draft, etc.)
  source_type TEXT,                  -- Auto-detected: pdf, docx, txt, markdown, html, rtf
  source_url TEXT,                   -- Optional source URL or path
  doc_date TIMESTAMPTZ,              -- Original document date (not upload date)
  
  -- Processing tracking (added in Prompt 1)
  processing_progress INTEGER DEFAULT 0 CHECK (processing_progress >= 0 AND processing_progress <= 100),
  processing_error TEXT,             -- Error message if status = 'error'
  processing_started_at TIMESTAMPTZ, -- When text extraction started
  processing_completed_at TIMESTAMPTZ -- When text extraction completed
);

-- Indexes (added in Prompt 1)
CREATE INDEX idx_documents_status_updated 
  ON documents(status, updated_at) 
  WHERE status IN ('uploaded', 'processing');

CREATE INDEX idx_documents_source_type 
  ON documents(source_type) 
  WHERE source_type IS NOT NULL;
```

### User Profiles Table (Existing)

```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT CHECK (role IN ('admin', 'user', 'viewer')) DEFAULT 'user',
  organization_id UUID,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);
```

### Storage Buckets (Configured in Prompt 1)

**Bucket Name:** `documents`  
**Type:** Private  
**Max File Size:** 100MB (104857600 bytes)  
**File Path Pattern:** `{userId}/{timestamp}-{sanitized_filename}`

**RLS Policies:**
- Users can upload to their own folder
- Users can read their own documents
- Users can update their own documents
- Users can delete their own documents

---

## 🎨 UI Component Catalog

### Available Radix UI Components (in `src/components/ui/`)

You have access to 48 pre-built components. **DO NOT recreate these!**

#### Layout & Container
- `Card`, `CardContent`, `CardHeader`, `CardTitle`, `CardDescription`, `CardFooter`
- `Sheet`, `SheetTrigger`, `SheetContent`, `SheetHeader`, `SheetTitle`
- `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`
- `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`
- `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent`
- `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent`
- `ScrollArea`
- `Separator`
- `Resizable`, `ResizablePanel`, `ResizableHandle`

#### Form Elements
- `Button`
- `Input`
- `Textarea`
- `Label`
- `Select`, `SelectTrigger`, `SelectContent`, `SelectItem`
- `Checkbox`
- `RadioGroup`, `RadioGroupItem`
- `Switch`
- `Slider`
- `Calendar`
- `DatePicker` (via react-day-picker)
- `InputOTP`

#### Feedback & Status
- `Alert`, `AlertTitle`, `AlertDescription`
- `Badge`
- `Progress`
- `Skeleton`
- `Spinner` (via lucide-react icons)
- `Toast` / `Toaster` (via sonner)

#### Navigation & Menu
- `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`
- `ContextMenu`, `ContextMenuTrigger`, `ContextMenuContent`, `ContextMenuItem`
- `Menubar`, `MenubarMenu`, `MenubarTrigger`, `MenubarContent`, `MenubarItem`
- `NavigationMenu`, `NavigationMenuList`, `NavigationMenuItem`
- `Breadcrumb`, `BreadcrumbList`, `BreadcrumbItem`
- `Pagination`, `PaginationContent`, `PaginationItem`

#### Data Display
- `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableCell`
- `Avatar`, `AvatarImage`, `AvatarFallback`
- `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider`
- `HoverCard`, `HoverCardTrigger`, `HoverCardContent`
- `Popover`, `PopoverTrigger`, `PopoverContent`
- `Chart` (via recharts)
- `Carousel`, `CarouselContent`, `CarouselItem`

#### Other
- `Command`, `CommandInput`, `CommandList`, `CommandItem`
- `Toggle`, `ToggleGroup`
- `AspectRatio`
- `Drawer` (via vaul)
- `Sidebar`

### Icons (via lucide-react)

```typescript
import { 
  Upload, Download, FileText, File, Folder,
  CheckCircle, XCircle, AlertCircle, Clock,
  Search, Filter, Edit, Trash2, MoreVertical,
  ChevronUp, ChevronDown, ChevronLeft, ChevronRight,
  Plus, Minus, X, Check, Loader2
} from 'lucide-react';
```

### Notification System (sonner)

```typescript
import { toast } from 'sonner';

// Success notification
toast.success('Upload complete', {
  description: 'Your file was uploaded successfully'
});

// Error notification
toast.error('Upload failed', {
  description: error.message
});

// Loading notification
toast.loading('Processing...', { id: 'process-id' });
toast.success('Done!', { id: 'process-id' }); // Updates the loading toast
```

---

## 🔍 What You're Building: Visual Overview

### Prompt 4: Status Polling & Queue Management

**Status Polling Hook Flow:**
```
User uploads file
     ↓
File stored in Supabase Storage
     ↓
Database: status = 'uploaded'
     ↓
Processing triggered (Prompt 3)
     ↓
[YOUR WORK] Status polling starts
     ↓
Poll /api/documents/status every 2 seconds
     ↓
Update UI with progress (0% → 100%)
     ↓
Status changes: uploaded → processing → completed
     ↓
Stop polling when completed or error
```

**Upload Queue UI Layout:**
```
┌─────────────────────────────────────────────────────────┐
│  Upload Documents                                        │
├─────────────────────────────────────────────────────────┤
│  Statistics:                                             │
│  [Total: 45] [Queued: 5] [Processing: 2] [Complete: 35] │
├─────────────────────────────────────────────────────────┤
│  Filters:                                                │
│  [Status ▼] [File Type ▼] [Date ▼] [Search_______]     │
├─────────────────────────────────────────────────────────┤
│  Batch Actions: [Select All] [Retry] [Delete]           │
├─────────────────────────────────────────────────────────┤
│  ☐ │ 📄 document.pdf    │ ⚙️ Processing  │ [▓▓▓▓░] 75% │ │
│  ☐ │ 📄 report.docx     │ ✅ Completed   │ 2.5 MB      │ │
│  ☐ │ 📄 notes.txt       │ ⚙️ Processing  │ [▓▓░░░] 40% │ │
│  ☐ │ 📄 invoice.pdf     │ ❌ Error       │ [Actions▼]  │ │
└─────────────────────────────────────────────────────────┘
```

### Prompt 5: Metadata & Preview

**Metadata Edit Dialog:**
```
┌──────────────────────────────────────┐
│  Edit Document Metadata         [X] │
├──────────────────────────────────────┤
│  Title: [________________________]  │
│  Version: [______________________]  │
│  Source URL: [___________________]  │
│  Date: [__/__/__] 📅                │
│  Type: PDF (detected)               │
│                                      │
│  [Cancel]              [Save]       │
└──────────────────────────────────────┘
```

**Content Preview Sheet:**
```
┌──────────────────────────────────────────┐
│  Content Preview                    [X]  │
├──────────────────────────────────────────┤
│  📄 document.pdf                         │
│  2.5 MB • PDF • Uploaded 5m ago          │
├──────────────────────────────────────────┤
│  Extracted Text:                         │
│  ┌────────────────────────────────────┐  │
│  │ This is the extracted text from    │  │
│  │ the PDF document. Lorem ipsum...   │  │
│  │                                    │  │
│  │ [First 1000 characters shown]     │  │
│  └────────────────────────────────────┘  │
│                                          │
│  Validation:                             │
│  ✓ Format Valid                          │
│  ✓ Content Length: 5,234 chars           │
│  ✓ Encoding: UTF-8                       │
│  ✓ Quality Score: 98%                    │
│                                          │
│  [View Full Document]                    │
└──────────────────────────────────────────┘
```

---

## 📝 Prompt Format Requirements

Your Prompts 4-6 **MUST** follow this exact format (from Prompts 1-3):

### 1. Document Header
```markdown
# PROMPT X: Title
**Module:** Document Upload & Processing  
**Phase:** Phase Name  
**Estimated Time:** X hours  
**Prerequisites:** Previous prompts completed

---

## CONTEXT FOR CODING AGENT
[Provide complete context - assume agent has NO prior knowledge]
```

### 2. SQL/Code Block Delimiters
```markdown
====================

## STEP X: Directive Title

**DIRECTIVE:** You shall [action verb] the following...

**Instructions:**
1. Step one
2. Step two

**SQL/Code:**
```sql
-- Code here
```

**Verification:**
- Check this
- Verify that

++++++++++++++++++++++++
```

**CRITICAL:** 
- `====================` (20 equals) BEFORE each SQL/code directive
- `+++++++++++++++++++++` (20 plus signs) AFTER each SQL/code directive
- Three blank lines before `====` and after `++++`

### 3. Complete Code Blocks
- ✅ **DO:** Provide complete, copy-paste-ready code
- ❌ **DON'T:** Use placeholders like "// your code here"
- ✅ **DO:** Include all imports, types, error handling
- ❌ **DON'T:** Say "implement this function" without showing how

### 4. Self-Contained Instructions
Each prompt must include:
- Complete context (what's been built, what's being built)
- All necessary imports and dependencies
- Complete file contents (not snippets)
- Verification steps to check work
- Testing procedures

### 5. Directive Style
Use imperative commands:
- ✅ "You shall create a file..."
- ✅ "You shall execute the following SQL..."
- ✅ "You shall verify the endpoint works by..."
- ❌ "You could create..." or "Consider creating..."

---

## ✅ Pre-Flight Checklist

Before writing Prompt 4, verify you understand:

- [ ] The status values and their flow (uploaded → processing → completed)
- [ ] How authentication works (JWT tokens from Supabase)
- [ ] The API response format (`{ success: boolean, ... }`)
- [ ] Available UI components (don't recreate Button, Card, etc.)
- [ ] The polling mechanism (2-second interval, stop when complete)
- [ ] Database schema (especially documents table columns)
- [ ] File structure (`src/app/api/`, `src/components/`, `src/lib/`)
- [ ] Import paths (relative vs `@/` alias)
- [ ] Error handling pattern (try/catch, error codes, toast)
- [ ] The wireframe reference in `doc-module/`

**If you can't check all boxes**, re-read the relevant sections above!

---

## 🎯 Success Criteria

Your Prompts 4-6 will be successful when they:

1. ✅ Follow the exact format from Prompts 1-3
2. ✅ Use `====` and `++++` delimiters correctly
3. ✅ Provide complete, copy-paste-ready code
4. ✅ Include all context needed for execution
5. ✅ Have clear verification and testing steps
6. ✅ Maintain consistency with established patterns
7. ✅ Reference specific sections of requirements spec
8. ✅ Can be executed in a NEW chat with NO prior context

---

## 📞 Quick Reference

| Need | Location | Section |
|------|----------|---------|
| **API pattern** | This doc | 💻 Code Patterns → Pattern 1 |
| **Component pattern** | This doc | 💻 Code Patterns → Pattern 2 |
| **Database schema** | This doc | 🗄️ Complete Database Schema |
| **UI components** | This doc | 🎨 UI Component Catalog |
| **Requirements** | `c-alpha-build-spec_v3.3_document_module_v3.md` | FR-3, FR-5, WF-* |
| **Prompt format** | Prompt 1 | Steps 1-5 |
| **React patterns** | Prompt 2 | UploadDropzone component |
| **Service patterns** | Prompt 3 | TextExtractor class |

---

# END OF AGENT ONBOARDING

✅ **You're now ready to create Prompts 4-6!**

The rest of this document contains detailed feature specifications for what needs to be built. Use it as your reference while writing the prompts.

---

---

# PART 2: FEATURE SPECIFICATIONS

## Executive Summary

Prompts 1-3 have successfully implemented the **core document upload and text extraction functionality**. Users can now upload files, and text is automatically extracted from PDF, DOCX, HTML, TXT, MD, and RTF formats. This section outlines the remaining features needed to complete the full module as specified in the requirements document.

---

## What's Been Completed (Prompts 1-3)

### ✅ Prompt 1: Database & Infrastructure
- Database schema updated with 8 processing columns
- Supabase Storage bucket configured with RLS policies
- NPM packages installed (pdf-parse, mammoth, html-to-text)
- TypeScript type definitions created
- Upload API endpoint (`/api/documents/upload`)

### ✅ Prompt 2: Upload UI Components  
- Upload Dropzone component (drag-drop + file selection)
- Upload Page with progress tracking
- Dashboard integration ("Upload Documents" button)
- Loading states and error handling

### ✅ Prompt 3: Text Extraction Engine
- Text Extractor Service (multi-format support)
- Document Processor orchestrator
- Processing API endpoint (`/api/documents/process`)
- Error handling and retry logic

---

## What Remains (Part 2)

The following features are specified in `c-alpha-build-spec_v3.3_document_module_v3.md` but not yet implemented. They should be organized into 2-3 additional prompts.

---

## REMAINING FEATURE SET 1: Status Polling & Real-Time Updates

### Priority: HIGH
**Estimated Time:** 3-4 hours  
**Complexity:** Medium

### Components Needed:

#### 1. Status Polling API Endpoint
**File:** `src/app/api/documents/status/route.ts`

**Purpose:** Provide current processing status for one or more documents

**Functionality:**
- GET endpoint accepting `?id=uuid` or `?ids=uuid1,uuid2,uuid3`
- Query documents table for status, progress, error messages
- Return JSON with current state
- Support batch queries (up to 100 documents)
- Response time < 200ms

**Response Format:**
```typescript
{
  documents: [
    {
      id: string,
      status: 'uploaded' | 'processing' | 'completed' | 'error',
      progress: number (0-100),
      error: string | null,
      processingStartedAt: string | null,
      processingCompletedAt: string | null,
      estimatedSecondsRemaining: number | null
    }
  ]
}
```

#### 2. Status Polling React Hook
**File:** `src/hooks/use-document-status.ts`

**Purpose:** Custom React hook that polls status endpoint every 2 seconds

**Functionality:**
- Accept document ID or array of IDs
- Poll `/api/documents/status` every 2 seconds
- Stop polling when status reaches 'completed' or 'error'
- Pause polling when browser tab inactive (performance optimization)
- Return current status, progress, loading state

**Usage Pattern:**
```typescript
const { status, progress, error, isPolling } = useDocumentStatus(documentId);
```

#### 3. Update Upload Page with Polling
**File:** `src/app/(dashboard)/upload/page.tsx` (modify)

**Changes:**
- Import and use `useDocumentStatus` hook
- Display real-time progress for each uploading document
- Show live status updates without page refresh
- Update "Recently Uploaded Documents" list dynamically

#### 4. Status Badge Component
**File:** `src/components/upload/document-status.tsx`

**Purpose:** Visual status indicator with icon and color

**Variants:**
- **Queued:** Gray badge, clock icon
- **Processing:** Blue badge, spinner icon, progress percentage
- **Completed:** Green badge, checkmark icon
- **Error:** Red badge, alert icon
- **Paused:** Yellow badge, pause icon

---

## REMAINING FEATURE SET 2: Upload Queue Management

### Priority: HIGH
**Estimated Time:** 4-5 hours  
**Complexity:** High

### Components Needed:

#### 1. Upload Queue Component
**File:** `src/components/upload/upload-queue.tsx`

**Purpose:** Full-featured table showing all user's uploads with management controls

**Features:**
- Table display with columns:
  - Checkbox (for selection)
  - File name with icon
  - Status badge
  - Priority badge
  - Progress bar
  - File size
  - Upload time ("Xm ago")
  - Actions menu (three-dot)
- Sorting: by upload time, status, name, size
- Pagination: 20 items per page
- Row hover effects
- Empty state: "No documents uploaded yet"

#### 2. Upload Statistics Component
**File:** `src/components/upload/upload-stats.tsx`

**Purpose:** Dashboard cards showing aggregate statistics

**Metrics:**
- Total Files (all-time count)
- Queued (status='uploaded')
- Processing (status='processing')
- Completed (status='completed')
- Errors (status='error')

**Design:** 5 cards in grid layout, color-coded

#### 3. Upload Filters Component
**File:** `src/components/upload/upload-filters.tsx`

**Purpose:** Filter and search controls

**Filters:**
- Status dropdown (All, Queued, Processing, Completed, Error)
- File type dropdown (All, PDF, DOCX, TXT, etc.)
- Date range picker (Today, Last 7 days, Last 30 days, Custom)
- Search input (filter by filename)

**Behavior:** Real-time filtering (no submit button)

#### 4. Upload Actions Component
**File:** `src/components/upload/upload-actions.tsx`

**Purpose:** Batch operations toolbar

**Actions:**
- Select All checkbox
- Set Priority (High, Medium, Low) for selected
- Pause selected (future: pause processing)
- Resume selected (future: resume paused)
- Retry selected (re-trigger processing for errors)
- Delete selected (with confirmation dialog)

**Visibility:** Only shows when items are selected

#### 5. Actions Menu (Per-File)
**File:** `src/components/upload/document-actions-menu.tsx`

**Purpose:** Dropdown menu for individual file actions

**Menu Items (contextual):**
- View (navigate to document)
- Preview (show content preview)
- Edit Metadata (future)
- Retry (if error)
- Download Original (future)
- Delete

---

## REMAINING FEATURE SET 3: Metadata & Preview

### Priority: MEDIUM
**Estimated Time:** 3-4 hours  
**Complexity:** Medium

### Components Needed:

#### 1. Metadata Form Component
**File:** `src/components/upload/metadata-form.tsx`

**Purpose:** Edit document metadata after upload

**Fields:**
- Title (text input)
- Document Version (text input, optional)
- Source URL (text input, optional, validate URL format)
- Document Date (date picker, optional)
- Source Type (display only, auto-detected)

**Functionality:**
- Inline editing in upload queue
- Or dialog/sheet for bulk editing
- PATCH `/api/documents/{id}` to save changes
- Validation and error display

#### 2. Content Preview Component
**File:** `src/components/upload/content-preview.tsx`

**Purpose:** Preview extracted text content

**Features:**
- Side sheet or modal
- Show first 1000 characters of extracted text
- "View Full Document" button
- Document metadata display:
  - File size
  - File type
  - Upload timestamp
  - Processing time
  - Word count
  - Character count
- Extraction validation status:
  - Format ✓
  - Content length ✓
  - Encoding ✓
  - Quality score

#### 3. Update API for Metadata Editing
**File:** `src/app/api/documents/[id]/route.ts`

**New Endpoint:** PATCH `/api/documents/:id`

**Purpose:** Update document metadata

**Allowed Fields:**
- title
- doc_version
- source_url
- doc_date

**Not Allowed:**
- content (read-only after extraction)
- file_path (immutable)
- status (managed by system)
- author_id (immutable)

---

## REMAINING FEATURE SET 4: Workflow Integration

### Priority: HIGH
**Estimated Time:** 2-3 hours  
**Complexity:** Low-Medium

### Components Needed:

#### 1. Update Document Selector
**File:** `src/components/DocumentSelector.tsx` (modify)

**Changes:**
- Include documents with status 'completed' in selector
- Filter out documents still in 'uploaded' or 'processing' state
- Add source indicator badge: "Uploaded" vs "Seed Data"
- Show upload date in document list
- Sort by upload date (newest first) by default

#### 2. "Start Workflow" Button in Upload Page
**File:** `src/app/(dashboard)/upload/page.tsx` (modify)

**Changes:**
- Add "Start Workflow" button for completed documents
- Navigate to `/workflow/{documentId}/stage1`
- Bulk action: "Start Workflow for Selected" (queue multiple)

#### 3. Workflow Bulk Processing
**File:** `src/app/(workflow)/workflow/[documentId]/stage1/page.tsx` (investigate)

**Enhancement:**
- Support query param: `?batch=true&ids=uuid1,uuid2`
- Show batch progress: "Document 3 of 10"
- "Next Document" button after completing workflow
- Save and move to next document in batch

---

## REMAINING FEATURE SET 5: Enhanced Error Handling & Retry

### Priority: MEDIUM
**Estimated Time:** 2-3 hours  
**Complexity:** Medium

### Components Needed:

#### 1. Error Details Dialog
**File:** `src/components/upload/error-details-dialog.tsx`

**Purpose:** Show detailed error information for failed uploads

**Display:**
- Error type (CORRUPT_FILE, UNSUPPORTED_CONTENT, etc.)
- Full error message
- Suggested action
- Retry button
- "Contact Support" button with error code
- Option to download original file for inspection

#### 2. Retry Logic Enhancement
**File:** `src/lib/file-processing/document-processor.ts` (modify)

**Enhancements:**
- Track retry attempts (max 3)
- Exponential backoff (5s, 15s, 45s delays)
- Store retry history in database
- Different strategies for different error types:
  - CORRUPT_FILE: No retry (user must re-upload)
  - TIMEOUT: Retry with longer timeout
  - SERVER_ERROR: Retry immediately
  - UNSUPPORTED_CONTENT: No retry

#### 3. Error Logging Table
**New Database Table:** `document_processing_errors`

**Schema:**
```sql
CREATE TABLE document_processing_errors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  error_type TEXT NOT NULL,
  error_message TEXT NOT NULL,
  stack_trace TEXT,
  retry_attempt INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Purpose:** Audit trail of all processing errors for debugging

---

## REMAINING FEATURE SET 6: Advanced Features (Lower Priority)

### Priority: LOW
**Estimated Time:** 5-6 hours (can be deferred)
**Complexity:** Medium-High

### Features:

#### 1. Document Preview Before Upload
- Show file details before committing upload
- Edit metadata before upload starts
- Preview first page (for PDF) or content snippet

#### 2. Bulk Metadata Templates
- Save metadata presets
- Apply template to multiple documents
- Organization-level templates (future: multi-tenant)

#### 3. Download Original File
- Download button for each uploaded document
- Signed URL from Supabase Storage
- Expire after 1 hour

#### 4. Document Versioning
- Track multiple versions of same document
- Compare extracted text between versions
- Version history timeline

#### 5. OCR for Scanned PDFs
- Detect scanned PDFs (image-only)
- Integrate Tesseract.js or cloud OCR service
- Extract text from images
- Much higher complexity & cost

---

## Implementation Strategy for Part 2

### Recommended Prompt Structure:

**PROMPT 4: Status Polling & Queue Management**
- Status polling API endpoint
- Status polling React hook
- Upload Queue component
- Upload Statistics component
- Upload Filters component
- Upload Actions component
- Integration with upload page

**PROMPT 5: Metadata & Preview Features**
- Metadata form component
- Content preview component
- Metadata update API endpoint
- Error details dialog
- Enhanced error handling

**PROMPT 6: Workflow Integration & Testing**
- Document Selector updates
- Workflow integration
- Bulk workflow processing
- End-to-end testing
- Documentation

---

## Database Schema Additions Needed

### For Enhanced Error Logging:

```sql
-- Create error logging table
CREATE TABLE IF NOT EXISTS document_processing_errors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  error_type TEXT NOT NULL CHECK (error_type IN ('CORRUPT_FILE', 'UNSUPPORTED_CONTENT', 'TIMEOUT', 'SERVER_ERROR', 'STORAGE_ERROR')),
  error_message TEXT NOT NULL,
  stack_trace TEXT,
  retry_attempt INTEGER DEFAULT 0 CHECK (retry_attempt >= 0 AND retry_attempt <= 3),
  recoverable BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for querying errors by document
CREATE INDEX idx_processing_errors_document 
  ON document_processing_errors(document_id, created_at DESC);

-- Add retry tracking to documents table
ALTER TABLE documents 
  ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0 CHECK (retry_count >= 0 AND retry_count <= 3);
```

### For Metadata History (Optional):

```sql
-- Track metadata changes
CREATE TABLE IF NOT EXISTS document_metadata_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  changed_by UUID REFERENCES user_profiles(id),
  changed_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## API Endpoints to Create

| Endpoint | Method | Purpose | Priority |
|----------|--------|---------|----------|
| `/api/documents/status` | GET | Poll processing status | HIGH |
| `/api/documents/[id]` | PATCH | Update metadata | MEDIUM |
| `/api/documents/[id]` | DELETE | Delete document | MEDIUM |
| `/api/documents/[id]/retry` | POST | Retry processing | HIGH |
| `/api/documents/[id]/content` | GET | Get full extracted content | MEDIUM |
| `/api/documents/[id]/download` | GET | Download original file | LOW |
| `/api/documents/batch` | POST | Batch operations | MEDIUM |

---

## Testing Requirements

### Unit Tests Needed:
- Text extractor service (each file type)
- File validation functions
- Metadata validation
- Status polling hook

### Integration Tests Needed:
- Upload → Extract → Complete workflow
- Upload → Error → Retry workflow
- Batch upload (10+ files)
- Large file handling (50MB+)
- Mixed file types in single batch

### E2E Tests Needed:
- Full user workflow: Dashboard → Upload → Extract → Categorize
- Error handling: Invalid files, corrupt files, network errors
- Concurrent uploads from multiple users
- Browser compatibility (Chrome, Firefox, Safari, Edge)

---

## Performance Optimization Opportunities

1. **Parallel Processing**
   - Currently: Sequential upload
   - Future: Parallel upload of multiple files
   - Benefit: 3-5x faster for batches

2. **Client-Side Compression**
   - Compress large files before upload
   - Reduce upload time and bandwidth

3. **Chunked Upload**
   - Upload large files in chunks
   - Resume failed uploads
   - Show real upload progress

4. **WebSocket Status Updates**
   - Replace polling with WebSockets
   - Instant status updates
   - Reduced server load

5. **Progressive Text Extraction**
   - Stream extracted text as it's processed
   - Show partial results immediately
   - Better perceived performance

---

## Known Issues & Limitations

### Current Limitations:
1. No OCR support (scanned PDFs won't extract text)
2. Sequential upload only (one at a time)
3. No file preview before upload
4. No download original file feature
5. No document versioning
6. No collaborative features
7. 100MB file size limit (could increase)
8. 100 files per batch limit

### Future Enhancements:
- Multi-tenant organization support
- Role-based access control
- Document sharing and permissions
- Advanced search and filtering
- Analytics and insights
- Export to various formats
- Integration with external systems

---

## Documentation Needed

### User Documentation:
- [ ] Upload page user guide (how to use)
- [ ] Supported file formats and limitations
- [ ] Troubleshooting guide (common errors)
- [ ] FAQ

### Developer Documentation:
- [ ] API reference (all endpoints)
- [ ] Component API docs (props, usage)
- [ ] Database schema documentation
- [ ] Architecture overview
- [ ] Deployment guide

### Testing Documentation:
- [ ] Test plan
- [ ] Test cases and scenarios
- [ ] Performance benchmarks
- [ ] Security audit checklist

---

## Dependencies for Part 2

### New NPM Packages Needed:
- None (all required packages installed in Prompt 1)

### Optional Packages for Future Enhancements:
- `tesseract.js` - OCR for scanned PDFs
- `pdfjs-dist` - PDF preview generation
- `socket.io` - WebSocket status updates
- `react-dropzone` - Enhanced drag-drop (if needed)

---

## Estimated Total Time for Part 2

| Feature Set | Time | Complexity |
|-------------|------|------------|
| Status Polling & Real-Time | 3-4 hours | Medium |
| Upload Queue Management | 4-5 hours | High |
| Metadata & Preview | 3-4 hours | Medium |
| Workflow Integration | 2-3 hours | Low-Medium |
| Enhanced Error Handling | 2-3 hours | Medium |
| **TOTAL** | **14-19 hours** | **~2 weeks** |

Advanced features (lower priority): Additional 5-6 hours

---

## Success Criteria for Completion

The document upload module will be considered **fully complete** when:

1. ✅ All UI features from `doc-module/` wireframe are functional
2. ✅ Users can upload, view, filter, search, and manage documents
3. ✅ Real-time status updates work via polling
4. ✅ Metadata can be edited after upload
5. ✅ Content preview is available
6. ✅ Workflow integration is seamless
7. ✅ Error handling is comprehensive with retry logic
8. ✅ All test scenarios pass
9. ✅ Documentation is complete
10. ✅ Performance meets targets (<30s upload, <60s processing for 90% of files)

---

## Next Steps for Implementation Agent

1. **Review this turnover document** thoroughly (especially Agent Onboarding)
2. **Review Prompts 1-3** to understand what's already built
3. **Review requirements spec** (`c-alpha-build-spec_v3.3_document_module_v3.md`)
4. **Prioritize Feature Sets** based on business value
5. **Create Prompt 4** covering Status Polling & Queue Management
6. **Create Prompt 5** covering Metadata & Preview Features
7. **Create Prompt 6** covering Workflow Integration & Testing
8. **Execute prompts** sequentially with full testing between each
9. **Document any deviations** or architectural decisions
10. **Update this turnover doc** as features are completed

---

## Questions for Next Agent

1. Should we implement WebSockets instead of polling for status updates?
   - Polling is simpler and works with Vercel serverless
   - WebSockets would be real-time but more complex

2. Should bulk workflow processing be in scope?
   - Allows users to categorize many documents efficiently
   - Would require workflow system modifications

3. What's the priority of OCR support for scanned PDFs?
   - High user value but significant complexity
   - Could be separate feature/module

4. Should we implement document versioning?
   - Valuable for tracking changes over time
   - Requires additional database tables

5. Mobile app support?
   - Currently responsive web only
   - Native mobile app would require separate implementation

---

**END OF TURNOVER DOCUMENT**

This document provides complete context for the next implementation agent to continue building the document upload module. All components from Prompts 1-3 are functional and tested. The remaining features are clearly organized and prioritized.

**Status:** Ready for Part 2 Implementation  
**Last Updated:** October 10, 2025

