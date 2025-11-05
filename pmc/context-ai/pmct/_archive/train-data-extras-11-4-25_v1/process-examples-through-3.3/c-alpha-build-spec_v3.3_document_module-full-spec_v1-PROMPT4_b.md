# PROMPT 4B: Visual Status Components (Part 2 of 4)
**Module:** Document Upload & Processing  
**Phase:** Real-Time Updates & Queue Interface  
**Estimated Time:** 1-1.5 hours (Steps 3-4)  
**Prerequisites:** PROMPT4_a.md completed (API & Hook ready)

---

## 📌 CONTEXT: This is Part 2 of 4

This prompt file contains steps 3-4 of Prompt 4:
- **STEP 3:** Document Status Badge Component
- **STEP 4:** Upload Statistics Component

**Prerequisite:** You must have completed **PROMPT4_a.md** first (Status API & Hook).

After completing this part, proceed to **PROMPT4_c.md** for Steps 5-6.

---

## CONTEXT REMINDER

### What's Already Built
✅ **PROMPT4_a:** Status Polling API Endpoint, Status Polling React Hook

### Your Task in Prompt 4B (Steps 3-4)
3. ✅ Create Document Status Badge Component (visual status indicators)
4. ✅ Create Upload Statistics Component (aggregate metrics)

### Success Criteria for Part 4B
- Status badges show appropriate colors and icons
- Statistics cards display accurate counts
- Components auto-refresh with real-time data

---



====================



## STEP 3: Create Document Status Badge Component

**DIRECTIVE:** You shall create a reusable visual component that displays document status with appropriate colors, icons, and progress indicators.

**Instructions:**
1. Create file: `src/components/upload/document-status-badge.tsx`
2. Copy the complete code below
3. Save and verify no TypeScript errors

**File:** `src/components/upload/document-status-badge.tsx`

```typescript
'use client';

import React from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Loader2, 
  AlertCircle,
  FileText 
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';

export type DocumentStatusType = 
  | 'uploaded' 
  | 'processing' 
  | 'completed' 
  | 'error' 
  | 'pending' 
  | 'categorizing';

interface DocumentStatusBadgeProps {
  /** Current document status */
  status: DocumentStatusType;
  /** Processing progress (0-100), shown for 'processing' status */
  progress?: number;
  /** Whether to show progress percentage inline */
  showProgress?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Custom className */
  className?: string;
}

/**
 * DocumentStatusBadge Component
 * 
 * Visual status indicator with icon, color, and optional progress
 * 
 * Status Colors:
 * - uploaded: Gray (queued)
 * - processing: Blue (in progress)
 * - completed: Green (success)
 * - error: Red (failed)
 * - pending: Gray (waiting)
 * - categorizing: Purple (workflow active)
 */
export function DocumentStatusBadge({ 
  status, 
  progress = 0,
  showProgress = false,
  size = 'md',
  className 
}: DocumentStatusBadgeProps) {
  // Get status configuration
  const config = getStatusConfig(status, progress);

  // Size classes
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const Icon = config.icon;

  return (
    <Badge 
      variant={config.variant}
      className={cn(
        'inline-flex items-center gap-1.5 font-medium',
        sizeClasses[size],
        config.className,
        className
      )}
    >
      <Icon 
        className={cn(
          iconSizeClasses[size],
          config.animated && 'animate-spin'
        )} 
      />
      <span>{config.label}</span>
      {showProgress && status === 'processing' && (
        <span className="font-normal opacity-90">
          {progress}%
        </span>
      )}
    </Badge>
  );
}

/**
 * Get status configuration (icon, color, label)
 */
function getStatusConfig(status: DocumentStatusType, progress: number) {
  switch (status) {
    case 'uploaded':
      return {
        icon: Clock,
        label: 'Queued',
        variant: 'secondary' as const,
        className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
        animated: false
      };

    case 'processing':
      return {
        icon: Loader2,
        label: progress > 0 ? `Processing` : 'Processing',
        variant: 'default' as const,
        className: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
        animated: true
      };

    case 'completed':
      return {
        icon: CheckCircle,
        label: 'Completed',
        variant: 'default' as const,
        className: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
        animated: false
      };

    case 'error':
      return {
        icon: XCircle,
        label: 'Error',
        variant: 'destructive' as const,
        className: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
        animated: false
      };

    case 'pending':
      return {
        icon: FileText,
        label: 'Pending',
        variant: 'secondary' as const,
        className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
        animated: false
      };

    case 'categorizing':
      return {
        icon: Loader2,
        label: 'Categorizing',
        variant: 'default' as const,
        className: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
        animated: true
      };

    default:
      return {
        icon: AlertCircle,
        label: 'Unknown',
        variant: 'secondary' as const,
        className: '',
        animated: false
      };
  }
}

/**
 * Get status display text (for use outside badge)
 */
export function getStatusText(status: DocumentStatusType): string {
  const config = getStatusConfig(status, 0);
  return config.label;
}

/**
 * Check if status is terminal (won't change without user action)
 */
export function isTerminalStatus(status: DocumentStatusType): boolean {
  return status === 'completed' || status === 'error';
}

/**
 * Check if status is active (currently being processed)
 */
export function isActiveStatus(status: DocumentStatusType): boolean {
  return status === 'processing' || status === 'categorizing';
}
```

**Explanation:**
- **Visual Feedback:** Color-coded badges with icons
- **Animated Icons:** Spinner for 'processing' and 'categorizing' states
- **Progress Display:** Optional progress percentage for processing status
- **Size Variants:** Small, medium, large sizes
- **Utility Functions:** Helper functions for status checking
- **Dark Mode:** Supports dark mode with appropriate colors

