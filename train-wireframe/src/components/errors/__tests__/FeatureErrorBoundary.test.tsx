/**
 * FeatureErrorBoundary Component Tests
 * 
 * Tests for feature-specific error boundaries including Dashboard,
 * Generation, Export, Templates, and Modal error boundaries.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  DashboardErrorBoundary,
  GenerationErrorBoundary,
  ExportErrorBoundary,
  TemplatesErrorBoundary,
  ReviewQueueErrorBoundary,
  SettingsErrorBoundary,
  ModalErrorBoundary,
} from '../FeatureErrorBoundary';

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  AlertCircle: () => <div data-testid="alert-icon">Alert</div>,
  Home: () => <div data-testid="home-icon">Home</div>,
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
  Card: ({ children }: any) => <div>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h2>{children}</h2>,
  CardDescription: ({ children }: any) => <p>{children}</p>,
  CardContent: ({ children }: any) => <div>{children}</div>,
  CardFooter: ({ children }: any) => <div>{children}</div>,
}));

// Mock ErrorBoundary to simplify testing
jest.mock('../ErrorBoundary', () => ({
  ErrorBoundary: ({ children, fallback }: any) => {
    try {
      return children;
    } catch (error) {
      const mockErrorInfo = { componentStack: 'test stack' };
      const mockReset = jest.fn();
      return fallback(error, mockErrorInfo, mockReset);
    }
  },
}));

// Component that throws an error
function ThrowError() {
  throw new Error('Test error');
}

describe('FeatureErrorBoundary', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('DashboardErrorBoundary', () => {
    it('should render children when no error', () => {
      render(
        <DashboardErrorBoundary>
          <div>Dashboard content</div>
        </DashboardErrorBoundary>
      );

      expect(screen.getByText('Dashboard content')).toBeInTheDocument();
    });

    it('should display feature-specific error message', () => {
      render(
        <DashboardErrorBoundary>
          <ThrowError />
        </DashboardErrorBoundary>
      );

      expect(screen.getByText('Dashboard Unavailable')).toBeInTheDocument();
    });

    it('should show try again button', () => {
      render(
        <DashboardErrorBoundary>
          <ThrowError />
        </DashboardErrorBoundary>
      );

      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    it('should navigate to templates on "Go to Dashboard" click', () => {
      render(
        <DashboardErrorBoundary>
          <ThrowError />
        </DashboardErrorBoundary>
      );

      const dashboardButton = screen.getByText(/Go to Dashboard/);
      fireEvent.click(dashboardButton);

      expect(mockPush).toHaveBeenCalledWith('/templates');
    });
  });

  describe('GenerationErrorBoundary', () => {
    it('should render children when no error', () => {
      render(
        <GenerationErrorBoundary>
          <div>Generation content</div>
        </GenerationErrorBoundary>
      );

      expect(screen.getByText('Generation content')).toBeInTheDocument();
    });

    it('should display generation error message', () => {
      render(
        <GenerationErrorBoundary>
          <ThrowError />
        </GenerationErrorBoundary>
      );

      expect(screen.getByText('Generation Unavailable')).toBeInTheDocument();
    });

    it('should navigate to dashboard on error recovery', () => {
      render(
        <GenerationErrorBoundary>
          <ThrowError />
        </GenerationErrorBoundary>
      );

      const dashboardButton = screen.getByText(/Go to Dashboard/);
      fireEvent.click(dashboardButton);

      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  describe('ExportErrorBoundary', () => {
    it('should render children when no error', () => {
      render(
        <ExportErrorBoundary>
          <div>Export content</div>
        </ExportErrorBoundary>
      );

      expect(screen.getByText('Export content')).toBeInTheDocument();
    });

    it('should display export error message', () => {
      render(
        <ExportErrorBoundary>
          <ThrowError />
        </ExportErrorBoundary>
      );

      expect(screen.getByText('Export Unavailable')).toBeInTheDocument();
    });
  });

  describe('TemplatesErrorBoundary', () => {
    it('should render children when no error', () => {
      render(
        <TemplatesErrorBoundary>
          <div>Templates content</div>
        </TemplatesErrorBoundary>
      );

      expect(screen.getByText('Templates content')).toBeInTheDocument();
    });

    it('should display templates error message', () => {
      render(
        <TemplatesErrorBoundary>
          <ThrowError />
        </TemplatesErrorBoundary>
      );

      expect(screen.getByText('Templates Unavailable')).toBeInTheDocument();
    });
  });

  describe('ReviewQueueErrorBoundary', () => {
    it('should render children when no error', () => {
      render(
        <ReviewQueueErrorBoundary>
          <div>Review queue content</div>
        </ReviewQueueErrorBoundary>
      );

      expect(screen.getByText('Review queue content')).toBeInTheDocument();
    });

    it('should display review queue error message', () => {
      render(
        <ReviewQueueErrorBoundary>
          <ThrowError />
        </ReviewQueueErrorBoundary>
      );

      expect(screen.getByText('Review Queue Unavailable')).toBeInTheDocument();
    });
  });

  describe('SettingsErrorBoundary', () => {
    it('should render children when no error', () => {
      render(
        <SettingsErrorBoundary>
          <div>Settings content</div>
        </SettingsErrorBoundary>
      );

      expect(screen.getByText('Settings content')).toBeInTheDocument();
    });

    it('should display settings error message', () => {
      render(
        <SettingsErrorBoundary>
          <ThrowError />
        </SettingsErrorBoundary>
      );

      expect(screen.getByText('Settings Unavailable')).toBeInTheDocument();
    });
  });

  describe('ModalErrorBoundary', () => {
    it('should render children when no error', () => {
      render(
        <ModalErrorBoundary>
          <div>Modal content</div>
        </ModalErrorBoundary>
      );

      expect(screen.getByText('Modal content')).toBeInTheDocument();
    });

    it('should display modal error message', () => {
      render(
        <ModalErrorBoundary>
          <ThrowError />
        </ModalErrorBoundary>
      );

      expect(screen.getByText('Modal Error')).toBeInTheDocument();
    });

    it('should show close button', () => {
      render(
        <ModalErrorBoundary>
          <ThrowError />
        </ModalErrorBoundary>
      );

      expect(screen.getByText('Close')).toBeInTheDocument();
    });

    it('should call onClose when close button clicked', () => {
      const mockOnClose = jest.fn();

      render(
        <ModalErrorBoundary onClose={mockOnClose}>
          <ThrowError />
        </ModalErrorBoundary>
      );

      const closeButton = screen.getByText('Close');
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should show try again button', () => {
      render(
        <ModalErrorBoundary>
          <ThrowError />
        </ModalErrorBoundary>
      );

      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });
  });

  describe('Development Mode', () => {
    const originalEnv = process.env.NODE_ENV;

    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it('should show error details in development mode', () => {
      render(
        <DashboardErrorBoundary>
          <ThrowError />
        </DashboardErrorBoundary>
      );

      expect(screen.getByText(/Test error/)).toBeInTheDocument();
    });
  });

  describe('Production Mode', () => {
    const originalEnv = process.env.NODE_ENV;

    beforeEach(() => {
      process.env.NODE_ENV = 'production';
    });

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it('should hide error details in production mode', () => {
      render(
        <DashboardErrorBoundary>
          <ThrowError />
        </DashboardErrorBoundary>
      );

      // Should show generic message
      expect(screen.getByText(/This feature encountered an error/)).toBeInTheDocument();
      // Should not show specific error details
      expect(screen.queryByText(/Test error/)).not.toBeInTheDocument();
    });
  });

  describe('Error Isolation', () => {
    it('should isolate errors to feature boundary', () => {
      const { container } = render(
        <div>
          <div>App content</div>
          <DashboardErrorBoundary>
            <ThrowError />
          </DashboardErrorBoundary>
          <div>More app content</div>
        </div>
      );

      // App content should still render
      expect(screen.getByText('App content')).toBeInTheDocument();
      expect(screen.getByText('More app content')).toBeInTheDocument();
      
      // Only dashboard shows error
      expect(screen.getByText('Dashboard Unavailable')).toBeInTheDocument();
    });
  });

  describe('User Guidance', () => {
    it('should provide reassurance that rest of app works', () => {
      render(
        <DashboardErrorBoundary>
          <ThrowError />
        </DashboardErrorBoundary>
      );

      expect(screen.getByText(/the rest of the application is still working/i)).toBeInTheDocument();
    });

    it('should suggest recovery options', () => {
      render(
        <DashboardErrorBoundary>
          <ThrowError />
        </DashboardErrorBoundary>
      );

      expect(screen.getByText(/Try Again/)).toBeInTheDocument();
      expect(screen.getByText(/Go to Dashboard/)).toBeInTheDocument();
    });
  });
});

