'use client';

import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, CheckCircle2 } from 'lucide-react';

interface ProgressIndicatorProps {
  current: number;
  total: number;
  label: string;
  isComplete?: boolean;
}

export function ProgressIndicator({ current, total, label, isComplete = false }: ProgressIndicatorProps) {
  const percentage = Math.round((current / total) * 100);
  
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            {isComplete ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            )}
            <div className="flex-1">
              <p className="text-sm font-medium">{label}</p>
              <p className="text-xs text-muted-foreground">
                {current} of {total} completed ({percentage}%)
              </p>
            </div>
          </div>
          <Progress value={percentage} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}

interface BulkOperationProgressProps {
  operation: string;
  completed: number;
  total: number;
  failed?: number;
}

export function BulkOperationProgress({ 
  operation, 
  completed, 
  total, 
  failed = 0 
}: BulkOperationProgressProps) {
  const isComplete = completed + failed >= total;
  const successPercentage = Math.round((completed / total) * 100);
  
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="text-sm font-semibold">{operation}</h4>
          <p className="text-xs text-muted-foreground mt-1">
            {completed} succeeded
            {failed > 0 && `, ${failed} failed`}
            {` of ${total} total`}
          </p>
        </div>
        {isComplete ? (
          <CheckCircle2 className="h-5 w-5 text-green-500" />
        ) : (
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        )}
      </div>
      <div className="space-y-2">
        <Progress value={successPercentage} className="h-2" />
        {!isComplete && (
          <p className="text-xs text-muted-foreground">
            Please wait while we process your request...
          </p>
        )}
      </div>
    </div>
  );
}

