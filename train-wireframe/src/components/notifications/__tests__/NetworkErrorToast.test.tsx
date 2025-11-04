/**
 * NetworkErrorToast Component Tests
 * 
 * Tests for network error toast component:
 * - Rendering error message
 * - Retry button functionality
 * - Accessibility
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NetworkErrorToast } from '../NetworkErrorToast';

describe('NetworkErrorToast', () => {
  it('should render error message', () => {
    render(<NetworkErrorToast message="Failed to connect to server" />);

    expect(screen.getByText('Network Error')).toBeInTheDocument();
    expect(screen.getByText('Failed to connect to server')).toBeInTheDocument();
  });

  it('should render retry button when onRetry provided', () => {
    const handleRetry = vi.fn();
    render(<NetworkErrorToast message="Connection timeout" onRetry={handleRetry} />);

    expect(screen.getByRole('button', { name: /retry request/i })).toBeInTheDocument();
  });

  it('should not render retry button when onRetry not provided', () => {
    render(<NetworkErrorToast message="Connection timeout" />);

    expect(screen.queryByRole('button', { name: /retry request/i })).not.toBeInTheDocument();
  });

  it('should call onRetry when retry button clicked', async () => {
    const user = userEvent.setup();
    const handleRetry = vi.fn();
    render(<NetworkErrorToast message="Connection timeout" onRetry={handleRetry} />);

    const retryButton = screen.getByRole('button', { name: /retry request/i });
    await user.click(retryButton);

    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it('should have proper ARIA labels', () => {
    render(<NetworkErrorToast message="Test error" />);

    const container = screen.getByRole('alert');
    expect(container).toHaveAttribute('aria-live', 'assertive');
    expect(container).toHaveAttribute('aria-atomic', 'true');
  });

  it('should display wifi off icon', () => {
    const { container } = render(<NetworkErrorToast message="Test error" />);
    
    // Check for wifi off icon (lucide-react renders as svg)
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('should handle long error messages', () => {
    const longMessage = 'A'.repeat(200);
    render(<NetworkErrorToast message={longMessage} />);

    expect(screen.getByText(longMessage)).toBeInTheDocument();
  });
});

