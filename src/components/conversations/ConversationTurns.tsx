'use client';

import { ConversationTurn } from '@/lib/types/conversations';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { User, Bot } from 'lucide-react';

interface ConversationTurnsProps {
  turns: ConversationTurn[];
}

export function ConversationTurns({ turns }: ConversationTurnsProps) {
  if (turns.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No conversation turns available
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {turns.map((turn) => (
        <div
          key={turn.id}
          className={cn(
            "flex gap-4",
            turn.role === 'user' ? 'flex-row' : 'flex-row-reverse'
          )}
        >
          {/* Avatar */}
          <Avatar className={cn(
            "h-10 w-10 shrink-0",
            turn.role === 'user' ? 'bg-blue-500' : 'bg-purple-500'
          )}>
            <AvatarFallback>
              {turn.role === 'user' ? <User className="h-5 w-5 text-white" /> : <Bot className="h-5 w-5 text-white" />}
            </AvatarFallback>
          </Avatar>
          
          {/* Message bubble */}
          <div className={cn(
            "flex-1 space-y-2",
            turn.role === 'user' ? 'mr-12' : 'ml-12'
          )}>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {turn.role === 'user' ? 'User' : 'Assistant'}
              </span>
              <span className="text-xs text-muted-foreground">
                Turn {turn.turnNumber}
              </span>
              {turn.tokenCount && turn.tokenCount > 0 && (
                <span className="text-xs text-muted-foreground">
                  • {turn.tokenCount} tokens
                </span>
              )}
            </div>
            
            <div className={cn(
              "rounded-lg p-4",
              turn.role === 'user' 
                ? 'bg-blue-50 border border-blue-200' 
                : 'bg-purple-50 border border-purple-200'
            )}>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">
                {turn.content}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

