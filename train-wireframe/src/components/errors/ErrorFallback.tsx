'use client';

import React, { useState } from 'react';
import { ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw, Bug, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ErrorDetailsModal } from './ErrorDetailsModal';

interface ErrorFallbackProps {
  error: Error;
  errorInfo: ErrorInfo;
  errorId?: string;
  onReset?: () => void;
  showReportButton?: boolean;
}

/**
 * ErrorFallback Component
 * 
 * User-friendly fallback UI displayed when ErrorBoundary catches an error.
 * 
 * Features:
 * - Displays user-friendly error message (production) or detailed error (development)
 * - Shows unique error ID for support tracking
 * - "Reload Page" button to attempt recovery
 * - "Report Issue" button pre-filled with error details
 * - Collapsible detailed error information (development only)
 * - Responsive layout for all screen sizes
 * - Accessible keyboard navigation
 * 
 * @example
 * ```tsx
 * <ErrorFallback
 *   error={new Error('Something went wrong')}
 *   errorInfo={{ componentStack: '...' }}
 *   errorId="abc-123"
 *   onReset={() => window.location.reload()}
 * />
 * ```
 */
export function ErrorFallback({
  error,
  errorInfo,
  errorId,
  onReset,
  showReportButton = true,
}: ErrorFallbackProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const isDevelopment = process.env.NODE_ENV === 'development';

  /**
   * Handle reload - try to recover by resetting error boundary or reloading page
   */
  const handleReload = () => {
    if (onReset) {
      onReset();
    } else {
      window.location.reload();
    }
  };

  /**
   * Handle report issue - open email client with pre-filled error details
   */
  const handleReport = () => {
    // Format error details for email
    const subject = encodeURIComponent(`Error Report: ${error.name}`);
    const body = encodeURIComponent(
      `Error ID: ${errorId}\n\n` +
      `Error Name: ${error.name}\n` +
      `Error Message: ${error.message}\n\n` +
      `Component Stack:\n${errorInfo.componentStack}\n\n` +
      `Please describe what you were doing when this error occurred:\n` +
      `[Your description here]\n\n` +
      `Additional context (browser, OS, etc.):\n` +
      `[Your details here]\n`
    );
    
    // Open email client (in production, this could be a support form)
    window.open(`mailto:support@example.com?subject=${subject}&body=${body}`, '_blank');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/20">
      <Card className="max-w-2xl w-full shadow-lg">
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="p-3 bg-destructive/10 rounded-full flex-shrink-0">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-xl">Something went wrong</CardTitle>
              <CardDescription className="mt-2">
                {isDevelopment
                  ? error.message
                  : "We're sorry, but an unexpected error occurred. The application will attempt to recover."}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Error ID for support tracking */}
          {errorId && (
            <Alert>
              <AlertDescription className="font-mono text-sm">
                Error ID: <span className="font-semibold">{errorId}</span>
              </AlertDescription>
            </Alert>
          )}

          {/* User guidance */}
          <div className="text-sm text-muted-foreground space-y-2">
            <p>
              The application encountered an error and couldn't continue. You can try:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Reloading the page to start fresh</li>
              <li>Going back and trying a different action</li>
              <li>Reporting this issue if it persists</li>
            </ul>
          </div>

          {/* Development mode: Detailed error information */}
          {isDevelopment && (
            <Collapsible open={showDetails} onOpenChange={setShowDetails}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm" className="w-full">
                  {showDetails ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-2" />
                      Hide Error Details
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-2" />
                      Show Error Details (Development Mode)
                    </>
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4 space-y-4">
                {/* Error name and message */}
                <div>
                  <h4 className="font-semibold mb-2 text-sm">Error Message:</h4>
                  <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto border">
                    {error.name}: {error.message}
                  </pre>
                </div>

                {/* Stack trace */}
                {error.stack && (
                  <div>
                    <h4 className="font-semibold mb-2 text-sm">Stack Trace:</h4>
                    <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto max-h-64 border">
                      {error.stack}
                    </pre>
                  </div>
                )}

                {/* Component stack */}
                {errorInfo.componentStack && (
                  <div>
                    <h4 className="font-semibold mb-2 text-sm">Component Stack:</h4>
                    <pre className="bg-muted p-3 rounded-md text-xs overflow-x-auto max-h-64 border">
                      {errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          )}
        </CardContent>

        <CardFooter className="flex gap-2 flex-wrap">
          <Button onClick={handleReload} className="flex-1 min-w-[200px]" size="lg">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reload Page
          </Button>
          <Button
            onClick={() => setShowDetailsModal(true)}
            variant="outline"
            className="flex-1 min-w-[200px]"
            size="lg"
          >
            <Info className="h-4 w-4 mr-2" />
            View Details
          </Button>
          {showReportButton && (
            <Button onClick={handleReport} variant="outline" className="flex-1 min-w-[200px]" size="lg">
              <Bug className="h-4 w-4 mr-2" />
              Report Issue
            </Button>
          )}
        </CardFooter>
      </Card>

      <ErrorDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        error={error}
        errorId={errorId}
      />
    </div>
  );
}

