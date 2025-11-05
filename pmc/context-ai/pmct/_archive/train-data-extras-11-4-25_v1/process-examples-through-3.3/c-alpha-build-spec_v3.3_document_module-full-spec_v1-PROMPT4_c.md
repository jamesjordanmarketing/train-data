# PROMPT 4C: Queue Management Interface (Part 3 of 4)
**Module:** Document Upload & Processing  
**Phase:** Real-Time Updates & Queue Interface  
**Estimated Time:** 2-2.5 hours (Steps 5-6)  
**Prerequisites:** PROMPT4_a.md and PROMPT4_b.md completed

---

## 📌 CONTEXT: This is Part 3 of 4

This prompt file contains steps 5-6 of Prompt 4:
- **STEP 5:** Upload Filters Component
- **STEP 6:** Upload Queue Component (the largest component)

**Prerequisites:** You must have completed:
- **PROMPT4_a.md** - Status API & Hook
- **PROMPT4_b.md** - Status Badge & Statistics

After completing this part, proceed to **PROMPT4_d.md** for Step 7 and final checklist.

---

## CONTEXT REMINDER

### What's Already Built
✅ **PROMPT4_a:** Status Polling API, Status Polling Hook  
✅ **PROMPT4_b:** Document Status Badge, Upload Statistics

### Your Task in Prompt 4C (Steps 5-6)
5. ✅ Create Upload Filters Component (search, filter by status/type/date)
6. ✅ Create Upload Queue Component (full-featured table with actions)

### Success Criteria for Part 4C
- Filters work correctly (status, file type, date, search)
- Queue displays all user's documents
- Real-time status updates via polling
- Actions work (view, retry, delete)

---



====================



## STEP 5: Create Upload Filters Component

**DIRECTIVE:** You shall create a comprehensive filtering interface with status, file type, date range, and search filters.

**Instructions:**
1. Create file: `src/components/upload/upload-filters.tsx`
2. Copy the complete code below
3. Save and verify no TypeScript errors

**File:** `src/components/upload/upload-filters.tsx`

```typescript
'use client';

import React from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../ui/select';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Search, X, Filter } from 'lucide-react';
import { Badge } from '../ui/badge';

export interface UploadFilters {
  status: string;
  fileType: string;
  dateRange: string;
  searchQuery: string;
}

interface UploadFiltersProps {
  /** Current filter values */
  filters: UploadFilters;
  /** Callback when filters change */
  onFiltersChange: (filters: UploadFilters) => void;
  /** Number of active filters (for badge display) */
  activeFilterCount?: number;
}

/**
 * UploadFilters Component
 * 
 * Comprehensive filtering interface for upload queue
 * Features:
 * - Status filter (All, Queued, Processing, Completed, Error)
 * - File type filter (All, PDF, DOCX, TXT, etc.)
 * - Date range filter (Today, Last 7 days, Last 30 days, All time)
 * - Search by filename
 * - Clear all filters button
 * - Real-time filtering (no submit button)
 */
export function UploadFilters({ 
  filters, 
  onFiltersChange,
  activeFilterCount = 0
}: UploadFiltersProps) {
  /**
   * Update a single filter
   */
  const updateFilter = (key: keyof UploadFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  /**
   * Clear all filters
   */
  const clearFilters = () => {
    onFiltersChange({
      status: 'all',
      fileType: 'all',
      dateRange: 'all',
      searchQuery: ''
    });
  };

  /**
   * Check if any filters are active
   */
  const hasActiveFilters = 
    filters.status !== 'all' ||
    filters.fileType !== 'all' ||
    filters.dateRange !== 'all' ||
    filters.searchQuery !== '';

  return (
    <div className="space-y-4">
      {/* Filter Controls Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Status Filter */}
        <div className="flex-1 min-w-[150px]">
          <Select 
            value={filters.status} 
            onValueChange={(value) => updateFilter('status', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="uploaded">Queued</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* File Type Filter */}
        <div className="flex-1 min-w-[150px]">
          <Select 
            value={filters.fileType} 
            onValueChange={(value) => updateFilter('fileType', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="File Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="docx">DOCX</SelectItem>
              <SelectItem value="doc">DOC</SelectItem>
              <SelectItem value="txt">TXT</SelectItem>
              <SelectItem value="md">Markdown</SelectItem>
              <SelectItem value="html">HTML</SelectItem>
              <SelectItem value="rtf">RTF</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date Range Filter */}
        <div className="flex-1 min-w-[150px]">
          <Select 
            value={filters.dateRange} 
            onValueChange={(value) => updateFilter('dateRange', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button 
            variant="outline" 
            size="default"
            onClick={clearFilters}
            className="flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Clear</span>
          </Button>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by filename..."
          value={filters.searchQuery}
          onChange={(e) => updateFilter('searchQuery', e.target.value)}
          className="pl-9 pr-9"
        />
        {filters.searchQuery && (
          <button
            onClick={() => updateFilter('searchQuery', '')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Active Filters Indicator */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="w-4 h-4" />
            <span>Active filters:</span>
          </div>
          
          {filters.status !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Status: {filters.status}
              <button
                onClick={() => updateFilter('status', 'all')}
                className="ml-1 hover:text-foreground"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}

          {filters.fileType !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Type: {filters.fileType.toUpperCase()}
              <button
                onClick={() => updateFilter('fileType', 'all')}
                className="ml-1 hover:text-foreground"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}

          {filters.dateRange !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Date: {filters.dateRange}
              <button
                onClick={() => updateFilter('dateRange', 'all')}
                className="ml-1 hover:text-foreground"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}

          {filters.searchQuery && (
            <Badge variant="secondary" className="gap-1">
              Search: "{filters.searchQuery}"
              <button
                onClick={() => updateFilter('searchQuery', '')}
                className="ml-1 hover:text-foreground"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
```

