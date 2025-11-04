/**
 * ChunkDetailPanel Component
 * 
 * Displays detailed information about a selected chunk in a Sheet modal:
 * - Full chunk content (scrollable)
 * - Document metadata
 * - Dimension visualization
 * - Quality score
 * - Select button
 */

import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Progress } from '../ui/progress';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '../ui/sheet';
import { 
  BookOpen, 
  FileText, 
  Hash, 
  BarChart3, 
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { ChunkWithDimensions } from '@/lib/chunks-integration';

interface ChunkDetailPanelProps {
  chunk: ChunkWithDimensions | null;
  onClose: () => void;
  onSelect: (chunkId: string, chunk: ChunkWithDimensions) => void;
  isSelected?: boolean;
}

/**
 * Get quality badge color based on confidence score
 */
function getQualityColor(confidence: number): string {
  if (confidence >= 0.8) return 'text-green-600 bg-green-50';
  if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-50';
  return 'text-orange-600 bg-orange-50';
}

/**
 * Format dimension value as percentage
 */
function formatDimensionValue(value: number): string {
  return `${(value * 100).toFixed(0)}%`;
}

export function ChunkDetailPanel({ 
  chunk, 
  onClose, 
  onSelect,
  isSelected = false 
}: ChunkDetailPanelProps) {
  if (!chunk) return null;

  const qualityScore = chunk.dimensions?.confidence 
    ? (chunk.dimensions.confidence * 10).toFixed(1) 
    : 'N/A';

  const pageRange = chunk.pageStart && chunk.pageEnd
    ? chunk.pageStart === chunk.pageEnd
      ? `Page ${chunk.pageStart}`
      : `Pages ${chunk.pageStart}-${chunk.pageEnd}`
    : 'Page range unavailable';

  // Get top 5 dimensions if available
  const topDimensions = chunk.dimensions?.dimensions 
    ? Object.entries(chunk.dimensions.dimensions)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
    : [];

  return (
    <Sheet open={!!chunk} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="space-y-3">
          <SheetTitle className="text-xl">{chunk.title}</SheetTitle>
          <SheetDescription className="flex flex-col gap-2">
            {/* Document Info */}
            {chunk.documentTitle && (
              <div className="flex items-center gap-2 text-sm">
                <BookOpen className="h-4 w-4" />
                <span className="font-medium">{chunk.documentTitle}</span>
              </div>
            )}
            
            {/* Page Range */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FileText className="h-4 w-4" />
              <span>{pageRange}</span>
            </div>

            {/* Chunk ID */}
            <div className="flex items-center gap-2 text-xs text-gray-500 font-mono">
              <Hash className="h-3 w-3" />
              <span>{chunk.id}</span>
            </div>
          </SheetDescription>
        </SheetHeader>

        <Separator className="my-4" />

        {/* Content Section */}
        <div className="space-y-4">
          {/* Section Heading */}
          {chunk.sectionHeading && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-1">Section</h4>
              <p className="text-sm text-gray-600 italic">{chunk.sectionHeading}</p>
            </div>
          )}

          {/* Content */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Content</h4>
            <ScrollArea className="h-64 w-full rounded border bg-gray-50 p-4">
              <p className="text-sm leading-relaxed text-gray-800 whitespace-pre-wrap">
                {chunk.content}
              </p>
            </ScrollArea>
          </div>

          {/* Quality Score */}
          {chunk.dimensions && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Quality Metrics</h4>
              <div className={`p-4 rounded-lg border-2 ${getQualityColor(chunk.dimensions.confidence)}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Overall Quality Score</span>
                  <Badge 
                    variant="outline" 
                    className="text-lg font-bold px-3 py-1"
                  >
                    {qualityScore} / 10
                  </Badge>
                </div>
                <Progress 
                  value={chunk.dimensions.confidence * 100} 
                  className="h-2"
                />
                <p className="text-xs text-gray-600 mt-2">
                  Confidence: {formatDimensionValue(chunk.dimensions.confidence)}
                </p>
              </div>
            </div>
          )}

          {/* Semantic Dimensions */}
          {topDimensions.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="h-4 w-4 text-gray-700" />
                <h4 className="text-sm font-semibold text-gray-700">
                  Top Semantic Dimensions
                </h4>
              </div>
              
              <div className="space-y-3">
                {topDimensions.map(([name, value]) => (
                  <div key={name} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700 capitalize">
                        {name.replace(/_/g, ' ')}
                      </span>
                      <span className="text-gray-600 font-mono text-xs">
                        {formatDimensionValue(value)}
                      </span>
                    </div>
                    <Progress value={value * 100} className="h-1.5" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Semantic Categories */}
          {chunk.dimensions?.semanticDimensions && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">
                Semantic Categories
              </h4>
              <div className="space-y-2">
                {chunk.dimensions.semanticDimensions.persona && (
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Persona:</p>
                    <div className="flex flex-wrap gap-1">
                      {chunk.dimensions.semanticDimensions.persona.map(p => (
                        <Badge key={p} variant="secondary" className="text-xs">
                          {p}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {chunk.dimensions.semanticDimensions.emotion && (
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Emotion:</p>
                    <div className="flex flex-wrap gap-1">
                      {chunk.dimensions.semanticDimensions.emotion.map(e => (
                        <Badge key={e} variant="secondary" className="text-xs">
                          {e}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {chunk.dimensions.semanticDimensions.complexity !== undefined && (
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Complexity:</p>
                    <Badge variant="outline" className="text-xs">
                      {chunk.dimensions.semanticDimensions.complexity.toFixed(2)}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Extracted At */}
          {chunk.dimensions?.extractedAt && (
            <div className="text-xs text-gray-500 flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              <span>
                Analyzed: {new Date(chunk.dimensions.extractedAt).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        <SheetFooter className="mt-6 flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Close
          </Button>
          <Button
            onClick={() => onSelect(chunk.id, chunk)}
            disabled={isSelected}
            className="w-full sm:w-auto gap-2"
          >
            {isSelected ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Selected
              </>
            ) : (
              'Select This Chunk'
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

