/**
 * Error Logging Service
 * 
 * Provides centralized error logging with:
 * - Multiple log levels (debug, info, warn, error, critical)
 * - Batched logging to API endpoint
 * - Console logging in development
 * - Automatic flushing on critical errors
 * - Queue management with size limits
 * 
 * @module error-logger
 */

import { AppError, ErrorCode } from './error-classes';
import { sanitizeError } from './error-guards';

/**
 * Log severity levels.
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

/**
 * Log entry structure.
 */
export interface LogEntry {
  id: string;
  level: LogLevel;
  message: string;
  code?: ErrorCode;
  error?: AppError;
  context?: Record<string, unknown>;
  timestamp: string;
}

/**
 * Log destination interface.
 * Implement this to create custom log destinations.
 */
interface LogDestination {
  log(entry: LogEntry): Promise<void>;
  destroy?(): void;
}

/**
 * Console destination for development logging.
 * Logs to browser/Node console with appropriate formatting.
 */
class ConsoleDestination implements LogDestination {
  async log(entry: LogEntry): Promise<void> {
    const prefix = `[${entry.level.toUpperCase()}] ${entry.timestamp}`;
    const message = entry.error 
      ? `${prefix} ${entry.message}: ${entry.error.message}`
      : `${prefix} ${entry.message}`;

    switch (entry.level) {
      case 'debug':
        console.debug(message, entry.context || '');
        break;
      case 'info':
        console.info(message, entry.context || '');
        break;
      case 'warn':
        console.warn(message, entry.context || '');
        if (entry.error) {
          console.warn('Error details:', entry.error);
        }
        break;
      case 'error':
      case 'critical':
        console.error(message, entry.context || '');
        if (entry.error) {
          console.error('Error details:', entry.error);
          if (entry.error.stack) {
            console.error('Stack trace:', entry.error.stack);
          }
        }
        break;
    }
  }
}

/**
 * API destination for production logging.
 * Batches logs and sends to API endpoint periodically.
 */
class APIDestination implements LogDestination {
  private queue: LogEntry[] = [];
  private flushInterval: ReturnType<typeof setInterval> | null = null;
  private readonly batchSize = 10;
  private readonly flushDelay = 5000; // 5 seconds
  private readonly maxQueueSize = 100; // Prevent memory issues
  private isFlushing = false;

  constructor() {
    this.startFlushInterval();
  }

  async log(entry: LogEntry): Promise<void> {
    // Sanitize before adding to queue
    const sanitized: LogEntry = {
      ...entry,
      error: entry.error ? {
        ...sanitizeError(entry.error),
        // Keep the full error for API logging (will be sanitized server-side)
        name: entry.error.name,
        message: entry.error.message,
        code: entry.error.code,
        isRecoverable: entry.error.isRecoverable,
        context: entry.error.context,
        stack: entry.error.stack,
      } as AppError,
    };

    // Check queue size limit
    if (this.queue.length >= this.maxQueueSize) {
      console.warn('Error log queue full, dropping oldest entry');
      this.queue.shift(); // Remove oldest entry
    }

    this.queue.push(sanitized);

    // Flush immediately for critical errors or when batch is full
    if (entry.level === 'critical' || this.queue.length >= this.batchSize) {
      await this.flush();
    }
  }

  private startFlushInterval(): void {
    // Only set up interval if not already running
    if (this.flushInterval) return;

    this.flushInterval = setInterval(() => {
      if (this.queue.length > 0 && !this.isFlushing) {
        this.flush().catch((error) => {
          console.error('Error during scheduled flush:', error);
        });
      }
    }, this.flushDelay);
  }

  private async flush(): Promise<void> {
    if (this.queue.length === 0 || this.isFlushing) return;

    this.isFlushing = true;
    const batch = [...this.queue];
    this.queue = [];

    try {
      const response = await fetch('/api/errors/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logs: batch }),
      });

      if (!response.ok) {
        console.error('Failed to send error logs to API:', response.statusText);
        // Re-queue on failure (with limit to prevent infinite growth)
        if (this.queue.length < this.maxQueueSize - batch.length) {
          this.queue.unshift(...batch);
        }
      }
    } catch (error) {
      console.error('Error sending logs to API:', error);
      // Re-queue on failure (with limit)
      if (this.queue.length < this.maxQueueSize - batch.length) {
        this.queue.unshift(...batch);
      }
    } finally {
      this.isFlushing = false;
    }
  }

  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
    // Final flush (synchronous attempt)
    if (this.queue.length > 0) {
      this.flush().catch((error) => {
        console.error('Error during final flush:', error);
      });
    }
  }
}

/**
 * Singleton ErrorLogger class.
 * Provides centralized error logging for the entire application.
 * 
 * @example
 * ```typescript
 * import { errorLogger } from './error-logger';
 * 
 * try {
 *   // some code
 * } catch (error) {
 *   errorLogger.error('Operation failed', error, { component: 'DataLoader' });
 * }
 * ```
 */
