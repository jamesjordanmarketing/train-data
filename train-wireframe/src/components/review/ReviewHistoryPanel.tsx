import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { CheckCircle, XCircle, AlertCircle, Clock, User } from 'lucide-react';
import { ReviewAction } from '../../lib/types';

interface ReviewHistoryPanelProps {
  history: ReviewAction[];
  isLoading?: boolean;
}

export function ReviewHistoryPanel({ history, isLoading }: ReviewHistoryPanelProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Review History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin h-6 w-6 border-4 border-blue-600 border-t-transparent rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!history || history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Review History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No review history yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getActionIcon = (action: ReviewAction['action']) => {
    switch (action) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'revision_requested':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'moved_to_review':
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActionColor = (action: ReviewAction['action']) => {
    switch (action) {
      case 'approved':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'revision_requested':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'moved_to_review':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getActionLabel = (action: ReviewAction['action']) => {
    switch (action) {
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'revision_requested':
        return 'Changes Requested';
      case 'moved_to_review':
        return 'Moved to Review';
      case 'generated':
        return 'Generated';
      default:
        return action;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Review History</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-48 pr-4">
          <div className="space-y-3">
            {history.map((item, index) => (
              <div key={item.id} className="relative">
                {/* Timeline connector */}
                {index < history.length - 1 && (
                  <div className="absolute left-2 top-6 bottom-0 w-px bg-gray-200" />
                )}
                
                <div className="flex gap-3">
                  {/* Icon */}
                  <div className="relative z-10 mt-0.5">
                    {getActionIcon(item.action)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <Badge className={getActionColor(item.action)}>
                        {getActionLabel(item.action)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(item.timestamp)}
                      </span>
                    </div>

                    {item.performedBy && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>{item.performedBy}</span>
                      </div>
                    )}

                    {item.comment && (
                      <p className="text-sm text-muted-foreground bg-muted/50 rounded p-2 mt-1">
                        {item.comment}
                      </p>
                    )}

                    {item.reasons && item.reasons.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.reasons.map((reason, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {reason}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

