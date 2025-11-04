/**
 * Notification Manager
 * 
 * Centralized notification system for the Training Data Generation platform.
 * Provides toast management with:
 * - Deduplication to prevent spam
 * - Error-specific handling and styling
 * - Action button support (Retry, View Details)
 * - Automatic duration based on error severity
 * - Integration with Sonner toast library
 * 
 * @module notification-manager
 */

import { toast as sonnerToast } from 'sonner';
import {
  AppError,
  categorizeError,
  getUserMessage,
  isRetryable,
} from '../errors';
import { errorLogger } from '../errors/error-logger';

/**
 * Notification options for customizing toast behavior.
 */
export interface NotificationOptions {
  /** Duration in milliseconds. 0 for persistent. */
  duration?: number;
  /** Action button configuration */
  action?: {
    label: string;
    onClick: () => void;
  };
  /** Additional description text */
  description?: string;
  /** Mark as important (affects styling/persistence) */
  important?: boolean;
}

/**
 * Notification types matching Sonner's toast types.
 */
export type NotificationType = 'success' | 'error' | 'warning' | 'info';

/**
 * Toast cache entry for deduplication.
 */
interface ToastCacheEntry {
  message: string;
  timestamp: number;
}

/**
 * Centralized notification manager.
 * Manages toast display with deduplication and error-specific handling.
 * 
 * Implements singleton pattern to ensure consistent state across the application.
 * 
 * @example
 * ```typescript
 * import { notificationManager } from '@/lib/notifications/manager';
 * 
 * // Show success
 * notificationManager.success('Operation completed!');
 * 
 * // Show error with retry
 * notificationManager.showError(error, {
 *   onRetry: () => retryOperation(),
 * });
 * ```
 */
class NotificationManager {
  private static instance: NotificationManager;
  private toastCache: Map<string, ToastCacheEntry> = new Map();
  private readonly deduplicationWindow = 5000; // 5 seconds

  /**
   * Private constructor for singleton pattern.
   */
  private constructor() {
    // Singleton pattern - prevent external instantiation
  }

  /**
   * Get singleton instance.
   */
  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  /**
   * Check if a toast with this message was recently shown.
   * Prevents duplicate toasts from appearing within the deduplication window.
   */
  private isDuplicate(message: string): boolean {
    const cached = this.toastCache.get(message);
    if (!cached) return false;

    const now = Date.now();
    if (now - cached.timestamp > this.deduplicationWindow) {
      this.toastCache.delete(message);
      return false;
    }

    return true;
  }

  /**
   * Add message to deduplication cache.
   * Automatically cleans up after the deduplication window expires.
   */
  private cacheMessage(message: string): void {
    this.toastCache.set(message, {
      message,
      timestamp: Date.now(),
    });

    // Auto-cleanup after window expires
    setTimeout(() => {
      this.toastCache.delete(message);
    }, this.deduplicationWindow);
  }

  /**
   * Show success toast.
   * Auto-dismisses after 4 seconds by default.
   * 
   * @example
   * ```typescript
   * notificationManager.success('Conversation generated successfully!');
   * ```
   */
  success(message: string, options: NotificationOptions = {}): void {
    if (this.isDuplicate(message)) {
      errorLogger.debug('Duplicate success toast suppressed', { message });
      return;
    }

    sonnerToast.success(message, {
      duration: options.duration !== undefined ? options.duration : 4000,
      description: options.description,
      action: options.action,
    });

    this.cacheMessage(message);
  }

  /**
   * Show info toast.
   * Auto-dismisses after 4 seconds by default.
   * 
   * @example
   * ```typescript
   * notificationManager.info('Processing your request...');
   * ```
   */
  info(message: string, options: NotificationOptions = {}): void {
    if (this.isDuplicate(message)) {
      errorLogger.debug('Duplicate info toast suppressed', { message });
      return;
    }

    sonnerToast.info(message, {
      duration: options.duration !== undefined ? options.duration : 4000,
      description: options.description,
      action: options.action,
    });

    this.cacheMessage(message);
  }

