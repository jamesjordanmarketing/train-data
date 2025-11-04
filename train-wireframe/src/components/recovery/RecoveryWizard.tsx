'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { detectRecoverableData } from '@/lib/recovery/detection';
import { recoverItems } from '@/lib/recovery/executor';
import { 
  RecoverableItem, 
  RecoveryStatus,
  RecoverySummary as RecoverySummaryType
} from '@/lib/recovery/types';
import { RecoverableItemList } from './RecoverableItemList';
import { RecoveryProgress as RecoveryProgressComponent } from './RecoveryProgress';
import { RecoverySummary } from './RecoverySummary';
import { errorLogger } from '@/lib/errors/error-logger';
import { toast } from 'sonner';

enum WizardStep {
  DETECTION = 'DETECTION',
  SELECTION = 'SELECTION',
  RECOVERY = 'RECOVERY',
  SUMMARY = 'SUMMARY',
}

interface RecoveryWizardProps {
  autoOpen?: boolean; // If true, opens automatically when items detected
  onComplete?: () => void;
}

export function RecoveryWizard({ autoOpen = true, onComplete }: RecoveryWizardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<WizardStep>(WizardStep.DETECTION);
  const [items, setItems] = useState<RecoverableItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [recoveryProgress, setRecoveryProgress] = useState(0);
  const [summary, setSummary] = useState<RecoverySummaryType | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Detect recoverable items on mount
  useEffect(() => {
    detectItems();
  }, []);

  async function detectItems() {
    try {
      setIsLoading(true);
      errorLogger.info('Detecting recoverable items');
      
      const detectedItems = await detectRecoverableData();
      
      if (detectedItems.length > 0) {
        setItems(detectedItems);
        
        // Pre-select all items
        setSelectedIds(new Set(detectedItems.map((item) => item.id)));
        
        // Open wizard if autoOpen is enabled
        if (autoOpen) {
          setIsOpen(true);
          setStep(WizardStep.SELECTION);
          
          toast.info(
            `Found ${detectedItems.length} recoverable item${detectedItems.length > 1 ? 's' : ''}`
          );
        }
      } else {
        errorLogger.info('No recoverable items found');
      }
    } catch (error) {
      errorLogger.error('Failed to detect recoverable items', error);
      toast.error('Failed to detect recoverable data');
    } finally {
      setIsLoading(false);
    }
  }

  function handleToggleSelection(itemId: string) {
    const newSelectedIds = new Set(selectedIds);
    if (newSelectedIds.has(itemId)) {
      newSelectedIds.delete(itemId);
    } else {
      newSelectedIds.add(itemId);
    }
    setSelectedIds(newSelectedIds);
  }

  function handleSelectAll() {
    setSelectedIds(new Set(items.map((item) => item.id)));
  }

  function handleDeselectAll() {
    setSelectedIds(new Set());
  }

  async function handleStartRecovery() {
    if (selectedIds.size === 0) {
      toast.warning('Please select at least one item to recover');
      return;
    }

    try {
      setStep(WizardStep.RECOVERY);
      setRecoveryProgress(0);
      
      // Mark non-selected items as skipped
      const itemsToRecover = items.map((item) => ({
        ...item,
        status: selectedIds.has(item.id) ? RecoveryStatus.PENDING : RecoveryStatus.SKIPPED,
      }));
      
      setItems(itemsToRecover);
      
      // Execute recovery
      const recoverySummary = await recoverItems(
        itemsToRecover,
        (currentItem, progress) => {
          setRecoveryProgress(progress);
          setItems((prevItems) =>
            prevItems.map((item) =>
              item.id === currentItem.id ? currentItem : item
            )
          );
        }
      );
      
      setSummary(recoverySummary);
      setStep(WizardStep.SUMMARY);
      
      // Show success/failure toast
      if (recoverySummary.failedCount === 0) {
        toast.success(
          `Successfully recovered ${recoverySummary.successCount} item${recoverySummary.successCount > 1 ? 's' : ''}!`
        );
      } else {
        toast.warning(
          `Recovered ${recoverySummary.successCount} of ${recoverySummary.totalItems} items`
        );
      }
    } catch (error) {
      errorLogger.error('Recovery failed', error);
      toast.error('Recovery process failed');
      setStep(WizardStep.SELECTION);
    }
  }

  function handleClose() {
    setIsOpen(false);
    
    if (onComplete) {
      onComplete();
    }
    
    // Reset wizard state
    setTimeout(() => {
      setStep(WizardStep.DETECTION);
      setItems([]);
      setSelectedIds(new Set());
      setRecoveryProgress(0);
      setSummary(null);
    }, 300);
  }

  function handleSkipRecovery() {
    errorLogger.info('User skipped recovery');
    toast.info('Recovery skipped. You can access this wizard later from Settings.');
    handleClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-3">
            {step !== WizardStep.SUMMARY && (
              <AlertCircle className="h-6 w-6 text-primary mt-0.5" />
            )}
            <div className="flex-1">
              <DialogTitle>
                {step === WizardStep.DETECTION && 'Detecting Recoverable Data...'}
                {step === WizardStep.SELECTION && 'Data Recovery Available'}
                {step === WizardStep.RECOVERY && 'Recovering Your Data'}
                {step === WizardStep.SUMMARY && 'Recovery Complete'}
              </DialogTitle>
              <DialogDescription>
                {step === WizardStep.DETECTION &&
                  'Scanning for recoverable drafts, batches, and backups...'}
                {step === WizardStep.SELECTION &&
                  'Select the items you want to recover.'}
                {step === WizardStep.RECOVERY &&
                  'Please wait while we recover your data...'}
                {step === WizardStep.SUMMARY &&
                  'Recovery process has finished.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Step: Detection */}
        {step === WizardStep.DETECTION && (
          <div className="py-8 text-center">
            <div className="inline-flex p-4 rounded-full bg-primary/10 mb-4 animate-pulse">
              <AlertCircle className="h-8 w-8 text-primary" />
            </div>
            <Progress value={undefined} className="w-full h-2" />
          </div>
        )}

        {/* Step: Selection */}
        {step === WizardStep.SELECTION && (
          <>
            <RecoverableItemList
              items={items}
              selectedIds={selectedIds}
              onToggleSelection={handleToggleSelection}
              onSelectAll={handleSelectAll}
              onDeselectAll={handleDeselectAll}
            />

            <div className="flex gap-2 pt-4">
              <Button
                variant="outline"
                onClick={handleSkipRecovery}
                className="flex-1"
              >
                Skip Recovery
              </Button>
              <Button
                onClick={handleStartRecovery}
                disabled={selectedIds.size === 0}
                className="flex-1"
              >
                Recover Selected ({selectedIds.size})
              </Button>
            </div>
          </>
        )}

        {/* Step: Recovery */}
        {step === WizardStep.RECOVERY && (
          <>
            <RecoveryProgressComponent
              items={items}
              currentProgress={recoveryProgress}
            />
            
            <div className="text-center text-sm text-muted-foreground">
              Please do not close this window...
            </div>
          </>
        )}

        {/* Step: Summary */}
        {step === WizardStep.SUMMARY && summary && (
          <RecoverySummary
            summary={summary}
            onClose={handleClose}
            onViewFailures={() => {
              // TODO: Show detailed failure report
              toast.info('Detailed failure report coming soon');
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

