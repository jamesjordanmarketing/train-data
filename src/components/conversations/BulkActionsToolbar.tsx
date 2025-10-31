'use client';

import { useConversationStore } from '@/stores/conversation-store';
import { useSelectedConversations } from '@/hooks/use-filtered-conversations';
import { useBulkUpdateConversations, useBulkDeleteConversations } from '@/hooks/use-conversations';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Trash2, Download, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import { BulkOperationProgress } from '@/components/progress-indicator';

export function BulkActionsToolbar() {
  const selectedIds = useConversationStore((state) => state.selectedConversationIds);
  const clearSelection = useConversationStore((state) => state.clearSelection);
  const showConfirm = useConversationStore((state) => state.showConfirm);
  const openExportModal = useConversationStore((state) => state.openExportModal);
  
  const selectedConversations = useSelectedConversations();
  const bulkUpdateMutation = useBulkUpdateConversations();
  const bulkDeleteMutation = useBulkDeleteConversations();
  const [isProcessing, setIsProcessing] = useState(false);
  
  if (selectedIds.length === 0) {
    return null;
  }
  
  const handleBulkApprove = () => {
    showConfirm(
      'Approve Conversations',
      `Are you sure you want to approve ${selectedIds.length} conversation(s)? This action will move them to the approved state.`,
      async () => {
        setIsProcessing(true);
        const toastId = toast.loading(
          <BulkOperationProgress 
            operation="Approving conversations" 
            completed={0} 
            total={selectedIds.length}
          />
        );
        
        try {
          await bulkUpdateMutation.mutateAsync({
            ids: selectedIds,
            updates: { status: 'approved' }
          });
          toast.success(`Successfully approved ${selectedIds.length} conversation(s)`, { id: toastId });
          clearSelection();
        } catch (error: any) {
          toast.error('Failed to approve conversations', {
            id: toastId,
            description: error?.message || 'An error occurred during bulk approval'
          });
          console.error('Bulk approve error:', error);
        } finally {
          setIsProcessing(false);
        }
      }
    );
  };
  
  const handleBulkReject = () => {
    showConfirm(
      'Reject Conversations',
      `Are you sure you want to reject ${selectedIds.length} conversation(s)? This will mark them as rejected.`,
      async () => {
        setIsProcessing(true);
        const toastId = toast.loading(
          <BulkOperationProgress 
            operation="Rejecting conversations" 
            completed={0} 
            total={selectedIds.length}
          />
        );
        
        try {
          await bulkUpdateMutation.mutateAsync({
            ids: selectedIds,
            updates: { status: 'rejected' }
          });
          toast.success(`Successfully rejected ${selectedIds.length} conversation(s)`, { id: toastId });
          clearSelection();
        } catch (error: any) {
          toast.error('Failed to reject conversations', {
            id: toastId,
            description: error?.message || 'An error occurred during bulk rejection'
          });
          console.error('Bulk reject error:', error);
        } finally {
          setIsProcessing(false);
        }
      }
    );
  };
  
  const handleBulkDelete = () => {
    showConfirm(
      'Delete Conversations',
      `Are you sure you want to delete ${selectedIds.length} conversation(s)? This action cannot be undone and will permanently remove these conversations.`,
      async () => {
        setIsProcessing(true);
        const toastId = toast.loading(
          <BulkOperationProgress 
            operation="Deleting conversations" 
            completed={0} 
            total={selectedIds.length}
          />
        );
        
        try {
          await bulkDeleteMutation.mutateAsync(selectedIds);
          toast.success(`Successfully deleted ${selectedIds.length} conversation(s)`, { id: toastId });
          clearSelection();
        } catch (error: any) {
          toast.error('Failed to delete conversations', {
            id: toastId,
            description: error?.message || 'An error occurred during bulk deletion'
          });
          console.error('Bulk delete error:', error);
        } finally {
          setIsProcessing(false);
        }
      }
    );
  };
  
  const handleExport = () => {
    openExportModal();
  };
  
  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-background border border-border rounded-lg shadow-lg px-6 py-4">
        <div className="flex items-center gap-6">
          {/* Selection count */}
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm px-3 py-1">
              {selectedIds.length} selected
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSelection}
              disabled={isProcessing}
            >
              <XCircle className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>
          
          {/* Divider */}
          <div className="h-8 w-px bg-border" />
          
          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={handleBulkApprove}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Check className="h-4 w-4 mr-1" />
              )}
              Approve All
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleBulkReject}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <X className="h-4 w-4 mr-1" />
              )}
              Reject All
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={isProcessing}
            >
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
            
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-1" />
              )}
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

