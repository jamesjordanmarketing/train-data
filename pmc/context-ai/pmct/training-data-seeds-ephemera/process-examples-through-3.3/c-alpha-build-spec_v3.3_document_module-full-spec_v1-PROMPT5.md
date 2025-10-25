# PROMPT 5: Metadata & Preview Features
**Module:** Document Upload & Processing  
**Phase:** Metadata Management & Content Preview  
**Estimated Time:** 3-4 hours  
**Prerequisites:** Prompts 1-4 completed (Upload, extraction, and queue management functional)

---

## CONTEXT FOR CODING AGENT

You are implementing Phase 5 of the document upload module for "Bright Run." In Prompts 1-4, you created the database schema, upload API, upload UI, text extraction engine, and real-time queue management. Now you will build metadata editing capabilities and content preview features.

### What Was Built in Previous Prompts
✅ **Prompt 1:** Database schema, Storage configuration, NPM packages, Upload API  
✅ **Prompt 2:** Upload Dropzone UI, Upload Page, Dashboard integration  
✅ **Prompt 3:** Text Extractor Service, Document Processor, Processing API  
✅ **Prompt 4:** Status Polling, Upload Queue, Statistics, Filters

### Current State
- Users can upload files and monitor processing status in real-time
- Text is automatically extracted from uploaded files
- Upload queue displays all documents with filters and search
- Users can view, retry, and delete documents
- Missing: Users cannot edit metadata or preview extracted content

### Your Task in Prompt 5
1. ✅ Create Metadata Update API Endpoint (PATCH /api/documents/:id)
2. ✅ Create Metadata Edit Form Component (edit title, version, URL, date)
3. ✅ Create Content Preview Component (show extracted text)
4. ✅ Create Error Details Dialog (detailed error information)
5. ✅ Update Upload Queue to integrate new features

### Success Criteria
- Users can edit document metadata after upload
- Metadata changes saved to database via API
- Content preview shows extracted text with statistics
- Error details show full error messages and retry options
- All changes integrate seamlessly with existing queue
- Form validation works (URL format, date validation)

---



====================



## STEP 1: Create Metadata Update API Endpoint

**DIRECTIVE:** You shall create an API endpoint that allows authenticated users to update metadata fields for their documents.

**Instructions:**
1. Create directory: `src/app/api/documents/[id]/`
2. Create file: `src/app/api/documents/[id]/route.ts`
3. Copy the complete code below
4. Save and verify no TypeScript errors

