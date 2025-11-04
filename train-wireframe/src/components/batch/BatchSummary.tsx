'use client';

import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BatchProgress } from '@/lib/batch/checkpoint';

interface BatchSummaryProps {
  progress: BatchProgress;
  startTime?: Date;
  estimatedTimeRemaining?: number; // seconds
}

export function BatchSummary({
  progress,
  startTime,
  estimatedTimeRemaining,
}: BatchSummaryProps) {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Batch Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">
              {progress.completedItems + progress.failedItems} / {progress.totalItems}
            </span>
          </div>
          <Progress value={progress.progressPercentage} className="h-2" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10">
            <CheckCircle className="h-5 w-5 text-success" />
            <div>
              <div className="text-xl font-bold">{progress.completedItems}</div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10">
            <XCircle className="h-5 w-5 text-destructive" />
            <div>
              <div className="text-xl font-bold">{progress.failedItems}</div>
              <div className="text-xs text-muted-foreground">Failed</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
            <AlertCircle className="h-5 w-5 text-muted-foreground" />
            <div>
              <div className="text-xl font-bold">{progress.pendingItems}</div>
              <div className="text-xs text-muted-foreground">Pending</div>
            </div>
          </div>

          {estimatedTimeRemaining !== undefined && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <div className="text-xl font-bold">
                  {formatTime(estimatedTimeRemaining)}
                </div>
                <div className="text-xs text-muted-foreground">Remaining</div>
              </div>
            </div>
          )}
        </div>

        {/* Status Badge */}
        <div className="flex items-center justify-between pt-2 border-t">
          {progress.progressPercentage === 100 ? (
            <Badge variant="default" className="bg-success">
              <CheckCircle className="h-3 w-3 mr-1" />
              Completed
            </Badge>
          ) : progress.failedItems > 0 ? (
            <Badge variant="destructive">
              <AlertCircle className="h-3 w-3 mr-1" />
              {progress.failedItems} Failed
            </Badge>
          ) : (
            <Badge variant="secondary">
              <Clock className="h-3 w-3 mr-1 animate-pulse" />
              In Progress
            </Badge>
          )}

          {startTime && (
            <span className="text-xs text-muted-foreground">
              Started {new Date(startTime).toLocaleTimeString()}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

