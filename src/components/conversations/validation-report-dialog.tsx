'use client';

/**
 * Validation Report Dialog Component
 * 
 * Displays comprehensive enrichment pipeline report including:
 * - Overall enrichment status
 * - Pipeline stages progress (generation → validation → enrichment → normalization)
 * - Validation blockers and warnings
 * - Enrichment errors
 * - Timeline of events
 * 
 * Fetches data from: GET /api/conversations/[id]/validation-report
 */

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, AlertTriangle, Clock, RefreshCw } from 'lucide-react';
import type {
  ValidationReportResponse,
  PipelineStage,
  ValidationIssue,
} from '@/lib/types/conversations';

interface ValidationReportDialogProps {
  conversationId: string;
  open: boolean;
  onClose: () => void;
}

export function ValidationReportDialog({
  conversationId,
  open,
  onClose,
}: ValidationReportDialogProps) {
  const [report, setReport] = useState<ValidationReportResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && conversationId) {
      fetchReport();
    }
  }, [open, conversationId]);

  async function fetchReport() {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/conversations/${conversationId}/validation-report`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch validation report');
      }
      
      const data = await response.json();
      setReport(data);
    } catch (err) {
      console.error('Error fetching validation report:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Enrichment Pipeline Report</DialogTitle>
            <DialogDescription>Loading pipeline status...</DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center p-8">
            <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
          </DialogHeader>
          <div className="p-4 bg-destructive/10 border border-destructive rounded-md">
            <p className="text-sm text-destructive">{error}</p>
          </div>
          <div className="flex justify-end">
            <Button variant="outline" onClick={fetchReport}>
              Retry
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!report) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Enrichment Pipeline Report</DialogTitle>
          <DialogDescription>
            Conversation ID: {conversationId}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Overall Status */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">Pipeline Status:</span>
              <Badge variant={getStatusVariant(report.enrichment_status)}>
                {formatStatus(report.enrichment_status)}
              </Badge>
            </div>
            <Button variant="ghost" size="sm" onClick={fetchReport}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Pipeline Stages */}
          <div className="space-y-3">
            <h3 className="font-medium text-base">Pipeline Stages</h3>
            <div className="space-y-2">
              {Object.entries(report.pipeline_stages).map(([key, stage]) => (
                <PipelineStageCard key={key} stage={stage} />
              ))}
            </div>
          </div>

          {/* Validation Report (if exists) */}
          {report.validation_report && (
            <div className="space-y-3">
              <h3 className="font-medium text-base">Validation Results</h3>

              {/* Summary */}
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm font-medium">{report.validation_report.summary}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Validated at: {formatTimestamp(report.validation_report.validatedAt)}
                </p>
              </div>

              {/* Blockers */}
              {report.validation_report.hasBlockers && report.validation_report.blockers.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-destructive flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Blocking Errors ({report.validation_report.blockers.length})
                  </h4>
                  <div className="space-y-2">
                    {report.validation_report.blockers.map((issue: ValidationIssue, i: number) => (
                      <ValidationIssueCard key={i} issue={issue} />
                    ))}
                  </div>
                </div>
              )}

              {/* Warnings */}
              {report.validation_report.hasWarnings && report.validation_report.warnings.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-yellow-600 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Warnings ({report.validation_report.warnings.length})
                  </h4>
                  <div className="space-y-2">
                    {report.validation_report.warnings.map((issue: ValidationIssue, i: number) => (
                      <ValidationIssueCard key={i} issue={issue} />
                    ))}
                  </div>
                </div>
              )}

              {/* Success */}
              {!report.validation_report.hasBlockers && !report.validation_report.hasWarnings && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-700">
                    No validation issues detected
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Error Message (if exists) */}
          {report.enrichment_error && (
            <div className="space-y-2">
              <h3 className="font-medium text-base text-destructive">Enrichment Error</h3>
              <div className="p-3 bg-destructive/10 border border-destructive rounded-md">
                <p className="text-sm text-destructive">{report.enrichment_error}</p>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="space-y-2">
            <h3 className="font-medium text-base">Timeline</h3>
            <div className="text-sm space-y-1.5 p-3 bg-muted/50 rounded-md">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Raw JSON stored:</span>
                <span className="font-medium">{formatTimestamp(report.timeline.raw_stored_at)}</span>
              </div>
              {report.timeline.enriched_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Enrichment completed:</span>
                  <span className="font-medium">{formatTimestamp(report.timeline.enriched_at)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last updated:</span>
                <span className="font-medium">{formatTimestamp(report.timeline.last_updated)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Pipeline Stage Card Component
 */
function PipelineStageCard({ stage }: { stage: PipelineStage }) {
  const getIcon = () => {
    switch (stage.status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-600 animate-pulse" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getBackgroundColor = () => {
    switch (stage.status) {
      case 'completed':
        return 'bg-green-50 border-green-200';
      case 'failed':
        return 'bg-destructive/5 border-destructive/20';
      case 'in_progress':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-muted/50 border-muted';
    }
  };

  return (
    <div className={`flex items-center gap-3 p-3 border rounded-md ${getBackgroundColor()}`}>
      {getIcon()}
      <div className="flex-1">
        <div className="text-sm font-medium">{stage.name}</div>
        {stage.completed_at && (
          <div className="text-xs text-muted-foreground mt-0.5">
            {formatTimestamp(stage.completed_at)}
          </div>
        )}
      </div>
      <Badge variant={getStatusVariant(stage.status)}>
        {formatStatus(stage.status)}
      </Badge>
    </div>
  );
}

/**
 * Validation Issue Card Component
 */
function ValidationIssueCard({ issue }: { issue: ValidationIssue }) {
  const isBlocker = issue.severity === 'blocker';
  const borderColor = isBlocker ? 'border-destructive/40' : 'border-yellow-400/40';

  return (
    <div className={`p-3 border-l-4 ${borderColor} bg-muted/30 rounded-r-md space-y-2`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{issue.field}</span>
            <Badge variant="outline" className="text-xs">
              {issue.code}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{issue.message}</p>
          {issue.suggestion && (
            <div className="flex items-start gap-1.5 mt-2 p-2 bg-background/50 rounded border border-muted">
              <span className="text-xs font-medium text-muted-foreground">💡 Suggestion:</span>
              <p className="text-xs text-muted-foreground flex-1">
                {issue.suggestion}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Helper Functions
 */

function getStatusVariant(
  status: string
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'completed':
    case 'enriched':
      return 'default';
    case 'validation_failed':
    case 'normalization_failed':
    case 'failed':
      return 'destructive';
    case 'in_progress':
    case 'enrichment_in_progress':
      return 'secondary';
    case 'validated':
      return 'outline';
    default:
      return 'outline';
  }
}

function formatStatus(status: string): string {
  return status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatTimestamp(timestamp: string | null): string {
  if (!timestamp) return 'N/A';
  try {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Invalid date';
  }
}

