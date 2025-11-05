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
  Download,
  Edit,
  FileText as FileTextIcon,
  AlertTriangle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { DocumentStatusBadge } from './document-status-badge';
import { Progress } from '../ui/progress';
import { formatFileSize, formatTimeAgo } from '@/lib/types/upload';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { useDocumentStatus } from '../../hooks/use-document-status';
import { UploadFilters } from './upload-filters';
import { Skeleton } from '../ui/skeleton';
import { MetadataEditDialog } from './metadata-edit-dialog';
import { ContentPreviewSheet } from './content-preview-sheet';
import { ErrorDetailsDialog } from './error-details-dialog';
import { getWorkflowUrl, isReadyForWorkflow, getNextActionLabel } from '../../lib/workflow-navigation';
import { BulkWorkflowActions } from './bulk-workflow-actions';
import { Checkbox } from '../ui/checkbox';

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
  doc_version: string | null;
  source_url: string | null;
  doc_date: string | null;
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
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>([]);
  const [filters, setFilters] = useState<{
    status: string;
    fileType: string;
    dateRange: string;
    searchQuery: string;
  }>({
    status: 'all',
    fileType: 'all',
    dateRange: 'all',
    searchQuery: ''
  });

  // Dialog state
  const [metadataDialogOpen, setMetadataDialogOpen] = useState(false);
  const [previewSheetOpen, setPreviewSheetOpen] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

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

      // Step 1: Delete workflow sessions first (foreign key constraint)
      const { error: workflowError } = await supabase
        .from('workflow_sessions')
        .delete()
        .eq('document_id', documentId)
        .eq('user_id', session.user.id);

      if (workflowError) {
        console.error('Workflow sessions delete error:', workflowError);
        throw new Error(`Failed to delete workflow sessions: ${workflowError.message}`);
      }

      // Step 2: Delete document categories (if they exist)
      const { error: categoriesError } = await supabase
        .from('document_categories')
        .delete()
        .eq('document_id', documentId);

      if (categoriesError) {
        console.error('Document categories delete error:', categoriesError);
        // Continue - this table might not have records
      }

      // Step 3: Delete document tags (if they exist)
      const { error: tagsError } = await supabase
        .from('document_tags')
        .delete()
        .eq('document_id', documentId);

      if (tagsError) {
        console.error('Document tags delete error:', tagsError);
        // Continue - this table might not have records
      }

      // Step 4: Delete chunks and their dimensions (if they exist)
      // First get all chunks for this document
      const { data: chunks } = await supabase
        .from('chunks')
        .select('id')
        .eq('document_id', documentId);

      if (chunks && chunks.length > 0) {
        const chunkIds = chunks.map(c => c.id);
        
        // Delete chunk dimensions
        const { error: dimensionsError } = await supabase
          .from('chunk_dimensions')
          .delete()
          .in('chunk_id', chunkIds);

        if (dimensionsError) {
          console.error('Chunk dimensions delete error:', dimensionsError);
        }

        // Delete chunks
        const { error: chunksError } = await supabase
          .from('chunks')
          .delete()
          .eq('document_id', documentId);

        if (chunksError) {
          console.error('Chunks delete error:', chunksError);
        }
      }

      // Step 5: Delete chunk extraction jobs (if they exist)
      const { error: jobsError } = await supabase
        .from('chunk_extraction_jobs')
        .delete()
        .eq('document_id', documentId);

      if (jobsError) {
        console.error('Chunk extraction jobs delete error:', jobsError);
        // Continue - this is not critical
      }

      // Step 6: Delete from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([filePath]);

      if (storageError) {
        console.error('Storage delete error:', storageError);
        // Continue anyway - database delete is more important
      }

      // Step 7: Finally delete the document record
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId)
        .eq('author_id', session.user.id);

      if (dbError) {
        throw new Error(dbError.message);
      }

      toast.success('Document and all related data deleted', { id: 'delete' });
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

  /**
   * Start workflow for document
   */
  const handleStartWorkflow = (doc: Document) => {
    const workflowUrl = getWorkflowUrl(doc.id, doc.status);
    router.push(workflowUrl);
  };

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
      {/* Bulk Workflow Actions */}
      {filteredDocuments.some(d => d.status === 'completed') && (
        <BulkWorkflowActions
          documents={filteredDocuments}
          selectedIds={selectedDocumentIds}
          onSelectionChange={setSelectedDocumentIds}
        />
      )}

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
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          selectedDocumentIds.length === filteredDocuments.filter(d => d.status === 'completed').length &&
                          filteredDocuments.filter(d => d.status === 'completed').length > 0
                        }
                        onCheckedChange={(checked) => {
                          if (checked) {
                            const completedIds = filteredDocuments
                              .filter(d => d.status === 'completed')
                              .map(d => d.id);
                            setSelectedDocumentIds(completedIds);
                          } else {
                            setSelectedDocumentIds([]);
                          }
                        }}
                      />
                    </TableHead>
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
                        {/* Checkbox Cell */}
                        <TableCell>
                          {doc.status === 'completed' && (
                            <Checkbox
                              checked={selectedDocumentIds.includes(doc.id)}
                              onCheckedChange={() => {
                                if (selectedDocumentIds.includes(doc.id)) {
                                  setSelectedDocumentIds(selectedDocumentIds.filter(id => id !== doc.id));
                                } else {
                                  setSelectedDocumentIds([...selectedDocumentIds, doc.id]);
                                }
                              }}
                            />
                          )}
                        </TableCell>

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
                          {(doc.status === 'processing' || doc.status === 'uploaded') && (() => {
                            const uploadedAt = new Date(doc.created_at).getTime();
                            const now = Date.now();
                            const minutesStuck = Math.floor((now - uploadedAt) / 60000);
                            const isStuck = doc.status === 'uploaded' && minutesStuck > 2;

                            return (
                              <div className="w-24">
                                <Progress value={doc.processing_progress} className="h-2" />
                                <p className={`text-xs mt-1 ${isStuck ? 'text-orange-600 dark:text-orange-400 font-medium' : 'text-muted-foreground'}`}>
                                  {isStuck ? `Stuck ${minutesStuck}m` : `${doc.processing_progress}%`}
                                </p>
                              </div>
                            );
                          })()}
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
                          <div className="flex items-center justify-end gap-2">
                            {/* Quick Start Workflow Button (for completed docs) */}
                            {doc.status === 'completed' && (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleStartWorkflow(doc)}
                              >
                                Start Workflow
                              </Button>
                            )}
                            
                            {/* Existing actions dropdown */}
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
                              
                              {/* Add Start Workflow option for ready documents */}
                              {isReadyForWorkflow(doc.status) && (
                                <DropdownMenuItem onClick={() => handleStartWorkflow(doc)}>
                                  <FileText className="w-4 h-4 mr-2" />
                                  {getNextActionLabel(doc.status)}
                                </DropdownMenuItem>
                              )}
                              
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

                              {/* Add retry option for stuck "uploaded" documents */}
                              {doc.status === 'uploaded' && (() => {
                                const uploadedAt = new Date(doc.created_at).getTime();
                                const now = Date.now();
                                const minutesStuck = Math.floor((now - uploadedAt) / 60000);
                                // If stuck for more than 2 minutes, show retry option
                                return minutesStuck > 2;
                              })() && (
                                <DropdownMenuItem onClick={() => handleRetry(doc.id)}>
                                  <RefreshCw className="w-4 h-4 mr-2" />
                                  Start Processing (Stuck)
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
                          </div>
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