**Explanation:**
- **4 Filter Types:** Status, File Type, Date Range, Search
- **Real-Time:** No submit button, changes apply instantly
- **Active Filter Badges:** Shows which filters are applied
- **Clear Filters:** Individual or all at once
- **Responsive:** Stacks on mobile, row on desktop
- **Search:** Filters by filename with clear button

**Verification:**
1. Component compiles with no TypeScript errors
2. UI components (Select, Input, Button, Badge) exist



++++++++++++++++++++++++



## STEP 6: Create Upload Queue Component

**DIRECTIVE:** You shall create a comprehensive table component that displays all uploaded documents with status, progress, actions, and integrates with the status polling hook.

**Instructions:**
1. Create file: `src/components/upload/upload-queue.tsx`
2. Copy the complete code below
3. Save and verify no TypeScript errors

**File:** `src/components/upload/upload-queue.tsx`

```typescript
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { 
  FileText, 
  MoreVertical, 
  Eye, 
  RefreshCw, 
  Trash2,
  Download
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { DocumentStatusBadge } from './document-status-badge';
import { Progress } from '../ui/progress';
import { formatFileSize, formatTimeAgo } from '../../lib/types/upload';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { useDocumentStatus } from '../../hooks/use-document-status';
import { UploadFilters } from './upload-filters';
import { Skeleton } from '../ui/skeleton';

interface Document {
  id: string;
  title: string;
  status: 'uploaded' | 'processing' | 'completed' | 'error' | 'pending' | 'categorizing';
  processing_progress: number;
  processing_error: string | null;
  file_path: string;
  file_size: number;
  source_type: string;
  created_at: string;
  metadata: { original_filename?: string } | null;
}

interface UploadQueueProps {
  /** Auto-refresh on mount */
  autoRefresh?: boolean;
}

/**
 * UploadQueue Component
 * 
 * Full-featured upload queue table with:
 * - Real-time status updates via polling
 * - Filters (status, type, date, search)
 * - Sorting
 * - Actions (view, retry, delete)
 * - Progress indicators
 * - Empty state
 * - Loading state
 */
export function UploadQueue({ autoRefresh = true }: UploadQueueProps) {
  const router = useRouter();
  
  // State
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<UploadFilters>({
    status: 'all',
    fileType: 'all',
    dateRange: 'all',
    searchQuery: ''
  });

  // Get document IDs for polling
  const documentIds = useMemo(() => documents.map(d => d.id), [documents]);

  // Status polling hook
  const { statuses, isPolling } = useDocumentStatus(documentIds, {
    enabled: autoRefresh && documents.length > 0
  });

  /**
   * Fetch documents from database
   */
  const fetchDocuments = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Authentication required');
        return;
      }

      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('author_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      setDocuments(data || []);
    } catch (error) {
      console.error('[UploadQueue] Fetch error:', error);
      toast.error('Failed to load documents', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchDocuments();
  }, []);

  // Update document status from polling
  useEffect(() => {
    if (statuses.size === 0) return;

    setDocuments(prevDocs => 
      prevDocs.map(doc => {
        const polledStatus = statuses.get(doc.id);
        if (polledStatus) {
          return {
            ...doc,
            status: polledStatus.status,
            processing_progress: polledStatus.progress,
            processing_error: polledStatus.error
          };
        }
        return doc;
      })
    );
  }, [statuses]);

  /**
   * Filter and sort documents
   */
  const filteredDocuments = useMemo(() => {
    let filtered = [...documents];

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(doc => doc.status === filters.status);
    }

    // File type filter
    if (filters.fileType !== 'all') {
      filtered = filtered.filter(doc => doc.source_type === filters.fileType);
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = Date.now();
      const ranges: Record<string, number> = {
        today: 24 * 60 * 60 * 1000,
        '7days': 7 * 24 * 60 * 60 * 1000,
        '30days': 30 * 24 * 60 * 60 * 1000,
        '90days': 90 * 24 * 60 * 60 * 1000,
      };
      
      const range = ranges[filters.dateRange];
      if (range) {
        filtered = filtered.filter(doc => {
          const docTime = new Date(doc.created_at).getTime();
          return now - docTime <= range;
        });
      }
    }

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(doc => {
        const filename = doc.metadata?.original_filename || doc.file_path;
        return (
          doc.title.toLowerCase().includes(query) ||
          filename.toLowerCase().includes(query)
        );
      });
    }

    return filtered;
  }, [documents, filters]);

  /**
   * Retry document processing
   */
  const handleRetry = async (documentId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Authentication required');
        return;
      }

      toast.loading('Retrying processing...', { id: 'retry' });

      const response = await fetch('/api/documents/process', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ documentId })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Processing restarted', { id: 'retry' });
        await fetchDocuments();
      } else {
        toast.error('Retry failed', {
          id: 'retry',
          description: data.error || 'Unknown error'
        });
      }
    } catch (error) {
      toast.error('Retry failed', {
        id: 'retry',
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Delete document
   */
  const handleDelete = async (documentId: string, filePath: string) => {
    if (!confirm('Are you sure you want to delete this document? This cannot be undone.')) {
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Authentication required');
        return;
      }

      toast.loading('Deleting document...', { id: 'delete' });

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([filePath]);

      if (storageError) {
        console.error('Storage delete error:', storageError);
        // Continue anyway - database delete is more important
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId)
        .eq('author_id', session.user.id);

      if (dbError) {
        throw new Error(dbError.message);
      }

      toast.success('Document deleted', { id: 'delete' });
      await fetchDocuments();
    } catch (error) {
      toast.error('Delete failed', {
        id: 'delete',
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * View document in workflow
   */
  const handleView = (documentId: string) => {
    router.push(`/workflow/${documentId}/stage1`);
  };

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state (no documents at all)
  if (documents.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No documents uploaded yet</h3>
          <p className="text-muted-foreground mb-4">
            Upload your first document to get started
          </p>
          <Button onClick={() => router.push('/upload')}>
            Upload Documents
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <UploadFilters 
        filters={filters} 
        onFiltersChange={setFilters}
      />

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {filteredDocuments.length === 0 ? (
            // Empty state (filtered results)
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No documents found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your filters
              </p>
              <Button 
                variant="outline" 
                onClick={() => setFilters({
                  status: 'all',
                  fileType: 'all',
                  dateRange: 'all',
                  searchQuery: ''
                })}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map((doc) => {
                    const filename = doc.metadata?.original_filename || 
                                   doc.file_path.split('/').pop() || 
                                   'Unknown';

                    return (
                      <TableRow key={doc.id}>
                        {/* Document Name */}
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="font-medium truncate">{doc.title}</p>
                              <p className="text-sm text-muted-foreground truncate">
                                {filename}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        {/* Status Badge */}
                        <TableCell>
                          <DocumentStatusBadge 
                            status={doc.status}
                            progress={doc.processing_progress}
                          />
                        </TableCell>

                        {/* Progress Bar */}
                        <TableCell>
                          {(doc.status === 'processing' || doc.status === 'uploaded') && (
                            <div className="w-24">
                              <Progress value={doc.processing_progress} className="h-2" />
                              <p className="text-xs text-muted-foreground mt-1">
                                {doc.processing_progress}%
                              </p>
                            </div>
                          )}
                          {doc.status === 'completed' && (
                            <span className="text-sm text-green-600 dark:text-green-400">
                              ✓ Done
                            </span>
                          )}
                          {doc.status === 'error' && (
                            <span className="text-sm text-red-600 dark:text-red-400">
                              Failed
                            </span>
                          )}
                        </TableCell>

                        {/* File Type */}
                        <TableCell>
                          <span className="text-sm uppercase font-mono">
                            {doc.source_type}
                          </span>
                        </TableCell>

                        {/* File Size */}
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {formatFileSize(doc.file_size)}
                          </span>
                        </TableCell>

                        {/* Upload Time */}
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {formatTimeAgo(doc.created_at)}
                          </span>
                        </TableCell>

                        {/* Actions Dropdown */}
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleView(doc.id)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Document
                              </DropdownMenuItem>
                              {doc.status === 'error' && (
                                <DropdownMenuItem onClick={() => handleRetry(doc.id)}>
                                  <RefreshCw className="w-4 h-4 mr-2" />
                                  Retry Processing
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem 
                                onClick={() => handleDelete(doc.id, doc.file_path)}
                                className="text-red-600 dark:text-red-400"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Polling Indicator */}
      {isPolling && (
        <div className="text-xs text-muted-foreground text-center">
          Auto-refreshing status every 2 seconds...
        </div>
      )}
    </div>
  );
}
```

