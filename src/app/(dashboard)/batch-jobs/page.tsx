'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Loader2, 
  Plus, 
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  Pause,
  Ban,
  AlertTriangle,
  Layers,
  StopCircle
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface BatchJob {
  id: string;
  name: string;
  status: 'queued' | 'processing' | 'paused' | 'completed' | 'failed' | 'cancelled';
  totalItems: number;
  completedItems: number;
  successfulItems: number;
  failedItems: number;
  startedAt?: string;
  completedAt?: string;
  createdAt?: string;
}

export default function BatchJobsListPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<BatchJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingJobId, setCancellingJobId] = useState<string | null>(null);
  const [jobToCancel, setJobToCancel] = useState<BatchJob | null>(null);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/batch-jobs');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch jobs');
      }
      
      setJobs(data.jobs || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchJobs, 30000);
    return () => clearInterval(interval);
  }, []);

  // Cancel a batch job
  const handleCancelJob = async (job: BatchJob) => {
    try {
      setCancellingJobId(job.id);
      const response = await fetch(`/api/batch-jobs/${job.id}/cancel`, {
        method: 'POST',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel job');
      }

      // Refresh jobs list
      await fetchJobs();
      setError(null);
    } catch (err) {
      console.error('Failed to cancel job:', err);
      setError(err instanceof Error ? err.message : 'Failed to cancel job');
    } finally {
      setCancellingJobId(null);
      setJobToCancel(null);
    }
  };

  // Check if job can be cancelled
  const canCancelJob = (status: string) => {
    return status === 'processing' || status === 'paused' || status === 'queued';
  };

  // Status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-green-500 hover:bg-green-500 text-white">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Completed
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-red-500 hover:bg-red-500 text-white">
            <XCircle className="mr-1 h-3 w-3" />
            Failed
          </Badge>
        );
      case 'processing':
        return (
          <Badge className="bg-blue-500 hover:bg-blue-500 text-white">
            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            Processing
          </Badge>
        );
      case 'paused':
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-500 text-white">
            <Pause className="mr-1 h-3 w-3" />
            Paused
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge className="bg-gray-500 hover:bg-gray-500 text-white">
            <Ban className="mr-1 h-3 w-3" />
            Cancelled
          </Badge>
        );
      case 'queued':
        return (
          <Badge className="bg-slate-400 hover:bg-slate-400 text-white">
            <Clock className="mr-1 h-3 w-3" />
            Queued
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Format relative time
  const formatRelativeTime = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading && jobs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Batch Jobs</h1>
          <p className="text-muted-foreground mt-1">
            Monitor and manage bulk conversation generation jobs
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchJobs} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => router.push('/bulk-generator')}>
            <Plus className="mr-2 h-4 w-4" />
            New Batch
          </Button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Jobs List */}
      {jobs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Layers className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Batch Jobs</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-sm">
              You haven&apos;t created any batch generation jobs yet. Start by creating a new batch to generate multiple conversations at once.
            </p>
            <Button onClick={() => router.push('/bulk-generator')}>
              <Plus className="mr-2 h-4 w-4" />
              Create First Batch
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {jobs.map(job => {
            const percentage = job.totalItems > 0 
              ? Math.round((job.completedItems / job.totalItems) * 100) 
              : 0;
            
            return (
              <Card 
                key={job.id} 
                className="cursor-pointer transition-all hover:border-primary hover:shadow-sm"
                onClick={() => router.push(`/batch-jobs/${job.id}`)}
              >
                <CardContent className="pt-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-medium truncate">{job.name}</p>
                        {getStatusBadge(job.status)}
                      </div>
                      
                      {/* Progress bar for active jobs */}
                      {(job.status === 'processing' || job.status === 'paused' || job.status === 'queued') && (
                        <div className="mb-2">
                          <Progress value={percentage} className="h-2" />
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span>
                          {job.completedItems}/{job.totalItems} completed
                        </span>
                        {job.successfulItems > 0 && (
                          <span className="text-green-600">
                            {job.successfulItems} successful
                          </span>
                        )}
                        {job.failedItems > 0 && (
                          <span className="text-red-600">
                            {job.failedItems} failed
                          </span>
                        )}
                        {(job.completedAt || job.startedAt || job.createdAt) && (
                          <span>
                            {formatRelativeTime(job.completedAt || job.startedAt || job.createdAt)}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {/* Stop Button for active jobs */}
                      {canCancelJob(job.status) && (
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={cancellingJobId === job.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setJobToCancel(job);
                          }}
                        >
                          {cancellingJobId === job.id ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <StopCircle className="mr-2 h-4 w-4" />
                          )}
                          Stop
                        </Button>
                      )}
                      <div className="text-right">
                        <p className="text-2xl font-bold">{percentage}%</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={!!jobToCancel} onOpenChange={(open) => !open && setJobToCancel(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Stop Batch Job?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to stop the batch job &quot;{jobToCancel?.name}&quot;? 
              This will cancel all pending items and cannot be undone.
              <br /><br />
              <span className="text-muted-foreground">
                {jobToCancel?.completedItems || 0}/{jobToCancel?.totalItems || 0} items completed
                {jobToCancel?.successfulItems ? ` (${jobToCancel.successfulItems} successful)` : ''}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Job</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => jobToCancel && handleCancelJob(jobToCancel)}
            >
              {cancellingJobId === jobToCancel?.id ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Stopping...
                </>
              ) : (
                <>
                  <StopCircle className="mr-2 h-4 w-4" />
                  Stop Job
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

