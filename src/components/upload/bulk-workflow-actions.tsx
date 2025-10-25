'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { Badge } from '../ui/badge';
import { 
  PlayCircle, 
  CheckSquare, 
  Square,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { getWorkflowReadyDocuments, getWorkflowUrl, WorkflowStatus } from '../../lib/workflow-navigation';

interface Document {
  id: string;
  title: string;
  status: WorkflowStatus;
}

interface BulkWorkflowActionsProps {
  /** All documents in queue */
  documents: Document[];
  /** Currently selected document IDs */
  selectedIds: string[];
  /** Callback when selection changes */
  onSelectionChange: (ids: string[]) => void;
}

/**
 * BulkWorkflowActions Component
 * 
 * Provides bulk workflow processing capabilities
 * Features:
 * - Select multiple completed documents
 * - Start workflow for batch
 * - Navigate through batch sequentially
 * - Progress tracking
 */
export function BulkWorkflowActions({
  documents,
  selectedIds,
  onSelectionChange
}: BulkWorkflowActionsProps) {
  const router = useRouter();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Get workflow-ready documents
  const readyDocuments = getWorkflowReadyDocuments(
    documents.filter(d => d.status === 'completed')
  );

  const selectedReadyDocs = readyDocuments.filter(d => 
    selectedIds.includes(d.id)
  );

  /**
   * Select all ready documents
   */
  const handleSelectAll = () => {
    const allReadyIds = readyDocuments.map(d => d.id);
    onSelectionChange(allReadyIds);
  };

  /**
   * Deselect all
   */
  const handleDeselectAll = () => {
    onSelectionChange([]);
  };

  /**
   * Toggle selection for document
   */
  const handleToggleSelection = (documentId: string) => {
    if (selectedIds.includes(documentId)) {
      onSelectionChange(selectedIds.filter(id => id !== documentId));
    } else {
      onSelectionChange([...selectedIds, documentId]);
    }
  };

  /**
   * Start bulk workflow
   */
  const handleStartBulkWorkflow = () => {
    if (selectedReadyDocs.length === 0) {
      toast.error('No documents selected', {
        description: 'Please select at least one completed document'
      });
      return;
    }

    setShowConfirmDialog(true);
  };

  /**
   * Confirm and navigate to first document
   */
  const handleConfirmBulkWorkflow = () => {
    const firstDoc = selectedReadyDocs[0];
    
    // Store batch info in sessionStorage for workflow to access
    sessionStorage.setItem('workflowBatch', JSON.stringify({
      documentIds: selectedReadyDocs.map(d => d.id),
      currentIndex: 0,
      total: selectedReadyDocs.length
    }));

    toast.success('Batch workflow started', {
      description: `Processing ${selectedReadyDocs.length} document(s)`
    });

    // Navigate to first document
    const url = getWorkflowUrl(firstDoc.id, firstDoc.status);
    router.push(url);
  };

  // Don't render if no ready documents
  if (readyDocuments.length === 0) {
    return null;
  }

  return (
    <>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedIds.length === readyDocuments.length && readyDocuments.length > 0}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      handleSelectAll();
                    } else {
                      handleDeselectAll();
                    }
                  }}
                />
                <span className="text-sm font-medium">
                  Select All ({readyDocuments.length} ready)
                </span>
              </div>

              {selectedIds.length > 0 && (
                <Badge variant="secondary">
                  {selectedIds.length} selected
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              {selectedIds.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDeselectAll}
                >
                  <Square className="w-4 h-4 mr-2" />
                  Clear Selection
                </Button>
              )}

              <Button
                onClick={handleStartBulkWorkflow}
                disabled={selectedReadyDocs.length === 0}
                size="sm"
              >
                <PlayCircle className="w-4 h-4 mr-2" />
                Start Workflow ({selectedReadyDocs.length})
              </Button>
            </div>
          </div>

          {selectedIds.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>
                  You will be taken through each document sequentially. 
                  After completing the workflow for one document, you can proceed to the next.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start Batch Workflow?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                You are about to start the categorization workflow for{' '}
                <strong>{selectedReadyDocs.length} document(s)</strong>.
              </p>
              <p>
                You will process each document one at a time. Your progress will be saved 
                automatically as you complete each document.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmBulkWorkflow}>
              Start Batch
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

