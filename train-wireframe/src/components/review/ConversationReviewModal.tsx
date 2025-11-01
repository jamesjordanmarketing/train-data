import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  AlertTriangle,
  Loader2,
  HelpCircle
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useAppStore } from '../../stores/useAppStore';
import { Conversation } from '../../lib/types';
import { ConversationDisplayPanel } from './ConversationDisplayPanel';
import { SourceChunkContext, SourceChunk } from './SourceChunkContext';
import { ReviewActionControls, ReviewActionType } from './ReviewActionControls';
import { ReviewHistoryPanel } from './ReviewHistoryPanel';
import { KeyboardShortcutsHelp } from './KeyboardShortcutsHelp';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';
import { cn } from '../../lib/utils';

interface ConversationReviewModalProps {
  conversationId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigateNext?: () => void;
  onNavigatePrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

// API functions
async function fetchConversationDetails(conversationId: string): Promise<Conversation> {
  const response = await fetch(`/api/conversations/${conversationId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch conversation details');
  }
  return response.json();
}

async function submitReviewAction(
  conversationId: string,
  action: ReviewActionType,
  comment: string,
  reasons: string[]
) {
  const actionMap = {
    approve: 'approved',
    reject: 'rejected',
    request_changes: 'needs_revision'
  };

  const response = await fetch(`/api/review/${conversationId}/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: actionMap[action],
      comment,
      reasons
    })
  });

  if (!response.ok) {
    throw new Error('Failed to submit review action');
  }

  return response.json();
}

