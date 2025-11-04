/**
 * ErrorBoundary Component Tests
 * 
 * Tests for error boundary functionality including error catching,
 * fallback UI display, error logging, and recovery mechanisms.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from '../ErrorBoundary';
import { errorLogger } from '@/lib/errors/error-logger';

// Mock errorLogger
jest.mock('@/lib/errors/error-logger', () => ({
  errorLogger: {
    critical: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock ErrorFallback component
jest.mock('../ErrorFallback', () => ({
  ErrorFallback: ({ error, errorId, onReset }: any) => (
    <div data-testid="error-fallback">
      <h1>Error Fallback</h1>
      <p>{error.message}</p>
      <p>Error ID: {errorId}</p>
      <button onClick={onReset}>Reset</button>
    </div>
  ),
}));

// Component that throws an error
function ThrowError({ shouldThrow = true }: { shouldThrow?: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
}

// Component that throws during render
function ThrowErrorOnMount() {
  throw new Error('Mount error');
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console.error for tests (ErrorBoundary logs errors)
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Error Catching', () => {
    it('should render children when no error occurs', () => {
      render(
        <ErrorBoundary>
          <div>Child component</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Child component')).toBeInTheDocument();
    });

    it('should catch errors thrown by children', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('error-fallback')).toBeInTheDocument();
      expect(screen.getByText('Test error')).toBeInTheDocument();
    });

    it('should catch errors thrown during mount', () => {
      render(
        <ErrorBoundary>
          <ThrowErrorOnMount />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('error-fallback')).toBeInTheDocument();
      expect(screen.getByText('Mount error')).toBeInTheDocument();
    });

    it('should not catch errors from outside boundary', () => {
      const { container } = render(
        <div>
          <ErrorBoundary>
            <div>Safe component</div>
          </ErrorBoundary>
        </div>
      );

      expect(screen.getByText('Safe component')).toBeInTheDocument();
    });
  });

  describe('Error Logging', () => {
    it('should log errors to errorLogger', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(errorLogger.critical).toHaveBeenCalledWith(
        'React error boundary caught error',
        expect.anything(),
        expect.objectContaining({
          componentStack: expect.any(String),
          errorId: expect.any(String),
          errorName: 'Error',
          errorMessage: 'Test error',
        })
      );
    });

    it('should generate unique error ID', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      const errorId = screen.getByText(/Error ID:/).textContent;
      expect(errorId).toMatch(/Error ID: [a-f0-9-]+/);
    });

    it('should log component stack trace', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(errorLogger.critical).toHaveBeenCalledWith(
        expect.any(String),
        expect.anything(),
        expect.objectContaining({
          componentStack: expect.any(String),
        })
      );
    });
  });

  describe('Error Recovery', () => {
    it('should reset error state when resetError is called', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Error should be displayed
      expect(screen.getByTestId('error-fallback')).toBeInTheDocument();

      // Click reset button
      const resetButton = screen.getByText('Reset');
      fireEvent.click(resetButton);

      // Re-render with non-throwing component
      rerender(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      );

      // Error should be cleared
      expect(screen.queryByTestId('error-fallback')).not.toBeInTheDocument();
      expect(screen.getByText('No error')).toBeInTheDocument();
    });

    it('should reset error when children change', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // Error should be displayed
      expect(screen.getByTestId('error-fallback')).toBeInTheDocument();

      // Change children (simulating route change)
      rerender(
        <ErrorBoundary>
          <div>New component</div>
        </ErrorBoundary>
      );

      // Error should be cleared
      expect(screen.queryByTestId('error-fallback')).not.toBeInTheDocument();
      expect(screen.getByText('New component')).toBeInTheDocument();
    });
  });

  describe('Custom Fallback', () => {
    it('should render custom fallback when provided', () => {
      const customFallback = (error: Error, errorInfo: any, reset: () => void) => (
        <div data-testid="custom-fallback">
          <h1>Custom Error UI</h1>
          <p>{error.message}</p>
          <button onClick={reset}>Custom Reset</button>
        </div>
      );

      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
      expect(screen.getByText('Custom Error UI')).toBeInTheDocument();
      expect(screen.queryByTestId('error-fallback')).not.toBeInTheDocument();
    });

    it('should fall back to default UI if custom fallback throws', () => {
      const brokenFallback = () => {
        throw new Error('Fallback error');
      };

      render(
        <ErrorBoundary fallback={brokenFallback}>
          <ThrowError />
        </ErrorBoundary>
      );

      // Should render default fallback
      expect(screen.getByTestId('error-fallback')).toBeInTheDocument();
    });
  });

  describe('Custom Error Handler', () => {
    it('should call onError handler when provided', () => {
      const onError = jest.fn();

      render(
        <ErrorBoundary onError={onError}>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Test error' }),
        expect.objectContaining({ componentStack: expect.any(String) })
      );
    });

    it('should not crash if onError handler throws', () => {
      const brokenOnError = jest.fn(() => {
        throw new Error('Handler error');
      });

      render(
        <ErrorBoundary onError={brokenOnError}>
          <ThrowError />
        </ErrorBoundary>
      );

      // Should still render fallback despite handler error
      expect(screen.getByTestId('error-fallback')).toBeInTheDocument();
    });
  });

  describe('Multiple Boundaries', () => {
    it('should isolate errors to nearest boundary', () => {
      render(
        <ErrorBoundary>
          <div>Outer safe content</div>
          <ErrorBoundary>
            <ThrowError />
          </ErrorBoundary>
          <div>Outer safe content 2</div>
        </ErrorBoundary>
      );

      // Inner boundary should catch error
      expect(screen.getByTestId('error-fallback')).toBeInTheDocument();
      // Outer content should still render
      expect(screen.getByText('Outer safe content')).toBeInTheDocument();
      expect(screen.getByText('Outer safe content 2')).toBeInTheDocument();
    });
  });

  describe('Error State Management', () => {
    it('should maintain error state across re-renders', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(screen.getByTestId('error-fallback')).toBeInTheDocument();

      // Re-render with same component
      rerender(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      // Error state should persist
      expect(screen.getByTestId('error-fallback')).toBeInTheDocument();
    });

    it('should clear error state when reset', () => {
      const { rerender } = render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      );

      // Click reset
      fireEvent.click(screen.getByText('Reset'));

      // Re-render with non-throwing component
      rerender(
        <ErrorBoundary>
          <div>Recovered</div>
        </ErrorBoundary>
      );

      expect(screen.getByText('Recovered')).toBeInTheDocument();
      expect(screen.queryByTestId('error-fallback')).not.toBeInTheDocument();
    });
  });

  describe('Error Information', () => {
    it('should capture error name', () => {
      class CustomError extends Error {
        constructor(message: string) {
          super(message);
          this.name = 'CustomError';
        }
      }

      function ThrowCustomError() {
        throw new CustomError('Custom error message');
      }

      render(
        <ErrorBoundary>
          <ThrowCustomError />
        </ErrorBoundary>
      );

      expect(errorLogger.critical).toHaveBeenCalledWith(
        expect.any(String),
        expect.anything(),
        expect.objectContaining({
          errorName: 'CustomError',
        })
      );
    });

    it('should capture error message', () => {
      render(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );

      expect(errorLogger.critical).toHaveBeenCalledWith(
        expect.any(String),
        expect.anything(),
        expect.objectContaining({
          errorMessage: 'Test error',
        })
      );
    });
  });
});

