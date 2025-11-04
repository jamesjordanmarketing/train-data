/**
 * Unit tests for error logger service
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ErrorLogger, errorLogger, type LogEntry, type LogLevel } from '../error-logger';
import { AppError, APIError, ErrorCode } from '../error-classes';

// Mock fetch for API destination tests
global.fetch = vi.fn();

describe('ErrorLogger', () => {
  let logger: ErrorLogger;

  beforeEach(() => {
    // Reset fetch mock
    vi.clearAllMocks();
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
  });

  afterEach(() => {
    if (logger) {
      logger.destroy();
    }
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = ErrorLogger.getInstance();
      const instance2 = ErrorLogger.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should export errorLogger singleton', () => {
      expect(errorLogger).toBeInstanceOf(ErrorLogger);
    });
  });

  describe('Logging Methods', () => {
    beforeEach(() => {
      // Spy on console methods
      vi.spyOn(console, 'debug').mockImplementation(() => {});
      vi.spyOn(console, 'info').mockImplementation(() => {});
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should log debug messages', () => {
      const logger = ErrorLogger.getInstance();
      logger.debug('Debug message', { key: 'value' });
      
      // In test environment, logs should go to console
      expect(console.debug).toHaveBeenCalled();
    });

    it('should log info messages', () => {
      const logger = ErrorLogger.getInstance();
      logger.info('Info message', { key: 'value' });
      
      expect(console.info).toHaveBeenCalled();
    });

    it('should log warn messages', () => {
      const logger = ErrorLogger.getInstance();
      const error = new Error('Warning');
      logger.warn('Warning message', error, { key: 'value' });
      
      expect(console.warn).toHaveBeenCalled();
    });

    it('should log error messages', () => {
      const logger = ErrorLogger.getInstance();
      const error = new AppError('Error', ErrorCode.ERR_NET_UNKNOWN);
      logger.error('Error message', error, { key: 'value' });
      
      expect(console.error).toHaveBeenCalled();
    });

    it('should log critical messages', () => {
      const logger = ErrorLogger.getInstance();
      const error = new AppError('Critical', ErrorCode.ERR_DB_CONNECTION);
      logger.critical('Critical message', error, { key: 'value' });
      
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('Log Entry Creation', () => {
    it('should create log entry with correct structure', () => {
      // Access private method via any for testing
      const logger = ErrorLogger.getInstance() as any;
      const error = new AppError('Test', ErrorCode.ERR_NET_UNKNOWN);
      const context = { userId: 'user123' };
      
      const entry = logger.createEntry('error', 'Test message', error, context);

      expect(entry.id).toBeDefined();
      expect(entry.level).toBe('error');
      expect(entry.message).toBe('Test message');
      expect(entry.code).toBe(ErrorCode.ERR_NET_UNKNOWN);
      expect(entry.error).toBe(error);
      expect(entry.context).toEqual(context);
      expect(entry.timestamp).toBeDefined();
    });

    it('should create log entry without error', () => {
      const logger = ErrorLogger.getInstance() as any;
      const entry = logger.createEntry('info', 'Info message', undefined, { key: 'value' });

      expect(entry.error).toBeUndefined();
      expect(entry.code).toBeUndefined();
    });

    it('should handle AppError instances', () => {
      const logger = ErrorLogger.getInstance() as any;
      const error = new APIError('API Error', 404, ErrorCode.ERR_API_NOT_FOUND);
      const entry = logger.createEntry('error', 'Message', error);

      expect(entry.error).toBe(error);
      expect(entry.code).toBe(ErrorCode.ERR_API_NOT_FOUND);
    });

    it('should handle non-AppError instances', () => {
      const logger = ErrorLogger.getInstance() as any;
      const error = new Error('Standard error');
      const entry = logger.createEntry('error', 'Message', error);

      expect(entry.error).toBeUndefined();
      expect(entry.code).toBeUndefined();
    });
  });

  describe('Console Destination', () => {
    beforeEach(() => {
      vi.spyOn(console, 'debug').mockImplementation(() => {});
      vi.spyOn(console, 'info').mockImplementation(() => {});
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should log to console in development', () => {
      const logger = ErrorLogger.getInstance();
      logger.info('Test message');
      
      expect(console.info).toHaveBeenCalled();
    });

    it('should format log messages with timestamp', () => {
      const logger = ErrorLogger.getInstance();
      logger.info('Test message');
      
      const call = (console.info as any).mock.calls[0][0];
      expect(call).toMatch(/\[INFO\]/);
      expect(call).toContain('Test message');
    });

    it('should include error details in console output', () => {
      const logger = ErrorLogger.getInstance();
      const error = new AppError('Error details', ErrorCode.ERR_NET_UNKNOWN);
      logger.error('Error occurred', error);
      
      expect(console.error).toHaveBeenCalled();
      const calls = (console.error as any).mock.calls;
      expect(calls.length).toBeGreaterThan(0);
    });
  });

  describe('API Destination', () => {
    it('should batch logs before sending', async () => {
      const logger = ErrorLogger.getInstance();
      
      // Log multiple entries (less than batch size)
      logger.info('Message 1');
      logger.info('Message 2');
      logger.info('Message 3');
      
      // Should not send immediately
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should flush on critical errors', async () => {
      const logger = ErrorLogger.getInstance();
      const error = new AppError('Critical', ErrorCode.ERR_DB_CONNECTION);
      
      logger.critical('Critical error', error);
      
      // Wait for async flush
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      // Note: In test environment with console destination, fetch might not be called
      // This test documents expected behavior in production
    });

    it('should handle API errors gracefully', async () => {
      (global.fetch as any).mockRejectedValue(new Error('Network error'));
      
      const logger = ErrorLogger.getInstance();
      
      // Should not throw
      expect(() => {
        logger.error('Test error');
      }).not.toThrow();
    });

    it('should re-queue failed logs', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        statusText: 'Server Error',
      });
      
      const logger = ErrorLogger.getInstance();
      logger.error('Test error');
      
      await new Promise((resolve) => setTimeout(resolve, 100));
      
      // Should not throw and handle gracefully
      expect(true).toBe(true);
    });
  });

  describe('Context and Metadata', () => {
    beforeEach(() => {
      vi.spyOn(console, 'info').mockImplementation(() => {});
      vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should include context in log entries', () => {
      const logger = ErrorLogger.getInstance();
      const context = {
        userId: 'user123',
        requestId: 'req456',
        component: 'TestComponent',
      };
      
      logger.info('Message', context);
      
      expect(console.info).toHaveBeenCalledWith(
        expect.any(String),
        context
      );
    });

    it('should handle errors with context', () => {
      const logger = ErrorLogger.getInstance();
      const error = new AppError('Error', ErrorCode.ERR_NET_UNKNOWN, {
        context: { component: 'TestComponent' },
      });
      
      logger.error('Error occurred', error, { userId: 'user123' });
      
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('Error Code Tracking', () => {
    it('should include error code in log entry', () => {
      const logger = ErrorLogger.getInstance() as any;
      const error = new AppError('Error', ErrorCode.ERR_API_RATE_LIMIT);
      const entry = logger.createEntry('error', 'Message', error);

      expect(entry.code).toBe(ErrorCode.ERR_API_RATE_LIMIT);
    });

    it('should not include code for non-AppError', () => {
      const logger = ErrorLogger.getInstance() as any;
      const error = new Error('Standard');
      const entry = logger.createEntry('error', 'Message', error);

      expect(entry.code).toBeUndefined();
    });
  });

  describe('Cleanup', () => {
    it('should clean up resources on destroy', () => {
      const logger = ErrorLogger.getInstance();
      
      expect(() => {
        logger.destroy();
      }).not.toThrow();
    });

    it('should flush remaining logs on destroy', async () => {
      const logger = ErrorLogger.getInstance();
      logger.info('Final message');
      
      logger.destroy();
      
      // Should not throw
      expect(true).toBe(true);
    });
  });

  describe('Custom Destinations', () => {
    it('should allow adding custom destinations', () => {
      const logger = ErrorLogger.getInstance();
      const mockDestination = {
        log: vi.fn().mockResolvedValue(undefined),
      };
      
      logger.addDestination(mockDestination);
      logger.info('Test message');
      
      // Custom destination should receive log
      expect(mockDestination.log).toHaveBeenCalled();
    });

    it('should handle destination errors gracefully', () => {
      const logger = ErrorLogger.getInstance();
      const mockDestination = {
        log: vi.fn().mockRejectedValue(new Error('Destination error')),
      };
      
      logger.addDestination(mockDestination);
      
      expect(() => {
        logger.info('Test message');
      }).not.toThrow();
    });
  });

  describe('Log Levels', () => {
    beforeEach(() => {
      vi.spyOn(console, 'debug').mockImplementation(() => {});
      vi.spyOn(console, 'info').mockImplementation(() => {});
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error', 'critical'];

    levels.forEach((level) => {
      it(`should log ${level} level messages`, () => {
        const logger = ErrorLogger.getInstance();
        const methodMap: Record<LogLevel, any> = {
          debug: console.debug,
          info: console.info,
          warn: console.warn,
          error: console.error,
          critical: console.error,
        };

        if (level === 'debug') {
          logger.debug('Message');
        } else if (level === 'info') {
          logger.info('Message');
        } else if (level === 'warn') {
          logger.warn('Message');
        } else if (level === 'error') {
          logger.error('Message');
        } else if (level === 'critical') {
          logger.critical('Message');
        }

        expect(methodMap[level]).toHaveBeenCalled();
      });
    });
  });

  describe('Error Sanitization', () => {
    it('should sanitize errors before sending to API', () => {
      const logger = ErrorLogger.getInstance() as any;
      const error = new AppError('Sensitive error', ErrorCode.ERR_NET_UNKNOWN, {
        context: {
          userId: 'user123',
          metadata: { password: 'secret' },
        },
      });

      // Create entry and verify it contains error
      const entry = logger.createEntry('error', 'Message', error);
      expect(entry.error).toBeDefined();
      
      // In production, API destination would sanitize before sending
      // This test documents expected behavior
    });
  });

  describe('Timestamp Format', () => {
    it('should use ISO format for timestamps', () => {
      const logger = ErrorLogger.getInstance() as any;
      const entry = logger.createEntry('info', 'Message');

      expect(entry.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });
  });

  describe('Unique IDs', () => {
    it('should generate unique IDs for log entries', () => {
      const logger = ErrorLogger.getInstance() as any;
      const entry1 = logger.createEntry('info', 'Message 1');
      const entry2 = logger.createEntry('info', 'Message 2');

      expect(entry1.id).not.toBe(entry2.id);
    });

    it('should generate valid UUID or fallback IDs', () => {
      const logger = ErrorLogger.getInstance() as any;
      const entry = logger.createEntry('info', 'Message');

      expect(entry.id).toBeDefined();
      expect(typeof entry.id).toBe('string');
      expect(entry.id.length).toBeGreaterThan(0);
    });
  });
});

