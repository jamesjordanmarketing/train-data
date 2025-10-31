'use client';

import { useEffect } from 'react';
import { Conversation, ConversationTurn } from '@/lib/types/conversations';
import { ConversationTurns } from './ConversationTurns';
import { ConversationMetadataPanel } from './ConversationMetadataPanel';
import { ConversationReviewActions } from './ConversationReviewActions';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useFilteredConversations } from '@/hooks/use-filtered-conversations';
import { useConversationStore } from '@/stores/conversation-store';

interface ConversationDetailViewProps {
  conversation: Conversation;
  turns: ConversationTurn[];
}

export function ConversationDetailView({ conversation, turns }: ConversationDetailViewProps) {
  const { conversations } = useFilteredConversations();
  const openConversationDetail = useConversationStore((state) => state.openConversationDetail);
  
  // Find current conversation index for navigation
  const currentIndex = conversations.findIndex(c => c.id === conversation.id);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < conversations.length - 1;
  
  const handlePrevious = () => {
    if (hasPrevious) {
      openConversationDetail(conversations[currentIndex - 1].id);
    }
  };
  
  const handleNext = () => {
    if (hasNext) {
      openConversationDetail(conversations[currentIndex + 1].id);
    }
  };
  
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && hasPrevious) {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === 'ArrowRight' && hasNext) {
        e.preventDefault();
        handleNext();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, conversations, hasPrevious, hasNext]);
  
  return (
    <div className="flex flex-col h-full">
      {/* Navigation Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b">
        <div>
          <h3 className="font-mono text-sm text-muted-foreground">{conversation.conversationId}</h3>
          <p className="text-xs text-muted-foreground mt-1">
            {currentIndex >= 0 ? currentIndex + 1 : 0} of {conversations.length} conversations
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            disabled={!hasPrevious}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={!hasNext}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
      
      {/* Two-column layout */}
      <div className="grid grid-cols-3 gap-6 flex-1 overflow-hidden">
        {/* Left column: Conversation turns (2/3 width) */}
        <div className="col-span-2 overflow-y-auto pr-2">
          <ConversationTurns turns={turns} />
        </div>
        
        {/* Right column: Metadata and actions (1/3 width) */}
        <div className="space-y-6 overflow-y-auto pr-2">
          <ConversationMetadataPanel conversation={conversation} />
          <ConversationReviewActions conversation={conversation} />
        </div>
      </div>
    </div>
  );
}

