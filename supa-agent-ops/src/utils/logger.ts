/**
 * Structured logging utilities
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
}

/**
 * Simple structured logger
 */
export class Logger {
  private minLevel: LogLevel;

  constructor(minLevel: LogLevel = 'info') {
    this.minLevel = minLevel;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    const minIndex = levels.indexOf(this.minLevel);
    const currentIndex = levels.indexOf(level);
    return currentIndex >= minIndex;
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context
    };

    const output = context 
      ? `[${entry.timestamp}] ${level.toUpperCase()}: ${message} ${JSON.stringify(context)}`
      : `[${entry.timestamp}] ${level.toUpperCase()}: ${message}`;

    switch (level) {
      case 'error':
        console.error(output);
        break;
      case 'warn':
        console.warn(output);
        break;
      default:
        console.log(output);
    }
  }

  debug(message: string, context?: Record<string, any>): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, any>): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, any>): void {
    this.log('warn', message, context);
  }

  error(message: string, context?: Record<string, any>): void {
    this.log('error', message, context);
  }
}

// Default logger instance
export const logger = new Logger(process.env.LOG_LEVEL as LogLevel || 'info');

