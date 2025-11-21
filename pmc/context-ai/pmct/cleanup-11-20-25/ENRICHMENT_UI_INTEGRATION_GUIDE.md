# Enrichment UI Components - Integration Guide

Quick reference for integrating the enrichment UI components into your application.

---

## 📦 Components Overview

### 1. ValidationReportDialog
Displays comprehensive enrichment pipeline status and validation results.

### 2. ConversationActions  
Provides download buttons and validation report access with state-aware behavior.

### 3. Dashboard Integration
Enhanced ConversationTable with enrichment status column.

---

## 🚀 Quick Start

### Import Components

```typescript
// Import individual components
import { ValidationReportDialog } from '@/components/conversations/validation-report-dialog';
import { ConversationActions } from '@/components/conversations/conversation-actions';

// Or import from index
import { 
  ValidationReportDialog, 
  ConversationActions 
} from '@/components/conversations';
```

---

## 📘 Component API Reference

### ValidationReportDialog

**Props**:
```typescript
interface ValidationReportDialogProps {
  conversationId: string;  // Conversation ID to fetch report for
  open: boolean;           // Dialog open state
  onClose: () => void;     // Close handler
}
```

**Usage Example**:
```typescript
'use client';

import { useState } from 'react';
import { ValidationReportDialog } from '@/components/conversations';
import { Button } from '@/components/ui/button';

export function MyComponent() {
  const [reportOpen, setReportOpen] = useState(false);
  const conversationId = 'conv-123';

  return (
    <>
      <Button onClick={() => setReportOpen(true)}>
        View Pipeline Status
      </Button>

      <ValidationReportDialog
        conversationId={conversationId}
        open={reportOpen}
        onClose={() => setReportOpen(false)}
      />
    </>
  );
}
```

**Features**:
- Auto-fetches validation report when opened
- Shows loading state while fetching
- Error handling with retry button
- Refresh button to reload latest status
- Displays:
  - Overall enrichment status
  - 4 pipeline stages with icons
  - Validation blockers and warnings
  - Enrichment errors (if any)
  - Timeline with timestamps

**API Dependency**:
- Requires: `GET /api/conversations/[id]/validation-report`
- Returns: `ValidationReportResponse`

---

### ConversationActions

**Props**:
```typescript
interface ConversationActionsProps {
  conversationId: string;      // Conversation ID
  enrichmentStatus: string;    // Current enrichment status
  hasRawResponse: boolean;     // Whether raw_response_path exists
  compact?: boolean;           // Display mode (true = dropdown, false = buttons)
}
```

**Usage Example - Compact Mode (for tables)**:
```typescript
'use client';

import { ConversationActions } from '@/components/conversations';

export function ConversationTableRow({ conversation }) {
  return (
    <tr>
      {/* ... other cells ... */}
      <td>
        <ConversationActions
          conversationId={conversation.conversation_id}
          enrichmentStatus={conversation.enrichment_status}
          hasRawResponse={!!conversation.raw_response_path}
          compact={true}  // Shows as dropdown menu
        />
      </td>
    </tr>
  );
}
```

**Usage Example - Full Mode (for detail pages)**:
```typescript
'use client';

import { ConversationActions } from '@/components/conversations';

export function ConversationDetailPage({ conversation }) {
  return (
    <div>
      <h1>{conversation.conversation_name}</h1>
      
      {/* Shows as button group */}
      <ConversationActions
        conversationId={conversation.conversation_id}
        enrichmentStatus={conversation.enrichment_status}
        hasRawResponse={!!conversation.raw_response_path}
        compact={false}  // Shows as separate buttons
      />
    </div>
  );
}
```

**Features**:
- **Download Raw JSON**: Always available if `raw_response_path` exists
- **Download Enriched JSON**: Only enabled when `enrichment_status = 'enriched' | 'completed'`
- **View Validation Report**: Always available
- State-aware button enabling/disabling
- Loading states during downloads
- Toast notifications for success/error
- Two display modes: compact (dropdown) and full (buttons)

**API Dependencies**:
- `GET /api/conversations/[id]/download/raw` - Returns signed URL
- `GET /api/conversations/[id]/download/enriched` - Returns signed URL
- `GET /api/conversations/[id]/validation-report` - For validation dialog

---

## 🎨 Styling & Theming

### Enrichment Status Colors

The components use these color schemes (defined in `ConversationTable.tsx`):

```typescript
const enrichmentStatusColors = {
  not_started: 'bg-gray-100 text-gray-700',
  validation_failed: 'bg-red-100 text-red-700',
  validated: 'bg-blue-100 text-blue-700',
  enrichment_in_progress: 'bg-yellow-100 text-yellow-700',
  enriched: 'bg-green-100 text-green-700',
  normalization_failed: 'bg-orange-100 text-orange-700',
  completed: 'bg-green-100 text-green-700',
};
```

