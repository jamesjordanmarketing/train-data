import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { FileText, User, Calendar, Tag } from 'lucide-react';
import { Separator } from '../ui/separator';

export interface SourceChunk {
  id: string;
  content: string;
  sourceType: 'template' | 'scenario' | 'edge_case';
  sourceName: string;
  sourceId: string;
  persona?: string;
  emotion?: string;
  category?: string[];
  createdAt: string;
  parameters?: Record<string, any>;
}

interface SourceChunkContextProps {
  sourceChunk: SourceChunk | null;
  isLoading?: boolean;
}

export function SourceChunkContext({ sourceChunk, isLoading }: SourceChunkContextProps) {
  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-base">Source Context</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin h-6 w-6 border-4 border-blue-600 border-t-transparent rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!sourceChunk) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-base">Source Context</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No source information available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const tierColors = {
    template: 'bg-purple-100 text-purple-700',
    scenario: 'bg-blue-100 text-blue-700',
    edge_case: 'bg-orange-100 text-orange-700',
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span>Source Context</span>
          <Badge className={tierColors[sourceChunk.sourceType]}>
            {sourceChunk.sourceType === 'edge_case' ? 'Edge Case' : 
             sourceChunk.sourceType.charAt(0).toUpperCase() + sourceChunk.sourceType.slice(1)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-full pr-4">
          <div className="space-y-4">
            {/* Source Name */}
            <div>
              <div className="flex items-center gap-2 text-sm font-medium mb-1">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span>Source Name</span>
              </div>
              <p className="text-sm text-muted-foreground pl-6">{sourceChunk.sourceName}</p>
            </div>

            <Separator />

            {/* Metadata */}
            <div className="space-y-3">
              {sourceChunk.persona && (
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium mb-1">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>Persona</span>
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">{sourceChunk.persona}</p>
                </div>
              )}

              {sourceChunk.emotion && (
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium mb-1">
                    <span className="text-muted-foreground">😊</span>
                    <span>Emotion</span>
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">{sourceChunk.emotion}</p>
                </div>
              )}

              {sourceChunk.category && sourceChunk.category.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium mb-1">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span>Categories</span>
                  </div>
                  <div className="flex flex-wrap gap-1 pl-6">
                    {sourceChunk.category.map((cat, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 text-sm font-medium mb-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Created</span>
                </div>
                <p className="text-sm text-muted-foreground pl-6">
                  {new Date(sourceChunk.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            <Separator />

            {/* Source Content */}
            <div>
              <h4 className="text-sm font-medium mb-2">Source Content</h4>
              <div className="bg-muted/50 rounded-md p-3 text-sm whitespace-pre-wrap break-words">
                {sourceChunk.content}
              </div>
            </div>

            {/* Parameters (if any) */}
            {sourceChunk.parameters && Object.keys(sourceChunk.parameters).length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="text-sm font-medium mb-2">Parameters</h4>
                  <div className="space-y-1">
                    {Object.entries(sourceChunk.parameters).map(([key, value]) => (
                      <div key={key} className="flex items-start gap-2 text-sm">
                        <span className="font-medium text-muted-foreground min-w-24">{key}:</span>
                        <span className="text-muted-foreground">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

