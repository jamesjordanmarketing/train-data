/**
 * ChunkSelector Component
 * 
 * Main component for searching, filtering, and selecting chunks.
 * Features:
 * - Debounced search (300ms)
 * - Document and quality filters
 * - Scrollable chunk list
 * - Detail panel for selected chunks
 * - Keyboard navigation support
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { Skeleton } from '../ui/skeleton';
import { Search, AlertCircle, Inbox } from 'lucide-react';
import { ChunkCard } from './ChunkCard';
import { ChunkFilters, ChunkFilters as ChunkFiltersType } from './ChunkFilters';
import { ChunkDetailPanel } from './ChunkDetailPanel';
import { Alert, AlertDescription } from '../ui/alert';
import { chunksService, ChunkWithDimensions } from '@/lib/chunks-integration';

interface ChunkSelectorProps {
  onSelect: (chunkId: string, chunk: ChunkWithDimensions) => void;
  selectedChunkId?: string;
  documentId?: string; // Optional pre-filter to specific document
  className?: string;
}

/**
 * Loading skeleton for chunk list
 */
function ChunkListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 border-2 rounded-lg space-y-3">
          <div className="flex items-start justify-between">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-5 w-12" />
          </div>
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Empty state when no chunks found
 */
function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <Inbox className="h-16 w-16 text-gray-300 mb-4" />
      <h3 className="text-lg font-semibold text-gray-700 mb-2">No Chunks Found</h3>
      <p className="text-sm text-gray-500 max-w-md">{message}</p>
    </div>
  );
}

/**
 * Error state display
 */
function ErrorState({ message }: { message: string }) {
  return (
    <Alert variant="destructive" className="mt-4">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

export function ChunkSelector({ 
  onSelect, 
  selectedChunkId, 
  documentId,
  className 
}: ChunkSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [chunks, setChunks] = useState<ChunkWithDimensions[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ChunkFiltersType>({
    documentId,
    minQuality: 6
  });
  const [selectedChunk, setSelectedChunk] = useState<ChunkWithDimensions | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  
  // Ref for debounce timeout
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Fetch chunks based on current filters and search query
   */
  const fetchChunks = useCallback(async (query: string, currentFilters: ChunkFiltersType) => {
    if (!chunksService) {
      setError('Chunks service not initialized. Please check environment configuration.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let results: ChunkWithDimensions[] = [];

      if (query.trim().length > 0) {
        // Perform search
        results = await chunksService.searchChunks(query, {
          limit: 50,
          minQuality: currentFilters.minQuality,
          includeContent: true
        });
      } else if (currentFilters.documentId) {
        // Get chunks for specific document
        results = await chunksService.getChunksByDocument(
          currentFilters.documentId,
          {
            limit: 100,
            minQuality: currentFilters.minQuality,
            includeContent: true,
            sortBy: 'page'
          }
        );
      } else {
        // Get all chunks (limited to 100)
        // In production, you might want to implement pagination
        results = await chunksService.getChunksByDocument(
          'all',
          {
            limit: 100,
            minQuality: currentFilters.minQuality,
            includeContent: true
          }
        );
      }

      setChunks(results);
      setFocusedIndex(-1); // Reset focus when results change
    } catch (err) {
      console.error('Error fetching chunks:', err);
      setError('Failed to load chunks. Please try again.');
      setChunks([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Debounced search handler
   */
  const debouncedSearch = useCallback((query: string, currentFilters: ChunkFiltersType) => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      fetchChunks(query, currentFilters);
    }, 300);
  }, [fetchChunks]);

  /**
   * Effect: Initial load
   */
  useEffect(() => {
    fetchChunks('', filters);
  }, []); // Only run on mount

  /**
   * Effect: Handle search query changes
   */
  useEffect(() => {
    debouncedSearch(searchQuery, filters);

    // Cleanup on unmount
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery, debouncedSearch, filters]);

  /**
   * Effect: Handle filter changes
   */
  const handleFiltersChange = (newFilters: ChunkFiltersType) => {
    setFilters(newFilters);
    fetchChunks(searchQuery, newFilters);
  };

  /**
   * Handle chunk selection
   */
  const handleChunkClick = (chunk: ChunkWithDimensions) => {
    setSelectedChunk(chunk);
    onSelect(chunk.id, chunk);
  };

  /**
   * Keyboard navigation
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if chunks are loaded and not in an input
      if (chunks.length === 0 || document.activeElement?.tagName === 'INPUT') {
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex(prev => Math.min(prev + 1, chunks.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          if (focusedIndex >= 0 && focusedIndex < chunks.length) {
            e.preventDefault();
            const chunk = chunks[focusedIndex];
            handleChunkClick(chunk);
          }
          break;
        case 'Escape':
          setSelectedChunk(null);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [chunks, focusedIndex, selectedChunk]);

  return (
    <div className={`flex flex-col h-full ${className || ''}`}>
      {/* Search Input */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search chunks by content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            aria-label="Search chunks"
          />
        </div>
        {searchQuery && (
          <p className="text-xs text-gray-500 mt-1">
            Searching for: "{searchQuery}"
          </p>
        )}
      </div>

      {/* Filters */}
      <ChunkFilters 
        filters={filters} 
        onFiltersChange={handleFiltersChange}
        availableDocuments={[]}
        className="mb-4"
      />

      {/* Error Display */}
      {error && <ErrorState message={error} />}

      {/* Chunk List */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full pr-4">
          {isLoading ? (
            <ChunkListSkeleton count={5} />
          ) : chunks.length > 0 ? (
            <div className="space-y-0">
              {chunks.map((chunk, index) => (
                <div
                  key={chunk.id}
                  className={focusedIndex === index ? 'ring-2 ring-primary rounded-lg' : ''}
                >
                  <ChunkCard
                    chunk={chunk}
                    isSelected={chunk.id === selectedChunkId}
                    onClick={() => handleChunkClick(chunk)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState 
              message={
                searchQuery 
                  ? `No chunks found matching "${searchQuery}". Try adjusting your search or filters.`
                  : 'No chunks available. Try adjusting your filters or check if chunks are loaded in the database.'
              } 
            />
          )}
        </ScrollArea>
      </div>

      {/* Results Count */}
      {!isLoading && chunks.length > 0 && (
        <div className="mt-4 text-sm text-gray-600 text-center">
          Showing {chunks.length} chunk{chunks.length !== 1 ? 's' : ''}
          {searchQuery && ` matching "${searchQuery}"`}
        </div>
      )}

      {/* Detail Panel */}
      <ChunkDetailPanel
        chunk={selectedChunk}
        onClose={() => setSelectedChunk(null)}
        onSelect={handleChunkClick}
        isSelected={selectedChunk?.id === selectedChunkId}
      />
    </div>
  );
}