### Customizing Badge Variants

```typescript
function getEnrichmentVariant(status: string): BadgeVariant {
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
```

---

## 🔌 Integration Examples

### Example 1: Add to Existing Conversation Detail Page

```typescript
'use client';

import { useState } from 'react';
import { ConversationActions, ValidationReportDialog } from '@/components/conversations';
import { Badge } from '@/components/ui/badge';

export function ConversationDetail({ conversation }) {
  return (
    <div className="space-y-6">
      {/* Conversation Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          {conversation.conversation_name}
        </h1>
        <Badge variant={getEnrichmentVariant(conversation.enrichment_status)}>
          {formatEnrichmentStatus(conversation.enrichment_status)}
        </Badge>
      </div>

      {/* Action Buttons */}
      <div className="border-t pt-6">
        <h2 className="text-lg font-semibold mb-3">Downloads & Reports</h2>
        <ConversationActions
          conversationId={conversation.conversation_id}
          enrichmentStatus={conversation.enrichment_status}
          hasRawResponse={!!conversation.raw_response_path}
          compact={false}
        />
      </div>

      {/* Rest of your detail view */}
      <div>
        {/* Conversation content */}
      </div>
    </div>
  );
}
```

---

### Example 2: Add Enrichment Status Card to Dashboard

```typescript
'use client';

import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function EnrichmentStatusCard() {
  const { data } = useQuery({
    queryKey: ['enrichment-stats'],
    queryFn: async () => {
      const res = await fetch('/api/conversations?enrichment_status=enrichment_in_progress');
      return res.json();
    }
  });

  const inProgressCount = data?.conversations?.length || 0;

  return (
    <Card className="p-4">
      <h3 className="text-sm font-medium text-muted-foreground">
        Enrichment Pipeline
      </h3>
      <p className="text-2xl font-bold mt-2">{inProgressCount}</p>
      <Badge variant="secondary" className="mt-2">
        In Progress
      </Badge>
    </Card>
  );
}
```

---

### Example 3: Bulk Enrichment Actions

```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function BulkEnrichmentActions({ selectedConversations }) {
  const [loading, setLoading] = useState(false);

  async function handleBulkDownload() {
    setLoading(true);
    try {
      // Download all enriched conversations
      for (const conv of selectedConversations) {
        if (conv.enrichment_status === 'completed') {
          const res = await fetch(`/api/conversations/${conv.conversation_id}/download/enriched`);
          const data = await res.json();
          window.open(data.download_url, '_blank');
          await new Promise(resolve => setTimeout(resolve, 100)); // Rate limit
        }
      }
      toast.success(`Downloaded ${selectedConversations.length} conversations`);
    } catch (error) {
      toast.error('Bulk download failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button onClick={handleBulkDownload} disabled={loading}>
      Download All Enriched ({selectedConversations.length})
    </Button>
  );
}
```

---

### Example 4: Enrichment Status Filter

```typescript
'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function EnrichmentStatusFilter({ value, onChange }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Filter by enrichment" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Statuses</SelectItem>
        <SelectItem value="not_started">Not Started</SelectItem>
        <SelectItem value="validated">Validated</SelectItem>
        <SelectItem value="enrichment_in_progress">In Progress</SelectItem>
        <SelectItem value="enriched">Enriched</SelectItem>
        <SelectItem value="completed">Completed</SelectItem>
        <SelectItem value="validation_failed">Failed</SelectItem>
      </SelectContent>
    </Select>
  );
}
```

---

## 🔧 Utility Functions

### Format Enrichment Status

```typescript
export function formatEnrichmentStatus(status: string): string {
  if (!status || status === 'not_started') return 'Pending';
  return status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Usage:
// formatEnrichmentStatus('enrichment_in_progress') => "Enrichment In Progress"
```

### Get Enrichment Status Variant

```typescript
export function getEnrichmentVariant(
  status: string
): 'default' | 'secondary' | 'destructive' | 'outline' {
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
```

### Check if Enriched

```typescript
export function isEnriched(status: string): boolean {
  return status === 'enriched' || status === 'completed';
}

// Usage:
const canDownloadEnriched = isEnriched(conversation.enrichment_status);
```

---

## 🎯 Common Integration Patterns

### Pattern 1: Progress Indicator

Show enrichment progress in a conversation card:

```typescript
export function ConversationCard({ conversation }) {
  const progressSteps = ['not_started', 'validated', 'enriched', 'completed'];
  const currentStep = progressSteps.indexOf(conversation.enrichment_status);
  const progress = (currentStep / (progressSteps.length - 1)) * 100;

  return (
    <Card>
      <h3>{conversation.conversation_name}</h3>
      <div className="mt-2">
        <div className="flex justify-between text-xs mb-1">
          <span>Enrichment Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </Card>
  );
}
```

