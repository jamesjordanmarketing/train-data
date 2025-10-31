'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, X, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDebounce } from '@/hooks/use-debounce';
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
import { useConversationStore } from '@/stores/conversation-store';
import { TierType, ConversationStatus } from '@/lib/types/conversations';

export function FilterBar() {
  const { 
    filterConfig, 
    setFilterConfig, 
    resetFilters,
    selectedConversationIds,
    openExportModal
  } = useConversationStore();
  
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Local search input state with debouncing
  const [searchInput, setSearchInput] = useState(filterConfig.searchQuery || '');
  const debouncedSearch = useDebounce(searchInput, 300);
  
  // Update filter config when debounced search changes
  useEffect(() => {
    setFilterConfig({ searchQuery: debouncedSearch });
  }, [debouncedSearch, setFilterConfig]);
  
  // Quick filter buttons
  const quickFilters = [
    { label: 'All', value: 'all' },
    { label: 'Templates', value: 'template', tierType: 'template' as TierType },
    { label: 'Scenarios', value: 'scenario', tierType: 'scenario' as TierType },
    { label: 'Edge Cases', value: 'edge_case', tierType: 'edge_case' as TierType },
    { label: 'Needs Review', value: 'pending_review', status: 'pending_review' as ConversationStatus },
    { label: 'Approved', value: 'approved', status: 'approved' as ConversationStatus },
    { label: 'High Quality (≥8)', value: 'high_quality' },
  ];
  
  const [activeQuickFilter, setActiveQuickFilter] = useState('all');
  
  const handleQuickFilter = (filterValue: string, tierType?: TierType, status?: ConversationStatus) => {
    setActiveQuickFilter(filterValue);
    
    if (filterValue === 'all') {
      resetFilters();
    } else if (tierType) {
      setFilterConfig({ tierTypes: [tierType], statuses: [], qualityRange: undefined });
    } else if (status) {
      setFilterConfig({ statuses: [status], tierTypes: [], qualityRange: undefined });
    } else if (filterValue === 'high_quality') {
      setFilterConfig({ qualityRange: { min: 8, max: 10 }, tierTypes: [], statuses: [] });
    }
  };
  
  const hasActiveFilters = 
    (filterConfig.tierTypes && filterConfig.tierTypes.length > 0) ||
    (filterConfig.statuses && filterConfig.statuses.length > 0) ||
    filterConfig.qualityRange ||
    (filterConfig.searchQuery && filterConfig.searchQuery.length > 0);
  
  const activeFilterCount = 
    (filterConfig.tierTypes?.length || 0) +
    (filterConfig.statuses?.length || 0) +
    (filterConfig.qualityRange ? 1 : 0);
  
  return (
    <div className="space-y-4">
      {/* Search Bar and Main Actions */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-10"
          />
          {searchInput && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
              onClick={() => {
                setSearchInput('');
                setFilterConfig({ searchQuery: '' });
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        <Popover open={showAdvancedFilters} onOpenChange={setShowAdvancedFilters}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Advanced Filters</h4>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={resetFilters}>
                    Clear All
                  </Button>
                )}
              </div>
              
              <div className="space-y-3">
                {/* Tier Filter */}
                <div className="space-y-2">
                  <Label>Tier</Label>
                  <Select 
                    value={filterConfig.tierTypes?.[0] || 'all'}
                    onValueChange={(value) => {
                      if (value === 'all') {
                        setFilterConfig({ tierTypes: [] });
                      } else {
                        setFilterConfig({ tierTypes: [value as TierType] });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select tier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tiers</SelectItem>
                      <SelectItem value="template">Templates</SelectItem>
                      <SelectItem value="scenario">Scenarios</SelectItem>
                      <SelectItem value="edge_case">Edge Cases</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Status Filter */}
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={filterConfig.statuses?.[0] || 'all'}
                    onValueChange={(value) => {
                      if (value === 'all') {
                        setFilterConfig({ statuses: [] });
                      } else {
                        setFilterConfig({ statuses: [value as ConversationStatus] });
                      }
                    }}
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
                
                {/* Quality Score Range Filter */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Quality Score Range</Label>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Min:</span>
                      <span className="font-semibold">{filterConfig.qualityRange?.min || 0}</span>
                    </div>
                    <Slider
                      value={[filterConfig.qualityRange?.min || 0]}
                      onValueChange={([value]) => {
                        const currentMax = filterConfig.qualityRange?.max || 10;
                        if (value === 0 && currentMax === 10) {
                          setFilterConfig({ qualityRange: undefined });
                        } else {
                          setFilterConfig({ 
                            qualityRange: { min: value, max: currentMax } 
                          });
                        }
                      }}
                      max={10}
                      step={0.5}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Max:</span>
                      <span className="font-semibold">{filterConfig.qualityRange?.max || 10}</span>
                    </div>
                    <Slider
                      value={[filterConfig.qualityRange?.max || 10]}
                      onValueChange={([value]) => {
                        const currentMin = filterConfig.qualityRange?.min || 0;
                        if (value === 10 && currentMin === 0) {
                          setFilterConfig({ qualityRange: undefined });
                        } else {
                          setFilterConfig({ 
                            qualityRange: { min: currentMin, max: value } 
                          });
                        }
                      }}
                      max={10}
                      step={0.5}
                      className="w-full"
                    />
                  </div>

                  {/* Quick quality filters */}
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => setFilterConfig({ qualityRange: { min: 8, max: 10 } })}
                    >
                      High (≥8)
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => setFilterConfig({ qualityRange: { min: 6, max: 8 } })}
                    >
                      Medium (6-8)
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => setFilterConfig({ qualityRange: { min: 0, max: 6 } })}
                    >
                      Low (&lt;6)
                    </Button>
                  </div>
                </div>
              </div>
              
              <Button 
                className="w-full" 
                onClick={() => setShowAdvancedFilters(false)}
              >
                Apply Filters
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        
        <Button variant="outline" onClick={openExportModal} className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>
      
      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2">
        {quickFilters.map((filter) => (
          <Button
            key={filter.value}
            variant={activeQuickFilter === filter.value ? "default" : "outline"}
            size="sm"
            onClick={() => handleQuickFilter(filter.value, filter.tierType, filter.status)}
          >
            {filter.label}
          </Button>
        ))}
      </div>
      
      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          
          {filterConfig.searchQuery && (
            <Badge variant="secondary" className="gap-1">
              Search: &quot;{filterConfig.searchQuery}&quot;
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => setFilterConfig({ searchQuery: '' })}
              />
            </Badge>
          )}
          
          {filterConfig.tierTypes && filterConfig.tierTypes.length > 0 && (
            <Badge variant="secondary" className="gap-1">
              Tier: {filterConfig.tierTypes[0]}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => setFilterConfig({ tierTypes: [] })}
              />
            </Badge>
          )}
          
          {filterConfig.statuses && filterConfig.statuses.length > 0 && (
            <Badge variant="secondary" className="gap-1">
              Status: {filterConfig.statuses[0]}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => setFilterConfig({ statuses: [] })}
              />
            </Badge>
          )}
          
          {filterConfig.qualityRange && (
            <Badge variant="secondary" className="gap-1">
              Quality: {filterConfig.qualityRange.min}-{filterConfig.qualityRange.max}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => setFilterConfig({ qualityRange: undefined })}
              />
            </Badge>
          )}
          
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={resetFilters}
              className="text-xs"
            >
              Clear all
            </Button>
          )}
        </div>
      )}
      
      {/* Bulk Actions Bar */}
      {selectedConversationIds.length > 0 && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 flex items-center gap-4">
          <span className="text-sm font-medium">
            {selectedConversationIds.length} conversation{selectedConversationIds.length !== 1 ? 's' : ''} selected
          </span>
          
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export Selected
            </Button>
            <Button variant="destructive" size="sm">
              Delete Selected
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
