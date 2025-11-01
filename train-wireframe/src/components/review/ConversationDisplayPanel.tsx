import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { MessageSquare, User, Bot } from 'lucide-react';
import { ConversationTurn } from '../../lib/types';
import { cn } from '../../lib/utils';

interface ConversationDisplayPanelProps {
  turns: ConversationTurn[];
  title: string;
  totalTokens?: number;
  isLoading?: boolean;
}

export function ConversationDisplayPanel({ 
  turns, 
  title, 
  totalTokens,
  isLoading 
}: ConversationDisplayPanelProps) {
  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-base">Conversation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin h-6 w-6 border-4 border-blue-600 border-t-transparent rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!turns || turns.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-base">Conversation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No conversation turns available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="space-y-2">
          <CardTitle className="text-base">{title}</CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{turns.length} turns</span>
            {totalTokens && (
              <>
                <span>•</span>
                <span>{totalTokens.toLocaleString()} tokens</span>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-full pr-4">
          <div className="space-y-4">
            {turns.map((turn, index) => (
              <div 
                key={index}
                className={cn(
                  "relative rounded-lg p-4 transition-colors",
                  turn.role === 'user' 
                    ? "bg-blue-50 border border-blue-200" 
                    : "bg-gray-50 border border-gray-200"
                )}
              >
                {/* Turn header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {turn.role === 'user' ? (
                      <>
                        <User className="h-4 w-4 text-blue-600" />
                        <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                          User
                        </Badge>
                      </>
                    ) : (
                      <>
                        <Bot className="h-4 w-4 text-gray-600" />
                        <Badge className="bg-gray-100 text-gray-700 border-gray-200">
                          Assistant
                        </Badge>
                      </>
                    )}
                    <span className="text-xs text-muted-foreground">
                      Turn {index + 1}
                    </span>
                  </div>
                  {turn.tokenCount && (
                    <span className="text-xs text-muted-foreground">
                      {turn.tokenCount} tokens
                    </span>
                  )}
                </div>

                {/* Turn content */}
                <div className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                  {turn.content}
                </div>

                {/* Timestamp */}
                {turn.timestamp && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    {new Date(turn.timestamp).toLocaleString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