---

### Pattern 2: Auto-refresh Validation Report

Automatically refresh report while enrichment is in progress:

```typescript
export function EnrichmentMonitor({ conversationId }) {
  const [reportOpen, setReportOpen] = useState(false);
  const { data: report } = useQuery({
    queryKey: ['validation-report', conversationId],
    queryFn: async () => {
      const res = await fetch(`/api/conversations/${conversationId}/validation-report`);
      return res.json();
    },
    refetchInterval: report?.enrichment_status === 'enrichment_in_progress' ? 5000 : false,
  });

  return (
    <div>
      <Badge variant={getEnrichmentVariant(report?.enrichment_status)}>
        {formatEnrichmentStatus(report?.enrichment_status)}
      </Badge>
      <Button onClick={() => setReportOpen(true)}>View Details</Button>
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

### Pattern 3: Enrichment Queue Management

Display enrichment queue with actions:

```typescript
export function EnrichmentQueue() {
  const { data: queuedConversations } = useQuery({
    queryKey: ['enrichment-queue'],
    queryFn: async () => {
      const res = await fetch('/api/conversations?enrichment_status=not_started,validation_failed');
      return res.json();
    }
  });

  return (
    <div className="space-y-2">
      <h2 className="text-xl font-bold">Enrichment Queue</h2>
      {queuedConversations?.conversations.map(conv => (
        <div key={conv.id} className="flex items-center justify-between p-3 border rounded">
          <div>
            <h3 className="font-medium">{conv.conversation_name}</h3>
            <Badge variant="outline">{formatEnrichmentStatus(conv.enrichment_status)}</Badge>
          </div>
          <ConversationActions
            conversationId={conv.conversation_id}
            enrichmentStatus={conv.enrichment_status}
            hasRawResponse={!!conv.raw_response_path}
            compact={true}
          />
        </div>
      ))}
    </div>
  );
}
```

---

## 🚨 Error Handling

### Handle Download Errors

```typescript
async function handleDownloadWithErrorHandling(conversationId: string, type: 'raw' | 'enriched') {
  try {
    const endpoint = `/api/conversations/${conversationId}/download/${type}`;
    const response = await fetch(endpoint);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Download failed');
    }
    
    const data = await response.json();
    window.open(data.download_url, '_blank');
    toast.success(`Downloading ${data.filename}`);
  } catch (error) {
    console.error('Download error:', error);
    toast.error('Download failed', {
      description: error.message,
      action: {
        label: 'Retry',
        onClick: () => handleDownloadWithErrorHandling(conversationId, type)
      }
    });
  }
}
```

---

## 📊 Type Definitions

All types are available from:

```typescript
import type {
  ValidationReportResponse,
  PipelineStages,
  PipelineStage,
  DownloadUrlResponse,
  ValidationResult,
  ValidationIssue,
  StorageConversation
} from '@/lib/types/conversations';
```

---

## 🔗 API Endpoints Reference

### GET /api/conversations/[id]/validation-report

**Response**:
```typescript
{
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
```

---

### GET /api/conversations/[id]/download/raw

**Response**:
```typescript
{
  conversation_id: string;
  download_url: string;        // Signed URL (expires in 1 hour)
  filename: string;
  file_size: number | null;
  expires_at: string;          // ISO timestamp
  expires_in_seconds: number;  // 3600
}
```

---

### GET /api/conversations/[id]/download/enriched

**Response**: Same as `/download/raw` but for enriched JSON

---

## 🎓 Best Practices

1. **Always Check Enrichment Status**: Before enabling download buttons, verify `enrichment_status`
2. **Handle Expired URLs**: Signed URLs expire after 1 hour - regenerate on-demand
3. **Show Loading States**: Provide feedback during async operations
4. **Use Toast Notifications**: Inform users of success/failure
5. **Validate Conversation ID**: Check that ID exists before showing actions
6. **Responsive Design**: Test on mobile/tablet/desktop
7. **Error Recovery**: Provide retry buttons for failed operations
8. **Accessibility**: Ensure buttons have proper aria-labels

---

## 📚 Additional Resources

- **Implementation Summary**: `PROMPT5_FILE3_V2_IMPLEMENTATION_SUMMARY.md`
- **Testing Guide**: `ENRICHMENT_UI_TESTING_GUIDE.md`
- **Type Definitions**: `src/lib/types/conversations.ts`
- **shadcn/ui Docs**: [https://ui.shadcn.com](https://ui.shadcn.com)
- **Sonner Docs**: [https://sonner.emilkowal.ski](https://sonner.emilkowal.ski)

---

**Happy Coding! 🚀**

