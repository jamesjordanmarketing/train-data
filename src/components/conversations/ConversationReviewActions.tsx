'use client';

import { useState } from 'react';
import { Conversation } from '@/lib/types/conversations';
import { useUpdateConversation } from '@/hooks/use-conversations';
import { useConversationStore } from '@/stores/conversation-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Check, X, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface ConversationReviewActionsProps {
  conversation: Conversation;
}

export function ConversationReviewActions({ conversation }: ConversationReviewActionsProps) {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const updateMutation = useUpdateConversation();
  const closeModal = useConversationStore((state) => state.closeConversationDetail);
  
  const handleReviewAction = async (
    action: 'approved' | 'rejected' | 'revision_requested',
    actionLabel: string,
    newStatus: 'approved' | 'rejected' | 'needs_revision'
  ) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const reviewAction = {
        id: `review-${Date.now()}`,
        action,
        performedBy: 'current-user', // TODO: Get from auth context
        timestamp: new Date().toISOString(),
        comment: comment || undefined,
      };
      
      const updates = {
        status: newStatus,
        reviewHistory: [
          ...(conversation.reviewHistory || []),
          reviewAction
        ]
      };
      
      await updateMutation.mutateAsync({
        id: conversation.id,
        updates
      });
      
      toast.success(`Conversation ${actionLabel.toLowerCase()}`);
      setComment('');
      closeModal();
    } catch (error) {
      toast.error(`Failed to ${actionLabel.toLowerCase()} conversation`);
      console.error('Review action error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const canApprove = conversation.status !== 'approved';
  const canReject = conversation.status !== 'rejected';
  const canRequestRevision = !['approved', 'rejected'].includes(conversation.status);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Review Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground">
            Comment (optional)
          </label>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment about this conversation..."
            className="mt-1"
            rows={3}
          />
        </div>
        
        <div className="space-y-2">
          <Button
            onClick={() => handleReviewAction('approved', 'Approved', 'approved')}
            disabled={!canApprove || isSubmitting}
            className="w-full"
            variant="default"
          >
            <Check className="h-4 w-4 mr-2" />
            Approve
          </Button>
          
          <Button
            onClick={() => handleReviewAction('revision_requested', 'Revision Requested', 'needs_revision')}
            disabled={!canRequestRevision || isSubmitting}
            className="w-full"
            variant="outline"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Request Revision
          </Button>
          
          <Button
            onClick={() => handleReviewAction('rejected', 'Rejected', 'rejected')}
            disabled={!canReject || isSubmitting}
            className="w-full"
            variant="destructive"
          >
            <X className="h-4 w-4 mr-2" />
            Reject
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground">
          Review actions are permanent and will be logged in the conversation history.
        </p>
      </CardContent>
    </Card>
  );
}

