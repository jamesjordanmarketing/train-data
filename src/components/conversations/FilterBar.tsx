/**
 * Filter Bar Component
 * 
 * Multi-dimensional filter controls with URL persistence
 */

'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, X, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { FilterConfig, ConversationStats } from '@/lib/types/conversations';
import { toast } from 'sonner';

interface FilterBarProps {
  filters: Partial<FilterConfig>;
  stats: ConversationStats;
  onChange: (filters: Partial<FilterConfig>) => void;
  onExport?: () => void;
}

export function FilterBar({ filters, stats, onChange, onExport }: FilterBarProps) {
  const [localFilters, setLocalFilters] = useState<Partial<FilterConfig>>(filters);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [searchValue, setSearchValue] = useState(filters.searchQuery || '');
  const [activeQuickFilter, setActiveQuickFilter] = useState<string | null>(null);

  // Sync local filters with props
  useEffect(() => {
    setLocalFilters(filters);
    setSearchValue(filters.searchQuery || '');
  }, [filters]);

  // Quick filters configuration
  const quickFilters = [
    {
      label: 'All',
      count: stats.total,
      filter: {},
      id: 'all',
    },
    {
      label: 'Needs Review',
      count: stats.pendingReview,
      filter: { statuses: ['pending_review'] },
      id: 'pending_review',
    },
    {
      label: 'Approved',
      count: stats.approved,
      filter: { statuses: ['approved'] },
      id: 'approved',
    },
    {
      label: 'High Quality',
      count: stats.highQuality,
      filter: { qualityRange: { min: 8, max: 10 } },
      id: 'high_quality',
    },
  ];

  const handleQuickFilter = (filter: Partial<FilterConfig>, id: string) => {
    setActiveQuickFilter(id);
    setLocalFilters(filter);
    onChange(filter);
  };

  const handleFilterChange = <K extends keyof FilterConfig>(
    key: K,
    value: FilterConfig[K]
  ) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    setActiveQuickFilter(null);
  };

  const handleApplyFilters = () => {
    onChange(localFilters);
    setShowAdvancedFilters(false);
    toast.success('Filters applied');
  };

  const handleClearFilters = () => {
    const cleared = {};
    setLocalFilters(cleared);
    setSearchValue('');
    setActiveQuickFilter('all');
    onChange(cleared);
    toast.info('Filters cleared');
  };

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    const newFilters = {
      ...localFilters,
      searchQuery: value || undefined,
    };
    setLocalFilters(newFilters);

    // Debounce search
    const timeoutId = setTimeout(() => {
      onChange(newFilters);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (localFilters.statuses && localFilters.statuses.length > 0) count++;
    if (localFilters.tierTypes && localFilters.tierTypes.length > 0) count++;
    if (localFilters.personas && localFilters.personas.length > 0) count++;
    if (localFilters.emotions && localFilters.emotions.length > 0) count++;
    if (localFilters.categories && localFilters.categories.length > 0) count++;
    if (localFilters.qualityRange) count++;
    if (localFilters.dateRange) count++;
    if (localFilters.searchQuery) count++;
    return count;
  };

  const hasActiveFilters = getActiveFilterCount() > 0;

  return (
    <div className="space-y-4">
      {/* Search Bar and Action Buttons */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, persona, or content..."
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
          {searchValue && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
              onClick={() => {
                setSearchValue('');
                handleSearchChange('');
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Advanced Filters Popover */}
        <Popover open={showAdvancedFilters} onOpenChange={setShowAdvancedFilters}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
              {getActiveFilterCount() > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {getActiveFilterCount()}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Advanced Filters</h4>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                    Clear All
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                {/* Status Filter */}
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={localFilters.statuses?.[0] || 'all'}
                    onValueChange={(value) =>
                      handleFilterChange(
                        'statuses',
                        value === 'all' ? undefined : [value]
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="generated">Generated</SelectItem>
                      <SelectItem value="pending_review">Pending Review</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="needs_revision">Needs Revision</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Tier Filter */}
                <div className="space-y-2">
                  <Label>Tier</Label>
                  <Select
                    value={localFilters.tierTypes?.[0] || 'all'}
                    onValueChange={(value) =>
                      handleFilterChange(
                        'tierTypes',
                        value === 'all' ? undefined : [value]
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select tier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tiers</SelectItem>
                      <SelectItem value="template">Template</SelectItem>
                      <SelectItem value="scenario">Scenario</SelectItem>
                      <SelectItem value="edge_case">Edge Case</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Quality Score Range */}
                <div className="space-y-2">
                  <Label>
                    Quality Score: {localFilters.qualityRange?.min || 0} -{' '}
                    {localFilters.qualityRange?.max || 10}
                  </Label>
                  <div className="pt-2">
                    <Slider
                      value={[
                        localFilters.qualityRange?.min || 0,
                        localFilters.qualityRange?.max || 10,
                      ]}
                      min={0}
                      max={10}
                      step={0.5}
                      onValueChange={([min, max]) =>
                        handleFilterChange('qualityRange', { min, max })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowAdvancedFilters(false)}
                >
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleApplyFilters}>
                  Apply Filters
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Export Button */}
        {onExport && (
          <Button variant="outline" onClick={onExport} className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        )}
      </div>

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2">
        {quickFilters.map((qf) => (
          <Button
            key={qf.id}
            variant={activeQuickFilter === qf.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleQuickFilter(qf.filter, qf.id)}
          >
            {qf.label}
            <Badge variant="secondary" className="ml-2">
              {qf.count}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-muted-foreground">Active filters:</span>

          {localFilters.searchQuery && (
            <Badge variant="secondary" className="gap-1">
              Search: "{localFilters.searchQuery}"
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={() => {
                  setSearchValue('');
                  handleSearchChange('');
                }}
              />
            </Badge>
          )}

          {localFilters.statuses && localFilters.statuses.length > 0 && (
            <Badge variant="secondary" className="gap-1">
              Status: {localFilters.statuses.join(', ')}
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={() => {
                  const { statuses, ...rest } = localFilters;
                  setLocalFilters(rest);
                  onChange(rest);
                }}
              />
            </Badge>
          )}

          {localFilters.tierTypes && localFilters.tierTypes.length > 0 && (
            <Badge variant="secondary" className="gap-1">
              Tier: {localFilters.tierTypes.join(', ')}
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={() => {
                  const { tierTypes, ...rest } = localFilters;
                  setLocalFilters(rest);
                  onChange(rest);
                }}
              />
            </Badge>
          )}

          {localFilters.qualityRange && (
            <Badge variant="secondary" className="gap-1">
              Quality: {localFilters.qualityRange.min} - {localFilters.qualityRange.max}
              <X
                className="h-3 w-3 cursor-pointer hover:text-destructive"
                onClick={() => {
                  const { qualityRange, ...rest } = localFilters;
                  setLocalFilters(rest);
                  onChange(rest);
                }}
              />
            </Badge>
          )}

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="h-7 text-xs"
            >
              Clear all filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

