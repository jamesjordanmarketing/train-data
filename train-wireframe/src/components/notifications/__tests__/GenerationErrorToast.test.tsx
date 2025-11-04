/**
 * GenerationErrorToast Component Tests
 * 
 * Tests for generation error toast component:
 * - Rendering error message
 * - Error code display
 * - View details link
 * - Accessibility
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GenerationErrorToast } from '../GenerationErrorToast';

describe('GenerationErrorToast', () => {
  it('should render error message', () => {
    render(<GenerationErrorToast message="Failed to generate conversation" />);

    expect(screen.getByText('Generation Failed')).toBeInTheDocument();
    expect(screen.getByText('Failed to generate conversation')).toBeInTheDocument();
  });

  it('should render error code when provided', () => {
    render(
      <GenerationErrorToast
        message="Token limit exceeded"
        errorCode="ERR_GEN_TOKEN_LIMIT"
      />
    );

    expect(screen.getByText('Error Code: ERR_GEN_TOKEN_LIMIT')).toBeInTheDocument();
  });

  it('should not render error code when not provided', () => {
    const { container } = render(
      <GenerationErrorToast message="Generation failed" />
    );

    expect(container.textContent).not.toContain('Error Code:');
  });

  it('should render view details link when onViewDetails provided', () => {
    const handleViewDetails = vi.fn();
    render(
      <GenerationErrorToast
        message="Generation failed"
        onViewDetails={handleViewDetails}
      />
    );

    expect(screen.getByRole('button', { name: /view detailed error information/i })).toBeInTheDocument();
  });

  it('should not render view details link when onViewDetails not provided', () => {
    render(<GenerationErrorToast message="Generation failed" />);

    expect(screen.queryByRole('button', { name: /view detailed error information/i })).not.toBeInTheDocument();
  });

  it('should call onViewDetails when link clicked', async () => {
    const user = userEvent.setup();
    const handleViewDetails = vi.fn();
    render(
      <GenerationErrorToast
        message="Generation failed"
        onViewDetails={handleViewDetails}
      />
    );

    const viewDetailsLink = screen.getByRole('button', { name: /view detailed error information/i });
    await user.click(viewDetailsLink);

    expect(handleViewDetails).toHaveBeenCalledTimes(1);
  });

  it('should render both error code and view details link', () => {
    const handleViewDetails = vi.fn();
    render(
      <GenerationErrorToast
        message="Generation failed"
        errorCode="ERR_GEN_TOKEN_LIMIT"
        onViewDetails={handleViewDetails}
      />
    );

    expect(screen.getByText('Error Code: ERR_GEN_TOKEN_LIMIT')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /view detailed error information/i })).toBeInTheDocument();
  });

  it('should have proper ARIA labels', () => {
    render(<GenerationErrorToast message="Test error" />);

    const container = screen.getByRole('alert');
    expect(container).toHaveAttribute('aria-live', 'assertive');
    expect(container).toHaveAttribute('aria-atomic', 'true');
  });

  it('should display lightning bolt icon', () => {
    const { container } = render(<GenerationErrorToast message="Test error" />);
    
    // Check for zap icon
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('should handle long error messages', () => {
    const longMessage = 'A'.repeat(150);
    render(<GenerationErrorToast message={longMessage} />);

    expect(screen.getByText(longMessage)).toBeInTheDocument();
  });
});

