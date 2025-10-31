import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useAppStore } from '../../stores/useAppStore';
import { CheckCircle2, XCircle, DollarSign, Clock, TrendingUp, AlertTriangle, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface BatchSummaryStepProps {
  onClose: () => void;
  onViewConversations: () => void;
}

export function BatchSummaryStep({ onClose, onViewConversations }: BatchSummaryStepProps) {
  const { batchGeneration, activeBatchJobs } = useAppStore();
  const { config, jobId, estimatedCost, estimatedTime, actualCost, actualTime } = batchGeneration;
  
  // Get the batch job from active jobs
  const batchJob = activeBatchJobs.find((job) => job.id === jobId);
  
  const totalGenerated = batchJob?.completedItems || 0;
  const successful = batchJob?.successfulItems || (batchJob?.completedItems || 0) - (batchJob?.failedItems || 0);
  const failed = batchJob?.failedItems || 0;
  const totalItems = batchJob?.totalItems || config.conversationCount;
  
  // Calculate comparisons
  const costDifference = actualCost - estimatedCost;
  const costVariance = estimatedCost > 0 ? ((costDifference / estimatedCost) * 100) : 0;
  const timeDifference = actualTime - estimatedTime;
  
  const handleViewErrors = () => {
    toast.info('Error details view coming soon');
    // TODO: Navigate to error details or show error modal
  };
  
  const handleRegenerateFailed = () => {
    toast.info('Regenerate failed conversations coming soon');
    // TODO: Start a new batch job with only failed conversations
  };
  
  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours} hours`;
  };
  
  const successRate = totalGenerated > 0 ? ((successful / totalGenerated) * 100) : 0;
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold mb-2">Batch Generation Complete!</h3>
        <p className="text-gray-600">
          Successfully generated {successful} out of {totalItems} conversations
        </p>
      </div>
      
      {/* Success Rate */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-600 mb-1">Success Rate</div>
            <div className="text-4xl font-bold text-green-600">
              {successRate.toFixed(1)}%
            </div>
          </div>
          <TrendingUp className="h-12 w-12 text-green-600" />
        </div>
      </div>
      
      {/* Statistics Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="border rounded-lg p-5">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <span className="text-sm text-gray-600">Successful</span>
          </div>
          <div className="text-3xl font-bold text-green-600">
            {successful}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {totalGenerated > 0 ? ((successful / totalGenerated) * 100).toFixed(1) : 0}% of total
          </div>
        </div>
        
        <div className="border rounded-lg p-5">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="h-5 w-5 text-red-600" />
            <span className="text-sm text-gray-600">Failed</span>
          </div>
          <div className="text-3xl font-bold text-red-600">
            {failed}
          </div>
          {failed > 0 && (
            <Button
              variant="link"
              size="sm"
              className="text-xs p-0 h-auto mt-1"
              onClick={handleViewErrors}
            >
              View Errors <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          )}
        </div>
      </div>
      
      {/* Cost & Time Comparison */}
      <div className="border rounded-lg p-5">
        <h4 className="font-semibold mb-4">Cost & Time Analysis</h4>
        
        <div className="space-y-4">
          {/* Cost */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="text-sm text-gray-600">Total Cost</span>
              </div>
              <div className="text-right">
                <div className="font-bold text-green-600">
                  ${actualCost.toFixed(2)}
                </div>
                <div className="text-xs text-gray-500">
                  Est: ${estimatedCost.toFixed(2)}
                  {costVariance !== 0 && (
                    <span className={costVariance > 0 ? 'text-red-600' : 'text-green-600'}>
                      {' '}({costVariance > 0 ? '+' : ''}{costVariance.toFixed(1)}%)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Time */}
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-gray-600">Total Time</span>
              </div>
              <div className="text-right">
                <div className="font-bold text-blue-600">
                  {formatTime(actualTime)}
                </div>
                <div className="text-xs text-gray-500">
                  Est: {formatTime(estimatedTime)}
                  {timeDifference !== 0 && (
                    <span className={timeDifference > 0 ? 'text-red-600' : 'text-green-600'}>
                      {' '}({timeDifference > 0 ? '+' : ''}{timeDifference} min)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Configuration Used */}
      <div className="border rounded-lg p-5">
        <h4 className="font-semibold mb-3">Configuration Used</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Tier Selection</span>
            <Badge variant="outline">
              {config.tier === 'all' ? 'All Tiers' : config.tier.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Concurrency</span>
            <Badge variant="outline">{config.concurrency} parallel</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Error Handling</span>
            <Badge variant="outline">
              {config.errorHandling === 'continue' ? 'Continue on Error' : 'Stop on Error'}
            </Badge>
          </div>
        </div>
      </div>
      
      {/* Warnings/Alerts for Failed Items */}
      {failed > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-yellow-900 mb-2">
              {failed} conversation{failed > 1 ? 's' : ''} failed to generate
            </p>
            <p className="text-xs text-yellow-800 mb-3">
              Common causes: API rate limits, invalid parameters, or template errors
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRegenerateFailed}
              className="text-xs"
            >
              Regenerate Failed Conversations
            </Button>
          </div>
        </div>
      )}
      
      {/* Success Message */}
      {successful === totalItems && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <p className="text-sm font-medium text-green-900">
            🎉 Perfect! All conversations generated successfully
          </p>
        </div>
      )}
      
      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onClose} className="flex-1">
          Close
        </Button>
        <Button onClick={onViewConversations} className="flex-1">
          View Conversations
        </Button>
      </div>
    </div>
  );
}

