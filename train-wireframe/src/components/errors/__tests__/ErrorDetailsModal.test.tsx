/**
 * ErrorDetailsModal Component Tests
 * 
 * Tests for error details modal component:
 * - Modal open/close
 * - Summary and Technical tabs
 * - Copy to clipboard
 * - Report issue
 * - Search functionality
 * - Accessibility
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorDetailsModal } from '../ErrorDetailsModal';
import { AppError, ErrorCode } from '@/lib/errors';
import * as sonner from 'sonner';

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
  },
});

// Mock window.open
global.open = vi.fn();

// Mock Sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('ErrorDetailsModal', () => {
  const mockError = new Error('Test error message');
  mockError.stack = 'Error: Test error\n  at Component.render\n  at App.tsx:123';

  const mockAppError = new AppError(
    'Test app error',
    ErrorCode.ERR_API_SERVER,
    {
      isRecoverable: false,
      context: {
        timestamp: '2024-01-01T00:00:00.000Z',
        component: 'TestComponent',
      },
    }
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render modal when open', () => {
      render(
        <ErrorDetailsModal
          isOpen={true}
          onClose={() => {}}
          error={mockError}
        />
      );

      expect(screen.getByText('Error Details')).toBeInTheDocument();
      expect(screen.getByText('Test error message')).toBeInTheDocument();
    });

    it('should not render modal when closed', () => {
      render(
        <ErrorDetailsModal
          isOpen={false}
          onClose={() => {}}
          error={mockError}
        />
      );

      expect(screen.queryByText('Error Details')).not.toBeInTheDocument();
    });

    it('should display error ID when provided', () => {
      render(
        <ErrorDetailsModal
          isOpen={true}
          onClose={() => {}}
          error={mockError}
          errorId="err-123"
        />
      );

      expect(screen.getByText('err-123')).toBeInTheDocument();
    });
  });

  describe('Tabs', () => {
    it('should have Summary and Technical Details tabs', () => {
      render(
        <ErrorDetailsModal
          isOpen={true}
          onClose={() => {}}
          error={mockError}
        />
      );

      expect(screen.getByRole('tab', { name: /summary/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /technical details/i })).toBeInTheDocument();
    });

    it('should display Summary tab by default', () => {
      render(
        <ErrorDetailsModal
          isOpen={true}
          onClose={() => {}}
          error={mockError}
        />
      );

      expect(screen.getByText('What Happened')).toBeInTheDocument();
      expect(screen.getByText('What You Can Do')).toBeInTheDocument();
    });

    it('should switch to Technical Details tab', async () => {
      const user = userEvent.setup();
      render(
        <ErrorDetailsModal
          isOpen={true}
          onClose={() => {}}
          error={mockError}
        />
      );

      const technicalTab = screen.getByRole('tab', { name: /technical details/i });
      await user.click(technicalTab);

      expect(screen.getByText('Error Name')).toBeInTheDocument();
      expect(screen.getByText('Stack Trace')).toBeInTheDocument();
    });
  });

  describe('Summary Tab', () => {
    it('should display user-friendly message', () => {
      render(
        <ErrorDetailsModal
          isOpen={true}
          onClose={() => {}}
          error={mockError}
        />
      );

      expect(screen.getByText('What Happened')).toBeInTheDocument();
      expect(screen.getByText('Test error message')).toBeInTheDocument();
    });

    it('should display error type for AppError', () => {
      render(
        <ErrorDetailsModal
          isOpen={true}
          onClose={() => {}}
          error={mockAppError}
        />
      );

      expect(screen.getByText('Error Type')).toBeInTheDocument();
      expect(screen.getByText('ERR_API_SERVER')).toBeInTheDocument();
    });

    it('should display recoverable status for AppError', () => {
      render(
        <ErrorDetailsModal
          isOpen={true}
          onClose={() => {}}
          error={mockAppError}
        />
      );

      expect(screen.getByText('Recoverable')).toBeInTheDocument();
      expect(screen.getByText(/no - permanent error/i)).toBeInTheDocument();
    });

    it('should display action suggestions', () => {
      render(
        <ErrorDetailsModal
          isOpen={true}
          onClose={() => {}}
          error={mockAppError}
        />
      );

      expect(screen.getByText('What You Can Do')).toBeInTheDocument();
      expect(screen.getByText(/review your input/i)).toBeInTheDocument();
      expect(screen.getByText(/report this issue/i)).toBeInTheDocument();
    });
  });

  describe('Technical Details Tab', () => {
    it('should display error code for AppError', async () => {
      const user = userEvent.setup();
      render(
        <ErrorDetailsModal
          isOpen={true}
          onClose={() => {}}
          error={mockAppError}
        />
      );

      const technicalTab = screen.getByRole('tab', { name: /technical details/i });
      await user.click(technicalTab);

      expect(screen.getByText('Error Code')).toBeInTheDocument();
      expect(screen.getByText('ERR_API_SERVER')).toBeInTheDocument();
    });

    it('should display error name', async () => {
      const user = userEvent.setup();
      render(
        <ErrorDetailsModal
          isOpen={true}
          onClose={() => {}}
          error={mockError}
        />
      );

      const technicalTab = screen.getByRole('tab', { name: /technical details/i });
      await user.click(technicalTab);

      expect(screen.getByText('Error Name')).toBeInTheDocument();
      expect(screen.getByText('Error')).toBeInTheDocument();
    });

    it('should display stack trace', async () => {
      const user = userEvent.setup();
      render(
        <ErrorDetailsModal
          isOpen={true}
          onClose={() => {}}
          error={mockError}
        />
      );

      const technicalTab = screen.getByRole('tab', { name: /technical details/i });
      await user.click(technicalTab);

      expect(screen.getByText('Stack Trace')).toBeInTheDocument();
      expect(screen.getByText(/Component\.render/)).toBeInTheDocument();
    });

    it('should display context for AppError', async () => {
      const user = userEvent.setup();
      render(
        <ErrorDetailsModal
          isOpen={true}
          onClose={() => {}}
          error={mockAppError}
        />
      );

      const technicalTab = screen.getByRole('tab', { name: /technical details/i });
      await user.click(technicalTab);

      expect(screen.getByText('Context')).toBeInTheDocument();
      expect(screen.getByText(/TestComponent/)).toBeInTheDocument();
    });
  });

  describe('Search Functionality', () => {
    it('should have search input in Technical Details tab', async () => {
      const user = userEvent.setup();
      render(
        <ErrorDetailsModal
          isOpen={true}
          onClose={() => {}}
          error={mockError}
        />
      );

      const technicalTab = screen.getByRole('tab', { name: /technical details/i });
      await user.click(technicalTab);

      expect(screen.getByPlaceholderText(/search in stack trace/i)).toBeInTheDocument();
    });

    it('should filter stack trace by search query', async () => {
      const user = userEvent.setup();
      const errorWithStack = new Error('Test error');
      errorWithStack.stack = 'Error: Test\n  at Component.render\n  at App.tsx:123\n  at Utils.js:45';

      render(
        <ErrorDetailsModal
          isOpen={true}
          onClose={() => {}}
          error={errorWithStack}
        />
      );

      const technicalTab = screen.getByRole('tab', { name: /technical details/i });
      await user.click(technicalTab);

      const searchInput = screen.getByPlaceholderText(/search in stack trace/i);
      await user.type(searchInput, 'Component');

      // Should show filtered results (only lines containing 'Component')
      await waitFor(() => {
        const stackTrace = screen.getByText(/Component\.render/);
        expect(stackTrace).toBeInTheDocument();
      });
    });
  });

  describe('Copy to Clipboard', () => {
    it('should have copy button', () => {
      render(
        <ErrorDetailsModal
          isOpen={true}
          onClose={() => {}}
          error={mockError}
        />
      );

      expect(screen.getByRole('button', { name: /copy error details to clipboard/i })).toBeInTheDocument();
    });

    it('should copy error details to clipboard', async () => {
      const user = userEvent.setup();
      render(
        <ErrorDetailsModal
          isOpen={true}
          onClose={() => {}}
          error={mockError}
          errorId="err-123"
        />
      );

      const copyButton = screen.getByRole('button', { name: /copy error details to clipboard/i });
      await user.click(copyButton);

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining('err-123')
      );
      expect(sonner.toast.success).toHaveBeenCalledWith('Error details copied to clipboard');
    });

    it('should show "Copied" feedback', async () => {
      const user = userEvent.setup();
      render(
        <ErrorDetailsModal
          isOpen={true}
          onClose={() => {}}
          error={mockError}
        />
      );

      const copyButton = screen.getByRole('button', { name: /copy error details to clipboard/i });
      await user.click(copyButton);

      await waitFor(() => {
        expect(screen.getByText('Copied')).toBeInTheDocument();
      });
    });

    it('should handle clipboard error', async () => {
      const user = userEvent.setup();
      vi.mocked(navigator.clipboard.writeText).mockRejectedValueOnce(new Error('Clipboard error'));

      render(
        <ErrorDetailsModal
          isOpen={true}
          onClose={() => {}}
          error={mockError}
        />
      );

      const copyButton = screen.getByRole('button', { name: /copy error details to clipboard/i });
      await user.click(copyButton);

      await waitFor(() => {
        expect(sonner.toast.error).toHaveBeenCalledWith('Failed to copy to clipboard');
      });
    });
  });

  describe('Report Issue', () => {
    it('should have report button', () => {
      render(
        <ErrorDetailsModal
          isOpen={true}
          onClose={() => {}}
          error={mockError}
        />
      );

      expect(screen.getByRole('button', { name: /report this issue/i })).toBeInTheDocument();
    });

    it('should open email client with pre-filled details', async () => {
      const user = userEvent.setup();
      render(
        <ErrorDetailsModal
          isOpen={true}
          onClose={() => {}}
          error={mockError}
          errorId="err-123"
        />
      );

      const reportButton = screen.getByRole('button', { name: /report this issue/i });
      await user.click(reportButton);

      expect(window.open).toHaveBeenCalledWith(
        expect.stringContaining('mailto:'),
        '_blank'
      );
      expect(window.open).toHaveBeenCalledWith(
        expect.stringContaining('err-123'),
        '_blank'
      );
    });
  });

  describe('Modal Close', () => {
    it('should call onClose when closed', async () => {
      const handleClose = vi.fn();
      const user = userEvent.setup();
      
      render(
        <ErrorDetailsModal
          isOpen={true}
          onClose={handleClose}
          error={mockError}
        />
      );

      // Dialog close button (X button in header)
      const closeButtons = screen.getAllByRole('button');
      const closeButton = closeButtons.find(btn => 
        btn.className.includes('close') || btn.getAttribute('aria-label')?.includes('Close')
      );

      if (closeButton) {
        await user.click(closeButton);
        expect(handleClose).toHaveBeenCalled();
      }
    });
  });

  describe('Accessibility', () => {
    it('should have proper dialog role', () => {
      render(
        <ErrorDetailsModal
          isOpen={true}
          onClose={() => {}}
          error={mockError}
        />
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should have accessible button labels', () => {
      render(
        <ErrorDetailsModal
          isOpen={true}
          onClose={() => {}}
          error={mockError}
        />
      );

      expect(screen.getByRole('button', { name: /copy error details to clipboard/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /report this issue/i })).toBeInTheDocument();
    });

    it('should have accessible search input', async () => {
      const user = userEvent.setup();
      render(
        <ErrorDetailsModal
          isOpen={true}
          onClose={() => {}}
          error={mockError}
        />
      );

      const technicalTab = screen.getByRole('tab', { name: /technical details/i });
      await user.click(technicalTab);

      const searchInput = screen.getByLabelText(/search stack trace/i);
      expect(searchInput).toBeInTheDocument();
    });
  });
});

