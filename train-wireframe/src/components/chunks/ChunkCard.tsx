/**
 * ChunkCard Component
 * 
 * Displays a single chunk in the chunk selector list.
 * Shows title, content snippet, metadata, and selection state.
 */

import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { FileText, BookOpen, Hash } from 'lucide-react';
import { cn } from '../../lib/utils';
import { ChunkWithDimensions } from '@/lib/chunks-integration';

interface ChunkCardProps {
  chunk: ChunkWithDimensions;
  isSelected: boolean;
  onClick: () => void;
}

/**
 * Get quality badge variant based on confidence score
 */
function getQualityVariant(confidence?: number): "default" | "secondary" | "destructive" | "outline" {
  if (!confidence) return "secondary";
  if (confidence >= 0.8) return "default";
  if (confidence >= 0.6) return "secondary";
  return "outline";
}

/**
 * Truncate content to a specific length with ellipsis
 */
function truncateContent(content: string, maxLength: number = 150): string {
  if (content.length <= maxLength) return content;
  return content.slice(0, maxLength).trim() + '...';
}

export function ChunkCard({ chunk, isSelected, onClick }: ChunkCardProps) {
  const qualityScore = chunk.dimensions?.confidence 
    ? (chunk.dimensions.confidence * 10).toFixed(1) 
    : 'N/A';
  
  const pageRange = chunk.pageStart && chunk.pageEnd
    ? chunk.pageStart === chunk.pageEnd
      ? `p.${chunk.pageStart}`
      : `pp.${chunk.pageStart}-${chunk.pageEnd}`
    : undefined;

  return (
    <Card
      className={cn(
        'p-4 mb-3 cursor-pointer transition-all hover:shadow-md',
        'border-2',
        isSelected
          ? 'bg-primary/10 border-primary shadow-sm'
          : 'bg-white border-gray-200 hover:bg-muted/50'
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      aria-selected={isSelected}
    >
      {/* Header with title and quality badge */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-gray-900 truncate">
            {chunk.title}
          </h3>
          {chunk.sectionHeading && (
            <p className="text-xs text-gray-500 mt-0.5 truncate">
              {chunk.sectionHeading}
            </p>
          )}
        </div>
        
        {chunk.dimensions && (
          <Badge 
            variant={getQualityVariant(chunk.dimensions.confidence)}
            className="shrink-0 text-xs"
          >
            Q: {qualityScore}
          </Badge>
        )}
      </div>

      {/* Content Snippet */}
      <p className="text-sm text-gray-700 leading-relaxed mb-3 line-clamp-3">
        {truncateContent(chunk.content)}
      </p>

      {/* Metadata Footer */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
        {/* Document Title */}
        {chunk.documentTitle && (
          <div className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            <span className="truncate max-w-[200px]">{chunk.documentTitle}</span>
          </div>
        )}

        {/* Page Range */}
        {pageRange && (
          <div className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            <span>{pageRange}</span>
          </div>
        )}

        {/* Chunk ID Badge */}
        <div className="flex items-center gap-1 ml-auto">
          <Hash className="h-3 w-3" />
          <span className="font-mono text-xs">{chunk.id.slice(0, 8)}</span>
        </div>
      </div>

      {/* Selection Indicator */}
      {isSelected && (
        <div className="mt-3 pt-3 border-t border-primary/20">
          <div className="flex items-center gap-2 text-xs font-medium text-primary">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Selected
          </div>
        </div>
      )}
    </Card>
  );
}

