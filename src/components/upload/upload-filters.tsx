'use client';

import React from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../ui/select';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Search, X, Filter } from 'lucide-react';
import { Badge } from '../ui/badge';

export interface UploadFilters {
  status: string;
  fileType: string;
  dateRange: string;
  searchQuery: string;
}

interface UploadFiltersProps {
  /** Current filter values */
  filters: UploadFilters;
  /** Callback when filters change */
  onFiltersChange: (filters: UploadFilters) => void;
  /** Number of active filters (for badge display) */
  activeFilterCount?: number;
}

/**
 * UploadFilters Component
 * 
 * Comprehensive filtering interface for upload queue
 * Features:
 * - Status filter (All, Queued, Processing, Completed, Error)
 * - File type filter (All, PDF, DOCX, TXT, etc.)
 * - Date range filter (Today, Last 7 days, Last 30 days, All time)
 * - Search by filename
 * - Clear all filters button
 * - Real-time filtering (no submit button)
 */
export function UploadFilters({ 
  filters, 
  onFiltersChange,
  activeFilterCount = 0
}: UploadFiltersProps) {
  /**
   * Update a single filter
   */
  const updateFilter = (key: keyof UploadFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  /**
   * Clear all filters
   */
  const clearFilters = () => {
    onFiltersChange({
      status: 'all',
      fileType: 'all',
      dateRange: 'all',
      searchQuery: ''
    });
  };

  /**
   * Check if any filters are active
   */
  const hasActiveFilters = 
    filters.status !== 'all' ||
    filters.fileType !== 'all' ||
    filters.dateRange !== 'all' ||
    filters.searchQuery !== '';

  return (
    <div className="space-y-4">
      {/* Filter Controls Row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Status Filter */}
        <div className="flex-1 min-w-[150px]">
          <Select 
            value={filters.status} 
            onValueChange={(value) => updateFilter('status', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="uploaded">Queued</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* File Type Filter */}
        <div className="flex-1 min-w-[150px]">
          <Select 
            value={filters.fileType} 
            onValueChange={(value) => updateFilter('fileType', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="File Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="docx">DOCX</SelectItem>
              <SelectItem value="doc">DOC</SelectItem>
              <SelectItem value="txt">TXT</SelectItem>
              <SelectItem value="md">Markdown</SelectItem>
              <SelectItem value="html">HTML</SelectItem>
              <SelectItem value="rtf">RTF</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date Range Filter */}
        <div className="flex-1 min-w-[150px]">
          <Select 
            value={filters.dateRange} 
            onValueChange={(value) => updateFilter('dateRange', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button 
            variant="outline" 
            size="default"
            onClick={clearFilters}
            className="flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Clear</span>
          </Button>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search by filename..."
          value={filters.searchQuery}
          onChange={(e) => updateFilter('searchQuery', e.target.value)}
          className="pl-9 pr-9"
        />
        {filters.searchQuery && (
          <button
            onClick={() => updateFilter('searchQuery', '')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Active Filters Indicator */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="w-4 h-4" />
            <span>Active filters:</span>
          </div>
          
          {filters.status !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Status: {filters.status}
              <button
                onClick={() => updateFilter('status', 'all')}
                className="ml-1 hover:text-foreground"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}

          {filters.fileType !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Type: {filters.fileType.toUpperCase()}
              <button
                onClick={() => updateFilter('fileType', 'all')}
                className="ml-1 hover:text-foreground"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}

          {filters.dateRange !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              Date: {filters.dateRange}
              <button
                onClick={() => updateFilter('dateRange', 'all')}
                className="ml-1 hover:text-foreground"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}

          {filters.searchQuery && (
            <Badge variant="secondary" className="gap-1">
              Search: "{filters.searchQuery}"
              <button
                onClick={() => updateFilter('searchQuery', '')}
                className="ml-1 hover:text-foreground"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

