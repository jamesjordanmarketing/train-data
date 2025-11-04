/**
 * RateLimitToast Component Tests
 * 
 * Tests for rate limit toast component:
 * - Countdown timer functionality
 * - Retry button appearance
 * - Time formatting
 * - Accessibility
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RateLimitToast } from '../RateLimitToast';

describe('RateLimitToast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render with initial countdown', () => {
    render(<RateLimitToast retryAfterSeconds={30} />);

    expect(screen.getByText('Rate Limit Exceeded')).toBeInTheDocument();
    expect(screen.getByText(/too many requests/i)).toBeInTheDocument();
    expect(screen.getByText(/retry available in 30s/i)).toBeInTheDocument();
  });

  it('should format seconds correctly', () => {
    render(<RateLimitToast retryAfterSeconds={45} />);
    expect(screen.getByText(/retry available in 45s/i)).toBeInTheDocument();
  });

  it('should format minutes and seconds correctly', () => {
    render(<RateLimitToast retryAfterSeconds={90} />);
    expect(screen.getByText(/retry available in 1m 30s/i)).toBeInTheDocument();
  });

  it('should count down every second', async () => {
    render(<RateLimitToast retryAfterSeconds={3} />);

    expect(screen.getByText(/retry available in 3s/i)).toBeInTheDocument();

    // Advance 1 second
    vi.advanceTimersByTime(1000);
    await waitFor(() => {
      expect(screen.getByText(/retry available in 2s/i)).toBeInTheDocument();
    });

    // Advance 1 second
    vi.advanceTimersByTime(1000);
    await waitFor(() => {
      expect(screen.getByText(/retry available in 1s/i)).toBeInTheDocument();
    });
  });

  it('should show retry button when countdown reaches zero', async () => {
    const handleRetry = vi.fn();
    render(<RateLimitToast retryAfterSeconds={2} onRetry={handleRetry} />);

    // Initially no retry button
    expect(screen.queryByRole('button', { name: /retry now/i })).not.toBeInTheDocument();

    // Advance to zero
    vi.advanceTimersByTime(2000);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /retry now/i })).toBeInTheDocument();
    });
  });

  it('should not show retry button if onRetry not provided', async () => {
    render(<RateLimitToast retryAfterSeconds={1} />);

    // Advance to zero
    vi.advanceTimersByTime(1000);

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /retry now/i })).not.toBeInTheDocument();
    });
  });

  it('should call onRetry when retry button clicked', async () => {
    const user = userEvent.setup({ delay: null });
    const handleRetry = vi.fn();
    render(<RateLimitToast retryAfterSeconds={1} onRetry={handleRetry} />);

    // Advance to zero
    vi.advanceTimersByTime(1000);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /retry now/i })).toBeInTheDocument();
    });

    const retryButton = screen.getByRole('button', { name: /retry now/i });
    await user.click(retryButton);

    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it('should have proper ARIA labels', () => {
    render(<RateLimitToast retryAfterSeconds={30} />);

    const container = screen.getByRole('alert');
    expect(container).toHaveAttribute('aria-live', 'polite');
    expect(container).toHaveAttribute('aria-atomic', 'true');
  });

  it('should stop counting at zero', async () => {
    render(<RateLimitToast retryAfterSeconds={1} />);

    // Advance past zero
    vi.advanceTimersByTime(5000);

    await waitFor(() => {
      // Should not show negative time
      expect(screen.queryByText(/-/)).not.toBeInTheDocument();
    });
  });

  it('should display animated clock icon', () => {
    const { container } = render(<RateLimitToast retryAfterSeconds={30} />);
    
    // Check for animated clock (uses animate-pulse class)
    const animatedClock = container.querySelector('.animate-pulse');
    expect(animatedClock).toBeInTheDocument();
  });
});

