/**
 * Rate Limit Toast Component
 * 
 * Displays a toast notification for rate limit errors with:
 * - Countdown timer showing seconds until retry is available
 * - Visual feedback with animated clock icon
 * - Retry button that appears when countdown completes
 * - User-friendly messaging explaining the rate limit
 * 
 * Used when API rate limits are exceeded (429 errors).
 * 
 * @example
 * ```typescript
 * import { RateLimitToast } from '@/components/notifications/RateLimitToast';
 * import { notificationManager } from '@/lib/notifications';
 * 
 * notificationManager.custom(
 *   <RateLimitToast
 *     retryAfterSeconds={30}
 *     onRetry={() => retryRequest()}
 *   />
 * );
 * ```
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Clock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RateLimitToastProps {
  /** Number of seconds to wait before retry is available */
  retryAfterSeconds: number;
  /** Callback when retry button is clicked */
  onRetry?: () => void;
}

/**
 * RateLimitToast component with countdown timer.
 * Shows "Retry Now" button when countdown reaches zero.
 */
export function RateLimitToast({ retryAfterSeconds, onRetry }: RateLimitToastProps) {
  const [secondsRemaining, setSecondsRemaining] = useState(retryAfterSeconds);

  useEffect(() => {
    if (secondsRemaining <= 0) return;

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [secondsRemaining]);

  /**
   * Format seconds into human-readable time string.
   * Examples: "30s", "1m 30s"
   */
  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div
      className="flex items-start gap-3 p-3"
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="p-2 rounded-full bg-warning/10">
        <Clock className="h-5 w-5 text-warning" aria-hidden="true" />
      </div>
      <div className="flex-1">
        <div className="font-semibold text-sm">Rate Limit Exceeded</div>
        <div className="text-sm text-muted-foreground mt-1">
          Too many requests. Please wait before trying again.
        </div>
        {secondsRemaining > 0 ? (
          <div
            className="flex items-center gap-2 mt-2 text-xs text-muted-foreground"
            aria-live="polite"
          >
            <Clock className="h-3 w-3 animate-pulse" aria-hidden="true" />
            <span>Retry available in {formatTime(secondsRemaining)}</span>
          </div>
        ) : (
          onRetry && (
            <Button
              size="sm"
              variant="outline"
              onClick={onRetry}
              className="mt-2 h-7 text-xs"
              aria-label="Retry now"
            >
              Retry Now
            </Button>
          )
        )}
      </div>
    </div>
  );
}

