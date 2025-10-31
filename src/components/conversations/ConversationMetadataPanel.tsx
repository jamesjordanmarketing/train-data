'use client';

import { Conversation } from '@/lib/types/conversations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface ConversationMetadataPanelProps {
  conversation: Conversation;
}

export function ConversationMetadataPanel({ conversation }: ConversationMetadataPanelProps) {
  const qualityMetrics = conversation.qualityMetrics;
  
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'rejected':
        return 'destructive';
      case 'pending_review':
        return 'secondary';
      default:
        return 'outline';
    }
  };
  
  return (
    <div className="space-y-4">
      {/* Basic Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <span className="text-xs font-medium text-muted-foreground">Status</span>
            <div className="mt-1">
              <Badge variant={getStatusVariant(conversation.status)}>
                {conversation.status.replace('_', ' ')}
              </Badge>
            </div>
          </div>
          
          <div>
            <span className="text-xs font-medium text-muted-foreground">Tier</span>
            <div className="mt-1">
              <Badge variant="outline">{conversation.tier}</Badge>
            </div>
          </div>
          
          <div>
            <span className="text-xs font-medium text-muted-foreground">Total Turns</span>
            <p className="mt-1 text-sm font-medium">{conversation.turnCount}</p>
          </div>
          
          {conversation.totalTokens > 0 && (
            <div>
              <span className="text-xs font-medium text-muted-foreground">Total Tokens</span>
              <p className="mt-1 text-sm font-medium">{conversation.totalTokens.toLocaleString()}</p>
            </div>
          )}
          
          <div>
            <span className="text-xs font-medium text-muted-foreground">Created</span>
            <p className="mt-1 text-sm">{new Date(conversation.createdAt).toLocaleString()}</p>
          </div>
          
          <div>
            <span className="text-xs font-medium text-muted-foreground">Last Updated</span>
            <p className="mt-1 text-sm">{new Date(conversation.updatedAt).toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>
      
      {/* Context Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Context</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {conversation.persona && (
            <div>
              <span className="text-xs font-medium text-muted-foreground">Persona</span>
              <p className="mt-1 text-sm">{conversation.persona}</p>
            </div>
          )}
          
          {conversation.emotion && (
            <div>
              <span className="text-xs font-medium text-muted-foreground">Emotion</span>
              <p className="mt-1 text-sm">{conversation.emotion}</p>
            </div>
          )}
          
          {conversation.topic && (
            <div>
              <span className="text-xs font-medium text-muted-foreground">Topic</span>
              <p className="mt-1 text-sm">{conversation.topic}</p>
            </div>
          )}
          
          {conversation.intent && (
            <div>
              <span className="text-xs font-medium text-muted-foreground">Intent</span>
              <p className="mt-1 text-sm">{conversation.intent}</p>
            </div>
          )}
          
          {conversation.tone && (
            <div>
              <span className="text-xs font-medium text-muted-foreground">Tone</span>
              <p className="mt-1 text-sm">{conversation.tone}</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Quality Metrics Card */}
      {qualityMetrics && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quality Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium">Overall Score</span>
                <span className="text-sm font-bold text-green-600">
                  {qualityMetrics.overall?.toFixed(1) || 'N/A'}
                </span>
              </div>
            </div>
            
            {qualityMetrics.relevance !== undefined && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs">Relevance</span>
                  <span className="text-xs font-medium">{qualityMetrics.relevance.toFixed(1)}/10</span>
                </div>
                <Progress value={qualityMetrics.relevance * 10} className="h-2" />
              </div>
            )}
            
            {qualityMetrics.accuracy !== undefined && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs">Accuracy</span>
                  <span className="text-xs font-medium">{qualityMetrics.accuracy.toFixed(1)}/10</span>
                </div>
                <Progress value={qualityMetrics.accuracy * 10} className="h-2" />
              </div>
            )}
            
            {qualityMetrics.naturalness !== undefined && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs">Naturalness</span>
                  <span className="text-xs font-medium">{qualityMetrics.naturalness.toFixed(1)}/10</span>
                </div>
                <Progress value={qualityMetrics.naturalness * 10} className="h-2" />
              </div>
            )}
            
            {qualityMetrics.coherence !== undefined && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs">Coherence</span>
                  <span className="text-xs font-medium">{qualityMetrics.coherence.toFixed(1)}/10</span>
                </div>
                <Progress value={qualityMetrics.coherence * 10} className="h-2" />
              </div>
            )}
            
            {qualityMetrics.confidence && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs">Confidence</span>
                  <Badge variant="outline" className="text-xs">
                    {qualityMetrics.confidence}
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Review History Card */}
      {conversation.reviewHistory && conversation.reviewHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Review History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {conversation.reviewHistory.map((review, index) => (
              <div key={review.id || index} className="text-sm border-l-2 border-muted pl-3 py-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {review.action.replace('_', ' ')}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(review.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  By: {review.performedBy}
                </p>
                {review.comment && (
                  <p className="text-xs text-muted-foreground mt-1">{review.comment}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

