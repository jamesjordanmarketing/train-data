'use client';

import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RecoverySummary as RecoverySummaryType } from '@/lib/recovery/types';

interface RecoverySummaryProps {
  summary: RecoverySummaryType;
  onClose: () => void;
  onViewFailures?: () => void;
}

export function RecoverySummary({
  summary,
  onClose,
  onViewFailures,
}: RecoverySummaryProps) {
  const hasFailures = summary.failedCount > 0;
  const allSuccess = summary.successCount === summary.totalItems;
  
  return (
    <div className="space-y-6">
      {/* Success/Warning Header */}
      {allSuccess ? (
        <div className="text-center py-6">
          <div className="inline-flex p-4 rounded-full bg-success/10 mb-4">
            <CheckCircle className="h-12 w-12 text-success" />
          </div>
          <h3 className="text-2xl font-bold">Recovery Complete!</h3>
          <p className="text-muted-foreground mt-2">
            All {summary.totalItems} items were recovered successfully.
          </p>
        </div>
      ) : hasFailures ? (
        <div className="text-center py-6">
          <div className="inline-flex p-4 rounded-full bg-warning/10 mb-4">
            <AlertTriangle className="h-12 w-12 text-warning" />
          </div>
          <h3 className="text-2xl font-bold">Partial Recovery</h3>
          <p className="text-muted-foreground mt-2">
            {summary.successCount} of {summary.totalItems} items recovered successfully.
          </p>
        </div>
      ) : (
        <div className="text-center py-6">
          <div className="inline-flex p-4 rounded-full bg-destructive/10 mb-4">
            <XCircle className="h-12 w-12 text-destructive" />
          </div>
          <h3 className="text-2xl font-bold">Recovery Failed</h3>
          <p className="text-muted-foreground mt-2">
            Unable to recover any items. Please try again or contact support.
          </p>
        </div>
      )}
      
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
            <div className="text-3xl font-bold">{summary.successCount}</div>
            <div className="text-sm text-muted-foreground">Recovered</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <XCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
            <div className="text-3xl font-bold">{summary.failedCount}</div>
            <div className="text-sm text-muted-foreground">Failed</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <div className="text-3xl font-bold">{summary.skippedCount}</div>
            <div className="text-sm text-muted-foreground">Skipped</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Failure Alert */}
      {hasFailures && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {summary.failedCount} item{summary.failedCount > 1 ? 's' : ''} could not be recovered.
            {onViewFailures && (
              <>
                {' '}
                <button
                  onClick={onViewFailures}
                  className="font-medium underline"
                >
                  View details
                </button>
              </>
            )}
          </AlertDescription>
        </Alert>
      )}
      
      {/* Next Steps */}
      <div>
        <h4 className="font-semibold mb-3">Next Steps</h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {summary.successCount > 0 && (
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
              <span>
                Your recovered data is now available in the application.
              </span>
            </li>
          )}
          {hasFailures && (
            <li className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
              <span>
                Failed items may require manual recovery or support assistance.
              </span>
            </li>
          )}
          <li className="flex items-start gap-2">
            <Download className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <span>
              A recovery log has been saved for your records.
            </span>
          </li>
        </ul>
      </div>
      
      {/* Action Buttons */}
      <div className="flex gap-2 pt-4">
        {hasFailures && onViewFailures && (
          <Button variant="outline" onClick={onViewFailures} className="flex-1">
            View Failures
          </Button>
        )}
        <Button onClick={onClose} className="flex-1">
          {allSuccess ? 'Done' : 'Close'}
        </Button>
      </div>
    </div>
  );
}