  /**
   * Show warning toast.
   * Auto-dismisses after 5 seconds by default.
   * 
   * @example
   * ```typescript
   * notificationManager.warning('Generation may take longer than usual');
   * ```
   */
  warning(message: string, options: NotificationOptions = {}): void {
    if (this.isDuplicate(message)) {
      errorLogger.debug('Duplicate warning toast suppressed', { message });
      return;
    }

    sonnerToast.warning(message, {
      duration: options.duration !== undefined ? options.duration : 5000,
      description: options.description,
      action: options.action,
    });

    this.cacheMessage(message);
  }

  /**
   * Show error toast with error-specific handling.
   * Duration is determined by error type:
   * - Temporary/retryable errors: 5 seconds (auto-dismiss)
   * - Permanent errors: 0 (persistent, requires manual dismissal)
   * 
   * @example
   * ```typescript
   * notificationManager.error('Failed to connect to server');
   * notificationManager.error(new NetworkError('Connection timeout'));
   * ```
   */
  error(
    error: Error | AppError | string,
    options: NotificationOptions = {}
  ): void {
    const message = typeof error === 'string' ? error : getUserMessage(error);

    if (this.isDuplicate(message)) {
      errorLogger.debug('Duplicate error toast suppressed', { message });
      return;
    }

    const category = typeof error === 'string' ? 'unknown' : categorizeError(error);
    const retryable = typeof error !== 'string' && isRetryable(error);

    // Determine duration based on error type
    let duration = options.duration;
    if (duration === undefined) {
      // Persistent for permanent errors (require manual dismissal)
      // Auto-dismiss for temporary errors
      duration = retryable ? 5000 : 0;
    }

    sonnerToast.error(message, {
      duration,
      description: options.description,
      action: options.action,
    });

    this.cacheMessage(message);

    // Log error
    if (typeof error !== 'string') {
      errorLogger.error('Error toast displayed', error, { category });
    }
  }

  /**
   * Show error toast from Error object with automatic message extraction and action buttons.
   * Intelligently adds Retry or View Details buttons based on error properties.
   * 
   * @example
   * ```typescript
   * try {
   *   await generateConversation();
   * } catch (error) {
   *   notificationManager.showError(error, {
   *     onRetry: () => retryGeneration(),
   *     onViewDetails: () => openErrorModal(error),
   *   });
   * }
   * ```
   */
  showError(
    error: Error | AppError | unknown,
    options: NotificationOptions & {
      onRetry?: () => void;
      onViewDetails?: () => void;
    } = {}
  ): void {
    const message = getUserMessage(error);
    const retryable = isRetryable(error);

    // Build action button
    let action: NotificationOptions['action'] | undefined;
    if (options.onRetry && retryable) {
      action = {
        label: 'Retry',
        onClick: options.onRetry,
      };
    } else if (options.onViewDetails) {
      action = {
        label: 'View Details',
        onClick: options.onViewDetails,
      };
    }

    this.error(message, {
      ...options,
      action,
    });
  }

  /**
   * Show custom toast with custom component.
   * Use for specialized toast designs (e.g., RateLimitToast, NetworkErrorToast).
   * 
   * @example
   * ```typescript
   * import { RateLimitToast } from '@/components/notifications/RateLimitToast';
   * 
   * notificationManager.custom(
   *   <RateLimitToast retryAfterSeconds={30} onRetry={retryRequest} />
   * );
   * ```
   */
  custom(component: React.ReactNode, options: { duration?: number } = {}): void {
    sonnerToast.custom(component, {
      duration: options.duration !== undefined ? options.duration : 0,
    });
  }

  /**
   * Dismiss all toasts.
   * Useful for cleanup on navigation or when showing critical alerts.
   * 
   * @example
   * ```typescript
   * notificationManager.dismissAll();
   * ```
   */
  dismissAll(): void {
    sonnerToast.dismiss();
  }

  /**
   * Clear deduplication cache.
   * Useful for testing or when you want to allow immediate re-display of messages.
   */
  clearCache(): void {
    this.toastCache.clear();
  }
}

// Export singleton instance
export const notificationManager = NotificationManager.getInstance();

// Convenience exports for common operations
export const showSuccess = (message: string, options?: NotificationOptions) =>
  notificationManager.success(message, options);

export const showError = (error: Error | AppError | string, options?: NotificationOptions) =>
  notificationManager.error(error, options);

export const showWarning = (message: string, options?: NotificationOptions) =>
  notificationManager.warning(message, options);

export const showInfo = (message: string, options?: NotificationOptions) =>
  notificationManager.info(message, options);

