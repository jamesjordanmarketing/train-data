/**
 * Generation Error Toast Component
 * 
 * Displays a toast notification for AI generation errors with:
 * - Generation-specific icon (lightning bolt)
 * - Error code display for troubleshooting
 * - "View Details" link for technical information
 * - Warning color scheme (orange/yellow)
 * 
 * Used for LLM generation failures, token limits, content policy violations, etc.
 * 
 * @example
 * ```typescript
 * import { GenerationErrorToast } from '@/components/notifications/GenerationErrorToast';
 * import { notificationManager } from '@/lib/notifications';
 * 
 * notificationManager.custom(
 *   <GenerationErrorToast
 *     message="Failed to generate conversation"
 *     errorCode="ERR_GEN_TOKEN_LIMIT"
 *     onViewDetails={() => openErrorModal()}
 *   />
 * );
 * ```
 */

'use client';

import React from 'react';
import { Zap, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GenerationErrorToastProps {
  /** User-friendly error message */
  message: string;
  /** Optional error code for troubleshooting */
  errorCode?: string;
  /** Callback to open error details modal */
  onViewDetails?: () => void;
}

/**
 * GenerationErrorToast component for AI generation failures.
 * Includes error code and link to view detailed error information.
 */
export function GenerationErrorToast({
  message,
  errorCode,
  onViewDetails,
}: GenerationErrorToastProps) {
  return (
    <div
      className="flex items-start gap-3 p-3"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="p-2 rounded-full bg-warning/10">
        <Zap className="h-5 w-5 text-warning" aria-hidden="true" />
      </div>
      <div className="flex-1">
        <div className="font-semibold text-sm">Generation Failed</div>
        <div className="text-sm text-muted-foreground mt-1">{message}</div>
        {errorCode && (
          <div className="mt-1 text-xs font-mono text-muted-foreground">
            Error Code: {errorCode}
          </div>
        )}
        {onViewDetails && (
          <Button
            size="sm"
            variant="link"
            onClick={onViewDetails}
            className="mt-1 h-auto p-0 text-xs"
            aria-label="View detailed error information"
          >
            View Details
            <ExternalLink className="h-3 w-3 ml-1" aria-hidden="true" />
          </Button>
        )}
      </div>
    </div>
  );
}

