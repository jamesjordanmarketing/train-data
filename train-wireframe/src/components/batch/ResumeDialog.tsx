'use client';

import React, { useState, useEffect } from 'react';
import { Play, X, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  getIncompleteCheckpoints,
  BatchCheckpoint,
  calculateProgress,
  cleanupCheckpoint,
} from '@/lib/batch/checkpoint';
import { errorLogger } from '@/lib/errors/error-logger';
import { toast } from 'sonner';

interface ResumeDialogProps {
  onResume?: (checkpoint: BatchCheckpoint) => void;
  onDiscard?: (checkpoint: BatchCheckpoint) => void;
}

export function ResumeDialog({ onResume, onDiscard }: ResumeDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [checkpoints, setCheckpoints] = useState<BatchCheckpoint[]>([]);
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<BatchCheckpoint | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load incomplete checkpoints on mount
  useEffect(() => {
    loadIncompleteCheckpoints();
  }, []);

  async function loadIncompleteCheckpoints() {
    try {
      setIsLoading(true);
      const incomplete = await getIncompleteCheckpoints();
      
      if (incomplete.length > 0) {
        setCheckpoints(incomplete);
        setSelectedCheckpoint(incomplete[0]); // Select first by default
        setIsOpen(true); // Show dialog
      }
    } catch (error) {
      errorLogger.error('Failed to load incomplete checkpoints', error);
      toast.error('Failed to detect incomplete batches');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResume() {
    if (!selectedCheckpoint) return;

    errorLogger.info('User resumed batch', {
      jobId: selectedCheckpoint.jobId,
      progress: selectedCheckpoint.progressPercentage,
    });

    if (onResume) {
      onResume(selectedCheckpoint);
    }

    setIsOpen(false);
  }

  async function handleDiscard() {
    if (!selectedCheckpoint) return;

    try {
      await cleanupCheckpoint(selectedCheckpoint.jobId);
      
      errorLogger.info('User discarded batch', {
        jobId: selectedCheckpoint.jobId,
      });

      toast.success('Batch discarded');

      if (onDiscard) {
        onDiscard(selectedCheckpoint);
      }

      // Remove from list
      const updatedCheckpoints = checkpoints.filter(
        (c) => c.id !== selectedCheckpoint.id
      );
      setCheckpoints(updatedCheckpoints);

      // Select next checkpoint or close dialog
      if (updatedCheckpoints.length > 0) {
        setSelectedCheckpoint(updatedCheckpoints[0]);
      } else {
        setIsOpen(false);
      }
    } catch (error) {
      errorLogger.error('Failed to discard checkpoint', error);
      toast.error('Failed to discard batch');
    }
  }

  if (isLoading || checkpoints.length === 0) {
    return null;
  }

  const progress = selectedCheckpoint
    ? calculateProgress(selectedCheckpoint, 
        selectedCheckpoint.completedItems.length + 
        selectedCheckpoint.failedItems.length + 
        Math.round((100 - selectedCheckpoint.progressPercentage) / 100 * 
          (selectedCheckpoint.completedItems.length + selectedCheckpoint.failedItems.length))
      )
    : null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-warning mt-0.5" />
            <div>
              <DialogTitle>Incomplete Batch Detected</DialogTitle>
              <DialogDescription>
                You have {checkpoints.length} incomplete batch{checkpoints.length > 1 ? 'es' : ''} that can be resumed.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {selectedCheckpoint && progress && (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Batch Summary */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Batch Progress</span>
                    <span className="text-sm text-muted-foreground">
                      {progress.progressPercentage}% complete
                    </span>
                  </div>
                  <Progress value={progress.progressPercentage} className="h-2" />
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <div>
                      <div className="text-2xl font-bold">{progress.completedItems}</div>
                      <div className="text-xs text-muted-foreground">Completed</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-destructive" />
                    <div>
                      <div className="text-2xl font-bold">{progress.failedItems}</div>
                      <div className="text-xs text-muted-foreground">Failed</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-2xl font-bold">{progress.pendingItems}</div>
                      <div className="text-xs text-muted-foreground">Pending</div>
                    </div>
                  </div>
                </div>

                {/* Last Updated */}
                <div className="pt-2 border-t">
                  <div className="text-sm text-muted-foreground">
                    Last updated: {new Date(selectedCheckpoint.lastCheckpointAt).toLocaleString()}
                  </div>
                </div>

                {/* Failed Items (if any) */}
                {progress.failedItems > 0 && (
                  <div className="pt-2">
                    <Badge variant="destructive" className="text-xs">
                      {progress.failedItems} item{progress.failedItems > 1 ? 's' : ''} failed
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      Failed items will be retried when you resume
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleDiscard}
            className="w-full sm:w-auto"
          >
            <X className="h-4 w-4 mr-2" />
            Discard Batch
          </Button>
          <Button
            onClick={handleResume}
            className="w-full sm:w-auto"
          >
            <Play className="h-4 w-4 mr-2" />
            Resume Batch
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

