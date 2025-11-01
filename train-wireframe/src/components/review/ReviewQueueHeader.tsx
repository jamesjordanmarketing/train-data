import { RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';

export interface QueueStatistics {
  totalPending: number;
  averageQuality: number;
  oldestPendingDate: string;
}

interface ReviewQueueHeaderProps {
  statistics: QueueStatistics;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export function ReviewQueueHeader({ statistics, onRefresh, isRefreshing }: ReviewQueueHeaderProps) {
  const getQualityColor = (score: number) => {
    if (score >= 8) return 'bg-green-50 text-green-700 border-green-200';
    if (score >= 6) return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    return 'bg-red-50 text-red-700 border-red-200';
  };
  
  const formatOldestDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };
  
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Review Queue</h1>
        <p className="text-muted-foreground mt-1">
          {statistics.totalPending} conversation{statistics.totalPending !== 1 ? 's' : ''} awaiting review
        </p>
      </div>
      <div className="flex items-center gap-4">
        {statistics.totalPending > 0 && (
          <>
            <div className="text-sm flex items-center gap-2">
              <span className="text-muted-foreground">Avg Quality:</span>
              <Badge className={cn(getQualityColor(statistics.averageQuality))}>
                {statistics.averageQuality.toFixed(1)}
              </Badge>
            </div>
            <div className="text-sm flex items-center gap-2">
              <span className="text-muted-foreground">Oldest:</span>
              <span className="font-medium">{formatOldestDate(statistics.oldestPendingDate)}</span>
            </div>
          </>
        )}
        <Button 
          onClick={onRefresh} 
          variant="outline" 
          size="sm"
          disabled={isRefreshing}
        >
          <RefreshCw className={cn("mr-2 h-4 w-4", isRefreshing && "animate-spin")} />
          Refresh
        </Button>
      </div>
    </div>
  );
}

