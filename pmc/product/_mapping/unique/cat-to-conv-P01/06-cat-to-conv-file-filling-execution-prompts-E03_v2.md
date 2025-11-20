# Conversation JSON Enrichment Pipeline - Execution Prompts E03
**Generated**: 2025-11-20  
**Segment**: E03 - UI Components & Dashboard Integration (Prompt 5)  
**Total Prompts in this file**: 1  
**Specification Source**: `06-cat-to-conv-file-filling_v2.md`

---

## Executive Summary

This file contains Prompt 5 (final prompt) of the 5-prompt implementation sequence. This prompt implements the user-facing UI components that provide visibility into the enrichment pipeline and access to raw and enriched JSON files.

**Pipeline Progress:**
1. ✅ DONE (E01-Prompt 1): Database schema + Validation service
2. ✅ DONE (E01-Prompt 2): Enrichment service
3. ✅ DONE (E02-Prompt 3): Normalization service + API endpoints
4. ✅ DONE (E02-Prompt 4): Complete pipeline orchestration
5. **Prompt 5**: UI components for viewing pipeline status, downloading files, and viewing validation reports

**Key Deliverables:**
- Validation Report Dialog component with pipeline stages visualization
- Download buttons for raw and enriched JSON
- Enhanced Conversation Dashboard with enrichment status indicators
- Integration with existing conversation views

---

## IMPORTANT: Use SAOL for All Database Operations

**For all Supabase operations use the Supabase Agent Ops Library (SAOL).**  
**Library location:** `C:\Users\james\Master\BrightHub\brun\train-data\supa-agent-ops\`  
**Quick Start Guide:** `C:\Users\james\Master\BrightHub\brun\train-data\supa-agent-ops\saol-agent-quick-start-guide_v1.md`

---

## Prompt 5: UI Components & Dashboard Integration

**Scope**: Validation report dialog, download buttons, dashboard integration  
**Dependencies**: Prompts 1-4 complete (all services and APIs exist)  
**Estimated Time**: 8-10 hours  
**Risk Level**: Low (UI-only, no complex business logic)

========================

You are a senior full-stack TypeScript developer implementing the UI components for the Conversation JSON Enrichment Pipeline. This final prompt creates user-facing components that provide visibility into the enrichment pipeline, enable users to download raw and enriched JSON files, and view detailed validation reports.

**CRITICAL CONTEXT:**

**Pipeline State - ALL BACKEND COMPLETE:**
1. ✅ ConversationValidationService - validates minimal JSON
2. ✅ ConversationEnrichmentService - enriches with database metadata
3. ✅ ConversationNormalizationService - normalizes encoding/format
4. ✅ EnrichmentPipelineOrchestrator - coordinates entire pipeline
5. ✅ API endpoints - `/api/conversations/[id]/download/raw`, `/download/enriched`, `/validation-report`

**What You're Building:**
1. ValidationReportDialog component - displays pipeline status, blockers, warnings
2. ConversationActions component - download buttons with state-aware behavior
3. Dashboard integration - add enrichment status badges and action buttons
4. Type definitions for UI state

**Integration Points:**
- Find existing conversation dashboard/table component
- Add enrichment status column/badge
- Add action buttons for downloads and validation report
- Ensure buttons are enabled/disabled based on enrichment_status

**File Locations:**
- Validation Report Dialog: `src/components/conversation/validation-report-dialog.tsx` (NEW)
- Conversation Actions: `src/components/conversation/conversation-actions.tsx` (NEW or UPDATE if exists)
- Dashboard Updates: Update existing conversation list/table component
- Types: Add to `src/lib/types/conversations.ts` (append UI types)

---

### TASK 5.1: Type Definitions for UI State

**Add to:** `src/lib/types/conversations.ts` (append to end)

```typescript
/**
 * UI-specific types for enrichment pipeline
 */

/**
 * Validation report API response
 */
export interface ValidationReportResponse {
  conversation_id: string;
  enrichment_status: string;
  processing_status: string;
  validation_report: ValidationResult | null;
  enrichment_error: string | null;
  timeline: {
    raw_stored_at: string | null;
    enriched_at: string | null;
    last_updated: string | null;
  };
  pipeline_stages: PipelineStages;
}

/**
 * Pipeline stages status
 */
export interface PipelineStages {
  stage_1_generation: PipelineStage;
  stage_2_validation: PipelineStage;
  stage_3_enrichment: PipelineStage;
  stage_4_normalization: PipelineStage;
}

/**
 * Individual pipeline stage
 */
export interface PipelineStage {
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  completed_at: string | null;
}

/**
 * Download URL response
 */