class ErrorLogger {
  private static instance: ErrorLogger;
  private destinations: LogDestination[] = [];
  private isDevelopment = typeof process !== 'undefined' && process.env?.NODE_ENV === 'development';

  private constructor() {
    // Always add console in development
    if (this.isDevelopment) {
      this.destinations.push(new ConsoleDestination());
    }

    // Add API destination in production (and development if needed for testing)
    if (!this.isDevelopment || process.env?.LOG_TO_API === 'true') {
      this.destinations.push(new APIDestination());
    }

    // If no destinations configured, add console as fallback
    if (this.destinations.length === 0) {
      this.destinations.push(new ConsoleDestination());
    }
  }

  /**
   * Get the singleton ErrorLogger instance.
   */
  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  /**
   * Create a log entry with standardized structure.
   */
  private createEntry(
    level: LogLevel,
    message: string,
    error?: AppError | Error | unknown,
    context?: Record<string, unknown>
  ): LogEntry {
    // Generate unique ID for this log entry
    const id = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    return {
      id,
      level,
      message,
      code: error instanceof AppError ? error.code : undefined,
      error: error instanceof AppError ? error : undefined,
      context,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Log to all configured destinations.
   */
  private logToDestinations(entry: LogEntry): void {
    this.destinations.forEach((destination) => {
      destination.log(entry).catch((err) => {
        // Avoid infinite loops - just console.error
        console.error('Failed to log to destination:', err);
      });
    });
  }

  /**
   * Log debug message (verbose information for development).
   * 
   * @example
   * ```typescript
   * errorLogger.debug('User session initialized', { userId: '123' });
   * ```
   */
  debug(message: string, context?: Record<string, unknown>): void {
    const entry = this.createEntry('debug', message, undefined, context);
    this.logToDestinations(entry);
  }

  /**
   * Log info message (general information).
   * 
   * @example
   * ```typescript
   * errorLogger.info('Conversation generated successfully', { conversationId: 'abc' });
   * ```
   */
  info(message: string, context?: Record<string, unknown>): void {
    const entry = this.createEntry('info', message, undefined, context);
    this.logToDestinations(entry);
  }

  /**
   * Log warning message (potential issues that don't stop execution).
   * 
   * @example
   * ```typescript
   * errorLogger.warn('API response slow', error, { duration: 5000 });
   * ```
   */
  warn(message: string, error?: Error | unknown, context?: Record<string, unknown>): void {
    const entry = this.createEntry('warn', message, error, context);
    this.logToDestinations(entry);
  }

  /**
   * Log error message (errors that affect functionality).
   * 
   * @example
   * ```typescript
   * errorLogger.error('Failed to save conversation', error, { conversationId: '123' });
   * ```
   */
  error(message: string, error?: Error | unknown, context?: Record<string, unknown>): void {
    const entry = this.createEntry('error', message, error, context);
    this.logToDestinations(entry);
  }

  /**
   * Log critical error (severe errors requiring immediate attention).
   * Triggers immediate flush to ensure the error is recorded.
   * 
   * @example
   * ```typescript
   * errorLogger.critical('Database connection lost', error, { service: 'Supabase' });
   * ```
   */
  critical(message: string, error?: Error | unknown, context?: Record<string, unknown>): void {
    const entry = this.createEntry('critical', message, error, context);
    this.logToDestinations(entry);
  }

  /**
   * Destroy the logger and clean up resources.
   * Call this when shutting down the application.
   */
  destroy(): void {
    this.destinations.forEach((destination) => {
      if (destination.destroy) {
        destination.destroy();
      }
    });
    this.destinations = [];
  }

  /**
   * Add a custom log destination.
   * Useful for adding specialized logging targets.
   * 
   * @example
   * ```typescript
   * class SentryDestination implements LogDestination {
   *   async log(entry: LogEntry) {
   *     Sentry.captureException(entry.error);
   *   }
   * }
   * errorLogger.addDestination(new SentryDestination());
   * ```
   */
  addDestination(destination: LogDestination): void {
    this.destinations.push(destination);
  }

  /**
   * Remove all destinations of a specific type.
   */
  removeDestination(destinationType: new () => LogDestination): void {
    this.destinations = this.destinations.filter(
      (dest) => !(dest instanceof destinationType)
    );
  }
}

/**
 * Export singleton instance for application-wide use.
 * 
 * @example
 * ```typescript
 * import { errorLogger } from '@/lib/errors/error-logger';
 * 
 * errorLogger.error('Operation failed', error);
 * ```
 */
export const errorLogger = ErrorLogger.getInstance();

/**
 * Export ErrorLogger class for testing purposes.
 */
export { ErrorLogger };

