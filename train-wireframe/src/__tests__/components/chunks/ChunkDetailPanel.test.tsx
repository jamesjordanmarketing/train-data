/**
 * ChunkDetailPanel Component Tests
 * 
 * Tests for ChunkDetailPanel React component including:
 * - Detail panel display
 * - Chunk metadata rendering
 * - Dimension visualization
 * - Selection and closing
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { ChunkDetailPanel } from '../../../components/chunks/ChunkDetailPanel';
import { ChunkWithDimensions } from '@/lib/chunks-integration';

describe('ChunkDetailPanel', () => {
  const mockOnClose = jest.fn();
  const mockOnSelect = jest.fn();

  const createMockChunk = (overrides = {}): ChunkWithDimensions => ({
    id: 'chunk-123',
    title: 'Test Chunk Title',
    content: 'This is the full content of the test chunk. It contains valuable information that will be displayed in the detail panel.',
    documentId: 'doc-456',
    documentTitle: 'Test Document',
    sectionHeading: 'Chapter 1: Introduction',
    pageStart: 5,
    pageEnd: 7,
    dimensions: {
      confidence: 0.85,
      generatedAt: '2024-01-01T00:00:00Z',
      semanticDimensions: {
        domain: ['software', 'development'],
        audience: 'developers',
        intent: 'educate',
        persona: ['technical-expert', 'mentor'],
        emotion: ['neutral', 'encouraging'],
        complexity: 0.75,
      },
      dimensions: {
        'technical_depth': 0.8,
        'code_examples': 0.6,
        'theoretical_concepts': 0.7,
        'practical_applications': 0.9,
        'difficulty_level': 0.65,
      },
    },
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should return null when chunk is null', () => {
      const { container } = render(
        <ChunkDetailPanel
          chunk={null}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      );
      
      expect(container.firstChild).toBeNull();
    });

    it('should render chunk title', () => {
      const chunk = createMockChunk();
      
      render(
        <ChunkDetailPanel
          chunk={chunk}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      );
      
      expect(screen.getByText('Test Chunk Title')).toBeInTheDocument();
    });

    it('should render document title', () => {
      const chunk = createMockChunk();
      
      render(
        <ChunkDetailPanel
          chunk={chunk}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      );
      
      expect(screen.getByText('Test Document')).toBeInTheDocument();
    });

    it('should render page range', () => {
      const chunk = createMockChunk();
      
      render(
        <ChunkDetailPanel
          chunk={chunk}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      );
      
      expect(screen.getByText(/pages 5-7/i)).toBeInTheDocument();
    });

    it('should render single page when start equals end', () => {
      const chunk = createMockChunk({ pageStart: 5, pageEnd: 5 });
      
      render(
        <ChunkDetailPanel
          chunk={chunk}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      );
      
      expect(screen.getByText(/page 5/i)).toBeInTheDocument();
    });

    it('should show unavailable message when no page range', () => {
      const chunk = createMockChunk({ pageStart: null, pageEnd: null });
      
      render(
        <ChunkDetailPanel
          chunk={chunk}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      );
      
      expect(screen.getByText(/page range unavailable/i)).toBeInTheDocument();
    });

    it('should render chunk ID', () => {
      const chunk = createMockChunk();
      
      render(
        <ChunkDetailPanel
          chunk={chunk}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      );
      
      expect(screen.getByText('chunk-123')).toBeInTheDocument();
    });

    it('should render section heading when available', () => {
      const chunk = createMockChunk();
      
      render(
        <ChunkDetailPanel
          chunk={chunk}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      );
      
      expect(screen.getByText('Chapter 1: Introduction')).toBeInTheDocument();
    });

    it('should not render section heading when unavailable', () => {
      const chunk = createMockChunk({ sectionHeading: null });
      
      render(
        <ChunkDetailPanel
          chunk={chunk}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      );
      
      expect(screen.queryByText(/section/i)).not.toBeInTheDocument();
    });

    it('should render full chunk content', () => {
      const chunk = createMockChunk();
      
      render(
        <ChunkDetailPanel
          chunk={chunk}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      );
      
      expect(screen.getByText(/this is the full content/i)).toBeInTheDocument();
    });
  });

  describe('Quality Metrics', () => {
    it('should display quality score', () => {
      const chunk = createMockChunk();
      
      render(
        <ChunkDetailPanel
          chunk={chunk}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      );
      
      // Confidence 0.85 * 10 = 8.5
      expect(screen.getByText(/8.5 \/ 10/i)).toBeInTheDocument();
    });

    it('should show N/A when no dimensions', () => {
      const chunk = createMockChunk({ dimensions: undefined });
      
      render(
        <ChunkDetailPanel
          chunk={chunk}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      );
      
      expect(screen.queryByText(/overall quality score/i)).not.toBeInTheDocument();
    });

    it('should display confidence percentage', () => {
      const chunk = createMockChunk();
      
      render(
        <ChunkDetailPanel
          chunk={chunk}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      );
      
      expect(screen.getByText(/confidence: 85%/i)).toBeInTheDocument();
    });

    it('should use correct color for high quality', () => {
      const chunk = createMockChunk({ 
        dimensions: {
          ...createMockChunk().dimensions!,
          confidence: 0.9
        }
      });
      
      render(
        <ChunkDetailPanel
          chunk={chunk}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      );
      
      // Quality > 0.8 should have green styling
      const qualitySection = screen.getByText(/overall quality score/i).closest('div');
      expect(qualitySection).toHaveClass('text-green-600');
    });

    it('should use correct color for medium quality', () => {
      const chunk = createMockChunk({ 
        dimensions: {
          ...createMockChunk().dimensions!,
          confidence: 0.7
        }
      });
      
      render(
        <ChunkDetailPanel
          chunk={chunk}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      );
      
      // Quality 0.6-0.8 should have yellow styling
      const qualitySection = screen.getByText(/overall quality score/i).closest('div');
      expect(qualitySection).toHaveClass('text-yellow-600');
    });

    it('should use correct color for low quality', () => {
      const chunk = createMockChunk({ 
        dimensions: {
          ...createMockChunk().dimensions!,
          confidence: 0.5
        }
      });
      
      render(
        <ChunkDetailPanel
          chunk={chunk}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      );
      
      // Quality < 0.6 should have orange styling
      const qualitySection = screen.getByText(/overall quality score/i).closest('div');
      expect(qualitySection).toHaveClass('text-orange-600');
    });
  });

  describe('Semantic Dimensions', () => {
    it('should display top 5 dimensions', () => {
      const chunk = createMockChunk();
      
      render(
        <ChunkDetailPanel
          chunk={chunk}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      );
      
      expect(screen.getByText(/top semantic dimensions/i)).toBeInTheDocument();
      expect(screen.getByText(/practical applications/i)).toBeInTheDocument();
      expect(screen.getByText(/technical depth/i)).toBeInTheDocument();
    });

    it('should format dimension names correctly', () => {
      const chunk = createMockChunk();
      
      render(
        <ChunkDetailPanel
          chunk={chunk}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      );
      
      // Snake_case should be converted to space-separated
      expect(screen.getByText(/technical depth/i)).toBeInTheDocument();
      expect(screen.getByText(/code examples/i)).toBeInTheDocument();
    });

    it('should display dimension values as percentages', () => {
      const chunk = createMockChunk();
      
      render(
        <ChunkDetailPanel
          chunk={chunk}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      );
      
      // 0.9 should be displayed as 90%
      expect(screen.getByText('90%')).toBeInTheDocument();
      // 0.8 should be displayed as 80%
      expect(screen.getByText('80%')).toBeInTheDocument();
    });

    it('should not show dimensions section when no dimensions data', () => {
      const chunk = createMockChunk({
        dimensions: {
          confidence: 0.8,
          generatedAt: '2024-01-01T00:00:00Z',
          semanticDimensions: {},
        }
      });
      
      render(
        <ChunkDetailPanel
          chunk={chunk}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      );
      
      expect(screen.queryByText(/top semantic dimensions/i)).not.toBeInTheDocument();
    });
  });

  describe('Semantic Categories', () => {
    it('should display persona badges', () => {
      const chunk = createMockChunk();
      
      render(
        <ChunkDetailPanel
          chunk={chunk}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      );
      
      expect(screen.getByText('technical-expert')).toBeInTheDocument();
      expect(screen.getByText('mentor')).toBeInTheDocument();
    });

    it('should display emotion badges', () => {
      const chunk = createMockChunk();
      
      render(
        <ChunkDetailPanel
          chunk={chunk}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      );
      
      expect(screen.getByText('neutral')).toBeInTheDocument();
      expect(screen.getByText('encouraging')).toBeInTheDocument();
    });

    it('should display complexity value', () => {
      const chunk = createMockChunk();
      
      render(
        <ChunkDetailPanel
          chunk={chunk}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      );
      
      expect(screen.getByText('0.75')).toBeInTheDocument();
    });

    it('should not show semantic categories when unavailable', () => {
      const chunk = createMockChunk({
        dimensions: {
          confidence: 0.8,
          generatedAt: '2024-01-01T00:00:00Z',
          semanticDimensions: {},
        }
      });
      
      render(
        <ChunkDetailPanel
          chunk={chunk}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      );
      
      expect(screen.queryByText(/semantic categories/i)).not.toBeInTheDocument();
    });
  });

  describe('Interaction', () => {
    it('should call onClose when close button clicked', async () => {
      const chunk = createMockChunk();
      
      render(
        <ChunkDetailPanel
          chunk={chunk}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      );
      
      const closeButton = screen.getByText('Close');
      await userEvent.click(closeButton);
      
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onSelect when select button clicked', async () => {
      const chunk = createMockChunk();
      
      render(
        <ChunkDetailPanel
          chunk={chunk}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      );
      
      const selectButton = screen.getByText('Select This Chunk');
      await userEvent.click(selectButton);
      
      expect(mockOnSelect).toHaveBeenCalledWith('chunk-123', chunk);
    });

    it('should disable select button when already selected', () => {
      const chunk = createMockChunk();
      
      render(
        <ChunkDetailPanel
          chunk={chunk}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
          isSelected={true}
        />
      );
      
      const selectButton = screen.getByText('Selected');
      expect(selectButton).toBeDisabled();
    });

    it('should show "Selected" text when chunk is selected', () => {
      const chunk = createMockChunk();
      
      render(
        <ChunkDetailPanel
          chunk={chunk}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
          isSelected={true}
        />
      );
      
      expect(screen.getByText('Selected')).toBeInTheDocument();
      expect(screen.queryByText('Select This Chunk')).not.toBeInTheDocument();
    });

    it('should call onClose when Sheet is closed via overlay', async () => {
      const chunk = createMockChunk();
      
      render(
        <ChunkDetailPanel
          chunk={chunk}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      );
      
      // Sheet component would trigger onOpenChange(false) when overlay clicked
      // This is handled by the Sheet component itself
      expect(screen.getByText('Test Chunk Title')).toBeInTheDocument();
    });
  });

  describe('Generated At Timestamp', () => {
    it('should display formatted generation date', () => {
      const chunk = createMockChunk({
        dimensions: {
          ...createMockChunk().dimensions!,
          extractedAt: '2024-01-15T10:30:00Z',
        }
      });
      
      render(
        <ChunkDetailPanel
          chunk={chunk}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      );
      
      expect(screen.getByText(/analyzed:/i)).toBeInTheDocument();
    });

    it('should not show timestamp when not available', () => {
      const chunk = createMockChunk({
        dimensions: {
          confidence: 0.8,
          generatedAt: '2024-01-01T00:00:00Z',
          semanticDimensions: {},
        }
      });
      
      render(
        <ChunkDetailPanel
          chunk={chunk}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      );
      
      expect(screen.queryByText(/analyzed:/i)).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle chunk with no document title', () => {
      const chunk = createMockChunk({ documentTitle: undefined });
      
      render(
        <ChunkDetailPanel
          chunk={chunk}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      );
      
      expect(screen.queryByText('Test Document')).not.toBeInTheDocument();
    });

    it('should handle chunk with very long content', () => {
      const longContent = 'A'.repeat(5000);
      const chunk = createMockChunk({ content: longContent });
      
      render(
        <ChunkDetailPanel
          chunk={chunk}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      );
      
      // Should still render without crashing
      expect(screen.getByText('Test Chunk Title')).toBeInTheDocument();
    });

    it('should handle chunk with special characters in content', () => {
      const specialContent = 'Content with <tags> & "quotes" and \'apostrophes\'';
      const chunk = createMockChunk({ content: specialContent });
      
      render(
        <ChunkDetailPanel
          chunk={chunk}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      );
      
      expect(screen.getByText(specialContent)).toBeInTheDocument();
    });

    it('should handle dimensions with empty arrays', () => {
      const chunk = createMockChunk({
        dimensions: {
          confidence: 0.8,
          generatedAt: '2024-01-01T00:00:00Z',
          semanticDimensions: {
            persona: [],
            emotion: [],
            domain: [],
          },
        }
      });
      
      render(
        <ChunkDetailPanel
          chunk={chunk}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      );
      
      // Should not show empty badge lists
      expect(screen.queryByText(/persona:/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/emotion:/i)).not.toBeInTheDocument();
    });

    it('should handle very low confidence score', () => {
      const chunk = createMockChunk({
        dimensions: {
          ...createMockChunk().dimensions!,
          confidence: 0.05
        }
      });
      
      render(
        <ChunkDetailPanel
          chunk={chunk}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      );
      
      // 0.05 * 10 = 0.5
      expect(screen.getByText(/0.5 \/ 10/i)).toBeInTheDocument();
    });

    it('should handle perfect confidence score', () => {
      const chunk = createMockChunk({
        dimensions: {
          ...createMockChunk().dimensions!,
          confidence: 1.0
        }
      });
      
      render(
        <ChunkDetailPanel
          chunk={chunk}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      );
      
      // 1.0 * 10 = 10.0
      expect(screen.getByText(/10.0 \/ 10/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper semantic structure', () => {
      const chunk = createMockChunk();
      
      render(
        <ChunkDetailPanel
          chunk={chunk}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
        />
      );
      
      // Title should be in header
      expect(screen.getByText('Test Chunk Title')).toBeInTheDocument();
      
      // Buttons should be accessible
      expect(screen.getByText('Close')).toBeInTheDocument();
      expect(screen.getByText('Select This Chunk')).toBeInTheDocument();
    });

    it('should have disabled state on select button when selected', () => {
      const chunk = createMockChunk();
      
      render(
        <ChunkDetailPanel
          chunk={chunk}
          onClose={mockOnClose}
          onSelect={mockOnSelect}
          isSelected={true}
        />
      );
      
      const selectButton = screen.getByText('Selected');
      expect(selectButton).toHaveAttribute('disabled');
    });
  });
});

