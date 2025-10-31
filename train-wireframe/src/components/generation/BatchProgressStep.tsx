import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { useAppStore } from '../../stores/useAppStore';
import { Loader2, Clock, CheckCircle2, XCircle, AlertCircle, Pause } from 'lucide-react';
import { toast } from 'sonner';

interface BatchProgressStepProps {
  onComplete: () => void;
}

interface ProgressData {
  jobId: string;
  status: 'queued' | 'processing' | 'paused' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  completedItems: number;
  failedItems: number;
  totalItems: number;
  elapsedTime?: string;
  estimatedTimeRemaining?: string;
  currentItem?: string;
}

export function BatchProgressStep({ onComplete }: BatchProgressStepProps) {
  const { batchGeneration, setBatchJobId, setBatchActuals, updateBatchJob, addBatchJob } = useAppStore();
  const { jobId, config } = batchGeneration;
  
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [isStarting, setIsStarting] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [startTime] = useState(Date.now());
  
  // Start the batch generation job
  useEffect(() => {
    const startBatchJob = async () => {
      try {
        setIsStarting(true);
        
        const response = await fetch('/api/conversations/generate-batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: `Batch ${new Date().toISOString().split('T')[0]}`,
            tier: config.tier === 'all' ? undefined : config.tier,
            sharedParameters: config.sharedParameters,
            concurrentProcessing: config.concurrency,
            errorHandling: config.errorHandling === 'stop' ? 'stop' : 'continue',
            userId: 'current-user', // TODO: Get from auth context
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to start batch generation');
        }
        
        const data = await response.json();
        
        if (data.success && data.data?.jobId) {
          setBatchJobId(data.data.jobId);
          
          // Add to active batch jobs
          addBatchJob({
            id: data.data.jobId,
            name: `Batch ${new Date().toLocaleString()}`,
            status: 'processing',
            totalItems: config.conversationCount,
            completedItems: 0,
            failedItems: 0,
            successfulItems: 0,
            startedAt: new Date().toISOString(),
            priority: 'normal',
            items: [],
            configuration: {
              tier: config.tier as any,
              sharedParameters: config.sharedParameters,
              concurrentProcessing: config.concurrency,
              errorHandling: config.errorHandling,
            },
          });
          
          toast.success('Batch generation started');
        } else {
          throw new Error('Invalid response from batch API');
        }
      } catch (err) {
        console.error('Failed to start batch:', err);
        toast.error('Failed to start batch generation');
        // TODO: Handle error - maybe go back to preview step
      } finally {
        setIsStarting(false);
      }
    };
    
    if (!jobId) {
      startBatchJob();
    }
  }, [jobId, config, setBatchJobId, addBatchJob]);
  
  // Poll for progress updates
  useEffect(() => {
    if (!jobId || isStarting) return;
    
    const pollProgress = async () => {
      try {
        const response = await fetch(`/api/conversations/batch/${jobId}/status`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch progress');
        }
        
        const data = await response.json();
        
        if (data.success && data.data) {
          const progressData: ProgressData = {
            jobId: data.data.jobId,
            status: data.data.status,
            progress: data.data.progress || 0,
            completedItems: data.data.completedItems || 0,
            failedItems: data.data.failedItems || 0,
            totalItems: data.data.totalItems || config.conversationCount,
            elapsedTime: data.data.elapsedTime,
            estimatedTimeRemaining: data.data.estimatedTimeRemaining,
            currentItem: data.data.currentItem,
          };
          
          setProgress(progressData);
          
          // Update batch job in store
          updateBatchJob(jobId, {
            status: progressData.status,
            completedItems: progressData.completedItems,
            failedItems: progressData.failedItems,
            successfulItems: progressData.completedItems - progressData.failedItems,
          });
          
          // Check if completed or failed
          if (progressData.status === 'completed' || progressData.status === 'failed') {
            const elapsedMinutes = Math.round((Date.now() - startTime) / 60000);
            const totalCost = progressData.completedItems * 0.085; // Approximate
            
            setBatchActuals(totalCost, elapsedMinutes);
            
            if (progressData.status === 'completed') {
              toast.success(`Batch generation completed! ${progressData.completedItems} conversations generated.`);
            } else {
              toast.error('Batch generation failed');
            }
            
            // Move to summary step after a short delay
            setTimeout(() => {
              onComplete();
            }, 1000);
          }
        }
      } catch (err) {
        console.error('Failed to fetch progress:', err);
      }
    };
    
    // Poll immediately
    pollProgress();
    
    // Then poll every 3 seconds
    const interval = setInterval(pollProgress, 3000);
    
    return () => clearInterval(interval);
  }, [jobId, isStarting, config, updateBatchJob, setBatchActuals, onComplete, startTime]);
  
  const handleCancel = async () => {
    if (!jobId || isCancelling) return;
    
    setIsCancelling(true);
    
    try {
      const response = await fetch(`/api/conversations/batch/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to cancel batch');
      }
      
      toast.success('Batch generation cancelled');
    } catch (err) {
      console.error('Failed to cancel:', err);
      toast.error('Failed to cancel batch generation');
    } finally {
      setIsCancelling(false);
    }
  };
  
  const formatElapsedTime = (timeStr?: string) => {
    if (!timeStr) {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const minutes = Math.floor(elapsed / 60);
      const seconds = elapsed % 60;
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    return timeStr;
  };
  
  if (isStarting) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
          <h3 className="text-lg font-semibold mb-2">Starting batch generation...</h3>
          <p className="text-sm text-gray-600">
            Initializing {config.conversationCount} conversations
          </p>
        </div>
      </div>
    );
  }
  
  const progressPercentage = progress?.progress || 0;
  const completedItems = progress?.completedItems || 0;
  const failedItems = progress?.failedItems || 0;
  const totalItems = progress?.totalItems || config.conversationCount;
  const successfulItems = completedItems - failedItems;
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Generation in Progress</h3>
        <p className="text-sm text-gray-600">
          Generating conversations with {config.concurrency} parallel requests
        </p>
      </div>
      
      {/* Status Badge */}
      <div className="flex items-center justify-between">
        <Badge variant={progress?.status === 'processing' ? 'default' : 'secondary'}>
          {progress?.status === 'processing' ? (
            <>
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Processing
            </>
          ) : progress?.status === 'paused' ? (
            <>
              <Pause className="h-3 w-3 mr-1" />
              Paused
            </>
          ) : (
            'Initializing'
          )}
        </Badge>
        
        <div className="text-sm text-gray-600">
          {completedItems} of {totalItems} completed
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="space-y-2">
        <Progress value={progressPercentage} className="h-3" />
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-gray-900">{progressPercentage.toFixed(1)}%</span>
          <span className="text-gray-600">
            {successfulItems} successful, {failedItems} failed
          </span>
        </div>
      </div>
      
      {/* Current Item */}
      {progress?.currentItem && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-1">
            <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
            <span className="text-sm font-medium text-blue-900">Currently processing:</span>
          </div>
          <p className="text-sm text-blue-700 ml-6">{progress.currentItem}</p>
        </div>
      )}
      
      {/* Statistics Grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span className="text-xs text-gray-600">Successful</span>
          </div>
          <div className="text-2xl font-bold text-green-600">
            {successfulItems}
          </div>
        </div>
        
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="h-4 w-4 text-red-600" />
            <span className="text-xs text-gray-600">Failed</span>
          </div>
          <div className="text-2xl font-bold text-red-600">
            {failedItems}
          </div>
        </div>
        
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4 text-gray-600" />
            <span className="text-xs text-gray-600">Remaining</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {totalItems - completedItems}
          </div>
        </div>
      </div>
      
      {/* Time Information */}
      <div className="bg-gray-50 border rounded-lg p-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-gray-600" />
              <span className="text-xs text-gray-600">Elapsed Time</span>
            </div>
            <div className="text-lg font-semibold text-gray-900">
              {formatElapsedTime(progress?.elapsedTime)}
            </div>
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-gray-600" />
              <span className="text-xs text-gray-600">Estimated Remaining</span>
            </div>
            <div className="text-lg font-semibold text-gray-900">
              {progress?.estimatedTimeRemaining || 'Calculating...'}
            </div>
          </div>
        </div>
      </div>
      
      {/* Info Message */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          💡 You can safely close this modal. The generation will continue in the background,
          and you can monitor progress from the dashboard.
        </p>
      </div>
      
      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t">
        <Button
          variant="outline"
          onClick={handleCancel}
          disabled={isCancelling || progress?.status !== 'processing'}
          className="flex-1"
        >
          {isCancelling ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Cancelling...
            </>
          ) : (
            'Cancel Generation'
          )}
        </Button>
      </div>
    </div>
  );
}

