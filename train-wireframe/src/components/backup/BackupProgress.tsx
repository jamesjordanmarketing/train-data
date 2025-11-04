'use client';

import React from 'react';
import { Loader2, CheckCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';

interface BackupProgressProps {
  progress: number;
  isComplete: boolean;
  fileName?: string;
}

export function BackupProgress({
  progress,
  isComplete,
  fileName,
}: BackupProgressProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Progress Icon */}
          <div className="flex items-center justify-center">
            {isComplete ? (
              <div className="rounded-full bg-success/10 p-3">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
            ) : (
              <div className="rounded-full bg-primary/10 p-3">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                {isComplete ? 'Backup Complete' : 'Creating Backup...'}
              </span>
              <span className="text-sm text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* File Info */}
          {fileName && (
            <div className="text-center text-sm text-muted-foreground">
              {fileName}
            </div>
          )}

          {/* Completion Message */}
          {isComplete && (
            <div className="text-center text-sm text-success">
              Your conversations have been backed up successfully.
              <br />
              The backup will be available for download for 7 days.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

