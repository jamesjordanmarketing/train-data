import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { 
  CheckCircle, 
  AlertCircle, 
  Save, 
  RefreshCw, 
  Eye, 
  TrendingUp,
  MessageSquare,
  Hash,
  User,
  Bot
} from 'lucide-react';
import { Conversation } from '../../lib/types';
import { cn } from '../../lib/utils';

interface ConversationPreviewProps {
  conversation: Conversation;
  onSave: () => void;
  onRegenerate: () => void;
  onClose: () => void;
  saving?: boolean;
  regenerating?: boolean;
}

export function ConversationPreview({ 
  conversation, 
  onSave, 
  onRegenerate, 
  onClose,
  saving = false,
  regenerating = false
}: ConversationPreviewProps) {
  const [showAllTurns, setShowAllTurns] = useState(false);

  const getQualityColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 6) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getQualityLabel = (score: number) => {
    if (score >= 8) return 'Excellent';
    if (score >= 7) return 'Good';
    if (score >= 6) return 'Fair';
    return 'Needs Improvement';
  };

  const displayTurns = showAllTurns ? conversation.turns : conversation.turns.slice(0, 4);
  const hasMoreTurns = conversation.turns.length > 4;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Conversation Generated Successfully
          </DialogTitle>
          <DialogDescription>
            Review your generated conversation below
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          {/* Metadata Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Quality Score</p>
                    <p className={cn('text-lg font-bold', getQualityColor(conversation.qualityScore).split(' ')[0])}>
                      {conversation.qualityScore.toFixed(1)}/10
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Total Turns</p>
                    <p className="text-lg font-bold">{conversation.totalTurns}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Total Tokens</p>
                    <p className="text-lg font-bold">{conversation.totalTokens}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-gray-500">Status</p>
                    <Badge className="mt-1">{getQualityLabel(conversation.qualityScore)}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Conversation Details */}
          <Card>
            <CardContent className="p-4 space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 font-medium">Title:</span>
                  <p className="text-gray-900 mt-1">{conversation.title}</p>
                </div>
                <div>
                  <span className="text-gray-600 font-medium">Tier:</span>
                  <Badge className="mt-1 capitalize">{conversation.tier}</Badge>
                </div>
                {conversation.persona && (
                  <div>
                    <span className="text-gray-600 font-medium">Persona:</span>
                    <p className="text-gray-900 mt-1">{conversation.persona}</p>
                  </div>
                )}
                {conversation.emotion && (
                  <div>
                    <span className="text-gray-600 font-medium">Emotion:</span>
                    <p className="text-gray-900 mt-1">{conversation.emotion}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quality Breakdown */}
          {conversation.qualityMetrics && (
            <Card className={cn('border-2', getQualityColor(conversation.qualityScore))}>
              <CardContent className="p-4">
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Quality Metrics
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-gray-600">Relevance:</span>
                    <p className="font-medium">{conversation.qualityMetrics.relevance.toFixed(1)}/10</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Accuracy:</span>
                    <p className="font-medium">{conversation.qualityMetrics.accuracy.toFixed(1)}/10</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Naturalness:</span>
                    <p className="font-medium">{conversation.qualityMetrics.naturalness.toFixed(1)}/10</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Coherence:</span>
                    <p className="font-medium">{conversation.qualityMetrics.coherence.toFixed(1)}/10</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs">
                  <div>
                    <span className="text-gray-600">Confidence:</span>
                    <Badge variant="outline" className="ml-2 capitalize">
                      {conversation.qualityMetrics.confidence}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-gray-600">Training Value:</span>
                    <Badge variant="outline" className="ml-2 capitalize">
                      {conversation.qualityMetrics.trainingValue}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Conversation Turns */}
          <Card className="flex-1 overflow-hidden flex flex-col">
            <CardContent className="p-4 flex-1 overflow-hidden flex flex-col">
              <h4 className="font-semibold text-sm mb-3">Conversation Preview</h4>
              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-4">
                  {displayTurns.map((turn, index) => (
                    <div key={index} className="space-y-2">
                      <div className={cn(
                        'p-3 rounded-lg',
                        turn.role === 'user' 
                          ? 'bg-blue-50 border border-blue-200' 
                          : 'bg-gray-50 border border-gray-200'
                      )}>
                        <div className="flex items-start gap-2">
                          {turn.role === 'user' ? (
                            <User className="h-4 w-4 mt-1 text-blue-600 flex-shrink-0" />
                          ) : (
                            <Bot className="h-4 w-4 mt-1 text-gray-600 flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-semibold uppercase text-gray-600">
                                {turn.role}
                              </span>
                              <span className="text-xs text-gray-400">
                                {turn.tokenCount} tokens
                              </span>
                            </div>
                            <p className="text-sm text-gray-900 whitespace-pre-wrap break-words">
                              {turn.content}
                            </p>
                          </div>
                        </div>
                      </div>
                      {index < displayTurns.length - 1 && <Separator className="my-2" />}
                    </div>
                  ))}

                  {hasMoreTurns && !showAllTurns && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAllTurns(true)}
                      className="w-full"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Show All {conversation.totalTurns} Turns
                    </Button>
                  )}

                  {showAllTurns && hasMoreTurns && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAllTurns(false)}
                      className="w-full"
                    >
                      Show Less
                    </Button>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="flex-row gap-2 justify-between sm:justify-between">
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={saving || regenerating}
            >
              Close
            </Button>
            <Button 
              variant="outline" 
              onClick={onRegenerate}
              disabled={saving || regenerating}
              className="gap-2"
            >
              {regenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Regenerating...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Regenerate
                </>
              )}
            </Button>
          </div>
          <Button 
            onClick={onSave}
            disabled={saving || regenerating}
            className="gap-2"
          >
            {saving ? (
              <>
                <Save className="h-4 w-4 animate-pulse" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Conversation
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

