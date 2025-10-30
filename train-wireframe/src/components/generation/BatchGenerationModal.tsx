import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { useAppStore } from '../../stores/useAppStore';
import { Upload, Plus, AlertCircle, CheckCircle, Clock, Activity } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

/**
 * Rate limit status from the API
 */
interface QueueStatus {
  queueSize: number;
  currentUtilization: number;
  estimatedWaitTime: number;
  rateLimitStatus: 'healthy' | 'approaching' | 'throttled';
  isProcessing: boolean;
  isPaused: boolean;
  activeRequests: number;
  maxConcurrent: number;
  totalProcessed: number;
  totalFailed: number;
}

/**
 * Rate Limit Status Indicator Component
 */
function RateLimitIndicator({ status }: { status: QueueStatus | null }) {
  if (!status) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center gap-3">
        <Activity className="h-5 w-5 text-gray-400 animate-pulse" />
        <div className="text-sm text-gray-600">Loading rate limit status...</div>
      </div>
    );
  }

  const { rateLimitStatus, currentUtilization, queueSize, estimatedWaitTime, isPaused, activeRequests, maxConcurrent } = status;
  
  // Determine indicator color and icon based on status
  let bgColor = 'bg-green-50';
  let borderColor = 'border-green-200';
  let textColor = 'text-green-700';
  let icon = <CheckCircle className="h-5 w-5" />;
  let statusText = 'API Rate: Healthy';
  
  if (rateLimitStatus === 'approaching') {
    bgColor = 'bg-yellow-50';
    borderColor = 'border-yellow-300';
    textColor = 'text-yellow-700';
    icon = <AlertCircle className="h-5 w-5" />;
    statusText = 'API Rate: Busy';
  } else if (rateLimitStatus === 'throttled' || isPaused) {
    bgColor = 'bg-red-50';
    borderColor = 'border-red-300';
    textColor = 'text-red-700';
    icon = <Clock className="h-5 w-5 animate-pulse" />;
    statusText = 'API Rate: Throttled - Pausing...';
  }

  return (
    <div className={`${bgColor} border ${borderColor} rounded-lg p-3`}>
      <div className="flex items-start gap-3">
        <div className={textColor}>
          {icon}
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div className={`text-sm font-medium ${textColor}`}>
              {statusText}
            </div>
            <div className={`text-sm font-semibold ${textColor}`}>
              {currentUtilization.toFixed(1)}%
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                rateLimitStatus === 'healthy' ? 'bg-green-500' :
                rateLimitStatus === 'approaching' ? 'bg-yellow-500' :
                'bg-red-500'
              }`}
              style={{ width: `${Math.min(100, currentUtilization)}%` }}
            />
          </div>
          
          {/* Additional details */}
          <div className="flex items-center justify-between text-xs text-gray-600">
            <div className="flex gap-4">
              <span>Queue: {queueSize}</span>
              <span>Active: {activeRequests}/{maxConcurrent}</span>
            </div>
            {estimatedWaitTime > 0 && (
              <span>Wait: ~{Math.ceil(estimatedWaitTime / 1000)}s</span>
            )}
          </div>
          
          {/* Pause countdown if throttled */}
          {isPaused && estimatedWaitTime > 0 && (
            <div className="text-xs text-red-600 font-medium">
              ⏸ Pausing for {Math.ceil(estimatedWaitTime / 1000)} seconds...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function BatchGenerationModal() {
  const { showBatchModal, closeBatchModal } = useAppStore();
  const [batchName, setBatchName] = useState('');
  const [topics, setTopics] = useState('');
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastRateLimitStatus, setLastRateLimitStatus] = useState<'healthy' | 'approaching' | 'throttled'>('healthy');
  
  /**
   * Fetches current queue status from API
   */
  const fetchQueueStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/ai/queue-status');
      if (response.ok) {
        const data: QueueStatus = await response.json();
        setQueueStatus(data);
        
        // Show notifications on status changes
        if (data.rateLimitStatus !== lastRateLimitStatus) {
          if (data.rateLimitStatus === 'approaching' && lastRateLimitStatus === 'healthy') {
            toast.warning('Generation slowing down - approaching API rate limit');
          } else if (data.rateLimitStatus === 'throttled' && lastRateLimitStatus !== 'throttled') {
            toast.error('Pausing generation for 30 seconds to respect API limits...');
          } else if (data.rateLimitStatus === 'healthy' && lastRateLimitStatus === 'throttled') {
            toast.success('Generation resumed');
          }
          setLastRateLimitStatus(data.rateLimitStatus);
        }
      }
    } catch (error) {
      console.error('Failed to fetch queue status:', error);
    }
  }, [lastRateLimitStatus]);
  
  /**
   * Poll queue status every 3 seconds when modal is open or generating
   */
  useEffect(() => {
    if (showBatchModal || isGenerating) {
      // Fetch immediately on open
      fetchQueueStatus();
      
      // Then poll every 3 seconds
      const interval = setInterval(fetchQueueStatus, 3000);
      
      return () => clearInterval(interval);
    }
  }, [showBatchModal, isGenerating, fetchQueueStatus]);
  
  const handleStartBatch = () => {
    if (!batchName.trim()) {
      toast.error('Please enter a batch name');
      return;
    }
    
    const topicList = topics.split('\n').filter(t => t.trim());
    if (topicList.length === 0) {
      toast.error('Please enter at least one topic');
      return;
    }
    
    // Check rate limit status before starting
    if (queueStatus && queueStatus.rateLimitStatus === 'throttled') {
      toast.warning('API rate limit reached. Generation will start when capacity is available.');
    }
    
    setIsGenerating(true);
    toast.success(`Batch "${batchName}" started with ${topicList.length} conversations`);
    
    // TODO: In real implementation, this would call the batch generation API
    // For now, we'll just simulate it
    setTimeout(() => {
      setIsGenerating(false);
      closeBatchModal();
    }, 2000);
  };
  
  return (
    <Dialog open={showBatchModal} onOpenChange={closeBatchModal}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Batch Conversation Generation</DialogTitle>
          <DialogDescription>
            Generate multiple conversations at once
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="batchName">Batch Name *</Label>
            <Input
              id="batchName"
              placeholder="e.g., Customer Support Scenarios Q1 2025"
              value={batchName}
              onChange={(e) => setBatchName(e.target.value)}
            />
          </div>
          
          <Tabs defaultValue="manual" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="csv">CSV Upload</TabsTrigger>
              <TabsTrigger value="manual">Manual Entry</TabsTrigger>
              <TabsTrigger value="template">Template-Based</TabsTrigger>
              <TabsTrigger value="clone">Clone Existing</TabsTrigger>
            </TabsList>
            
            <TabsContent value="csv" className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-12 text-center hover:border-blue-500 cursor-pointer">
                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-sm text-gray-600">Drag CSV file here or click to browse</p>
                <p className="text-xs text-gray-500 mt-2">CSV with columns: tier, topic, audience, complexity, length, style</p>
                <Button variant="link" size="sm" className="mt-2">
                  Download Sample CSV
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="manual" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="topics">Topics (one per line) *</Label>
                <Textarea
                  id="topics"
                  placeholder="Password reset process&#10;Account recovery workflow&#10;Two-factor authentication setup&#10;..."
                  value={topics}
                  onChange={(e) => setTopics(e.target.value)}
                  rows={10}
                />
                <p className="text-xs text-gray-500">
                  {topics.split('\n').filter(t => t.trim()).length} topics entered
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="template" className="space-y-4">
              <p className="text-sm text-gray-600">
                Select a template and enter variations to generate multiple scenarios
              </p>
              <div className="space-y-2">
                <Label>Coming soon...</Label>
                <p className="text-xs text-gray-500">This feature will allow you to select a template and generate variations automatically.</p>
              </div>
            </TabsContent>
            
            <TabsContent value="clone" className="space-y-4">
              <p className="text-sm text-gray-600">
                Clone an existing conversation with variations
              </p>
              <div className="space-y-2">
                <Label>Coming soon...</Label>
                <p className="text-xs text-gray-500">This feature will allow you to create variations of existing conversations.</p>
              </div>
            </TabsContent>
          </Tabs>
          
          {/* Rate Limit Status Indicator */}
          <RateLimitIndicator status={queueStatus} />
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
            <div className="text-sm">
              <strong>Batch Configuration:</strong>
            </div>
            <div className="text-xs text-gray-600 space-y-1">
              <div>• Priority: Normal</div>
              <div>• Concurrent processing: {queueStatus?.maxConcurrent || 3} conversations at a time</div>
              <div>• Error handling: Continue on error</div>
              {queueStatus && queueStatus.totalProcessed > 0 && (
                <div>• Completed: {queueStatus.totalProcessed} (Failed: {queueStatus.totalFailed})</div>
              )}
            </div>
          </div>
          
          <div className="flex gap-2 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={closeBatchModal} 
              className="flex-1"
              disabled={isGenerating}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleStartBatch} 
              className="flex-1"
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Activity className="h-4 w-4 mr-2 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Start Batch Generation
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