export function ConversationReviewModal({
  conversationId,
  open,
  onOpenChange,
  onNavigateNext,
  onNavigatePrevious,
  hasNext = false,
  hasPrevious = false
}: ConversationReviewModalProps) {
  const { conversations, updateConversation, showConfirm } = useAppStore();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [sourceChunk, setSourceChunk] = useState<SourceChunk | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHelpDialog, setShowHelpDialog] = useState(false);

  // Load conversation data
  const loadConversation = useCallback(async () => {
    if (!conversationId || !open) return;

    setIsLoading(true);
    setError(null);

    try {
      // In a real implementation, fetch from API
      // const data = await fetchConversationDetails(conversationId);
      
      // For now, get from store
      const conv = conversations.find(c => c.id === conversationId);
      if (!conv) {
        throw new Error('Conversation not found');
      }

      setConversation(conv);

      // Mock source chunk data (in real implementation, fetch from API)
      const mockSourceChunk: SourceChunk = {
        id: conv.parentId || 'source-1',
        content: 'This is the source template/scenario content that was used to generate this conversation.',
        sourceType: conv.tier,
        sourceName: conv.parentType === 'template' ? 'Template Name' : 'Scenario Name',
        sourceId: conv.parentId || 'unknown',
        persona: conv.persona,
        emotion: conv.emotion,
        category: conv.category,
        createdAt: conv.createdAt,
        parameters: conv.parameters
      };
      setSourceChunk(mockSourceChunk);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load conversation';
      console.error('Failed to load conversation:', err);
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, conversations, open]);

  useEffect(() => {
    loadConversation();
  }, [loadConversation]);

  // Keyboard shortcuts handlers
  const handleApproveShortcut = () => {
    if (!isSubmitting) {
      handleAction('approve', '', []);
    }
  };

  const handleRejectShortcut = () => {
    if (!isSubmitting) {
      // Note: Full rejection requires comment, so just focus the action controls
      toast.info('Please provide a comment for rejection');
    }
  };

  const handleChangesShortcut = () => {
    if (!isSubmitting) {
      // Note: Changes require comment, so just focus the action controls
      toast.info('Please provide a comment for change requests');
    }
  };

  const handleNextShortcut = () => {
    if (hasNext && onNavigateNext) {
      onNavigateNext();
    }
  };

  const handlePreviousShortcut = () => {
    if (hasPrevious && onNavigatePrevious) {
      onNavigatePrevious();
    }
  };

  const handleCloseShortcut = () => {
    onOpenChange(false);
  };

  const handleHelpShortcut = () => {
    setShowHelpDialog(true);
  };

  // Configure keyboard shortcuts
  const shortcuts = {
    'a': handleApproveShortcut,
    'r': handleRejectShortcut,
    'c': handleChangesShortcut,
    'n': handleNextShortcut,
    'p': handlePreviousShortcut,
    'escape': handleCloseShortcut,
    '?': handleHelpShortcut
  };

  // Use the keyboard shortcuts hook
  useKeyboardShortcuts(shortcuts, open);

  // Handle review actions
  const handleAction = async (
    action: ReviewActionType,
    comment: string,
    reasons: string[]
  ) => {
    if (!conversation) return;

    // Show confirmation for destructive actions
    if (action === 'reject') {
      return new Promise<void>((resolve, reject) => {
        showConfirm({
          title: 'Confirm Rejection',
          message: 'Are you sure you want to reject this conversation? This action cannot be undone.',
          onConfirm: async () => {
            try {
              await submitAction(action, comment, reasons);
              resolve();
            } catch (err) {
              reject(err);
            }
          },
          onCancel: () => reject(new Error('Action cancelled'))
        });
      });
    }

    await submitAction(action, comment, reasons);
  };

  const submitAction = async (
    action: ReviewActionType,
    comment: string,
    reasons: string[]
  ) => {
    if (!conversation) return;

    setIsSubmitting(true);

    try {
      // Optimistic update
      const newStatus = action === 'approve' ? 'approved' : 
                       action === 'reject' ? 'rejected' : 
                       'needs_revision';

      const previousStatus = conversation.status;

      // Update UI immediately
      updateConversation(conversation.id, { status: newStatus });

      // Submit to API
      try {
        // await submitReviewAction(conversation.id, action, comment, reasons);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Success notification
        const actionText = action === 'approve' ? 'approved' : 
                          action === 'reject' ? 'rejected' : 
                          'marked for revision';
        toast.success(`Conversation ${actionText} successfully`);

        // Close modal and navigate to next if available
        if (hasNext && onNavigateNext) {
          onNavigateNext();
        } else {
          onOpenChange(false);
        }
      } catch (error) {
        // Rollback on error
        updateConversation(conversation.id, { status: previousStatus });
        throw error;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit review action';
      console.error('Failed to submit review action:', err);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quality score color
  const getQualityColor = (score?: number) => {
    if (!score) return 'bg-gray-50 text-gray-700 border-gray-200';
    if (score >= 8) return 'bg-green-50 text-green-700 border-green-200';
    if (score >= 6) return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    return 'bg-red-50 text-red-700 border-red-200';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] h-[95vh] p-0 gap-0">
        {/* Header */}
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <DialogTitle className="text-xl">Review Conversation</DialogTitle>
                {conversation && (
                  <Badge className={getQualityColor(conversation.qualityScore)}>
                    Quality: {conversation.qualityScore?.toFixed(1) || 'N/A'}
                  </Badge>
                )}
              </div>
              {conversation && (
                <DialogDescription className="text-sm">
                  ID: {conversation.id} • Created: {new Date(conversation.createdAt).toLocaleDateString()}
                </DialogDescription>
              )}
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-2 ml-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHelpDialog(true)}
                title="Show keyboard shortcuts (Press ?)"
              >
                <HelpCircle className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onNavigatePrevious}
                disabled={!hasPrevious || isLoading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onNavigateNext}
                disabled={!hasNext || isLoading}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Separator />

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <p className="text-sm text-muted-foreground">Loading conversation...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-4 max-w-md text-center">
                <AlertTriangle className="h-12 w-12 text-red-500" />
                <h3 className="text-lg font-semibold">Failed to Load Conversation</h3>
                <p className="text-sm text-muted-foreground">{error}</p>
                <Button onClick={loadConversation}>Try Again</Button>
              </div>
            </div>
          ) : conversation ? (
            <div className="grid grid-cols-[60%_40%] gap-6 p-6 h-full overflow-hidden">
              {/* Left Panel: Conversation Display */}
              <div className="flex flex-col gap-4 overflow-hidden">
                <ConversationDisplayPanel
                  turns={conversation.turns}
                  title={conversation.title}
                  totalTokens={conversation.totalTokens}
                />
              </div>

              {/* Right Panel: Context and Actions */}
              <div className="flex flex-col gap-4 overflow-hidden">
                <SourceChunkContext sourceChunk={sourceChunk} />
                
                <ReviewHistoryPanel history={conversation.reviewHistory || []} />
                
                <ReviewActionControls
                  onAction={handleAction}
                  isSubmitting={isSubmitting}
                  disabled={isLoading}
                />
              </div>
            </div>
          ) : null}
        </div>

        {/* Keyboard Shortcuts Help Dialog */}
        <KeyboardShortcutsHelp 
          isOpen={showHelpDialog} 
          onClose={() => setShowHelpDialog(false)} 
        />
      </DialogContent>
    </Dialog>
  );
}

