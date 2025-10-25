# PROMPT 5c: Metadata & Preview Features (Part 3 of 4)
**Module:** Document Upload & Processing  
**Phase:** Metadata Management & Content Preview  
**Estimated Time:** 3-4 hours total (this is part 3)  
**Prerequisites:** PROMPT5_a.md and PROMPT5_b.md completed

---

## CONTINUATION FROM PROMPT 5b

In the previous parts, you completed:
- ✅ STEP 1: Created Metadata Update API Endpoint (PROMPT5_a.md)
- ✅ STEP 2: Created Metadata Edit Form Component (PROMPT5_b.md)

In this part, you will continue with:
- **STEP 3: Create Content Preview Component** ← THIS PART
- **STEP 4: Create Error Details Dialog** ← THIS PART

---

## CONTEXT REMINDER

You are building metadata editing and preview features for the document upload module. The API and metadata edit form are ready. Now you will create components for previewing extracted content and viewing error details.

### What's Available Now
✅ Metadata Update API with GET endpoint for fetching document content  
✅ Metadata Edit Form for editing document information  
✅ Upload queue with documents that have extracted text content

### Your Current Task
Build the Content Preview Sheet and Error Details Dialog components.

---



====================



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



## STEPS 3 & 4 COMPLETE - PROCEED TO FINAL PART

✅ **You have completed STEPS 3 & 4 of PROMPT 5**

**What was built:**
- Content Preview Sheet component with statistics and quality indicators
- Error Details Dialog with classification and support options
- Copy and download functionality for content
- Pre-filled error reporting via email

**Next Steps:**
Continue to **PROMPT5_d.md** to implement:
- STEP 5: Update Upload Queue with New Features
- PROMPT 5 COMPLETION CHECKLIST

**Verification before continuing:**
- [ ] Content Preview Sheet file created at `src/components/upload/content-preview-sheet.tsx`
- [ ] Error Details Dialog file created at `src/components/upload/error-details-dialog.tsx`
- [ ] Both files compile with no TypeScript errors
- [ ] All imports resolve correctly

---

**END OF PROMPT 5c (Part 3 of 4)**
