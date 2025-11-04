/**
 * ErrorFallback Component Tests
 * 
 * Tests for error fallback UI including error display, recovery actions,
 * and development vs production modes.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorFallback } from '../ErrorFallback';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  AlertTriangle: () => <div data-testid="alert-icon">Alert Icon</div>,
  RefreshCw: () => <div data-testid="refresh-icon">Refresh Icon</div>,
  Bug: () => <div data-testid="bug-icon">Bug Icon</div>,
  ChevronDown: () => <div data-testid="chevron-down">Down</div>,
  ChevronUp: () => <div data-testid="chevron-up">Up</div>,
}));

// Mock UI components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h2>{children}</h2>,
  CardDescription: ({ children }: any) => <p>{children}</p>,
  CardContent: ({ children }: any) => <div>{children}</div>,
  CardFooter: ({ children }: any) => <div>{children}</div>,
}));

jest.mock('@/components/ui/alert', () => ({
  Alert: ({ children }: any) => <div>{children}</div>,
  AlertDescription: ({ children }: any) => <div>{children}</div>,
}));

jest.mock('@/components/ui/collapsible', () => ({
  Collapsible: ({ children, open }: any) => <div>{open ? children : null}</div>,
  CollapsibleTrigger: ({ children, asChild }: any) => <div>{children}</div>,
  CollapsibleContent: ({ children }: any) => <div>{children}</div>,
}));

describe('ErrorFallback', () => {
  const mockError = new Error('Test error message');
  mockError.stack = 'Error: Test error message\n    at TestComponent (test.tsx:10:15)';
  
  const mockErrorInfo = {
    componentStack: '\n    at TestComponent (test.tsx:10:15)\n    at ErrorBoundary',
  };

  const mockOnReset = jest.fn();

  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    jest.clearAllMocks();
    delete (window as any).location;
    (window as any).location = { reload: jest.fn() };
    (window as any).open = jest.fn();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
  });

  describe('Rendering', () => {
    it('should render error fallback UI', () => {
      render(
        <ErrorFallback
          error={mockError}
          errorInfo={mockErrorInfo}
          errorId="test-error-123"
          onReset={mockOnReset}
        />
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });

    it('should display error ID', () => {
      render(
        <ErrorFallback
          error={mockError}
          errorInfo={mockErrorInfo}
          errorId="test-error-123"
          onReset={mockOnReset}
        />
      );

      expect(screen.getByText(/Error ID:/)).toBeInTheDocument();
      expect(screen.getByText(/test-error-123/)).toBeInTheDocument();
    });

    it('should render without error ID', () => {
      render(
        <ErrorFallback
          error={mockError}
          errorInfo={mockErrorInfo}
          onReset={mockOnReset}
        />
      );

      expect(screen.queryByText(/Error ID:/)).not.toBeInTheDocument();
    });

    it('should show reload button', () => {
      render(
        <ErrorFallback
          error={mockError}
          errorInfo={mockErrorInfo}
          onReset={mockOnReset}
        />
      );

      expect(screen.getByText(/Reload Page/)).toBeInTheDocument();
    });

    it('should show report button by default', () => {
      render(
        <ErrorFallback
          error={mockError}
          errorInfo={mockErrorInfo}
          onReset={mockOnReset}
        />
      );

      expect(screen.getByText(/Report Issue/)).toBeInTheDocument();
    });

    it('should hide report button when showReportButton is false', () => {
      render(
        <ErrorFallback
          error={mockError}
          errorInfo={mockErrorInfo}
          onReset={mockOnReset}
          showReportButton={false}
        />
      );

      expect(screen.queryByText(/Report Issue/)).not.toBeInTheDocument();
    });
  });

  describe('Development Mode', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });

    it('should show detailed error message in development', () => {
      render(
        <ErrorFallback
          error={mockError}
          errorInfo={mockErrorInfo}
          onReset={mockOnReset}
        />
      );

      expect(screen.getByText('Test error message')).toBeInTheDocument();
    });

    it('should show error details toggle button', () => {
      render(
        <ErrorFallback
          error={mockError}
          errorInfo={mockErrorInfo}
          onReset={mockOnReset}
        />
      );

      expect(screen.getByText(/Show Error Details/)).toBeInTheDocument();
    });

    it('should toggle error details visibility', () => {
      render(
        <ErrorFallback
          error={mockError}
          errorInfo={mockErrorInfo}
          onReset={mockOnReset}
        />
      );

      // Initially closed
      expect(screen.queryByText(/Error Message:/)).not.toBeInTheDocument();

      // Click to open
      const toggleButton = screen.getByText(/Show Error Details/);
      fireEvent.click(toggleButton);

      // Should show details
      expect(screen.getByText(/Error Message:/)).toBeInTheDocument();
      expect(screen.getByText(/Stack Trace:/)).toBeInTheDocument();
      expect(screen.getByText(/Component Stack:/)).toBeInTheDocument();
    });

    it('should display error stack trace', () => {
      render(
        <ErrorFallback
          error={mockError}
          errorInfo={mockErrorInfo}
          onReset={mockOnReset}
        />
      );

      // Open details
      fireEvent.click(screen.getByText(/Show Error Details/));

      expect(screen.getByText(/TestComponent/)).toBeInTheDocument();
    });

    it('should display component stack', () => {
      render(
        <ErrorFallback
          error={mockError}
          errorInfo={mockErrorInfo}
          onReset={mockOnReset}
        />
      );

      // Open details
      fireEvent.click(screen.getByText(/Show Error Details/));

      expect(screen.getByText(/ErrorBoundary/)).toBeInTheDocument();
    });
  });

  describe('Production Mode', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
    });

    it('should show generic error message in production', () => {
      render(
        <ErrorFallback
          error={mockError}
          errorInfo={mockErrorInfo}
          onReset={mockOnReset}
        />
      );

      expect(screen.getByText(/unexpected error occurred/)).toBeInTheDocument();
      expect(screen.queryByText('Test error message')).not.toBeInTheDocument();
    });

    it('should not show error details toggle in production', () => {
      render(
        <ErrorFallback
          error={mockError}
          errorInfo={mockErrorInfo}
          onReset={mockOnReset}
        />
      );

      expect(screen.queryByText(/Show Error Details/)).not.toBeInTheDocument();
    });
  });

  describe('User Actions', () => {
    it('should call onReset when reload button clicked', () => {
      render(
        <ErrorFallback
          error={mockError}
          errorInfo={mockErrorInfo}
          onReset={mockOnReset}
        />
      );

      const reloadButton = screen.getByText(/Reload Page/);
      fireEvent.click(reloadButton);

      expect(mockOnReset).toHaveBeenCalled();
    });

    it('should reload page when no onReset provided', () => {
      render(
        <ErrorFallback
          error={mockError}
          errorInfo={mockErrorInfo}
        />
      );

      const reloadButton = screen.getByText(/Reload Page/);
      fireEvent.click(reloadButton);

      expect(window.location.reload).toHaveBeenCalled();
    });

    it('should open email client when report button clicked', () => {
      render(
        <ErrorFallback
          error={mockError}
          errorInfo={mockErrorInfo}
          errorId="test-123"
          onReset={mockOnReset}
        />
      );

      const reportButton = screen.getByText(/Report Issue/);
      fireEvent.click(reportButton);

      expect(window.open).toHaveBeenCalledWith(
        expect.stringContaining('mailto:'),
        '_blank'
      );
      expect(window.open).toHaveBeenCalledWith(
        expect.stringContaining('test-123'),
        '_blank'
      );
    });

    it('should include error details in report email', () => {
      render(
        <ErrorFallback
          error={mockError}
          errorInfo={mockErrorInfo}
          errorId="test-123"
          onReset={mockOnReset}
        />
      );

      const reportButton = screen.getByText(/Report Issue/);
      fireEvent.click(reportButton);

      const emailUrl = (window.open as jest.Mock).mock.calls[0][0];
      expect(emailUrl).toContain('Error ID: test-123');
      expect(emailUrl).toContain('Error Name: Error');
      expect(emailUrl).toContain('Error Message: Test error message');
      expect(emailUrl).toContain('Component Stack');
    });
  });

  describe('User Guidance', () => {
    it('should display user guidance', () => {
      render(
        <ErrorFallback
          error={mockError}
          errorInfo={mockErrorInfo}
          onReset={mockOnReset}
        />
      );

      expect(screen.getByText(/The application encountered an error/)).toBeInTheDocument();
      expect(screen.getByText(/Reloading the page to start fresh/)).toBeInTheDocument();
      expect(screen.getByText(/Going back and trying a different action/)).toBeInTheDocument();
      expect(screen.getByText(/Reporting this issue if it persists/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible buttons', () => {
      render(
        <ErrorFallback
          error={mockError}
          errorInfo={mockErrorInfo}
          onReset={mockOnReset}
        />
      );

      const reloadButton = screen.getByText(/Reload Page/).closest('button');
      expect(reloadButton).toBeInTheDocument();
      expect(reloadButton).toHaveAttribute('type', 'button');
    });
  });

  describe('Error Without Stack', () => {
    it('should handle errors without stack trace', () => {
      const errorWithoutStack = new Error('Simple error');
      delete errorWithoutStack.stack;

      process.env.NODE_ENV = 'development';

      render(
        <ErrorFallback
          error={errorWithoutStack}
          errorInfo={mockErrorInfo}
          onReset={mockOnReset}
        />
      );

      // Should still render without crashing
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });

  describe('Long Error Messages', () => {
    it('should handle very long error messages', () => {
      const longError = new Error('x'.repeat(1000));

      render(
        <ErrorFallback
          error={longError}
          errorInfo={mockErrorInfo}
          onReset={mockOnReset}
        />
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    });
  });
});