**Explanation:**
- **Real-Time Updates:** Integrates with `useDocumentStatus` hook for 2-second polling
- **Comprehensive Table:** Shows all document info with sortable columns
- **Filters:** Integrates UploadFilters component
- **Actions:** View, Retry (for errors), Delete
- **Progress Bars:** Visual progress for processing documents
- **Empty States:** Handles no documents and no filtered results
- **Loading States:** Skeleton placeholders
- **Error Handling:** Toast notifications for all actions

**Verification:**
1. Component compiles with no TypeScript errors
2. All UI components exist (Table, DropdownMenu, etc.)



++++++++++++++++++++++++



## PROMPT 4C COMPLETION CHECKLIST

Before proceeding to Prompt 4D, verify:

### Components Created (Part C)
- [ ] Upload Filters: `src/components/upload/upload-filters.tsx`
- [ ] Upload Queue: `src/components/upload/upload-queue.tsx`

### Build Verification
- [ ] Run `npm run build` - no TypeScript errors
- [ ] All imports resolve correctly
- [ ] Filters component can be imported
- [ ] Queue component can be imported

### Integration Testing
- [ ] Upload a test document
- [ ] Verify it appears in queue
- [ ] Test status filtering
- [ ] Test file type filtering
- [ ] Test search functionality
- [ ] Test clear filters button

---

## ➡️ NEXT: Proceed to PROMPT4_d.md

After completing and verifying the above checklist, continue with:
- **PROMPT4_d.md** - Step 7 (Update Upload Page) + Final Completion Checklist

This will integrate all the components you've built into the upload page and provide comprehensive testing procedures.

---

**END OF PROMPT 4C**
