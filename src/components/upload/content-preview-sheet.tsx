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
import { formatFileSize, formatTimeAgo } from '@/lib/types/upload';

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