export interface DownloadUrlResponse {
  conversation_id: string;
  download_url: string;
  filename: string;
  file_size: number | null;
  expires_at: string;
  expires_in_seconds: number;
}
```

---

### TASK 5.2: Validation Report Dialog Component

**Create file:** `src/components/conversation/validation-report-dialog.tsx`

**Requirements:**
1. Display enrichment pipeline status with visual indicators
2. Show pipeline stages with completion status
3. Display validation blockers and warnings with details
4. Show enrichment errors if any
5. Display timeline of pipeline execution
6. Responsive design with max height and scrolling

**Full Implementation:**

```typescript
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
import { AlertCircle, CheckCircle, AlertTriangle, Clock, RefreshCw, X } from 'lucide-react';
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
```

---

### TASK 5.3: Conversation Actions Component (Download Buttons)

**Create file:** `src/components/conversation/conversation-actions.tsx`

**Requirements:**
1. Download Raw JSON button (always enabled if raw_response_path exists)
2. Download Enriched JSON button (only enabled when enrichment_status = 'enriched' or 'completed')
3. View Validation Report button (always enabled)
4. Trigger ValidationReportDialog on click
5. Handle download via API endpoints with signed URLs

**Full Implementation:**

```typescript
'use client';

/**
 * Conversation Actions Component
 * 
 * Provides action buttons for:
 * - Downloading raw minimal JSON
 * - Downloading enriched JSON (when available)
 * - Viewing validation report
 * 
 * Button states are determined by enrichment_status:
 * - Raw JSON: Always available (if raw_response_path exists)
 * - Enriched JSON: Only when enrichment_status = 'enriched' or 'completed'
 * - Validation Report: Always available
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Download, FileJson, FileText, AlertCircle, MoreVertical } from 'lucide-react';
import { ValidationReportDialog } from './validation-report-dialog';
import { useToast } from '@/components/ui/use-toast';

interface ConversationActionsProps {
  conversationId: string;
  enrichmentStatus: string;
  hasRawResponse: boolean;
  compact?: boolean; // If true, show as dropdown menu; if false, show as buttons
}

export function ConversationActions({
  conversationId,
  enrichmentStatus,
  hasRawResponse,
  compact = false,
}: ConversationActionsProps) {
  const [reportOpen, setReportOpen] = useState(false);
  const [downloading, setDownloading] = useState<'raw' | 'enriched' | null>(null);
  const { toast } = useToast();

  const isEnriched = enrichmentStatus === 'enriched' || enrichmentStatus === 'completed';

  async function handleDownloadRaw() {
    if (!hasRawResponse) {
      toast({
        title: 'Raw JSON not available',
        description: 'This conversation does not have a raw response stored.',
        variant: 'destructive',
      });
      return;
    }

    setDownloading('raw');
    
    try {
      const response = await fetch(`/api/conversations/${conversationId}/download/raw`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get download URL');
      }
      
      const data = await response.json();
      
      // Open download URL in new tab
      window.open(data.download_url, '_blank');
      
      toast({
        title: 'Download started',
        description: `Downloading ${data.filename}`,
      });
    } catch (error) {
      console.error('Error downloading raw JSON:', error);
      toast({
        title: 'Download failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setDownloading(null);
    }
  }

  async function handleDownloadEnriched() {
    if (!isEnriched) {
      toast({
        title: 'Enriched JSON not available',
        description: `Enrichment status: ${enrichmentStatus}. Enriched JSON is only available when status is 'enriched' or 'completed'.`,
        variant: 'destructive',
      });
      return;
    }

    setDownloading('enriched');
    
    try {
      const response = await fetch(`/api/conversations/${conversationId}/download/enriched`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get download URL');
      }
      
      const data = await response.json();
      
      // Open download URL in new tab
      window.open(data.download_url, '_blank');
      
      toast({
        title: 'Download started',
        description: `Downloading ${data.filename}`,
      });
    } catch (error) {
      console.error('Error downloading enriched JSON:', error);
      toast({
        title: 'Download failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setDownloading(null);
    }
  }

  if (compact) {
    // Compact dropdown menu for table rows
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={handleDownloadRaw}
              disabled={!hasRawResponse || downloading === 'raw'}
            >
              <FileJson className="w-4 h-4 mr-2" />
              Download Raw JSON
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDownloadEnriched}
              disabled={!isEnriched || downloading === 'enriched'}
            >
              <FileText className="w-4 h-4 mr-2" />
              Download Enriched JSON
              {!isEnriched && <span className="text-xs text-muted-foreground ml-2">(not ready)</span>}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setReportOpen(true)}>
              <AlertCircle className="w-4 h-4 mr-2" />
              View Validation Report
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <ValidationReportDialog
          conversationId={conversationId}
          open={reportOpen}
          onClose={() => setReportOpen(false)}
        />
      </>
    );
  }

  // Full button layout for detail views
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleDownloadRaw}
        disabled={!hasRawResponse || downloading === 'raw'}
      >
        <Download className="w-4 h-4 mr-2" />
        Raw JSON
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleDownloadEnriched}
        disabled={!isEnriched || downloading === 'enriched'}
      >
        <Download className="w-4 h-4 mr-2" />
        Enriched JSON
        {!isEnriched && (
          <span className="ml-2 text-xs text-muted-foreground">
            (Status: {enrichmentStatus})
          </span>
        )}
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={() => setReportOpen(true)}
      >
        <AlertCircle className="w-4 h-4 mr-2" />
        Validation Report
      </Button>

      <ValidationReportDialog
        conversationId={conversationId}
        open={reportOpen}
        onClose={() => setReportOpen(false)}
      />
    </div>
  );
}
```

---

### TASK 5.4: Dashboard Integration

**Update existing conversation dashboard/table component**

**Location**: Find your existing conversation table/list component (likely in `src/components/` or `src/app/`)

**Requirements:**
1. Add enrichment_status column to conversations query
2. Display enrichment status badge in table
3. Add ConversationActions component to action column
4. Ensure table refreshes after enrichment completes

**Example Integration (adapt to your existing component):**

```typescript
// Example: src/components/conversation/conversation-table.tsx or similar

import { ConversationActions } from './conversation-actions';
import { Badge } from '@/components/ui/badge';

// In your conversations query, add enrichment_status:
const { data: conversations } = useQuery({
  queryKey: ['conversations'],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        conversation_id,
        created_at,
        processing_status,
        enrichment_status,    // ADD THIS
        raw_response_path,    // ADD THIS
        quality_score,
        turn_count
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },
});

// In your table columns, add enrichment status and actions:
const columns = [
  // ... existing columns ...
  
  {
    header: 'Enrichment Status',
    cell: (conversation: any) => (
      <Badge variant={getEnrichmentVariant(conversation.enrichment_status)}>
        {formatEnrichmentStatus(conversation.enrichment_status)}
      </Badge>
    ),
  },
  
  {
    header: 'Actions',
    cell: (conversation: any) => (
      <ConversationActions
        conversationId={conversation.conversation_id}
        enrichmentStatus={conversation.enrichment_status}
        hasRawResponse={!!conversation.raw_response_path}
        compact={true}
      />
    ),
  },
];

// Helper functions
function getEnrichmentVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'completed':
    case 'enriched':
      return 'default';
    case 'validation_failed':
    case 'normalization_failed':
      return 'destructive';
    case 'enrichment_in_progress':
      return 'secondary';
    default:
      return 'outline';
  }
}

function formatEnrichmentStatus(status: string): string {
  if (!status || status === 'not_started') return 'Pending';
  return status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
```

---

### ACCEPTANCE CRITERIA

✅ **Validation Report Dialog:**
- ValidationReportDialog component displays pipeline status correctly
- Shows all 4 pipeline stages with visual indicators
- Displays validation blockers and warnings with details
- Shows enrichment errors when present
- Timeline section shows key timestamps
- Refresh button re-fetches latest status
- Responsive design with scrolling for long reports
- Error handling for API failures

✅ **Conversation Actions:**
- ConversationActions component exported and functional
- Download Raw JSON button works (opens signed URL in new tab)
- Download Enriched JSON button only enabled when status = enriched/completed
- View Validation Report button opens dialog
- Compact mode (dropdown) works for table rows
- Full mode (buttons) works for detail views
- Loading states during download operations
- Error toasts display meaningful messages

✅ **Dashboard Integration:**
- Conversations table includes enrichment_status column
- Enrichment status badge displays with correct colors
- ConversationActions integrated into table action column
- Buttons disabled appropriately based on enrichment_status
- No console errors or warnings

✅ **User Experience:**
- All buttons have clear labels and icons
- Disabled buttons show tooltips or hints why they're disabled
- Download operations don't block UI
- Validation report loads smoothly
- Error messages are user-friendly and actionable

---

### MANUAL TESTING

**Test 1: Validation Report Dialog**

1. Navigate to conversations dashboard
2. Click "View Validation Report" on any conversation
3. Verify dialog opens with loading state
4. Verify report displays with:
   - Overall status badge
   - All 4 pipeline stages with correct status
   - Validation results (if available)
   - Timeline information
5. Click Refresh button - verify report updates
6. Close dialog and reopen - verify it fetches fresh data

**Test 2: Download Raw JSON**

1. Click "Download Raw JSON" button
2. Verify signed URL opens in new tab
3. Verify JSON file downloads
4. Open file and verify it contains minimal conversation JSON
5. Verify file structure matches expected format

**Test 3: Download Enriched JSON**

1. For conversation with enrichment_status = 'not_started':
   - Verify "Download Enriched JSON" button is disabled
   - Verify button shows status hint
2. For conversation with enrichment_status = 'completed':
   - Verify button is enabled
   - Click button
   - Verify signed URL opens and file downloads
   - Open file and verify enriched structure

**Test 4: Dashboard Integration**

1. View conversations table
2. Verify enrichment status column shows correct badges
3. Verify action dropdown/buttons appear in each row
4. Test actions from table vs detail view
5. Generate new conversation and watch enrichment status update

**Test 5: Error Handling**

1. Test with invalid conversation ID → verify error message
2. Test downloading enriched JSON when not ready → verify clear error
3. Test when API is unavailable → verify graceful degradation
4. Test network timeout → verify loading states resolve

**Test 6: Visual Polish**

1. Check responsive design on mobile/tablet
2. Verify icons align correctly
3. Verify badge colors match design system
4. Verify dialog scrolls properly with long content
5. Verify no layout shift during loading

---

### DELIVERABLES

Submit:
1. ✅ New file `src/components/conversation/validation-report-dialog.tsx`
2. ✅ New file `src/components/conversation/conversation-actions.tsx`
3. ✅ Updated conversation dashboard/table component with enrichment integration
4. ✅ Updated `src/lib/types/conversations.ts` with UI types
5. ✅ Screenshots showing:
   - Validation report dialog with blockers/warnings
   - Download buttons in different states
   - Enrichment status badges in dashboard
6. ✅ Video or GIF demonstrating complete workflow:
   - Generate conversation
   - Watch enrichment pipeline progress
   - Download raw JSON
   - View validation report
   - Download enriched JSON

**Completion checklist:**
- [ ] ValidationReportDialog component displays all sections correctly
- [ ] Download buttons work and respect enrichment status
- [ ] Dashboard shows enrichment status badges
- [ ] All TypeScript types exported correctly
- [ ] No console errors or warnings
- [ ] Responsive design works on all screen sizes
- [ ] Error handling displays user-friendly messages
- [ ] Loading states prevent duplicate operations
- [ ] Downloaded files have correct structure

---

### INTEGRATION NOTES

**Where to Add Components:**

1. **If you have a conversation detail page:**
   - Add full button layout: `<ConversationActions compact={false} />`
   - Place below conversation metadata section

2. **If you have a conversations table:**
   - Add compact dropdown: `<ConversationActions compact={true} />`
   - Place in actions column

3. **If you have both:**
   - Use compact in table, full in detail page
   - Both use same component, just different `compact` prop

**Finding Your Existing Components:**

Look for files with names like:
- `conversation-table.tsx`
- `conversation-list.tsx`
- `conversations-page.tsx`
- `conversation-detail.tsx`
- `dashboard.tsx`

Search for existing conversation queries to find where to add `enrichment_status`:
```bash
grep -r "from('conversations')" src/
```

**Adding Toast Notifications:**

If your project doesn't have `useToast`, install shadcn/ui toast:
```bash
npx shadcn-ui@latest add toast
```

Or replace with your existing notification system (e.g., `react-hot-toast`, `sonner`, etc.).

---

### OPTIONAL ENHANCEMENTS (Future)

These are NOT required for completion but could be added later:

1. **Automatic Status Polling:**
   - Poll validation report while enrichment_status = 'enrichment_in_progress'
   - Auto-refresh dashboard when enrichment completes

2. **Batch Actions:**
   - Select multiple conversations
   - Download all as ZIP file
   - View combined validation report

3. **Enrichment Retry Button:**
   - Add "Retry Enrichment" button for failed conversations
   - Calls `POST /api/conversations/[id]/enrich`

4. **JSON Preview:**
   - Show JSON preview in dialog before download
   - Syntax highlighting for JSON
   - Copy to clipboard button

5. **Export History:**
   - Track download history
   - Show who downloaded what and when
   - Audit log for compliance

---

+++++++++++++++++


---

**End of E03 Execution Prompts**

**🎉 PIPELINE IMPLEMENTATION COMPLETE 🎉**

**All 5 prompts delivered:**
- ✅ Prompt 1 (E01): Database schema + Validation service
- ✅ Prompt 2 (E01): Enrichment service
- ✅ Prompt 3 (E02): Normalization service + API endpoints
- ✅ Prompt 4 (E02): Pipeline orchestration
- ✅ Prompt 5 (E03): UI components

**Next Steps:**
1. Execute prompts in sequence (1 → 2 → 3 → 4 → 5)
2. Test each prompt's deliverables before moving to next
3. Run integration tests after all prompts complete
4. Deploy to production once testing passes

**Success Metrics to Verify:**
- Enrichment success rate > 95%
- Pipeline duration < 5 seconds
- All UI components functional
- No console errors
- User can download both raw and enriched JSON
- Validation reports display correctly