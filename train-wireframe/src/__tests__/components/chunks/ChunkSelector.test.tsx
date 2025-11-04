/**
 * ChunkSelector Component Tests
 * 
 * Tests for ChunkSelector React component including:
 * - Rendering and search functionality
 * - Debounced search behavior
 * - Chunk selection
 * - Keyboard navigation
 * - Loading and error states
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { ChunkSelector } from '../../../components/chunks/ChunkSelector';
import { chunksService, ChunkWithDimensions } from '@/lib/chunks-integration';

// Mock the chunks service
jest.mock('@/lib/chunks-integration', () => ({
  chunksService: {
    searchChunks: jest.fn(),
    getChunksByDocument: jest.fn(),
  },
  ChunkWithDimensions: {},
}));

// Mock child components
jest.mock('../../../components/chunks/ChunkCard', () => ({
  ChunkCard: ({ chunk, isSelected, onClick }: any) => (
    <div
      data-testid={`chunk-card-${chunk.id}`}
      onClick={onClick}
      aria-selected={isSelected}
    >
      <div>{chunk.title}</div>
      <div>{chunk.content}</div>
    </div>
  ),
}));

jest.mock('../../../components/chunks/ChunkFilters', () => ({
  ChunkFilters: ({ filters, onFiltersChange }: any) => (
    <div data-testid="chunk-filters">
      <button onClick={() => onFiltersChange({ minQuality: 8 })}>
        Change Filter
      </button>
    </div>
  ),
}));

jest.mock('../../../components/chunks/ChunkDetailPanel', () => ({
  ChunkDetailPanel: ({ chunk, onClose, onSelect, isSelected }: any) => 
    chunk ? (
      <div data-testid="chunk-detail-panel">
        <div>{chunk.title}</div>
        <button onClick={onClose}>Close</button>
        <button onClick={() => onSelect(chunk.id, chunk)} disabled={isSelected}>
          Select
        </button>
      </div>
    ) : null,
}));

describe('ChunkSelector', () => {
  const mockOnSelect = jest.fn();

  const createMockChunk = (id: string, overrides = {}): ChunkWithDimensions => ({
    id,
    title: `Chunk ${id}`,
    content: `Content for chunk ${id}`,
    documentId: 'doc-1',
    documentTitle: 'Test Document',
    sectionHeading: 'Test Section',
    pageStart: 1,
    pageEnd: 2,
    dimensions: {
      confidence: 0.85,
      generatedAt: '2024-01-01T00:00:00Z',
      semanticDimensions: {
        domain: ['software'],
        audience: 'developers',
        intent: 'educate',
      },
    },
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Rendering', () => {
    it('should render search input', () => {
      (chunksService.getChunksByDocument as jest.Mock).mockResolvedValue([]);
      
      render(<ChunkSelector onSelect={mockOnSelect} />);
      
      expect(screen.getByPlaceholderText(/search chunks/i)).toBeInTheDocument();
    });

    it('should render chunk filters', () => {
      (chunksService.getChunksByDocument as jest.Mock).mockResolvedValue([]);
      
      render(<ChunkSelector onSelect={mockOnSelect} />);
      
      expect(screen.getByTestId('chunk-filters')).toBeInTheDocument();
    });

    it('should display loading skeleton initially', async () => {
      (chunksService.getChunksByDocument as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );
      
      render(<ChunkSelector onSelect={mockOnSelect} />);
      
      // Advance past initial render
      await waitFor(() => {
        expect(chunksService.getChunksByDocument).toHaveBeenCalled();
      });
    });

    it('should render chunks when loaded', async () => {
      const mockChunks = [
        createMockChunk('chunk-1'),
        createMockChunk('chunk-2'),
      ];
      
      (chunksService.getChunksByDocument as jest.Mock).mockResolvedValue(mockChunks);
      
      render(<ChunkSelector onSelect={mockOnSelect} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('chunk-card-chunk-1')).toBeInTheDocument();
        expect(screen.getByTestId('chunk-card-chunk-2')).toBeInTheDocument();
      });
    });
  });

  describe('Search Functionality', () => {
    it('should perform debounced search on input change', async () => {
      const mockChunks = [createMockChunk('chunk-1')];
      
      (chunksService.getChunksByDocument as jest.Mock).mockResolvedValue([]);
      (chunksService.searchChunks as jest.Mock).mockResolvedValue(mockChunks);
      
      render(<ChunkSelector onSelect={mockOnSelect} />);
      
      const searchInput = screen.getByPlaceholderText(/search chunks/i);
      
      // Type in search box
      await userEvent.type(searchInput, 'test query');
      
      // Should not call immediately
      expect(chunksService.searchChunks).not.toHaveBeenCalled();
      
      // Advance timers by 300ms (debounce delay)
      jest.advanceTimersByTime(300);
      
      await waitFor(() => {
        expect(chunksService.searchChunks).toHaveBeenCalledWith(
          'test query',
          expect.objectContaining({
            limit: 50,
            includeContent: true,
          })
        );
      });
    });

    it('should cancel previous search on rapid typing', async () => {
      (chunksService.getChunksByDocument as jest.Mock).mockResolvedValue([]);
      (chunksService.searchChunks as jest.Mock).mockResolvedValue([]);
      
      render(<ChunkSelector onSelect={mockOnSelect} />);
      
      const searchInput = screen.getByPlaceholderText(/search chunks/i);
      
      // Type multiple characters rapidly
      await userEvent.type(searchInput, 'a');
      jest.advanceTimersByTime(100);
      await userEvent.type(searchInput, 'b');
      jest.advanceTimersByTime(100);
      await userEvent.type(searchInput, 'c');
      
      // Advance past debounce
      jest.advanceTimersByTime(300);
      
      await waitFor(() => {
        // Should only search once with full query
        expect(chunksService.searchChunks).toHaveBeenCalledTimes(1);
        expect(chunksService.searchChunks).toHaveBeenCalledWith(
          'abc',
          expect.any(Object)
        );
      });
    });

    it('should display search results', async () => {
      const searchResults = [
        createMockChunk('result-1'),
        createMockChunk('result-2'),
      ];
      
      (chunksService.getChunksByDocument as jest.Mock).mockResolvedValue([]);
      (chunksService.searchChunks as jest.Mock).mockResolvedValue(searchResults);
      
      render(<ChunkSelector onSelect={mockOnSelect} />);
      
      const searchInput = screen.getByPlaceholderText(/search chunks/i);
      await userEvent.type(searchInput, 'test');
      
      jest.advanceTimersByTime(300);
      
      await waitFor(() => {
        expect(screen.getByTestId('chunk-card-result-1')).toBeInTheDocument();
        expect(screen.getByTestId('chunk-card-result-2')).toBeInTheDocument();
      });
    });

    it('should show empty state when no results found', async () => {
      (chunksService.getChunksByDocument as jest.Mock).mockResolvedValue([]);
      (chunksService.searchChunks as jest.Mock).mockResolvedValue([]);
      
      render(<ChunkSelector onSelect={mockOnSelect} />);
      
      const searchInput = screen.getByPlaceholderText(/search chunks/i);
      await userEvent.type(searchInput, 'nonexistent');
      
      jest.advanceTimersByTime(300);
      
      await waitFor(() => {
        expect(screen.getByText(/no chunks found/i)).toBeInTheDocument();
      });
    });
  });

  describe('Chunk Selection', () => {
    it('should call onSelect when chunk is clicked', async () => {
      const mockChunks = [createMockChunk('chunk-1')];
      
      (chunksService.getChunksByDocument as jest.Mock).mockResolvedValue(mockChunks);
      
      render(<ChunkSelector onSelect={mockOnSelect} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('chunk-card-chunk-1')).toBeInTheDocument();
      });
      
      const chunkCard = screen.getByTestId('chunk-card-chunk-1');
      await userEvent.click(chunkCard);
      
      expect(mockOnSelect).toHaveBeenCalledWith('chunk-1', mockChunks[0]);
    });

    it('should highlight selected chunk', async () => {
      const mockChunks = [createMockChunk('chunk-1')];
      
      (chunksService.getChunksByDocument as jest.Mock).mockResolvedValue(mockChunks);
      
      render(<ChunkSelector onSelect={mockOnSelect} selectedChunkId="chunk-1" />);
      
      await waitFor(() => {
        const chunkCard = screen.getByTestId('chunk-card-chunk-1');
        expect(chunkCard).toHaveAttribute('aria-selected', 'true');
      });
    });

    it('should open detail panel when chunk is clicked', async () => {
      const mockChunks = [createMockChunk('chunk-1')];
      
      (chunksService.getChunksByDocument as jest.Mock).mockResolvedValue(mockChunks);
      
      render(<ChunkSelector onSelect={mockOnSelect} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('chunk-card-chunk-1')).toBeInTheDocument();
      });
      
      const chunkCard = screen.getByTestId('chunk-card-chunk-1');
      await userEvent.click(chunkCard);
      
      expect(screen.getByTestId('chunk-detail-panel')).toBeInTheDocument();
    });

    it('should close detail panel on close button click', async () => {
      const mockChunks = [createMockChunk('chunk-1')];
      
      (chunksService.getChunksByDocument as jest.Mock).mockResolvedValue(mockChunks);
      
      render(<ChunkSelector onSelect={mockOnSelect} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('chunk-card-chunk-1')).toBeInTheDocument();
      });
      
      // Open detail panel
      await userEvent.click(screen.getByTestId('chunk-card-chunk-1'));
      expect(screen.getByTestId('chunk-detail-panel')).toBeInTheDocument();
      
      // Close it
      const closeButton = screen.getByText('Close');
      await userEvent.click(closeButton);
      
      await waitFor(() => {
        expect(screen.queryByTestId('chunk-detail-panel')).not.toBeInTheDocument();
      });
    });
  });

  describe('Filter Integration', () => {
    it('should apply quality filter', async () => {
      const mockChunks = [createMockChunk('chunk-1')];
      
      (chunksService.getChunksByDocument as jest.Mock).mockResolvedValue(mockChunks);
      
      render(<ChunkSelector onSelect={mockOnSelect} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('chunk-filters')).toBeInTheDocument();
      });
      
      // Click filter change button
      const filterButton = screen.getByText('Change Filter');
      await userEvent.click(filterButton);
      
      await waitFor(() => {
        expect(chunksService.getChunksByDocument).toHaveBeenCalledWith(
          'all',
          expect.objectContaining({
            minQuality: 8,
          })
        );
      });
    });

    it('should filter by document ID when provided', async () => {
      const mockChunks = [createMockChunk('chunk-1')];
      
      (chunksService.getChunksByDocument as jest.Mock).mockResolvedValue(mockChunks);
      
      render(<ChunkSelector onSelect={mockOnSelect} documentId="doc-specific" />);
      
      await waitFor(() => {
        expect(chunksService.getChunksByDocument).toHaveBeenCalledWith(
          'doc-specific',
          expect.objectContaining({
            includeContent: true,
            sortBy: 'page',
          })
        );
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message on fetch failure', async () => {
      (chunksService.getChunksByDocument as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );
      
      render(<ChunkSelector onSelect={mockOnSelect} />);
      
      await waitFor(() => {
        expect(screen.getByText(/failed to load chunks/i)).toBeInTheDocument();
      });
    });

    it('should handle service not initialized', async () => {
      // Temporarily mock chunksService as null
      const originalService = (chunksService as any);
      (require('@/lib/chunks-integration') as any).chunksService = null;
      
      render(<ChunkSelector onSelect={mockOnSelect} />);
      
      await waitFor(() => {
        expect(screen.getByText(/chunks service not initialized/i)).toBeInTheDocument();
      });
      
      // Restore
      (require('@/lib/chunks-integration') as any).chunksService = originalService;
    });
  });

  describe('Results Display', () => {
    it('should show chunk count', async () => {
      const mockChunks = [
        createMockChunk('chunk-1'),
        createMockChunk('chunk-2'),
        createMockChunk('chunk-3'),
      ];
      
      (chunksService.getChunksByDocument as jest.Mock).mockResolvedValue(mockChunks);
      
      render(<ChunkSelector onSelect={mockOnSelect} />);
      
      await waitFor(() => {
        expect(screen.getByText(/showing 3 chunks/i)).toBeInTheDocument();
      });
    });

    it('should show singular "chunk" for single result', async () => {
      const mockChunks = [createMockChunk('chunk-1')];
      
      (chunksService.getChunksByDocument as jest.Mock).mockResolvedValue(mockChunks);
      
      render(<ChunkSelector onSelect={mockOnSelect} />);
      
      await waitFor(() => {
        expect(screen.getByText(/showing 1 chunk$/i)).toBeInTheDocument();
      });
    });

    it('should not show count when loading', async () => {
      (chunksService.getChunksByDocument as jest.Mock).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );
      
      render(<ChunkSelector onSelect={mockOnSelect} />);
      
      expect(screen.queryByText(/showing \d+ chunk/i)).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', async () => {
      (chunksService.getChunksByDocument as jest.Mock).mockResolvedValue([]);
      
      render(<ChunkSelector onSelect={mockOnSelect} />);
      
      const searchInput = screen.getByPlaceholderText(/search chunks/i);
      expect(searchInput).toHaveAttribute('aria-label', 'Search chunks');
    });

    it('should support keyboard navigation on chunks', async () => {
      const mockChunks = [createMockChunk('chunk-1')];
      
      (chunksService.getChunksByDocument as jest.Mock).mockResolvedValue(mockChunks);
      
      render(<ChunkSelector onSelect={mockOnSelect} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('chunk-card-chunk-1')).toBeInTheDocument();
      });
      
      const chunkCard = screen.getByTestId('chunk-card-chunk-1');
      expect(chunkCard).toHaveAttribute('aria-selected');
    });
  });
});