**File:** `src/app/api/documents/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

export const runtime = 'nodejs';
export const maxDuration = 10;

/**
 * Allowed metadata fields that can be updated by users
 */
const ALLOWED_UPDATE_FIELDS = [
  'title',
  'doc_version',
  'source_url',
  'doc_date'
] as const;

/**
 * PATCH /api/documents/:id
 * Update document metadata
 * 
 * Request Body:
 *   - title?: string
 *   - doc_version?: string | null
 *   - source_url?: string | null
 *   - doc_date?: string | null (ISO 8601 date)
 * 
 * Response:
 *   - 200: { success: true, document: {...} }
 *   - 400: { success: false, error: string }
 *   - 401: { success: false, error: string }
 *   - 403: { success: false, error: string }
 *   - 404: { success: false, error: string }
 *   - 500: { success: false, error: string }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('[MetadataAPI] PATCH request for document:', params.id);
  
  try {
    // ================================================
    // STEP 1: Authentication
    // ================================================
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Authentication required',
          errorCode: 'AUTH_REQUIRED'
        },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error('[MetadataAPI] Authentication error:', userError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid authentication',
          errorCode: 'AUTH_INVALID'
        },
        { status: 401 }
      );
    }

    // ================================================
    // STEP 2: Parse and Validate Request Body
    // ================================================
    const body = await request.json();
    
    // Extract only allowed fields
    const updates: Record<string, any> = {};
    
    for (const field of ALLOWED_UPDATE_FIELDS) {
      if (field in body) {
        updates[field] = body[field];
      }
    }

    // Check if any valid fields provided
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No valid fields to update',
          errorCode: 'INVALID_REQUEST'
        },
        { status: 400 }
      );
    }

    // Validate title (if provided)
    if ('title' in updates) {
      if (typeof updates.title !== 'string' || updates.title.trim().length === 0) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Title cannot be empty',
            errorCode: 'INVALID_TITLE'
          },
          { status: 400 }
        );
      }
      
      if (updates.title.length > 500) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Title cannot exceed 500 characters',
            errorCode: 'TITLE_TOO_LONG'
          },
          { status: 400 }
        );
      }
      
      updates.title = updates.title.trim();
    }

    // Validate source_url (if provided)
    if ('source_url' in updates && updates.source_url !== null) {
      const urlPattern = /^https?:\/\/.+/i;
      if (!urlPattern.test(updates.source_url)) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Source URL must be a valid HTTP or HTTPS URL',
            errorCode: 'INVALID_URL'
          },
          { status: 400 }
        );
      }
    }

    // Validate doc_date (if provided)
    if ('doc_date' in updates && updates.doc_date !== null) {
      const date = new Date(updates.doc_date);
      if (isNaN(date.getTime())) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Document date must be a valid date',
            errorCode: 'INVALID_DATE'
          },
          { status: 400 }
        );
      }
      
      // Convert to ISO string
      updates.doc_date = date.toISOString();
    }

    // Add updated_at timestamp
    updates.updated_at = new Date().toISOString();

    console.log('[MetadataAPI] Validated updates:', Object.keys(updates));

    // ================================================
    // STEP 3: Verify Document Exists and User Owns It
    // ================================================
    const { data: existingDoc, error: fetchError } = await supabase
      .from('documents')
      .select('id, author_id, title, status')
      .eq('id', params.id)
      .single();

    if (fetchError || !existingDoc) {
      console.error('[MetadataAPI] Document not found:', fetchError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Document not found',
          errorCode: 'NOT_FOUND'
        },
        { status: 404 }
      );
    }

    // Verify ownership
    if (existingDoc.author_id !== user.id) {
      console.error(`[MetadataAPI] Unauthorized access attempt by ${user.id}`);
      return NextResponse.json(
        { 
          success: false, 
          error: 'You do not have permission to update this document',
          errorCode: 'FORBIDDEN'
        },
        { status: 403 }
      );
    }

    // ================================================
    // STEP 4: Update Database
    // ================================================
    const { data: updatedDoc, error: updateError } = await supabase
      .from('documents')
      .update(updates)
      .eq('id', params.id)
      .select(`
        id,
        title,
        doc_version,
        source_url,
        doc_date,
        source_type,
        file_size,
        status,
        created_at,
        updated_at
      `)
      .single();

    if (updateError) {
      console.error('[MetadataAPI] Update error:', updateError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to update document metadata',
          errorCode: 'DB_ERROR',
          details: updateError.message
        },
        { status: 500 }
      );
    }

    console.log('[MetadataAPI] Successfully updated document:', params.id);

    // ================================================
    // STEP 5: Return Success Response
    // ================================================
    return NextResponse.json({
      success: true,
      document: updatedDoc
    }, { status: 200 });

  } catch (error) {
    console.error('[MetadataAPI] Unexpected error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'An unexpected error occurred',
        errorCode: 'SERVER_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/documents/:id
 * Retrieve document details including full content
 * 
 * Response:
 *   - 200: { success: true, document: {...} }
 *   - 401: { success: false, error: string }
 *   - 403: { success: false, error: string }
 *   - 404: { success: false, error: string }
 *   - 500: { success: false, error: string }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('[MetadataAPI] GET request for document:', params.id);
  
  try {
    // Authentication
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

    // Fetch document
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', params.id)
      .single();

    if (fetchError || !document) {
      return NextResponse.json(
        { success: false, error: 'Document not found', errorCode: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (document.author_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized access', errorCode: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      document
    }, { status: 200 });

  } catch (error) {
    console.error('[MetadataAPI] GET error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'An unexpected error occurred',
        errorCode: 'SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/documents/:id
 * Delete document and associated file from storage
 * 
 * Response:
 *   - 200: { success: true }
 *   - 401: { success: false, error: string }
 *   - 403: { success: false, error: string }
 *   - 404: { success: false, error: string }
 *   - 500: { success: false, error: string }
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log('[MetadataAPI] DELETE request for document:', params.id);
  
  try {
    // Authentication
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

    // Fetch document to get file_path
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('id, author_id, file_path')
      .eq('id', params.id)
      .single();

    if (fetchError || !document) {
      return NextResponse.json(
        { success: false, error: 'Document not found', errorCode: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (document.author_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized access', errorCode: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    // Delete from storage
    if (document.file_path) {
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([document.file_path]);

      if (storageError) {
        console.error('[MetadataAPI] Storage delete error:', storageError);
        // Continue anyway - database delete is more important
      }
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('documents')
      .delete()
      .eq('id', params.id)
      .eq('author_id', user.id);

    if (deleteError) {
      throw new Error(deleteError.message);
    }

    console.log('[MetadataAPI] Successfully deleted document:', params.id);

    return NextResponse.json({
      success: true
    }, { status: 200 });

  } catch (error) {
    console.error('[MetadataAPI] DELETE error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete document',
        errorCode: 'SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}
```

**Explanation:**
- **PATCH Method:** Updates metadata fields (title, version, URL, date)
- **GET Method:** Retrieves full document details including content
- **DELETE Method:** Removes document and file from storage
- **Validation:** URL format, date format, title length checks
- **Security:** Verifies user ownership before any operations
- **Immutable Fields:** Cannot change content, file_path, status, author_id

**Verification:**
1. File compiles with no TypeScript errors
2. Endpoints will be available at `/api/documents/:id`

**Testing:**
```bash
# Update metadata
curl -X PATCH "http://localhost:3000/api/documents/DOC_ID" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Title","doc_version":"v2.0"}'

# Get document
curl -X GET "http://localhost:3000/api/documents/DOC_ID" \
  -H "Authorization: Bearer TOKEN"

# Delete document
curl -X DELETE "http://localhost:3000/api/documents/DOC_ID" \
  -H "Authorization: Bearer TOKEN"
```



