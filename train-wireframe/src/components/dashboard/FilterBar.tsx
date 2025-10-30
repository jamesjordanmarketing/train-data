import { Search, Filter, X, Download, Plus, Tag, Play } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { useAppStore } from '../../stores/useAppStore';
import { TierType, ConversationStatus } from '../../lib/types';
import { useState } from 'react';
import { toast } from 'sonner@2.0.3';

const quickFilters = [
  { label: 'All', value: 'all' },
  { label: 'Templates', value: 'template' },
  { label: 'Scenarios', value: 'scenario' },
  { label: 'Edge Cases', value: 'edge_case' },
  { label: 'Needs Review', value: 'pending_review' },
  { label: 'Approved', value: 'approved' },
  { label: 'High Quality (>8)', value: 'high_quality' },
];

interface FilterBarProps {
  onExport?: () => void;
  onBulkAction?: () => void;
}

export function FilterBar({ onExport, onBulkAction }: FilterBarProps) {
  const { 
    filters, 
    setFilters, 
    searchQuery, 
    setSearchQuery, 
    clearFilters,
    selectedConversationIds,
    openExportModal
  } = useAppStore();
  
  const [activeQuickFilter, setActiveQuickFilter] = useState('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  const handleQuickFilter = (filterValue: string) => {
    setActiveQuickFilter(filterValue);
    
    switch (filterValue) {
      case 'all':
        clearFilters();
        break;
      case 'template':
      case 'scenario':
      case 'edge_case':
        setFilters({ tier: [filterValue as TierType] });
        break;
      case 'pending_review':
      case 'approved':
        setFilters({ status: [filterValue as ConversationStatus] });
        break;
      case 'high_quality':
        setFilters({ qualityScoreMin: 8 });
        break;
    }
  };
  
  const hasActiveFilters = Object.keys(filters).length > 0 || searchQuery.length > 0;
  const activeFilterCount = Object.keys(filters).length;
  
  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
              onClick={() => setSearchQuery('')}
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
                <h4>Advanced Filters</h4>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear All
                  </Button>
                )}
              </div>
              
              <div className="space-y-3">
                {/* Tier Filter */}
                <div className="space-y-2">
                  <Label>Tier</Label>
                  <Select 
                    value={filters.tier?.[0] || 'all'}
                    onValueChange={(value) => {
                      if (value === 'all') {
                        const { tier, ...rest } = filters;
                        setFilters(rest);
                      } else {
                        setFilters({ ...filters, tier: [value as TierType] });
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
                    value={filters.status?.[0] || 'all'}
                    onValueChange={(value) => {
                      if (value === 'all') {
                        const { status, ...rest } = filters;
                        setFilters(rest);
                      } else {
                        setFilters({ ...filters, status: [value as ConversationStatus] });
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
                      <span className="text-gray-600">Min:</span>
                      <span className="font-semibold">{filters.qualityScoreMin || 0}</span>
                    </div>
                    <Slider
                      value={[filters.qualityScoreMin || 0]}
                      onValueChange={([value]) => {
                        if (value === 0) {
                          const { qualityScoreMin, ...rest } = filters;
                          setFilters(rest);
                        } else {
                          setFilters({ ...filters, qualityScoreMin: value });
                        }
                      }}
                      max={10}
                      step={0.5}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Max:</span>
                      <span className="font-semibold">{filters.qualityScoreMax || 10}</span>
                    </div>
                    <Slider
                      value={[filters.qualityScoreMax || 10]}
                      onValueChange={([value]) => {
                        if (value === 10) {
                          const { qualityScoreMax, ...rest } = filters;
                          setFilters(rest);
                        } else {
                          setFilters({ ...filters, qualityScoreMax: value });
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
                      onClick={() => setFilters({ ...filters, qualityScoreMin: 8 })}
                    >
                      High (≥8)
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => setFilters({ ...filters, qualityScoreMin: 6, qualityScoreMax: 8 })}
                    >
                      Medium (6-8)
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => setFilters({ ...filters, qualityScoreMax: 6 })}
                    >
                      Low (<6)
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
            onClick={() => handleQuickFilter(filter.value)}
          >
            {filter.label}
          </Button>
        ))}
      </div>
      
      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-600">Active filters:</span>
          
          {searchQuery && (
            <Badge variant="secondary" className="gap-1">
              Search: "{searchQuery}"
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => setSearchQuery('')}
              />
            </Badge>
          )}
          
          {filters.tier && (
            <Badge variant="secondary" className="gap-1">
              Tier: {filters.tier[0]}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => {
                  const { tier, ...rest } = filters;
                  setFilters(rest);
                }}
              />
            </Badge>
          )}
          
          {filters.status && (
            <Badge variant="secondary" className="gap-1">
              Status: {filters.status[0]}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => {
                  const { status, ...rest } = filters;
                  setFilters(rest);
                }}
              />
            </Badge>
          )}
          
          {(filters.qualityScoreMin !== undefined && filters.qualityScoreMin > 0) || 
           (filters.qualityScoreMax !== undefined && filters.qualityScoreMax < 10) ? (
            <Badge variant="secondary" className="gap-1">
              Quality: {filters.qualityScoreMin || 0}-{filters.qualityScoreMax || 10}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => {
                  const { qualityScoreMin, qualityScoreMax, ...rest } = filters;
                  setFilters(rest);
                }}
              />
            </Badge>
          ) : null}
          
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters}
              className="text-xs"
            >
              Clear all
            </Button>
          )}
        </div>
      )}
      
      {/* Bulk Actions Bar */}
      {selectedConversationIds.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-4">
          <span className="text-sm">
            {selectedConversationIds.length} conversation{selectedConversationIds.length !== 1 ? 's' : ''} selected
          </span>
          
          <div className="flex gap-2 ml-auto">
            <Button 
              size="sm" 
              className="gap-2"
              onClick={() => toast.info('Bulk generate functionality coming soon')}
            >
              <Play className="h-4 w-4" />
              Generate Selected
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Tag className="h-4 w-4" />
              Add Tags
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Move to Review
            </Button>
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
