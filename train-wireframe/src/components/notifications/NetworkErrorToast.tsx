/**
 * Network Error Toast Component
 * 
 * Displays a toast notification for network-related errors with:
 * - Network-specific icon (wifi off)
 * - Clear error messaging
 * - Retry button for recoverable errors
 * - Appropriate color scheme (red/destructive)
 * 
 * Used for connection failures, timeouts, and network issues.
 * 
 * @example
 * ```typescript
 * import { NetworkErrorToast } from '@/components/notifications/NetworkErrorToast';
 * import { notificationManager } from '@/lib/notifications';
 * 
 * notificationManager.custom(
 *   <NetworkErrorToast
 *     message="Failed to connect to server"
 *     onRetry={() => retryConnection()}
 *   />
 * );
 * ```
 */

'use client';

import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NetworkErrorToastProps {
  /** User-friendly error message */
  message: string;
  /** Optional callback when retry button is clicked */
  onRetry?: () => void;
}

/**
 * NetworkErrorToast component with retry functionality.
 * Displays network errors with appropriate styling and retry option.
 */
export function NetworkErrorToast({ message, onRetry }: NetworkErrorToastProps) {
  return (
    <div
      className="flex items-start gap-3 p-3"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="p-2 rounded-full bg-destructive/10">
        <WifiOff className="h-5 w-5 text-destructive" aria-hidden="true" />
      </div>
      <div className="flex-1">
        <div className="font-semibold text-sm">Network Error</div>
        <div className="text-sm text-muted-foreground mt-1">{message}</div>
        {onRetry && (
          <Button
            size="sm"
            variant="outline"
            onClick={onRetry}
            className="mt-2 h-7 text-xs"
            aria-label="Retry request"
          >
            <RefreshCw className="h-3 w-3 mr-1" aria-hidden="true" />
            Retry
          </Button>
        )}
      </div>
    </div>
  );
}