++++++++++++++++++++++++



## STEP 2: Create Metadata Edit Form Component

**DIRECTIVE:** You shall create a dialog component that allows users to edit document metadata with form validation.

**Instructions:**
1. Create file: `src/components/upload/metadata-edit-dialog.tsx`
2. Copy the complete code below
3. Save and verify no TypeScript errors

**File:** `src/components/upload/metadata-edit-dialog.tsx`

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { cn } from '../../lib/utils';

interface Document {
  id: string;
  title: string;
  doc_version: string | null;
  source_url: string | null;
  doc_date: string | null;
  source_type: string;
  file_size: number;
  status: string;
}

interface MetadataEditDialogProps {
  /** Document to edit */
  document: Document | null;
  /** Whether dialog is open */
  open: boolean;
  /** Callback when dialog close is requested */
  onOpenChange: (open: boolean) => void;
  /** Callback after successful save */
  onSaveSuccess?: () => void;
}

/**
 * MetadataEditDialog Component
 * 
 * Modal dialog for editing document metadata
 * Features:
 * - Edit title, version, source URL, document date
 * - Form validation (required fields, URL format, date validation)
 * - Date picker for document date
 * - Save to API with loading state
 * - Error handling and user feedback
 */
export function MetadataEditDialog({
  document,
  open,
  onOpenChange,
  onSaveSuccess
}: MetadataEditDialogProps) {
  // Form state
  const [title, setTitle] = useState('');
  const [docVersion, setDocVersion] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [docDate, setDocDate] = useState<Date | undefined>(undefined);
  
  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  /**
   * Initialize form when document changes
   */
  useEffect(() => {
    if (document) {
      setTitle(document.title);
      setDocVersion(document.doc_version || '');
      setSourceUrl(document.source_url || '');
      setDocDate(document.doc_date ? new Date(document.doc_date) : undefined);
      setErrors({});
    }
  }, [document]);

  /**
   * Validate form
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Title is required
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.length > 500) {
      newErrors.title = 'Title cannot exceed 500 characters';
    }

    // Source URL validation (if provided)
    if (sourceUrl.trim()) {
      const urlPattern = /^https?:\/\/.+/i;
      if (!urlPattern.test(sourceUrl)) {
        newErrors.sourceUrl = 'Must be a valid HTTP or HTTPS URL';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle save
   */
  const handleSave = async () => {
    if (!document) return;

    // Validate form
    if (!validateForm()) {
      toast.error('Please fix validation errors');
      return;
    }

    setIsSaving(true);

    try {
      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Authentication required');
        return;
      }

      // Prepare update payload
      const updates: Record<string, any> = {
        title: title.trim(),
        doc_version: docVersion.trim() || null,
        source_url: sourceUrl.trim() || null,
        doc_date: docDate ? docDate.toISOString() : null
      };

      // Call API
      const response = await fetch(`/api/documents/${document.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify(updates)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to update metadata');
      }

      toast.success('Metadata updated successfully');
      onOpenChange(false);
      
      if (onSaveSuccess) {
        onSaveSuccess();
      }

    } catch (error) {
      console.error('[MetadataEditDialog] Save error:', error);
      toast.error('Failed to save metadata', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Handle cancel
   */
  const handleCancel = () => {
    onOpenChange(false);
    // Reset form to original values
    if (document) {
      setTitle(document.title);
      setDocVersion(document.doc_version || '');
      setSourceUrl(document.source_url || '');
      setDocDate(document.doc_date ? new Date(document.doc_date) : undefined);
      setErrors({});
    }
  };

  if (!document) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Document Metadata</DialogTitle>
          <DialogDescription>
            Update document information. Changes are saved to the database.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Title Field */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Document title"
              className={cn(errors.title && 'border-red-500')}
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          {/* Version Field */}
          <div className="space-y-2">
            <Label htmlFor="version">Version</Label>
            <Input
              id="version"
              value={docVersion}
              onChange={(e) => setDocVersion(e.target.value)}
              placeholder="e.g., v1.0, Draft, Final"
            />
            <p className="text-xs text-muted-foreground">
              Optional version or status label
            </p>
          </div>

          {/* Source URL Field */}
          <div className="space-y-2">
            <Label htmlFor="sourceUrl">Source URL</Label>
            <Input
              id="sourceUrl"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://example.com/document"
              className={cn(errors.sourceUrl && 'border-red-500')}
            />
            {errors.sourceUrl && (
              <p className="text-sm text-red-500">{errors.sourceUrl}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Optional URL where document was sourced
            </p>
          </div>

          {/* Document Date Field */}
          <div className="space-y-2">
            <Label htmlFor="docDate">Document Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !docDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {docDate ? format(docDate, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={docDate}
                  onSelect={setDocDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <p className="text-xs text-muted-foreground">
              Original document date (not upload date)
            </p>
          </div>

          {/* Read-Only Fields */}
          <div className="pt-2 border-t">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">File Type</p>
                <p className="font-medium uppercase">{document.source_type}</p>
              </div>
              <div>
                <p className="text-muted-foreground">File Size</p>
                <p className="font-medium">
                  {(document.file_size / 1024).toFixed(0)} KB
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <p className="font-medium capitalize">{document.status}</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

**Explanation:**
- **Form Fields:** Title (required), Version, Source URL, Document Date
- **Validation:** Title required, URL format check, date validation
- **Date Picker:** Calendar component for easy date selection
- **Read-Only Info:** Shows file type, size, status
- **API Integration:** Calls PATCH endpoint to save changes
- **Loading State:** Disables form during save operation
- **Error Handling:** Shows validation errors inline

**Verification:**
1. Component compiles with no TypeScript errors
2. Dialog, Calendar, Popover components exist in `src/components/ui/`
3. `date-fns` package is installed (may need: `npm install date-fns`)



++++++++++++++++++++++++



## STEP 3: Create Content Preview Component

**DIRECTIVE:** You shall create a side sheet component that displays extracted text content with statistics and validation information.

**Instructions:**
1. Create file: `src/components/upload/content-preview-sheet.tsx`
2. Copy the complete code below
3. Save and verify no TypeScript errors

**File:** `src/components/upload/content-preview-sheet.tsx`

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '../ui/sheet';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Skeleton } from '../ui/skeleton';
import { 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Copy,
  Download,
  Maximize2
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../lib/supabase';
import { formatFileSize, formatTimeAgo } from '../../lib/types/upload';

interface ContentPreviewSheetProps {
  /** Document ID to preview */
  documentId: string | null;
  /** Whether sheet is open */
  open: boolean;
  /** Callback when sheet close is requested */
  onOpenChange: (open: boolean) => void;
}

interface DocumentDetails {
  id: string;
  title: string;
  content: string | null;
  file_size: number;
  source_type: string;
  created_at: string;
  processing_completed_at: string | null;
  metadata: { original_filename?: string } | null;
}

/**
 * ContentPreviewSheet Component
 * 
 * Side sheet displaying extracted document content
 * Features:
 * - Shows first 2000 characters of extracted text
 * - Content statistics (word count, character count, line count)
 * - Quality indicators (encoding, format, length validation)
 * - Copy to clipboard
 * - View full document option
 * - File metadata display
 */
export function ContentPreviewSheet({
  documentId,
  open,
  onOpenChange
}: ContentPreviewSheetProps) {
  const [document, setDocument] = useState<DocumentDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch document details
   */
  const fetchDocument = async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`/api/documents/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch document');
      }

      setDocument(data.document);
    } catch (err) {
      console.error('[ContentPreviewSheet] Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load document');
      toast.error('Failed to load content', {
        description: err instanceof Error ? err.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Fetch document when ID changes
   */
  useEffect(() => {
    if (documentId && open) {
      fetchDocument(documentId);
    }
  }, [documentId, open]);

  /**
   * Calculate content statistics
   */
  const getContentStats = (content: string | null) => {
    if (!content) {
      return {
        characters: 0,
        words: 0,
        lines: 0,
        paragraphs: 0
      };
    }

    const lines = content.split('\n');
    const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);
    const words = content.split(/\s+/).filter(w => w.length > 0);

    return {
      characters: content.length,
      words: words.length,
      lines: lines.length,
      paragraphs: paragraphs.length
    };
  };

  /**
   * Get content quality score (0-100)
   */
  const getQualityScore = (content: string | null): number => {
    if (!content) return 0;

    let score = 100;

    // Penalize very short content
    if (content.length < 100) score -= 50;
    else if (content.length < 500) score -= 20;

    // Check for good text-to-whitespace ratio
    const nonWhitespace = content.replace(/\s/g, '').length;
    const ratio = nonWhitespace / content.length;
    if (ratio < 0.7) score -= 10;

    // Check for printable characters
    const printable = content.replace(/[^\x20-\x7E\n\r\t]/g, '').length;
    const printableRatio = printable / content.length;
    if (printableRatio < 0.9) score -= 15;

    return Math.max(0, Math.min(100, score));
  };

  /**
   * Copy content to clipboard
   */
  const handleCopyToClipboard = () => {
    if (!document?.content) {
      toast.error('No content to copy');
      return;
    }

    navigator.clipboard.writeText(document.content)
      .then(() => {
        toast.success('Content copied to clipboard');
      })
      .catch(() => {
        toast.error('Failed to copy to clipboard');
      });
  };

  /**
   * Download content as text file
   */
  const handleDownloadContent = () => {
    if (!document?.content) {
      toast.error('No content to download');
      return;
    }

    const blob = new Blob([document.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `${document.title}_extracted.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Content downloaded');
  };

  // Loading state
  if (isLoading) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-2xl">
          <SheetHeader>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </SheetHeader>
          <div className="space-y-4 mt-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Error state
  if (error) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>Content Preview</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <p className="text-lg font-medium mb-2">Failed to load content</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  if (!document) return null;

  const stats = getContentStats(document.content);
  const qualityScore = getQualityScore(document.content);
  const filename = document.metadata?.original_filename || 'Unknown';
  const previewText = document.content?.substring(0, 2000) || 'No content available';
  const hasMoreContent = (document.content?.length || 0) > 2000;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {document.title}
          </SheetTitle>
          <SheetDescription>
            {filename} • {formatFileSize(document.file_size)} • {document.source_type.toUpperCase()}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Content Statistics */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-3">Content Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Characters</p>
                  <p className="text-2xl font-bold">{stats.characters.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Words</p>
                  <p className="text-2xl font-bold">{stats.words.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Lines</p>
                  <p className="text-2xl font-bold">{stats.lines.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Paragraphs</p>
                  <p className="text-2xl font-bold">{stats.paragraphs.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quality Indicators */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-3">Extraction Quality</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Format Validation</span>
                  <Badge variant="default" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Valid
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Content Length</span>
                  <Badge variant="default" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {stats.characters >= 100 ? 'Good' : 'Short'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Encoding</span>
                  <Badge variant="default" className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    UTF-8
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Quality Score</span>
                  <span className="text-lg font-bold">{qualityScore}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Extracted Text Preview */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">Extracted Text</h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyToClipboard}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadContent}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>

              <ScrollArea className="h-[400px] w-full rounded border p-4">
                <pre className="text-sm whitespace-pre-wrap font-mono">
                  {previewText}
                </pre>
                {hasMoreContent && (
                  <div className="mt-4 p-4 bg-muted rounded text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      Showing first 2,000 characters of {stats.characters.toLocaleString()} total
                    </p>
                    <Button variant="outline" size="sm">
                      <Maximize2 className="w-4 h-4 mr-2" />
                      View Full Document
                    </Button>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Processing Info */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Uploaded</p>
                  <p className="font-medium">{formatTimeAgo(document.created_at)}</p>
                </div>
                {document.processing_completed_at && (
                  <div>
                    <p className="text-muted-foreground">Processed</p>
                    <p className="font-medium">{formatTimeAgo(document.processing_completed_at)}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
}
```

**Explanation:**
- **Content Statistics:** Shows character, word, line, paragraph counts
- **Quality Indicators:** Format validation, length check, encoding, quality score
- **Text Preview:** First 2000 characters with scroll area
- **Actions:** Copy to clipboard, download as .txt file
- **Processing Info:** Upload and processing timestamps
- **Responsive:** Side sheet that works on mobile and desktop

**Verification:**
1. Component compiles with no TypeScript errors
2. Sheet, ScrollArea components exist in `src/components/ui/`



++++++++++++++++++++++++



## STEP 4: Create Error Details Dialog

**DIRECTIVE:** You shall create a dialog component that displays detailed error information with retry and support options.

**Instructions:**
1. Create file: `src/components/upload/error-details-dialog.tsx`
2. Copy the complete code below
3. Save and verify no TypeScript errors

**File:** `src/components/upload/error-details-dialog.tsx`

```typescript
'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { 
  AlertCircle, 
  RefreshCw, 
  Copy,
  ExternalLink,
  XCircle,
  FileWarning
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';

interface ErrorDetailsDialogProps {
  /** Document ID with error */
  documentId: string | null;
  /** Document title */
  documentTitle: string | null;
  /** Error message */
  errorMessage: string | null;
  /** Whether dialog is open */
  open: boolean;
  /** Callback when dialog close is requested */
  onOpenChange: (open: boolean) => void;
  /** Callback when retry is clicked */
  onRetry?: (documentId: string) => void;
}

/**
 * Error type classification
 */
function classifyError(errorMessage: string): {
  type: string;
  category: 'file' | 'content' | 'system';
  recoverable: boolean;
  suggestedAction: string;
} {
  const msg = errorMessage.toLowerCase();

  if (msg.includes('corrupt') || msg.includes('invalid format')) {
    return {
      type: 'Corrupt File',
      category: 'file',
      recoverable: false,
      suggestedAction: 'Re-upload a valid file'
    };
  }

  if (msg.includes('no extractable text') || msg.includes('empty') || msg.includes('too short')) {
    return {
      type: 'No Content',
      category: 'content',
      recoverable: false,
      suggestedAction: 'File may be scanned image or blank'
    };
  }

  if (msg.includes('unsupported') || msg.includes('invalid type')) {
    return {
      type: 'Unsupported Format',
      category: 'file',
      recoverable: false,
      suggestedAction: 'Convert to supported format (PDF, DOCX, TXT)'
    };
  }

  if (msg.includes('timeout')) {
    return {
      type: 'Processing Timeout',
      category: 'system',
      recoverable: true,
      suggestedAction: 'Retry processing (may succeed on retry)'
    };
  }

  if (msg.includes('server error') || msg.includes('failed to')) {
    return {
      type: 'Server Error',
      category: 'system',
      recoverable: true,
      suggestedAction: 'Retry processing or contact support'
    };
  }

  return {
    type: 'Unknown Error',
    category: 'system',
    recoverable: true,
    suggestedAction: 'Try again or contact support'
  };
}

/**
 * ErrorDetailsDialog Component
 * 
 * Displays detailed error information for failed document processing
 * Features:
 * - Error type classification
 * - Suggested actions
 * - Copy error message
 * - Retry button (if recoverable)
 * - Contact support link with pre-filled error code
 */
export function ErrorDetailsDialog({
  documentId,
  documentTitle,
  errorMessage,
  open,
  onOpenChange,
  onRetry
}: ErrorDetailsDialogProps) {
  if (!errorMessage) return null;

  const errorInfo = classifyError(errorMessage);

  /**
   * Copy error to clipboard
   */
  const handleCopyError = () => {
    const errorText = `
Document: ${documentTitle}
Document ID: ${documentId}
Error Type: ${errorInfo.type}
Error Message: ${errorMessage}
Timestamp: ${new Date().toISOString()}
    `.trim();

    navigator.clipboard.writeText(errorText)
      .then(() => {
        toast.success('Error details copied to clipboard');
      })
      .catch(() => {
        toast.error('Failed to copy to clipboard');
      });
  };

  /**
   * Handle retry
   */
  const handleRetry = () => {
    if (documentId && onRetry) {
      onRetry(documentId);
      onOpenChange(false);
    }
  };

  /**
   * Open support email
   */
  const handleContactSupport = () => {
    const subject = `Document Processing Error: ${errorInfo.type}`;
    const body = `
Document: ${documentTitle}
Document ID: ${documentId}
Error Type: ${errorInfo.type}
Error Message: ${errorMessage}

Please provide details about the issue:


    `.trim();

    const mailtoLink = `mailto:support@brightrun.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <XCircle className="w-5 h-5 text-red-500" />
            Processing Error
          </DialogTitle>
          <DialogDescription>
            {documentTitle || 'Document'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Error Type Badge */}
          <div className="flex items-center gap-2">
            <Badge 
              variant="destructive"
              className={cn(
                'text-sm',
                errorInfo.category === 'file' && 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
                errorInfo.category === 'content' && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
                errorInfo.category === 'system' && 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
              )}
            >
              {errorInfo.type}
            </Badge>
            {errorInfo.recoverable ? (
              <span className="text-sm text-muted-foreground">
                • Recoverable (retry available)
              </span>
            ) : (
              <span className="text-sm text-muted-foreground">
                • Not recoverable (action required)
              </span>
            )}
          </div>

          {/* Error Message */}
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="ml-2">
              <p className="font-medium mb-1">Error Details:</p>
              <p className="text-sm">{errorMessage}</p>
            </AlertDescription>
          </Alert>

          {/* Suggested Action */}
          <Alert>
            <FileWarning className="h-4 w-4" />
            <AlertDescription className="ml-2">
              <p className="font-medium mb-1">Suggested Action:</p>
              <p className="text-sm">{errorInfo.suggestedAction}</p>
            </AlertDescription>
          </Alert>

          {/* Common Causes */}
          <div className="border rounded-lg p-4 bg-muted/50">
            <p className="font-medium mb-2 text-sm">Common Causes:</p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              {errorInfo.category === 'file' && (
                <>
                  <li>File may be corrupted or incomplete</li>
                  <li>File format may not match extension</li>
                  <li>File may be password-protected</li>
                </>
              )}
              {errorInfo.category === 'content' && (
                <>
                  <li>PDF may contain only scanned images (no text layer)</li>
                  <li>Document may be blank or nearly empty</li>
                  <li>Content may be in unsupported language/encoding</li>
                </>
              )}
              {errorInfo.category === 'system' && (
                <>
                  <li>Temporary server issue or high load</li>
                  <li>Network connection interrupted during processing</li>
                  <li>File size may be too large for processing</li>
                </>
              )}
            </ul>
          </div>

          {/* Document Info */}
          <div className="border-t pt-4">
            <p className="text-xs text-muted-foreground mb-2">Technical Information:</p>
            <div className="bg-muted rounded p-3 font-mono text-xs space-y-1">
              <p>Document ID: {documentId}</p>
              <p>Error Category: {errorInfo.category}</p>
              <p>Timestamp: {new Date().toISOString()}</p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleCopyError}
            className="w-full sm:w-auto"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy Error Details
          </Button>
          
          {errorInfo.recoverable && onRetry && (
            <Button
              onClick={handleRetry}
              className="w-full sm:w-auto"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry Processing
            </Button>
          )}
          
          <Button
            variant="outline"
            onClick={handleContactSupport}
            className="w-full sm:w-auto"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Contact Support
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

**Explanation:**
- **Error Classification:** Categorizes errors into file, content, or system issues
- **Suggested Actions:** Provides specific guidance based on error type
- **Recoverable Check:** Shows retry button only for recoverable errors
- **Common Causes:** Lists typical reasons for each error category
- **Copy Details:** Copies full error info for support tickets
- **Contact Support:** Opens email with pre-filled error information
- **Technical Info:** Shows document ID, category, timestamp

**Verification:**
1. Component compiles with no TypeScript errors
2. Dialog, Alert components exist in `src/components/ui/`



++++++++++++++++++++++++



## STEP 5: Update Upload Queue with New Features

**DIRECTIVE:** You shall update the Upload Queue component to integrate metadata editing, content preview, and error details features.

**Instructions:**
1. Open file: `src/components/upload/upload-queue.tsx`
2. Add the following imports at the top (after existing imports):

```typescript
import { MetadataEditDialog } from './metadata-edit-dialog';
import { ContentPreviewSheet } from './content-preview-sheet';
import { ErrorDetailsDialog } from './error-details-dialog';
import { Edit, FileText as FileTextIcon, AlertTriangle } from 'lucide-react';
```

3. Add state for the new dialogs inside the `UploadQueue` component (after existing state declarations):

```typescript
// Dialog state
const [metadataDialogOpen, setMetadataDialogOpen] = useState(false);
const [previewSheetOpen, setPreviewSheetOpen] = useState(false);
const [errorDialogOpen, setErrorDialogOpen] = useState(false);
const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
```

4. Add handler functions inside the component (after existing handlers):

```typescript
/**
 * Open metadata edit dialog
 */
const handleEditMetadata = (doc: Document) => {
  setSelectedDocument(doc);
  setMetadataDialogOpen(true);
};

/**
 * Open content preview
 */
const handlePreviewContent = (doc: Document) => {
  setSelectedDocument(doc);
  setPreviewSheetOpen(true);
};

/**
 * Open error details
 */
const handleViewError = (doc: Document) => {
  setSelectedDocument(doc);
  setErrorDialogOpen(true);
};

/**
 * Handle successful metadata save
 */
const handleMetadataSaveSuccess = () => {
  fetchDocuments(); // Refresh list
};
```

5. Update the actions dropdown menu items (replace the existing `DropdownMenuContent` section):

```typescript
<DropdownMenuContent align="end">
  <DropdownMenuItem onClick={() => handleView(doc.id)}>
    <Eye className="w-4 h-4 mr-2" />
    View Document
  </DropdownMenuItem>
  
  {doc.status === 'completed' && (
    <>
      <DropdownMenuItem onClick={() => handlePreviewContent(doc)}>
        <FileTextIcon className="w-4 h-4 mr-2" />
        Preview Content
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => handleEditMetadata(doc)}>
        <Edit className="w-4 h-4 mr-2" />
        Edit Metadata
      </DropdownMenuItem>
    </>
  )}
  
  {doc.status === 'error' && (
    <>
      <DropdownMenuItem onClick={() => handleViewError(doc)}>
        <AlertTriangle className="w-4 h-4 mr-2" />
        View Error Details
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => handleRetry(doc.id)}>
        <RefreshCw className="w-4 h-4 mr-2" />
        Retry Processing
      </DropdownMenuItem>
    </>
  )}
  
  <DropdownMenuItem 
    onClick={() => handleDelete(doc.id, doc.file_path)}
    className="text-red-600 dark:text-red-400"
  >
    <Trash2 className="w-4 h-4 mr-2" />
    Delete
  </DropdownMenuItem>
</DropdownMenuContent>
```

6. Add the dialog components before the closing `</div>` of the main return statement:

```typescript
      {/* Polling Indicator */}
      {isPolling && (
        <div className="text-xs text-muted-foreground text-center">
          Auto-refreshing status every 2 seconds...
        </div>
      )}

      {/* Metadata Edit Dialog */}
      <MetadataEditDialog
        document={selectedDocument}
        open={metadataDialogOpen}
        onOpenChange={setMetadataDialogOpen}
        onSaveSuccess={handleMetadataSaveSuccess}
      />

      {/* Content Preview Sheet */}
      <ContentPreviewSheet
        documentId={selectedDocument?.id || null}
        open={previewSheetOpen}
        onOpenChange={setPreviewSheetOpen}
      />

      {/* Error Details Dialog */}
      <ErrorDetailsDialog
        documentId={selectedDocument?.id || null}
        documentTitle={selectedDocument?.title || null}
        errorMessage={selectedDocument?.processing_error || null}
        open={errorDialogOpen}
        onOpenChange={setErrorDialogOpen}
        onRetry={handleRetry}
      />
    </div>
  );
}
```

**Verification:**
1. File compiles with no TypeScript errors
2. All new imports resolve correctly
3. Upload queue displays new menu options

**Note:** If you need to install the `date-fns` package for the Calendar component:
```bash
npm install date-fns
```



++++++++++++++++++++++++



## PROMPT 5 COMPLETION CHECKLIST

Before proceeding to Prompt 6, verify all items below:

### Components Created
- [ ] Metadata Update API: `src/app/api/documents/[id]/route.ts`
- [ ] Metadata Edit Dialog: `src/components/upload/metadata-edit-dialog.tsx`
- [ ] Content Preview Sheet: `src/components/upload/content-preview-sheet.tsx`
- [ ] Error Details Dialog: `src/components/upload/error-details-dialog.tsx`
- [ ] Updated Upload Queue: `src/components/upload/upload-queue.tsx` (modified)

### Build Verification
- [ ] Run `npm run build` - no TypeScript errors
- [ ] All imports resolve correctly
- [ ] `date-fns` package installed (if needed)
- [ ] No console errors when starting dev server

### Metadata Editing Testing
- [ ] Navigate to upload queue
- [ ] Click actions dropdown on a completed document
- [ ] Click "Edit Metadata"
- [ ] Verify dialog opens with current values
- [ ] Edit title, verify validation (required field)
- [ ] Add version (e.g., "v2.0")
- [ ] Add source URL, test invalid URL (should show error)
- [ ] Add valid URL (e.g., "https://example.com")
- [ ] Select document date from calendar
- [ ] Click "Save Changes"
- [ ] Verify success toast appears
- [ ] Verify dialog closes
- [ ] Refresh queue, verify changes persisted

### API Endpoint Testing
- [ ] Test PATCH endpoint with curl or Postman:
  ```bash
  curl -X PATCH "http://localhost:3000/api/documents/DOC_ID" \
    -H "Authorization: Bearer TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"title":"New Title","doc_version":"v3.0"}'
  ```
- [ ] Verify 200 response with updated document
- [ ] Test with invalid URL, verify 400 error
- [ ] Test with empty title, verify 400 error
- [ ] Test with another user's document ID, verify 403 error

### Content Preview Testing
- [ ] Click actions dropdown on completed document
- [ ] Click "Preview Content"
- [ ] Verify side sheet opens from right
- [ ] Check statistics show correct counts
- [ ] Check quality indicators display
- [ ] Verify first 2000 characters of text shown
- [ ] Scroll through text preview
- [ ] Click "Copy" button, verify clipboard contains text
- [ ] Click "Download" button, verify .txt file downloads
- [ ] Close sheet, verify it closes properly

### Error Details Testing
- [ ] Upload a corrupt or empty file to create error
- [ ] Wait for processing to fail (status = 'error')
- [ ] Click actions dropdown on error document
- [ ] Click "View Error Details"
- [ ] Verify dialog opens with error information
- [ ] Check error type badge shows correct category
- [ ] Check suggested action is relevant
- [ ] Check common causes list displays
- [ ] Click "Copy Error Details", verify clipboard
- [ ] If recoverable error, verify "Retry Processing" button shows
- [ ] Click "Contact Support", verify email client opens with pre-filled info
- [ ] Close dialog

### UI/UX Testing
- [ ] Metadata edit form validates URL format
- [ ] Date picker works and displays correctly
- [ ] Content preview sheet scrolls smoothly
- [ ] Error dialog shows appropriate icons and colors
- [ ] All dialogs close via X button, Cancel button, or outside click
- [ ] Loading states show during API calls
- [ ] Toast notifications appear for all actions
- [ ] Mobile responsive (test on small screen)

### Integration Testing
- [ ] Edit metadata → Save → Verify in preview
- [ ] Preview content → Edit metadata → Preview again
- [ ] View error → Retry → Watch status change
- [ ] Delete document → Verify removed from queue
- [ ] Upload → Process → Edit metadata → Preview → Navigate to workflow

### Error Handling
- [ ] Edit metadata without auth token (should fail gracefully)
- [ ] Edit another user's document (should show 403)
- [ ] Save invalid data (empty title, bad URL format)
- [ ] Preview non-existent document (should show error)
- [ ] Network error during save (should show error toast)

### Performance Testing
- [ ] Metadata save completes in < 500ms
- [ ] Content preview loads in < 1 second
- [ ] Large documents (10,000+ words) preview smoothly
- [ ] Multiple dialogs can open/close without memory leaks
- [ ] No lag when scrolling through long content

### Manual Test Scenario

1. **Complete Metadata Workflow:**
   - Upload a PDF file
   - Wait for processing to complete
   - Open actions dropdown
   - Click "Edit Metadata"
   - Update all fields (title, version, URL, date)
   - Save changes
   - Click "Preview Content"
   - Verify updated metadata shows in preview
   - Close preview
   - Navigate to workflow page
   - Verify metadata displays correctly

2. **Error Handling Workflow:**
   - Create empty file: `touch empty.pdf`
   - Upload empty.pdf
   - Wait for processing to fail
   - Click "View Error Details"
   - Read error information
   - Copy error details
   - Click "Retry Processing"
   - Wait for retry to fail (expected)
   - View error details again
   - Note error persists

3. **Content Preview Workflow:**
   - Upload a document with substantial content (1000+ words)
   - Wait for completion
   - Click "Preview Content"
   - Review statistics (verify counts seem accurate)
   - Check quality score
   - Scroll through preview text
   - Click "Copy"
   - Open text editor, paste (verify copied)
   - Click "Download"
   - Open downloaded file (verify content matches)

**If all items checked:** ✅ Prompt 5 complete! Proceed to Prompt 6.

---

## What's Next

**Prompt 6** will build:
- Workflow integration (connect upload module to categorization workflow)
- Update Document Selector to include uploaded documents
- "Start Workflow" button in upload queue
- Bulk workflow processing capability
- End-to-end testing procedures
- Final documentation and completion summary

After Prompt 6, the document upload module will be **fully complete** with all features from the requirements specification!

---

**END OF PROMPT 5**

