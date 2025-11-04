'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AppError, ErrorCode } from '@/lib/errors';
import { errorLogger } from '@/lib/errors/error-logger';
import { ErrorFallback } from './ErrorFallback';

interface Props {
  children: ReactNode;
  fallback?: (error: Error, errorInfo: ErrorInfo, reset: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  isolate?: boolean; // If true, only catches errors in children
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

/**
 * ErrorBoundary Component
 * 
 * Catches React errors (component crashes, rendering failures) and displays
 * a user-friendly fallback UI instead of crashing the entire application.
 * 
 * Features:
 * - Catches all unhandled React errors in children
 * - Logs errors to ErrorLogger with component stack trace
 * - Displays fallback UI with error details and recovery options
 * - Generates unique error ID for support tracking
 * - Supports custom fallback components
 * - Integrates with error infrastructure from Prompt 1
 * 
 * @example
 * ```tsx
 * // Basic usage
 * <ErrorBoundary>
 *   <MyComponent />
 * </ErrorBoundary>
 * 
 * // With custom fallback
 * <ErrorBoundary
 *   fallback={(error, errorInfo, reset) => (
 *     <div>Custom error UI</div>
 *   )}
 * >
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  /**
   * Update state when an error is caught.
   * This is called during the render phase.
   */
  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: crypto.randomUUID(),
    };
  }

  /**
   * Log error details after error is caught.
   * This is called during the commit phase.
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Create AppError with component stack for better debugging
    const appError = new AppError(
      error.message || 'React component error',
      ErrorCode.ERR_NET_UNKNOWN, // Generic code for React errors
      {
        cause: error,
        context: {
          component: 'ErrorBoundary',
          metadata: {
            componentStack: errorInfo.componentStack,
            errorId: this.state.errorId,
            errorName: error.name,
            isolate: this.props.isolate,
          },
        },
      }
    );

    // Log to ErrorLogger service
    errorLogger.critical('React error boundary caught error', appError, {
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      errorName: error.name,
      errorMessage: error.message,
    });

    // Call custom onError handler if provided
    if (this.props.onError) {
      try {
        this.props.onError(error, errorInfo);
      } catch (handlerError) {
        // Don't let error handler crash the boundary
        console.error('Error in onError handler:', handlerError);
      }
    }

    // Update state with error info
    this.setState({ errorInfo });
  }

  /**
   * Reset error state to attempt recovery.
   * Called when user clicks "Try Again" or navigates away.
   */
  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });
  };

  /**
   * Reset error boundary when route changes.
   * This provides automatic recovery on navigation.
   */
  componentDidUpdate(prevProps: Props): void {
    // If children changed (e.g., route navigation), reset error
    if (this.state.hasError && prevProps.children !== this.props.children) {
      this.resetError();
    }
  }

  render(): ReactNode {
    if (this.state.hasError && this.state.error && this.state.errorInfo) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        try {
          return this.props.fallback(
            this.state.error,
            this.state.errorInfo,
            this.resetError
          );
        } catch (fallbackError) {
          // If custom fallback crashes, use default
          console.error('Error in custom fallback:', fallbackError);
        }
      }

      // Default fallback UI
      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          errorId={this.state.errorId || undefined}
          onReset={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}

