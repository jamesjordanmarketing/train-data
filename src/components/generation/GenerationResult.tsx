'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Eye, Plus, ArrowRight } from 'lucide-react';

interface GenerationResultProps {
  result: {
    conversation: {
      id: string;
      title?: string;
      totalTurns?: number;
      totalTokens?: number;
      qualityScore?: number;
      status?: string;
    };
    cost?: number;
    quality_metrics?: {
      quality_score?: number;
      turn_count?: number;
      status?: string;
    };
    metadata?: {
      generation_time_ms?: number;
      token_count?: number;
    };
    qualityMetrics?: {
      durationMs?: number;
    };
  } | null;
  error: string | null;
  onViewConversation: () => void;
  onGenerateAnother: () => void;
  onGoToDashboard: () => void;
}

export function GenerationResult({
  result,
  error,
  onViewConversation,
  onGenerateAnother,
  onGoToDashboard
}: GenerationResultProps) {
  // Error state
  if (error) {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertTitle>Generation Failed</AlertTitle>
        <AlertDescription>
          {error}
        </AlertDescription>
        <div className="flex gap-2 mt-4">
          <Button variant="outline" onClick={onGenerateAnother}>
            Try Again
          </Button>
        </div>
      </Alert>
    );
  }

  // Success state
  if (result) {
    const { conversation, cost, quality_metrics, metadata, qualityMetrics } = result;
    
    // Extract values with fallbacks
    const qualityScore = conversation.qualityScore ?? quality_metrics?.quality_score;
    const totalTurns = conversation.totalTurns ?? quality_metrics?.turn_count;
    const totalTokens = conversation.totalTokens ?? metadata?.token_count;
    const status = conversation.status ?? quality_metrics?.status ?? 'generated';
    const durationMs = qualityMetrics?.durationMs ?? metadata?.generation_time_ms;
    
    const qualityColor = qualityScore && qualityScore >= 8 ? 'text-green-500' :
                         qualityScore && qualityScore >= 6 ? 'text-yellow-500' :
                         'text-red-500';

    return (
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Success Header */}
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <h3 className="text-xl font-semibold">Conversation Generated Successfully!</h3>
                <p className="text-sm text-muted-foreground">
                  Your conversation is ready to view
                </p>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-3 border-t pt-4">
              <h4 className="font-medium">Conversation Details:</h4>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">ID:</span>
                  <p className="font-mono text-xs">{conversation.id}</p>
                </div>

                {conversation.title && (
                  <div>
                    <span className="text-muted-foreground">Title:</span>
                    <p>{conversation.title}</p>
                  </div>
                )}

                {totalTurns !== undefined && (
                  <div>
                    <span className="text-muted-foreground">Turns:</span>
                    <p>{totalTurns}</p>
                  </div>
                )}

                {totalTokens !== undefined && (
                  <div>
                    <span className="text-muted-foreground">Tokens:</span>
                    <p>{totalTokens.toLocaleString()}</p>
                  </div>
                )}

                {qualityScore !== undefined && (
                  <div>
                    <span className="text-muted-foreground">Quality Score:</span>
                    <p className={`font-bold ${qualityColor}`}>
                      {qualityScore.toFixed(1)}/10
                    </p>
                  </div>
                )}

                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant={status === 'generated' ? 'default' : 'secondary'}>
                    {status}
                  </Badge>
                </div>

                {cost !== undefined && (
                  <div>
                    <span className="text-muted-foreground">Cost:</span>
                    <p>${cost.toFixed(4)}</p>
                  </div>
                )}

                {durationMs !== undefined && (
                  <div>
                    <span className="text-muted-foreground">Duration:</span>
                    <p>{(durationMs / 1000).toFixed(1)}s</p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
              <Button onClick={onViewConversation} className="flex-1">
                <Eye className="h-4 w-4 mr-2" />
                View Conversation
              </Button>
              <Button onClick={onGenerateAnother} variant="outline" className="flex-1">
                <Plus className="h-4 w-4 mr-2" />
                Generate Another
              </Button>
              <Button onClick={onGoToDashboard} variant="outline" className="flex-1">
                <ArrowRight className="h-4 w-4 mr-2" />
                Go to Dashboard
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}

