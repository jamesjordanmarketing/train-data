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
import { cn } from '../ui/utils';

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

  if (msg.includes('failed to start text extraction') || msg.includes('processing service unreachable')) {
    return {
      type: 'Processing Trigger Failed',
      category: 'system',
      recoverable: true,
      suggestedAction: 'Retry processing from the dashboard'
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
                  {errorMessage?.includes('start text extraction') && (
                    <li>Background processing trigger failed (retryable)</li>
                  )}
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

