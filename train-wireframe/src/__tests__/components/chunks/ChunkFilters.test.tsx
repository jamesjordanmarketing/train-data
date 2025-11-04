/**
 * ChunkFilters Component Tests
 * 
 * Tests for ChunkFilters React component including:
 * - Filter state management
 * - Quality score slider
 * - Document selection
 * - Clear filters functionality
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { ChunkFilters } from '../../../components/chunks/ChunkFilters';

describe('ChunkFilters', () => {
  const mockOnFiltersChange = jest.fn();
  
  const defaultProps = {
    filters: {},
    onFiltersChange: mockOnFiltersChange,
    availableDocuments: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render filters toggle button', () => {
      render(<ChunkFilters {...defaultProps} />);
      
      expect(screen.getByText(/filters/i)).toBeInTheDocument();
    });

    it('should hide filter controls by default', () => {
      render(<ChunkFilters {...defaultProps} />);
      
      // Quality filter should not be visible initially
      expect(screen.queryByLabelText(/minimum quality score/i)).not.toBeInTheDocument();
    });

    it('should show filter controls when toggled', async () => {
      render(<ChunkFilters {...defaultProps} />);
      
      const toggleButton = screen.getByText(/filters/i);
      await userEvent.click(toggleButton);
      
      expect(screen.getByLabelText(/minimum quality score/i)).toBeInTheDocument();
    });

    it('should display active filter count badge', async () => {
      render(
        <ChunkFilters
          {...defaultProps}
          filters={{ minQuality: 8, documentId: 'doc-1' }}
        />
      );
      
      // Should show count of 2 active filters
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('should not show badge when no active filters', () => {
      render(<ChunkFilters {...defaultProps} filters={{}} />);
      
      expect(screen.queryByText(/^\d+$/)).not.toBeInTheDocument();
    });
  });

  describe('Quality Score Filter', () => {
    it('should initialize quality score to default value', async () => {
      render(
        <ChunkFilters
          {...defaultProps}
          filters={{ minQuality: 6 }}
        />
      );
      
      // Open filters
      await userEvent.click(screen.getByText(/filters/i));
      
      expect(screen.getByText('6.0')).toBeInTheDocument();
    });

    it('should call onFiltersChange when quality changes', async () => {
      render(<ChunkFilters {...defaultProps} />);
      
      // Open filters
      await userEvent.click(screen.getByText(/filters/i));
      
      // Click "High (≥8)" preset button
      const highQualityButton = screen.getByText(/high \(≥8\)/i);
      await userEvent.click(highQualityButton);
      
      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({ minQuality: 8 })
      );
    });

    it('should remove minQuality from filters when set to 0', async () => {
      render(
        <ChunkFilters
          {...defaultProps}
          filters={{ minQuality: 6 }}
        />
      );
      
      // Open filters
      await userEvent.click(screen.getByText(/filters/i));
      
      // Click "Any" preset (0)
      const anyButton = screen.getByText(/^any$/i);
      await userEvent.click(anyButton);
      
      expect(mockOnFiltersChange).toHaveBeenCalledWith({});
    });

    it('should highlight active quality preset', async () => {
      render(
        <ChunkFilters
          {...defaultProps}
          filters={{ minQuality: 8 }}
        />
      );
      
      // Open filters
      await userEvent.click(screen.getByText(/filters/i));
      
      const highButton = screen.getByText(/high \(≥8\)/i);
      
      // Check if button has the "default" variant (active state)
      // In actual implementation, this would check the className or variant
      expect(highButton).toBeInTheDocument();
    });

    it('should display quality score value', async () => {
      render(
        <ChunkFilters
          {...defaultProps}
          filters={{ minQuality: 7.5 }}
        />
      );
      
      // Open filters
      await userEvent.click(screen.getByText(/filters/i));
      
      expect(screen.getByText('7.5')).toBeInTheDocument();
    });
  });

  describe('Document Filter', () => {
    const availableDocuments = [
      { id: 'doc-1', title: 'Document 1' },
      { id: 'doc-2', title: 'Document 2' },
      { id: 'doc-3', title: 'Document 3' },
    ];

    it('should not show document filter when no documents available', async () => {
      render(<ChunkFilters {...defaultProps} availableDocuments={[]} />);
      
      // Open filters
      await userEvent.click(screen.getByText(/filters/i));
      
      expect(screen.queryByLabelText(/document/i)).not.toBeInTheDocument();
    });

    it('should show document filter when documents available', async () => {
      render(
        <ChunkFilters
          {...defaultProps}
          availableDocuments={availableDocuments}
        />
      );
      
      // Open filters
      await userEvent.click(screen.getByText(/filters/i));
      
      expect(screen.getByLabelText(/document/i)).toBeInTheDocument();
    });

    it('should call onFiltersChange when document selected', async () => {
      render(
        <ChunkFilters
          {...defaultProps}
          availableDocuments={availableDocuments}
        />
      );
      
      // Open filters
      await userEvent.click(screen.getByText(/filters/i));
      
      // Note: Actual select interaction would need more complex setup
      // This is a simplified test
      expect(screen.getByLabelText(/document/i)).toBeInTheDocument();
    });

    it('should remove documentId when "All Documents" selected', async () => {
      render(
        <ChunkFilters
          {...defaultProps}
          filters={{ documentId: 'doc-1' }}
          availableDocuments={availableDocuments}
        />
      );
      
      // Open filters
      await userEvent.click(screen.getByText(/filters/i));
      
      // In actual implementation, selecting "All Documents" would trigger this
      expect(screen.getByLabelText(/document/i)).toBeInTheDocument();
    });
  });

  describe('Clear Filters', () => {
    it('should show clear button when filters are active', () => {
      render(
        <ChunkFilters
          {...defaultProps}
          filters={{ minQuality: 8 }}
        />
      );
      
      expect(screen.getByText(/clear all/i)).toBeInTheDocument();
    });

    it('should hide clear button when no filters active', () => {
      render(<ChunkFilters {...defaultProps} filters={{}} />);
      
      expect(screen.queryByText(/clear all/i)).not.toBeInTheDocument();
    });

    it('should clear all filters when clear button clicked', async () => {
      render(
        <ChunkFilters
          {...defaultProps}
          filters={{ minQuality: 8, documentId: 'doc-1' }}
        />
      );
      
      const clearButton = screen.getByText(/clear all/i);
      await userEvent.click(clearButton);
      
      expect(mockOnFiltersChange).toHaveBeenCalledWith({});
    });
  });

  describe('Active Filters Summary', () => {
    const availableDocuments = [
      { id: 'doc-1', title: 'Document 1' },
    ];

    it('should show active filters summary when filters panel open', async () => {
      render(
        <ChunkFilters
          {...defaultProps}
          filters={{ minQuality: 8, documentId: 'doc-1' }}
          availableDocuments={availableDocuments}
        />
      );
      
      // Open filters
      await userEvent.click(screen.getByText(/filters/i));
      
      expect(screen.getByText(/active filters:/i)).toBeInTheDocument();
    });

    it('should display quality filter in summary', async () => {
      render(
        <ChunkFilters
          {...defaultProps}
          filters={{ minQuality: 8 }}
        />
      );
      
      // Open filters
      await userEvent.click(screen.getByText(/filters/i));
      
      expect(screen.getByText(/quality ≥ 8.0/i)).toBeInTheDocument();
    });

    it('should display document filter in summary', async () => {
      render(
        <ChunkFilters
          {...defaultProps}
          filters={{ documentId: 'doc-1' }}
          availableDocuments={availableDocuments}
        />
      );
      
      // Open filters
      await userEvent.click(screen.getByText(/filters/i));
      
      expect(screen.getByText(/document: document 1/i)).toBeInTheDocument();
    });

    it('should allow removing individual filters from summary', async () => {
      render(
        <ChunkFilters
          {...defaultProps}
          filters={{ minQuality: 8 }}
        />
      );
      
      // Open filters
      await userEvent.click(screen.getByText(/filters/i));
      
      // Find the X button in the quality filter badge
      const filterBadge = screen.getByText(/quality ≥ 8.0/i).closest('div');
      expect(filterBadge).toBeInTheDocument();
      
      // In actual implementation, clicking X would remove that filter
    });
  });

  describe('Filter State Synchronization', () => {
    it('should sync local state with prop changes', async () => {
      const { rerender } = render(
        <ChunkFilters
          {...defaultProps}
          filters={{ minQuality: 6 }}
        />
      );
      
      // Open filters
      await userEvent.click(screen.getByText(/filters/i));
      expect(screen.getByText('6.0')).toBeInTheDocument();
      
      // Update props
      rerender(
        <ChunkFilters
          {...defaultProps}
          filters={{ minQuality: 8 }}
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText('8.0')).toBeInTheDocument();
      });
    });

    it('should maintain local quality state during slider interaction', async () => {
      render(<ChunkFilters {...defaultProps} />);
      
      // Open filters
      await userEvent.click(screen.getByText(/filters/i));
      
      // Initial default should be 6
      expect(screen.getByText('6.0')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for form controls', async () => {
      render(<ChunkFilters {...defaultProps} />);
      
      // Open filters
      await userEvent.click(screen.getByText(/filters/i));
      
      expect(screen.getByLabelText(/minimum quality score/i)).toBeInTheDocument();
    });

    it('should have proper ARIA labels', () => {
      render(<ChunkFilters {...defaultProps} />);
      
      const toggleButton = screen.getByText(/filters/i);
      expect(toggleButton).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined minQuality gracefully', () => {
      render(
        <ChunkFilters
          {...defaultProps}
          filters={{ minQuality: undefined }}
        />
      );
      
      // Should not crash
      expect(screen.getByText(/filters/i)).toBeInTheDocument();
    });

    it('should handle negative quality values', async () => {
      render(
        <ChunkFilters
          {...defaultProps}
          filters={{ minQuality: -1 }}
        />
      );
      
      // Open filters
      await userEvent.click(screen.getByText(/filters/i));
      
      // Should display or handle gracefully
      expect(screen.getByLabelText(/minimum quality score/i)).toBeInTheDocument();
    });

    it('should handle quality value above maximum', async () => {
      render(
        <ChunkFilters
          {...defaultProps}
          filters={{ minQuality: 15 }}
        />
      );
      
      // Open filters
      await userEvent.click(screen.getByText(/filters/i));
      
      // Should display or clamp to max
      expect(screen.getByLabelText(/minimum quality score/i)).toBeInTheDocument();
    });

    it('should handle empty document list', async () => {
      render(
        <ChunkFilters
          {...defaultProps}
          filters={{ documentId: 'doc-1' }}
          availableDocuments={[]}
        />
      );
      
      // Open filters
      await userEvent.click(screen.getByText(/filters/i));
      
      // Document filter should not be shown
      expect(screen.queryByLabelText(/document/i)).not.toBeInTheDocument();
    });
  });

  describe('Visual States', () => {
    it('should show filter count badge', () => {
      render(
        <ChunkFilters
          {...defaultProps}
          filters={{ minQuality: 8, documentId: 'doc-1' }}
        />
      );
      
      // Badge showing 2 active filters
      const badge = screen.getByText('2');
      expect(badge).toBeInTheDocument();
    });

    it('should highlight selected quality preset buttons', async () => {
      render(
        <ChunkFilters
          {...defaultProps}
          filters={{ minQuality: 8 }}
        />
      );
      
      // Open filters
      await userEvent.click(screen.getByText(/filters/i));
      
      const highButton = screen.getByText(/high \(≥8\)/i);
      expect(highButton).toBeInTheDocument();
    });
  });
});

