'use client';

import React from 'react';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { RecoverableItem, RecoveryStatus } from '@/lib/recovery/types';

interface RecoveryProgressProps {
  items: RecoverableItem[];
  currentProgress: number; // 0-100
}

const STATUS_ICONS = {
  [RecoveryStatus.PENDING]: AlertCircle,
  [RecoveryStatus.RECOVERING]: Loader2,
  [RecoveryStatus.SUCCESS]: CheckCircle,
  [RecoveryStatus.FAILED]: XCircle,
  [RecoveryStatus.SKIPPED]: AlertCircle,
};

const STATUS_COLORS = {
  [RecoveryStatus.PENDING]: 'text-muted-foreground',
  [RecoveryStatus.RECOVERING]: 'text-primary animate-spin',
  [RecoveryStatus.SUCCESS]: 'text-success',
  [RecoveryStatus.FAILED]: 'text-destructive',
  [RecoveryStatus.SKIPPED]: 'text-muted-foreground',
};

const STATUS_LABELS = {
  [RecoveryStatus.PENDING]: 'Waiting',
  [RecoveryStatus.RECOVERING]: 'Recovering',
  [RecoveryStatus.SUCCESS]: 'Success',
  [RecoveryStatus.FAILED]: 'Failed',
  [RecoveryStatus.SKIPPED]: 'Skipped',
};

function RecoveryItemStatus({ item }: { item: RecoverableItem }) {
  const Icon = STATUS_ICONS[item.status];
  const colorClass = STATUS_COLORS[item.status];
  const label = STATUS_LABELS[item.status];
  
  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          {/* Status Icon */}
          <Icon className={`h-5 w-5 flex-shrink-0 ${colorClass}`} />
          
          {/* Description */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{item.description}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge 
                variant={item.status === RecoveryStatus.SUCCESS ? 'default' : 'secondary'}
                className="text-xs"
              >
                {label}
              </Badge>
              {item.error && (
                <span className="text-xs text-destructive truncate">
                  {item.error}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function RecoveryProgress({ items, currentProgress }: RecoveryProgressProps) {
  const successCount = items.filter((i) => i.status === RecoveryStatus.SUCCESS).length;
  const failedCount = items.filter((i) => i.status === RecoveryStatus.FAILED).length;
  const recoveringCount = items.filter((i) => i.status === RecoveryStatus.RECOVERING).length;
  
  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Overall Progress</span>
          <span className="text-sm text-muted-foreground">
            {Math.round(currentProgress)}%
          </span>
        </div>
        <Progress value={currentProgress} className="h-2" />
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 rounded-lg bg-success/10">
          <div className="text-2xl font-bold text-success">{successCount}</div>
          <div className="text-xs text-muted-foreground">Recovered</div>
        </div>
        
        <div className="text-center p-3 rounded-lg bg-destructive/10">
          <div className="text-2xl font-bold text-destructive">{failedCount}</div>
          <div className="text-xs text-muted-foreground">Failed</div>
        </div>
        
        <div className="text-center p-3 rounded-lg bg-primary/10">
          <div className="text-2xl font-bold text-primary">{recoveringCount}</div>
          <div className="text-xs text-muted-foreground">In Progress</div>
        </div>
      </div>
      
      {/* Item List */}
      <div>
        <h4 className="text-sm font-semibold mb-3">Recovery Status</h4>
        <ScrollArea className="h-[300px]">
          <div className="space-y-2">
            {items.map((item) => (
              <RecoveryItemStatus key={item.id} item={item} />
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

