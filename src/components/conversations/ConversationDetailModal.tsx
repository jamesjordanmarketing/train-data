'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useConversationStore } from '@/stores/conversation-store';
import { useConversation } from '@/hooks/use-conversations';
import { ConversationDetailView } from './ConversationDetailView';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function ConversationDetailModal() {
  const modalOpen = useConversationStore((state) => state.modalState.conversationDetailModalOpen);
  const conversationId = useConversationStore((state) => state.modalState.currentConversationId);
  const closeModal = useConversationStore((state) => state.closeConversationDetail);
  
  const { data: conversation, isLoading, error } = useConversation(conversationId);
  
  return (
    <Dialog open={modalOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Conversation Details</DialogTitle>
        </DialogHeader>
        
        {isLoading && (
          <div className="space-y-4 py-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        )}
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load conversation details. {error instanceof Error ? error.message : 'Unknown error'}
            </AlertDescription>
          </Alert>
        )}
        
        {conversation && (
          <ConversationDetailView 
            conversation={conversation}
            turns={conversation.turns || []}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

