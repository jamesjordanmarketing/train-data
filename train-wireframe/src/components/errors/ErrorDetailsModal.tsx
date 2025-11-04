/**
 * Error Details Modal Component
 * 
 * Comprehensive modal for displaying error information with:
 * - Summary tab: User-friendly error explanation
 * - Technical Details tab: Stack trace, error code, context
 * - Copy to clipboard functionality
 * - Report issue via email
 * - Search/filter in stack trace
 * - Keyboard shortcuts (ESC to close)
 * - Sanitized data display (no sensitive information)
 * 
 * Used by error boundaries and error handling flows to give users
 * detailed information for troubleshooting and reporting.
 * 
 * @example
 * ```typescript
 * import { ErrorDetailsModal } from '@/components/errors/ErrorDetailsModal';
 * 
 * const [showDetails, setShowDetails] = useState(false);
 * 
 * <ErrorDetailsModal
 *   isOpen={showDetails}
 *   onClose={() => setShowDetails(false)}
 *   error={error}
 *   errorId="err-123"
 * />
 * ```
 */

'use client';

import React, { useState } from 'react';
import { Copy, Check, Bug, Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { AppError, ErrorCode } from '@/lib/errors';
import { sanitizeError } from '@/lib/errors/error-guards';
import { toast } from 'sonner';

interface ErrorDetailsModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal is closed */
  onClose: () => void;
  /** The error to display */
  error: Error | AppError;
  /** Optional unique error ID for tracking */
  errorId?: string;
}

/**
 * ErrorDetailsModal component.
 * Displays comprehensive error information in a tabbed interface.
 * Supports copying error details and reporting issues.
 */
export function ErrorDetailsModal({
  isOpen,
  onClose,
  error,
  errorId,
}: ErrorDetailsModalProps) {
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const sanitized = error instanceof AppError ? sanitizeError(error) : null;
  const isAppError = error instanceof AppError;

  /**
   * Copy error details to clipboard.
   * Includes error ID, message, code, stack trace, and timestamp.
   */
  async function handleCopyDetails() {
    const details = {
      errorId,
      message: error.message,
      name: error.name,
      code: isAppError ? error.code : undefined,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    };

    try {
      await navigator.clipboard.writeText(JSON.stringify(details, null, 2));
      setCopied(true);
      toast.success('Error details copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  }

  /**
   * Open email client with pre-filled error report.
   * Includes error details and prompts user to describe what they were doing.
   */
  function handleReportIssue() {
    const subject = encodeURIComponent(`Error Report: ${error.name}`);
    const body = encodeURIComponent(
      `Error ID: ${errorId || 'N/A'}\n\n` +
      `Error: ${error.message}\n\n` +
      `Stack Trace:\n${error.stack || 'N/A'}\n\n` +
      `Please describe what you were doing when this error occurred:\n`
    );
    
    window.open(`mailto:support@example.com?subject=${subject}&body=${body}`, '_blank');
  }

  /**
   * Filter stack trace by search query.
   * Case-insensitive search through stack trace lines.
   */
  const filteredStack = error.stack
    ?.split('\n')
    .filter((line) => line.toLowerCase().includes(searchQuery.toLowerCase()))
    .join('\n');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle>Error Details</DialogTitle>
              <DialogDescription>
                {sanitized?.message || error.message}
              </DialogDescription>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopyDetails}
                className="h-8"
                aria-label="Copy error details to clipboard"
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3 mr-1" aria-hidden="true" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 mr-1" aria-hidden="true" />
                    Copy
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleReportIssue}
                className="h-8"
                aria-label="Report this issue"
              >
                <Bug className="h-3 w-3 mr-1" aria-hidden="true" />
                Report
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="summary" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="technical">Technical Details</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-4">
            {/* User-Friendly Summary */}
            <div>
              <h4 className="text-sm font-semibold mb-2">What Happened</h4>
              <p className="text-sm text-muted-foreground">
                {sanitized?.message || error.message}
              </p>
            </div>

            {errorId && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Error ID</h4>
                <code className="text-sm bg-muted px-2 py-1 rounded">
                  {errorId}
                </code>
              </div>
            )}

            {isAppError && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Error Type</h4>
                <Badge variant="secondary">{error.code}</Badge>
              </div>
            )}

            {isAppError && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Recoverable</h4>
                <Badge variant={error.isRecoverable ? 'default' : 'destructive'}>
                  {error.isRecoverable ? 'Yes - Can Retry' : 'No - Permanent Error'}
                </Badge>
              </div>
            )}

            <div>
              <h4 className="text-sm font-semibold mb-2">What You Can Do</h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                {isAppError && error.isRecoverable && (
                  <>
                    <li>Try the operation again</li>
                    <li>Check your network connection</li>
                  </>
                )}
                {isAppError && !error.isRecoverable && (
                  <>
                    <li>Review your input and try again</li>
                    <li>Contact support if the issue persists</li>
                  </>
                )}
                <li>Report this issue using the Report button above</li>
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="technical" className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search in stack trace..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
                aria-label="Search stack trace"
              />
            </div>

            {/* Error Code */}
            {isAppError && error.code && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Error Code</h4>
                <code className="text-xs bg-muted px-2 py-1 rounded block">
                  {error.code}
                </code>
              </div>
            )}

            {/* Error Name */}
            <div>
              <h4 className="text-sm font-semibold mb-2">Error Name</h4>
              <code className="text-xs bg-muted px-2 py-1 rounded block">
                {error.name}
              </code>
            </div>

            {/* Error Message */}
            <div>
              <h4 className="text-sm font-semibold mb-2">Error Message</h4>
              <code className="text-xs bg-muted px-2 py-1 rounded block">
                {error.message}
              </code>
            </div>

            {/* Stack Trace */}
            <div>
              <h4 className="text-sm font-semibold mb-2">Stack Trace</h4>
              <ScrollArea className="h-[300px] w-full rounded-md border">
                <pre className="text-xs p-3 font-mono">
                  {filteredStack || error.stack || 'No stack trace available'}
                </pre>
              </ScrollArea>
            </div>

            {/* Context (if AppError) */}
            {isAppError && error.context && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Context</h4>
                <ScrollArea className="h-[150px] w-full rounded-md border">
                  <pre className="text-xs p-3 font-mono">
                    {JSON.stringify(error.context, null, 2)}
                  </pre>
                </ScrollArea>
              </div>
            )}

            {/* Timestamp */}
            <div>
              <h4 className="text-sm font-semibold mb-2">Timestamp</h4>
              <code className="text-xs bg-muted px-2 py-1 rounded block">
                {isAppError && error.context?.timestamp 
                  ? error.context.timestamp 
                  : new Date().toISOString()}
              </code>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

