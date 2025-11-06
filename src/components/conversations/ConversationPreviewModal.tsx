/**
 * Conversation Preview Modal
 * 
 * Modal for previewing conversation details and turns
 */

'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ThumbsUp, 
  ThumbsDown, 
  Loader2,
  User,
  Bot,
  AlertCircle
} from 'lucide-react';
import { Conversation, ConversationTurn } from '@/lib/types/conversations';
import { getTierVariant, getStatusVariant, formatDate } from '@/lib/utils/query-params';
import { toast } from 'sonner';

interface ConversationPreviewModalProps {
  conversationId: string;
  onClose: () => void;
  onApprove?: () => void;
  onReject?: () => void;
}

export function ConversationPreviewModal({
  conversationId,
  onClose,
  onApprove,
  onReject,
}: ConversationPreviewModalProps) {
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchConversation();
  }, [conversationId]);

  const fetchConversation = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/conversations/${conversationId}?includeTurns=true`);

      if (!response.ok) {
        throw new Error('Failed to fetch conversation');
      }

      const data = await response.json();
      setConversation(data);
    } catch (err) {
      console.error('Error fetching conversation:', err);
      setError('Failed to load conversation details');
      toast.error('Failed to load conversation');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error || !conversation) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-4xl">
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <p className="text-lg text-muted-foreground">
              {error || 'Conversation not found'}
            </p>
            <Button onClick={onClose}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <DialogTitle className="text-2xl">
                {conversation.title || 'Untitled Conversation'}
              </DialogTitle>
              <DialogDescription className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={getTierVariant(conversation.tier)}>
                    {conversation.tier}
                  </Badge>
                  <Badge variant={getStatusVariant(conversation.status)}>
                    {conversation.status}
                  </Badge>
                  {conversation.qualityScore && (
                    <Badge variant="outline">
                      Quality: {conversation.qualityScore.toFixed(1)}
                    </Badge>
                  )}
                </div>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Separator />

        {/* Metadata */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Persona:</span> {conversation.persona}
          </div>
          <div>
            <span className="font-medium">Emotion:</span> {conversation.emotion}
          </div>
          {conversation.topic && (
            <div>
              <span className="font-medium">Topic:</span> {conversation.topic}
            </div>
          )}
          {conversation.intent && (
            <div>
              <span className="font-medium">Intent:</span> {conversation.intent}
            </div>
          )}
          <div>
            <span className="font-medium">Turns:</span> {conversation.turnCount}
          </div>
          <div>
            <span className="font-medium">Tokens:</span> {conversation.totalTokens.toLocaleString()}
          </div>
          <div>
            <span className="font-medium">Created:</span> {formatDate(conversation.createdAt)}
          </div>
          {conversation.approvedBy && (
            <div>
              <span className="font-medium">Approved By:</span> {conversation.approvedBy}
            </div>
          )}
        </div>

        {conversation.category && conversation.category.length > 0 && (
          <div className="space-y-2">
            <span className="text-sm font-medium">Categories:</span>
            <div className="flex flex-wrap gap-1">
              {conversation.category.map((cat) => (
                <Badge key={cat} variant="secondary" className="text-xs">
                  {cat}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Conversation Turns */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Conversation</h4>
          <ScrollArea className="h-64 w-full rounded-md border p-4">
            <div className="space-y-4">
              {conversation.turns && conversation.turns.length > 0 ? (
                conversation.turns.map((turn: ConversationTurn) => (
                  <div
                    key={turn.id}
                    className={`flex gap-3 ${
                      turn.role === 'assistant' ? 'bg-muted/50' : ''
                    } p-3 rounded-lg`}
                  >
                    <div className="flex-shrink-0">
                      {turn.role === 'user' ? (
                        <User className="h-5 w-5 text-primary" />
                      ) : (
                        <Bot className="h-5 w-5 text-secondary" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="text-xs text-muted-foreground font-medium">
                        {turn.role === 'user' ? 'Client' : 'Advisor'} - Turn {turn.turnNumber}
                      </div>
                      <div className="text-sm whitespace-pre-wrap">{turn.content}</div>
                      {turn.tokenCount && (
                        <div className="text-xs text-muted-foreground">
                          {turn.tokenCount} tokens
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  No turns available
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Review History */}
        {conversation.reviewHistory && conversation.reviewHistory.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Review History</h4>
              <div className="space-y-2">
                {conversation.reviewHistory.map((review, index) => (
                  <div key={index} className="text-xs bg-muted p-2 rounded">
                    <div className="font-medium">{review.action}</div>
                    <div className="text-muted-foreground">
                      by {review.performedBy} at {formatDate(review.timestamp)}
                    </div>
                    {review.comment && (
                      <div className="mt-1">{review.comment}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {onReject && conversation.status !== 'rejected' && (
            <Button variant="destructive" onClick={onReject} className="gap-2">
              <ThumbsDown className="h-4 w-4" />
              Reject
            </Button>
          )}
          {onApprove && conversation.status !== 'approved' && (
            <Button onClick={onApprove} className="gap-2">
              <ThumbsUp className="h-4 w-4" />
              Approve
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

