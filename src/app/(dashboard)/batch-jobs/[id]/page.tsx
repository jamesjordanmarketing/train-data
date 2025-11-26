'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Pause, 
  Play, 
  Ban,
  ArrowLeft,
  RefreshCw,
  AlertTriangle,
  Sparkles,
  StopCircle
} from 'lucide-react';

interface BatchJobStatus {
  jobId: string;
  status: 'queued' | 'processing' | 'paused' | 'completed' | 'failed' | 'cancelled';
  progress: {
    total: number;
    completed: number;
    successful: number;
    failed: number;
    percentage: number;
  };
  estimatedTimeRemaining?: number;
  startedAt?: string;
  completedAt?: string;
}

export default function BatchJobPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const [status, setStatus] = useState<BatchJobStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Enrichment state
  const [enriching, setEnriching] = useState(false);
  const [enrichResult, setEnrichResult] = useState<{
    successful: number;
    failed: number;
    skipped: number;
    total: number;
  } | null>(null);

  // Processing state
  const [processingActive, setProcessingActive] = useState(false);
  const processingRef = useRef(false);
  const [lastItemError, setLastItemError] = useState<string | null>(null);
  const [processLogs, setProcessLogs] = useState<string[]>([]);

  // Fetch status
  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch(`/api/conversations/batch/${jobId}/status`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch status');
      }

      setStatus(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch status');
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  // Process next item in queue
  const processNextItem = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch(`/api/batch-jobs/${jobId}/process-next`, {
        method: 'POST',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process item');
      }

      // Update status from response
      if (data.progress) {
        setStatus(prev => prev ? {
          ...prev,
          progress: data.progress,
          status: data.status === 'job_completed' ? 'completed' 
               : data.status === 'job_cancelled' ? 'cancelled' 
               : prev.status,
        } : null);
      }

      // Log the result
      const timestamp = new Date().toLocaleTimeString();
      if (data.success && data.conversationId) {
        setProcessLogs(prev => [...prev.slice(-50), `[${timestamp}] ✓ Item ${data.itemId?.slice(0, 8)}... completed`]);
        setLastItemError(null);
      } else if (data.itemId) {
        setProcessLogs(prev => [...prev.slice(-50), `[${timestamp}] ✗ Item ${data.itemId?.slice(0, 8)}... failed: ${data.error || 'Unknown'}`]);
        setLastItemError(data.error || 'Unknown error');
      }

      // Return whether there are more items to process
      return data.status === 'processed' && data.remainingItems > 0;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Processing error';
      setLastItemError(errorMsg);
      setProcessLogs(prev => [...prev.slice(-50), `[${new Date().toLocaleTimeString()}] ✗ Error: ${errorMsg}`]);
      return false;
    }
  }, [jobId]);

  // Start processing loop
  const startProcessing = useCallback(async () => {
    if (processingRef.current) return;
    
    processingRef.current = true;
    setProcessingActive(true);
    setProcessLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Starting batch processing...`]);

    let hasMore = true;
    while (hasMore && processingRef.current) {
      hasMore = await processNextItem();
      
      // Small delay between items to prevent overwhelming
      if (hasMore) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    if (processingRef.current) {
      setProcessLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Processing complete.`]);
    } else {
      setProcessLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Processing stopped by user.`]);
    }

    processingRef.current = false;
    setProcessingActive(false);
    await fetchStatus();
  }, [processNextItem, fetchStatus]);

  // Stop processing
  const stopProcessing = useCallback(() => {
    processingRef.current = false;
    setProcessLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Stopping...`]);
  }, []);

  // Initial fetch and auto-start processing for queued jobs
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Auto-start processing when job is queued and no processing is active
  useEffect(() => {
    if (status?.status === 'queued' && !processingActive && !processingRef.current) {
      // Auto-start processing for queued jobs
      startProcessing();
    }
  }, [status?.status, processingActive, startProcessing]);

  // Job control actions
  const handleAction = async (action: 'pause' | 'resume' | 'cancel') => {
    try {
      setActionLoading(true);

      if (action === 'cancel') {
        // Use the new cancel endpoint
        stopProcessing(); // Stop the processing loop first
        
        const response = await fetch(`/api/batch-jobs/${jobId}/cancel`, {
          method: 'POST',
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to cancel job');
        }

        setProcessLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Job cancelled.`]);
      } else {
        // Use the old endpoint for pause/resume
        const response = await fetch(`/api/conversations/batch/${jobId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action })
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || `Failed to ${action} job`);
        }

        if (action === 'pause') {
          stopProcessing();
        } else if (action === 'resume') {
          startProcessing();
        }
      }

      await fetchStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${action} job`);
    } finally {
      setActionLoading(false);
    }
  };

  // Bulk enrich handler
  const handleEnrichAll = async () => {
    if (!status || status.status !== 'completed') return;
    
    try {
      setEnriching(true);
      setEnrichResult(null);
      
      // Get all successful conversation IDs from batch items
      const response = await fetch(`/api/conversations/batch/${jobId}/items?status=completed`);
      const items = await response.json();
      
      if (!response.ok) {
        throw new Error(items.error || 'Failed to fetch batch items');
      }
      
      const conversationIds = items.data
        ?.map((item: { conversation_id: string | null }) => item.conversation_id)
        .filter(Boolean) || [];
      
      if (conversationIds.length === 0) {
        setEnrichResult({ successful: 0, failed: 0, skipped: 0, total: 0 });
        return;
      }
      
      // Trigger bulk enrichment
      const enrichResponse = await fetch('/api/conversations/bulk-enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationIds }),
      });
      
      const enrichData = await enrichResponse.json();
      
      if (!enrichResponse.ok) {
        throw new Error(enrichData.error || 'Enrichment failed');
      }
      
      setEnrichResult(enrichData.summary);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Enrichment failed');
    } finally {
      setEnriching(false);
    }
  };

  // Status badge color
  const getStatusColor = (jobStatus: string) => {
    switch (jobStatus) {
      case 'completed': return 'bg-green-500 hover:bg-green-500';
      case 'failed': return 'bg-red-500 hover:bg-red-500';
      case 'processing': return 'bg-blue-500 hover:bg-blue-500';
      case 'paused': return 'bg-yellow-500 hover:bg-yellow-500';
      case 'cancelled': return 'bg-gray-500 hover:bg-gray-500';
      case 'queued': return 'bg-slate-400 hover:bg-slate-400';
      default: return 'bg-gray-400 hover:bg-gray-400';
    }
  };

  // Format time remaining
  const formatTimeRemaining = (seconds?: number) => {
    if (!seconds || seconds <= 0) return 'Calculating...';
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  // Format datetime
  const formatDateTime = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error && !status) {
    return (
      <div className="container mx-auto py-6 max-w-2xl">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              Error Loading Batch Job
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{error}</p>
            <div className="flex gap-3">
              <Button onClick={() => fetchStatus()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
              <Button variant="outline" onClick={() => router.push('/bulk-generator')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Generator
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!status) return null;

  const isActive = status.status === 'processing' || status.status === 'queued';
  const isCompleted = status.status === 'completed';
  const isFailed = status.status === 'failed';
  const isPaused = status.status === 'paused';
  const isCancelled = status.status === 'cancelled';

  return (
    <div className="container mx-auto py-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.push('/batch-jobs')}
            className="mb-2 -ml-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            All Jobs
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Batch Job</h1>
          <p className="text-sm text-muted-foreground font-mono mt-1 break-all">{jobId}</p>
        </div>
        <Badge className={`${getStatusColor(status.status)} text-white`}>
          {status.status.toUpperCase()}
        </Badge>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Progress Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isActive && <Loader2 className="h-5 w-5 animate-spin text-blue-500" />}
            {isCompleted && <CheckCircle2 className="h-5 w-5 text-green-500" />}
            {isFailed && <XCircle className="h-5 w-5 text-red-500" />}
            {isPaused && <Pause className="h-5 w-5 text-yellow-500" />}
            {isCancelled && <Ban className="h-5 w-5 text-gray-500" />}
            Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">
                {status.progress.completed} / {status.progress.total} completed
              </span>
              <span className="font-medium">{Math.round(status.progress.percentage)}%</span>
            </div>
            <Progress value={status.progress.percentage} className="h-3" />
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {status.progress.successful}
              </p>
              <p className="text-xs text-muted-foreground">Successful</p>
            </div>
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30">
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {status.progress.failed}
              </p>
              <p className="text-xs text-muted-foreground">Failed</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {status.progress.total - status.progress.completed}
              </p>
              <p className="text-xs text-muted-foreground">Remaining</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
              <p className="text-2xl font-bold">{status.progress.total}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
          </div>

          <Separator />

          {/* Time Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            {status.startedAt && (
              <div>
                <p className="text-muted-foreground">Started</p>
                <p className="font-medium">{formatDateTime(status.startedAt)}</p>
              </div>
            )}
            {isActive && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-muted-foreground">Estimated remaining</p>
                  <p className="font-medium">{formatTimeRemaining(status.estimatedTimeRemaining)}</p>
                </div>
              </div>
            )}
            {status.completedAt && (
              <div>
                <p className="text-muted-foreground">Completed</p>
                <p className="font-medium">{formatDateTime(status.completedAt)}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {/* Processing status indicator */}
          {processingActive && (
            <Badge variant="secondary" className="animate-pulse">
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              Processing...
            </Badge>
          )}
          
          {/* Start Processing (for queued jobs that aren't auto-started) */}
          {status.status === 'queued' && !processingActive && (
            <Button 
              onClick={startProcessing}
              disabled={actionLoading}
            >
              <Play className="mr-2 h-4 w-4" />
              Start Processing
            </Button>
          )}
          
          {/* Stop Processing (replaces Pause for active processing) */}
          {processingActive && (
            <Button 
              variant="outline" 
              onClick={stopProcessing}
              disabled={actionLoading}
            >
              <StopCircle className="mr-2 h-4 w-4" />
              Stop
            </Button>
          )}
          
          {/* Resume Processing (for stopped but not cancelled jobs) */}
          {(status.status === 'processing' || status.status === 'paused') && !processingActive && status.progress.completed < status.progress.total && (
            <Button 
              onClick={startProcessing}
              disabled={actionLoading}
            >
              <Play className="mr-2 h-4 w-4" />
              Resume Processing
            </Button>
          )}
          
          {/* Cancel Job */}
          {(isActive || isPaused) && (
            <Button 
              variant="destructive" 
              onClick={() => handleAction('cancel')}
              disabled={actionLoading || processingActive}
            >
              {actionLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Ban className="mr-2 h-4 w-4" />
              )}
              Cancel Job
            </Button>
          )}
          
          <Button 
            variant="outline" 
            onClick={fetchStatus}
            disabled={actionLoading}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </CardContent>
      </Card>

      {/* Processing Log Card */}
      {processLogs.length > 0 && (
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Processing Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-40 overflow-y-auto font-mono text-xs bg-slate-50 dark:bg-slate-900 rounded p-2 space-y-0.5">
              {processLogs.slice(-20).map((log, i) => (
                <div key={i} className={log.includes('✓') ? 'text-green-600' : log.includes('✗') ? 'text-red-600' : 'text-muted-foreground'}>
                  {log}
                </div>
              ))}
            </div>
            {lastItemError && (
              <div className="mt-2 p-2 rounded bg-red-50 dark:bg-red-950/30 text-red-600 text-xs">
                Last error: {lastItemError}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Completion Card */}
      {isCompleted && (
        <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <CheckCircle2 className="h-5 w-5" />
              Batch Complete!
            </CardTitle>
            <CardDescription className="text-green-600 dark:text-green-500">
              Successfully generated {status.progress.successful} conversation{status.progress.successful !== 1 ? 's' : ''}
              {status.progress.failed > 0 && ` (${status.progress.failed} failed)`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Enrichment Result */}
            {enrichResult && (
              <div className="p-3 rounded-md bg-white dark:bg-slate-900 border">
                <p className="text-sm font-medium mb-1">Enrichment Complete</p>
                <p className="text-xs text-muted-foreground">
                  {enrichResult.successful} enriched, {enrichResult.skipped} skipped, {enrichResult.failed} failed
                </p>
              </div>
            )}
            
            <div className="flex flex-wrap gap-3">
              {/* Enrich All Button */}
              {!enrichResult && status.progress.successful > 0 && (
                <Button 
                  variant="secondary"
                  onClick={handleEnrichAll}
                  disabled={enriching}
                >
                  {enriching ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enriching...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Enrich All
                    </>
                  )}
                </Button>
              )}
              <Button onClick={() => router.push('/conversations')}>
                View Conversations
              </Button>
              <Button variant="outline" onClick={() => router.push('/bulk-generator')}>
                Generate More
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Failure Card */}
      {isFailed && (
        <Card className="bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
              <XCircle className="h-5 w-5" />
              Batch Failed
            </CardTitle>
            <CardDescription className="text-red-600 dark:text-red-500">
              {status.progress.failed} conversation{status.progress.failed !== 1 ? 's' : ''} failed to generate
              {status.progress.successful > 0 && ` (${status.progress.successful} succeeded)`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {status.progress.successful > 0 && (
                <Button onClick={() => router.push('/conversations')}>
                  View Successful Conversations
                </Button>
              )}
              <Button variant="outline" onClick={() => router.push('/bulk-generator')}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cancelled Card */}
      {isCancelled && (
        <Card className="bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <Ban className="h-5 w-5" />
              Batch Cancelled
            </CardTitle>
            <CardDescription>
              Job was cancelled. {status.progress.successful} conversation{status.progress.successful !== 1 ? 's were' : ' was'} generated before cancellation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {status.progress.successful > 0 && (
                <Button onClick={() => router.push('/conversations')}>
                  View Conversations
                </Button>
              )}
              <Button variant="outline" onClick={() => router.push('/bulk-generator')}>
                Start New Batch
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

