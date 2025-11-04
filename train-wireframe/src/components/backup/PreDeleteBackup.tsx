'use client';

import React, { useState } from 'react';
import { Download, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { errorLogger } from '@/lib/errors/error-logger';
import { toast } from 'sonner';

interface PreDeleteBackupProps {
  isOpen: boolean;
  onClose: () => void;
  conversationIds: string[];
  onConfirmDelete: () => Promise<void>;
}

export function PreDeleteBackup({
  isOpen,
  onClose,
  conversationIds,
  onConfirmDelete,
}: PreDeleteBackupProps) {
  const [createBackup, setCreateBackup] = useState(true);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  const [backupCompleted, setBackupCompleted] = useState(false);
  const [backupId, setBackupId] = useState<string | null>(null);
  const [step, setStep] = useState<'confirm' | 'backup' | 'final'>('confirm');

  async function handleProceed() {
    if (!createBackup) {
      // Skip backup and go straight to final confirmation
      setStep('final');
      return;
    }

    // Start backup creation
    setStep('backup');
    setIsCreatingBackup(true);

    try {
      errorLogger.info('Creating pre-delete backup', {
        conversationCount: conversationIds.length,
      });

      // Call backup API
      const response = await fetch('/api/backup/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationIds,
          reason: 'bulk_delete',
        }),
      });

      if (!response.ok) {
        throw new Error('Backup creation failed');
      }

      const data = await response.json();

      // Simulate progress (in real implementation, use streaming or polling)
      for (let i = 0; i <= 100; i += 10) {
        setBackupProgress(i);
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      setBackupId(data.backupId);
      setBackupCompleted(true);
      setIsCreatingBackup(false);

      errorLogger.info('Pre-delete backup completed', {
        backupId: data.backupId,
        conversationCount: conversationIds.length,
      });

      toast.success('Backup created successfully');

      // Move to final confirmation
      setTimeout(() => setStep('final'), 1000);
    } catch (error) {
      errorLogger.error('Pre-delete backup failed', error);
      setIsCreatingBackup(false);
      toast.error('Backup creation failed. Delete operation cancelled.');
      onClose();
    }
  }

  async function handleFinalDelete() {
    try {
      await onConfirmDelete();
      onClose();
      
      if (backupId) {
        toast.success(
          `${conversationIds.length} conversations deleted. Backup ${backupId} available for 7 days.`
        );
      } else {
        toast.success(`${conversationIds.length} conversations deleted.`);
      }
    } catch (error) {
      errorLogger.error('Delete operation failed', error);
      toast.error('Failed to delete conversations');
    }
  }

  function handleCancel() {
    errorLogger.info('User cancelled delete operation');
    onClose();
  }

  function handleDownloadBackup() {
    if (backupId) {
      window.open(`/api/backup/download/${backupId}`, '_blank');
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        {step === 'confirm' && (
          <>
            <DialogHeader>
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-6 w-6 text-destructive mt-0.5" />
                <div>
                  <DialogTitle>Confirm Bulk Delete</DialogTitle>
                  <DialogDescription>
                    You are about to delete {conversationIds.length} conversation
                    {conversationIds.length > 1 ? 's' : ''}.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <Alert>
              <AlertDescription>
                This action cannot be undone. We recommend creating a backup before deleting.
              </AlertDescription>
            </Alert>

            <div className="flex items-start gap-3 p-3 rounded-lg border">
              <Checkbox
                id="create-backup"
                checked={createBackup}
                onCheckedChange={(checked) => setCreateBackup(checked === true)}
              />
              <div className="flex-1">
                <label
                  htmlFor="create-backup"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Create backup before deleting
                </label>
                <p className="text-sm text-muted-foreground mt-1">
                  Backup will be stored for 7 days and can be downloaded anytime.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleProceed}>
                {createBackup ? 'Create Backup & Continue' : 'Delete Without Backup'}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'backup' && (
          <>
            <DialogHeader>
              <DialogTitle>Creating Backup</DialogTitle>
              <DialogDescription>
                Please wait while we create a backup of your conversations...
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <Progress value={backupProgress} className="h-2" />
              
              <div className="text-center text-sm text-muted-foreground">
                {backupProgress}% complete
              </div>

              {backupCompleted && (
                <Alert className="bg-success/10 border-success">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <AlertDescription className="text-success">
                    Backup created successfully!
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </>
        )}

        {step === 'final' && (
          <>
            <DialogHeader>
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-6 w-6 text-destructive mt-0.5" />
                <div>
                  <DialogTitle>Final Confirmation</DialogTitle>
                  <DialogDescription>
                    {backupCompleted
                      ? `Backup created successfully. Proceed with deleting ${conversationIds.length} conversation${conversationIds.length > 1 ? 's' : ''}?`
                      : `Are you sure you want to delete ${conversationIds.length} conversation${conversationIds.length > 1 ? 's' : ''} without a backup?`}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            {backupCompleted && backupId && (
              <Alert>
                <Download className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>Backup ID: {backupId}</span>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={handleDownloadBackup}
                    className="h-auto p-0"
                  >
                    Download Now
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleFinalDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Conversations
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

