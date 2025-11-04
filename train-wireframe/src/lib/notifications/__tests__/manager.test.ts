/**
 * NotificationManager Tests
 * 
 * Tests for notification manager singleton:
 * - Singleton pattern
 * - Deduplication logic
 * - Error-specific handling
 * - Action button integration
 * - Duration management
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { notificationManager } from '../manager';
import { AppError, ErrorCode } from '../../errors';
import * as sonner from 'sonner';

// Mock Sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    custom: vi.fn(),
    dismiss: vi.fn(),
  },
}));

// Mock ErrorLogger
vi.mock('../../errors/error-logger', () => ({
  errorLogger: {
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('NotificationManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear cache before each test
    notificationManager.clearCache();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = notificationManager;
      const instance2 = notificationManager;
      expect(instance1).toBe(instance2);
    });
  });

  describe('Success Notifications', () => {
    it('should show success toast with default duration', () => {
      notificationManager.success('Operation completed');

      expect(sonner.toast.success).toHaveBeenCalledWith(
        'Operation completed',
        expect.objectContaining({
          duration: 4000,
        })
      );
    });

    it('should show success toast with custom duration', () => {
      notificationManager.success('Operation completed', { duration: 2000 });

      expect(sonner.toast.success).toHaveBeenCalledWith(
        'Operation completed',
        expect.objectContaining({
          duration: 2000,
        })
      );
    });

    it('should show success toast with action button', () => {
      const handleAction = vi.fn();
      notificationManager.success('Operation completed', {
        action: {
          label: 'Undo',
          onClick: handleAction,
        },
      });

      expect(sonner.toast.success).toHaveBeenCalledWith(
        'Operation completed',
        expect.objectContaining({
          action: {
            label: 'Undo',
            onClick: handleAction,
          },
        })
      );
    });
  });

  describe('Error Notifications', () => {
    it('should show error toast from string', () => {
      notificationManager.error('Something went wrong');

      expect(sonner.toast.error).toHaveBeenCalledWith(
        'Something went wrong',
        expect.any(Object)
      );
    });

    it('should show error toast from Error object', () => {
      const error = new Error('Test error');
      notificationManager.error(error);

      expect(sonner.toast.error).toHaveBeenCalledWith(
        'An unexpected error occurred. Please try again.',
        expect.any(Object)
      );
    });

    it('should show error toast from AppError with user message', () => {
      const error = new AppError(
        'Internal error',
        ErrorCode.ERR_API_SERVER,
        {
          isRecoverable: false,
        }
      );

      notificationManager.error(error);

      expect(sonner.toast.error).toHaveBeenCalledWith(
        expect.stringContaining('server error'),
        expect.any(Object)
      );
    });

    it('should use persistent duration for permanent errors', () => {
      const error = new AppError(
        'Validation failed',
        ErrorCode.ERR_VAL_REQUIRED,
        {
          isRecoverable: false,
        }
      );

      notificationManager.error(error);

      expect(sonner.toast.error).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          duration: 0, // Persistent
        })
      );
    });

    it('should use auto-dismiss duration for temporary errors', () => {
      const error = new AppError(
        'Network timeout',
        ErrorCode.ERR_NET_TIMEOUT,
        {
          isRecoverable: true,
        }
      );

      notificationManager.error(error);

      expect(sonner.toast.error).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          duration: 5000, // Auto-dismiss
        })
      );
    });
  });

  describe('showError with Actions', () => {
    it('should show retry button for retryable errors', () => {
      const error = new AppError(
        'Network error',
        ErrorCode.ERR_NET_TIMEOUT,
        {
          isRecoverable: true,
        }
      );

      const handleRetry = vi.fn();
      notificationManager.showError(error, {
        onRetry: handleRetry,
      });

      expect(sonner.toast.error).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          action: {
            label: 'Retry',
            onClick: handleRetry,
          },
        })
      );
    });

    it('should show view details button for non-retryable errors', () => {
      const error = new AppError(
        'Validation error',
        ErrorCode.ERR_VAL_REQUIRED,
        {
          isRecoverable: false,
        }
      );

      const handleViewDetails = vi.fn();
      notificationManager.showError(error, {
        onViewDetails: handleViewDetails,
      });

      expect(sonner.toast.error).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          action: {
            label: 'View Details',
            onClick: handleViewDetails,
          },
        })
      );
    });

    it('should prioritize retry over view details for retryable errors', () => {
      const error = new AppError(
        'Network error',
        ErrorCode.ERR_NET_TIMEOUT,
        {
          isRecoverable: true,
        }
      );

      const handleRetry = vi.fn();
      const handleViewDetails = vi.fn();
      notificationManager.showError(error, {
        onRetry: handleRetry,
        onViewDetails: handleViewDetails,
      });

      expect(sonner.toast.error).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          action: {
            label: 'Retry',
            onClick: handleRetry,
          },
        })
      );
    });
  });

  describe('Deduplication', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    it('should prevent duplicate success messages within 5 seconds', () => {
      notificationManager.success('Test message');
      notificationManager.success('Test message');

      expect(sonner.toast.success).toHaveBeenCalledTimes(1);
    });

    it('should prevent duplicate error messages within 5 seconds', () => {
      notificationManager.error('Test error');
      notificationManager.error('Test error');

      expect(sonner.toast.error).toHaveBeenCalledTimes(1);
    });

    it('should allow duplicate messages after 5 seconds', () => {
      notificationManager.success('Test message');
      
      // Fast-forward 5 seconds
      vi.advanceTimersByTime(5001);
      
      notificationManager.success('Test message');

      expect(sonner.toast.success).toHaveBeenCalledTimes(2);
    });

    it('should allow different messages immediately', () => {
      notificationManager.success('Message 1');
      notificationManager.success('Message 2');

      expect(sonner.toast.success).toHaveBeenCalledTimes(2);
    });

    it('should cache and auto-cleanup messages', () => {
      notificationManager.success('Test message');

      // Message is cached
      notificationManager.success('Test message');
      expect(sonner.toast.success).toHaveBeenCalledTimes(1);

      // Fast-forward past cleanup time
      vi.advanceTimersByTime(5001);

      // Cache should be cleared, message should show again
      notificationManager.success('Test message');
      expect(sonner.toast.success).toHaveBeenCalledTimes(2);
    });
  });

  describe('Info Notifications', () => {
    it('should show info toast with default duration', () => {
      notificationManager.info('Processing...');

      expect(sonner.toast.info).toHaveBeenCalledWith(
        'Processing...',
        expect.objectContaining({
          duration: 4000,
        })
      );
    });
  });

  describe('Warning Notifications', () => {
    it('should show warning toast with default duration', () => {
      notificationManager.warning('Slow connection detected');

      expect(sonner.toast.warning).toHaveBeenCalledWith(
        'Slow connection detected',
        expect.objectContaining({
          duration: 5000,
        })
      );
    });
  });

  describe('Custom Notifications', () => {
    it('should show custom toast component', () => {
      const CustomComponent = () => <div>Custom Toast</div>;
      notificationManager.custom(<CustomComponent />);

      expect(sonner.toast.custom).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          duration: 0,
        })
      );
    });

    it('should show custom toast with custom duration', () => {
      const CustomComponent = () => <div>Custom Toast</div>;
      notificationManager.custom(<CustomComponent />, { duration: 3000 });

      expect(sonner.toast.custom).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          duration: 3000,
        })
      );
    });
  });

  describe('Dismiss All', () => {
    it('should dismiss all toasts', () => {
      notificationManager.dismissAll();
      expect(sonner.toast.dismiss).toHaveBeenCalled();
    });
  });

  describe('Cache Management', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    it('should clear cache manually', () => {
      notificationManager.success('Test message');
      notificationManager.success('Test message');
      expect(sonner.toast.success).toHaveBeenCalledTimes(1);

      // Clear cache
      notificationManager.clearCache();

      // Should allow same message immediately after cache clear
      notificationManager.success('Test message');
      expect(sonner.toast.success).toHaveBeenCalledTimes(2);
    });
  });
});

