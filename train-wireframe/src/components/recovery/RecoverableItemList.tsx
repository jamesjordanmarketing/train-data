'use client';

import React from 'react';
import { FileText, Loader, Database, Download, CheckCircle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  RecoverableItem, 
  RecoverableItemType,
  RecoveryStatus 
} from '@/lib/recovery/types';

interface RecoverableItemListProps {
  items: RecoverableItem[];
  selectedIds: Set<string>;
  onToggleSelection: (itemId: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

const ICONS = {
  [RecoverableItemType.DRAFT_CONVERSATION]: FileText,
  [RecoverableItemType.INCOMPLETE_BATCH]: Loader,
  [RecoverableItemType.AVAILABLE_BACKUP]: Database,
  [RecoverableItemType.FAILED_EXPORT]: Download,
};

const TYPE_COLORS = {
  [RecoverableItemType.DRAFT_CONVERSATION]: 'bg-blue-500/10 text-blue-700',
  [RecoverableItemType.INCOMPLETE_BATCH]: 'bg-purple-500/10 text-purple-700',
  [RecoverableItemType.AVAILABLE_BACKUP]: 'bg-green-500/10 text-green-700',
  [RecoverableItemType.FAILED_EXPORT]: 'bg-orange-500/10 text-orange-700',
};

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
}

function RecoverableItemCard({ 
  item, 
  selected, 
  onToggle 
}: { 
  item: RecoverableItem; 
  selected: boolean; 
  onToggle: () => void;
}) {
  const Icon = ICONS[item.type];
  const colorClass = TYPE_COLORS[item.type];
  
  return (
    <Card 
      className={`cursor-pointer transition-all ${
        selected ? 'border-primary ring-2 ring-primary/20' : 'hover:border-primary/50'
      }`}
      onClick={onToggle}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <Checkbox
            checked={selected}
            onCheckedChange={onToggle}
            className="mt-1"
            onClick={(e) => e.stopPropagation()}
          />
          
          {/* Icon */}
          <div className={`p-2 rounded-lg ${colorClass}`}>
            <Icon className="h-5 w-5" />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className="font-medium text-sm truncate">
                  {item.description}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatTimestamp(item.timestamp)}
                </p>
              </div>
              
              {/* Priority Badge */}
              {item.priority >= 70 && (
                <Badge variant="default" className="text-xs">
                  High Priority
                </Badge>
              )}
            </div>
            
            {/* Type Badge */}
            <div className="mt-2">
              <Badge variant="secondary" className="text-xs">
                {item.type.replace(/_/g, ' ')}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function RecoverableItemList({
  items,
  selectedIds,
  onToggleSelection,
  onSelectAll,
  onDeselectAll,
}: RecoverableItemListProps) {
  const allSelected = items.length > 0 && items.every((item) => selectedIds.has(item.id));
  const someSelected = items.some((item) => selectedIds.has(item.id)) && !allSelected;
  
  return (
    <div className="space-y-4">
      {/* Header with Select All */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={allSelected}
            ref={(el) => {
              if (el) {
                el.indeterminate = someSelected;
              }
            }}
            onCheckedChange={(checked) => {
              if (checked) {
                onSelectAll();
              } else {
                onDeselectAll();
              }
            }}
          />
          <span className="text-sm font-medium">
            {selectedIds.size} of {items.length} selected
          </span>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={onSelectAll}
            className="text-sm text-primary hover:underline disabled:opacity-50"
            disabled={allSelected}
          >
            Select All
          </button>
          <span className="text-sm text-muted-foreground">|</span>
          <button
            onClick={onDeselectAll}
            className="text-sm text-primary hover:underline disabled:opacity-50"
            disabled={selectedIds.size === 0}
          >
            Deselect All
          </button>
        </div>
      </div>
      
      {/* Item List */}
      {items.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-12 w-12 text-success mx-auto mb-3" />
            <p className="text-lg font-semibold">No items to recover</p>
            <p className="text-sm text-muted-foreground mt-1">
              All your data is safe and up to date!
            </p>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[400px]">
          <div className="space-y-2">
            {items.map((item) => (
              <RecoverableItemCard
                key={item.id}
                item={item}
                selected={selectedIds.has(item.id)}
                onToggle={() => onToggleSelection(item.id)}
              />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

