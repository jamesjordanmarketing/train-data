/**
 * Validation Error Toast Component
 * 
 * Displays a toast notification for validation errors with:
 * - List of field-specific validation errors
 * - Appropriate icon and color scheme
 * - Expandable error details
 * - User-friendly messaging
 * 
 * Used for form validation failures and input errors.
 * 
 * @example
 * ```typescript
 * import { ValidationErrorToast } from '@/components/notifications/ValidationErrorToast';
 * import { notificationManager } from '@/lib/notifications';
 * 
 * notificationManager.custom(
 *   <ValidationErrorToast
 *     message="Please correct the following errors"
 *     errors={{
 *       email: "Email is required",
 *       password: "Password must be at least 8 characters"
 *     }}
 *   />
 * );
 * ```
 */

'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ValidationErrorToastProps {
  /** Main error message */
  message: string;
  /** Field-specific validation errors */
  errors?: Record<string, string>;
}

/**
 * ValidationErrorToast component with field-level error details.
 * Displays validation errors in a clear, scannable format.
 */
export function ValidationErrorToast({ message, errors }: ValidationErrorToastProps) {
  return (
    <div
      className="flex items-start gap-3 p-3"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="p-2 rounded-full bg-destructive/10">
        <AlertCircle className="h-5 w-5 text-destructive" aria-hidden="true" />
      </div>
      <div className="flex-1">
        <div className="font-semibold text-sm">Validation Error</div>
        <div className="text-sm text-muted-foreground mt-1">{message}</div>
        {errors && Object.keys(errors).length > 0 && (
          <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
            {Object.entries(errors).map(([field, error]) => (
              <li key={field} className="flex items-start gap-1">
                <span className="font-medium">{field}:</span>
                <span>{error}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

