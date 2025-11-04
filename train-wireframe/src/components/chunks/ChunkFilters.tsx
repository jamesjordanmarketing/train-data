/**
 * ChunkFilters Component
 * 
 * Provides filtering controls for chunk selection:
 * - Document dropdown filter
 * - Quality score slider
 * - Clear filters button
 */

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { X, Filter } from 'lucide-react';
import { Card } from '../ui/card';

export interface ChunkFilters {
  documentId?: string;
  minQuality?: number;
  categories?: string[];
}

interface ChunkFiltersProps {
  filters: ChunkFilters;
  onFiltersChange: (filters: ChunkFilters) => void;
  availableDocuments?: Array<{ id: string; title: string }>;
  className?: string;
}

export function ChunkFilters({ 
  filters, 
  onFiltersChange, 
  availableDocuments = [],
  className 
}: ChunkFiltersProps) {
  const [localMinQuality, setLocalMinQuality] = useState(filters.minQuality || 6);
  const [showFilters, setShowFilters] = useState(false);

  // Sync local quality state with props
  useEffect(() => {
    if (filters.minQuality !== undefined) {
      setLocalMinQuality(filters.minQuality);
    }
  }, [filters.minQuality]);

  const handleDocumentChange = (value: string) => {
    if (value === 'all') {
      const { documentId, ...rest } = filters;
      onFiltersChange(rest);
    } else {
      onFiltersChange({ ...filters, documentId: value });
    }
  };

  const handleQualityChange = (values: number[]) => {
    const newQuality = values[0];
    setLocalMinQuality(newQuality);
    
    // Update parent immediately
    if (newQuality === 0) {
      const { minQuality, ...rest } = filters;
      onFiltersChange(rest);
    } else {
      onFiltersChange({ ...filters, minQuality: newQuality });
    }
  };

  const handleClearFilters = () => {
    setLocalMinQuality(6);
    onFiltersChange({});
  };

  const hasActiveFilters = 
    filters.documentId || 
    (filters.minQuality !== undefined && filters.minQuality > 0);

  const activeFilterCount = 
    (filters.documentId ? 1 : 0) + 
    (filters.minQuality !== undefined && filters.minQuality > 0 ? 1 : 0);

  return (
    <div className={className}>
      {/* Toggle Button */}
      <div className="flex items-center justify-between mb-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-1 px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
              {activeFilterCount}
            </span>
          )}
        </Button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="gap-2 text-xs"
          >
            <X className="h-3 w-3" />
            Clear All
          </Button>
        )}
      </div>

      {/* Filter Controls */}
      {showFilters && (
        <Card className="p-4 mb-4 space-y-4 bg-muted/30">
          {/* Document Filter */}
          {availableDocuments.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="document-filter" className="text-sm font-semibold">
                Document
              </Label>
              <Select 
                value={filters.documentId || 'all'}
                onValueChange={handleDocumentChange}
              >
                <SelectTrigger id="document-filter" className="w-full">
                  <SelectValue placeholder="All Documents" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Documents</SelectItem>
                  {availableDocuments.map(doc => (
                    <SelectItem key={doc.id} value={doc.id}>
                      {doc.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Quality Score Filter */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="quality-filter" className="text-sm font-semibold">
                Minimum Quality Score
              </Label>
              <span className="text-sm font-mono font-semibold text-primary">
                {localMinQuality.toFixed(1)}
              </span>
            </div>

            <Slider
              id="quality-filter"
              value={[localMinQuality]}
              onValueChange={handleQualityChange}
              min={0}
              max={10}
              step={0.5}
              className="w-full"
            />

            {/* Quality Range Labels */}
            <div className="flex justify-between text-xs text-gray-500">
              <span>0 (Any)</span>
              <span>5 (Medium)</span>
              <span>10 (High)</span>
            </div>

            {/* Quick Quality Presets */}
            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                variant={localMinQuality >= 8 ? "default" : "outline"}
                className="flex-1 text-xs"
                onClick={() => handleQualityChange([8])}
              >
                High (≥8)
              </Button>
              <Button
                size="sm"
                variant={localMinQuality === 6 ? "default" : "outline"}
                className="flex-1 text-xs"
                onClick={() => handleQualityChange([6])}
              >
                Medium (≥6)
              </Button>
              <Button
                size="sm"
                variant={localMinQuality === 0 ? "default" : "outline"}
                className="flex-1 text-xs"
                onClick={() => handleQualityChange([0])}
              >
                Any
              </Button>
            </div>
          </div>

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="pt-3 border-t border-gray-200">
              <div className="text-xs text-gray-600 mb-2">Active Filters:</div>
              <div className="flex flex-wrap gap-2">
                {filters.documentId && (
                  <div className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                    <span>
                      Document: {
                        availableDocuments.find(d => d.id === filters.documentId)?.title || 
                        filters.documentId.slice(0, 8)
                      }
                    </span>
                    <X 
                      className="h-3 w-3 cursor-pointer hover:text-primary/70" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDocumentChange('all');
                      }}
                    />
                  </div>
                )}
                {filters.minQuality !== undefined && filters.minQuality > 0 && (
                  <div className="inline-flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded text-xs">
                    <span>Quality ≥ {filters.minQuality.toFixed(1)}</span>
                    <X 
                      className="h-3 w-3 cursor-pointer hover:text-primary/70" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQualityChange([0]);
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