**Verification:**
1. Component compiles with no TypeScript errors
2. Can be imported: `import { DocumentStatusBadge } from '@/components/upload/document-status-badge';`



++++++++++++++++++++++++



## STEP 4: Create Upload Statistics Component

**DIRECTIVE:** You shall create a dashboard component that displays aggregate statistics about uploaded documents using stat cards.

**Instructions:**
1. Create file: `src/components/upload/upload-stats.tsx`
2. Copy the complete code below
3. Save and verify no TypeScript errors

**File:** `src/components/upload/upload-stats.tsx`

```typescript
'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { 
  FileText, 
  Clock, 
  Loader2, 
  CheckCircle, 
  XCircle 
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Skeleton } from '../ui/skeleton';
import { cn } from '../../lib/utils';

interface UploadStatsData {
  total: number;
  queued: number;
  processing: number;
  completed: number;
  errors: number;
}

interface UploadStatsProps {
  /** Auto-refresh interval in ms (default: 5000, set to 0 to disable) */
  refreshInterval?: number;
  /** Custom className */
  className?: string;
}

/**
 * UploadStats Component
 * 
 * Displays aggregate statistics about uploaded documents
 * Features:
 * - Total files count
 * - Queued (uploaded) count
 * - Processing count
 * - Completed count
 * - Error count
 * - Auto-refresh every 5 seconds
 */
export function UploadStats({ 
  refreshInterval = 5000,
  className 
}: UploadStatsProps) {
  const [stats, setStats] = useState<UploadStatsData>({
    total: 0,
    queued: 0,
    processing: 0,
    completed: 0,
    errors: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch statistics from database
   */
  const fetchStats = async () => {
    try {
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Not authenticated');
        setIsLoading(false);
        return;
      }

      // Get all user's documents
      const { data: documents, error: queryError } = await supabase
        .from('documents')
        .select('status')
        .eq('author_id', session.user.id);

      if (queryError) {
        throw new Error(queryError.message);
      }

      if (!documents) {
        setStats({ total: 0, queued: 0, processing: 0, completed: 0, errors: 0 });
        return;
      }

      // Calculate statistics
      const statsData: UploadStatsData = {
        total: documents.length,
        queued: documents.filter(d => d.status === 'uploaded').length,
        processing: documents.filter(d => d.status === 'processing').length,
        completed: documents.filter(d => d.status === 'completed').length,
        errors: documents.filter(d => d.status === 'error').length
      };

      setStats(statsData);
      setError(null);

    } catch (err) {
      console.error('[UploadStats] Error fetching stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to load statistics');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchStats();
  }, []);

  // Auto-refresh
  useEffect(() => {
    if (refreshInterval <= 0) return;

    const interval = setInterval(fetchStats, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  // Error state
  if (error && !isLoading) {
    return (
      <div className={cn('text-sm text-red-600 dark:text-red-400', className)}>
        Failed to load statistics: {error}
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className={cn('grid grid-cols-2 md:grid-cols-5 gap-4', className)}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-8 w-12 mb-1" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Stat cards configuration
  const statCards = [
    {
      label: 'Total Files',
      value: stats.total,
      icon: FileText,
      color: 'text-gray-600 dark:text-gray-400',
      bgColor: 'bg-gray-100 dark:bg-gray-800'
    },
    {
      label: 'Queued',
      value: stats.queued,
      icon: Clock,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/20'
    },
    {
      label: 'Processing',
      value: stats.processing,
      icon: Loader2,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      animated: true
    },
    {
      label: 'Completed',
      value: stats.completed,
      icon: CheckCircle,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20'
    },
    {
      label: 'Errors',
      value: stats.errors,
      icon: XCircle,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/20'
    }
  ];

  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-5 gap-4', className)}>
      {statCards.map((stat) => {
        const Icon = stat.icon;
        
        return (
          <Card key={stat.label} className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold tracking-tight">
                    {stat.value}
                  </p>
                </div>
                <div className={cn(
                  'p-2 rounded-lg',
                  stat.bgColor
                )}>
                  <Icon 
                    className={cn(
                      'w-5 h-5',
                      stat.color,
                      stat.animated && 'animate-spin'
                    )} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
```

**Explanation:**
- **5 Stat Cards:** Total, Queued, Processing, Completed, Errors
- **Auto-Refresh:** Updates every 5 seconds by default
- **Responsive:** 2 columns on mobile, 5 on desktop
- **Visual Icons:** Color-coded icons for each metric
- **Loading State:** Skeleton placeholders during load
- **Error Handling:** Displays error message if query fails

**Verification:**
1. Component compiles with no TypeScript errors
2. Skeleton component exists at `src/components/ui/skeleton.tsx` (created in Prompt 2)



++++++++++++++++++++++++



## PROMPT 4B COMPLETION CHECKLIST

Before proceeding to Prompt 4C, verify:

### Components Created (Part B)
- [ ] Document Status Badge: `src/components/upload/document-status-badge.tsx`
- [ ] Upload Statistics: `src/components/upload/upload-stats.tsx`

### Build Verification
- [ ] Run `npm run build` - no TypeScript errors
- [ ] All imports resolve correctly
- [ ] Badge component can be imported
- [ ] Stats component can be imported

### Visual Testing (Optional Preview)
- [ ] Status badges display with correct colors
- [ ] Animated spinner shows for processing status
- [ ] Statistics cards show accurate counts
- [ ] Responsive layout works on mobile

---

## ➡️ NEXT: Proceed to PROMPT4_c.md

After completing and verifying the above checklist, continue with:
- **PROMPT4_c.md** - Steps 5-6 (Upload Filters & Queue Components)

This will build the comprehensive queue management interface using the components you just created.

---

**END OF PROMPT 4B**
