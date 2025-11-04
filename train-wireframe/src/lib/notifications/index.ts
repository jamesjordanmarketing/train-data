/**
 * Notification System Exports
 * 
 * Centralized notification infrastructure for the Training Data Generation platform.
 * 
 * @example
 * ```typescript
 * import { notificationManager, showSuccess, showError } from '@/lib/notifications';
 * 
 * // Show success
 * showSuccess('Operation completed!');
 * 
 * // Show error with retry
 * notificationManager.showError(error, {
 *   onRetry: () => retryOperation(),
 * });
 * ```
 */

export {
  notificationManager,
  showSuccess,
  showError,
  showWarning,
  showInfo,
  type NotificationOptions,
  type NotificationType,
} from './manager';

