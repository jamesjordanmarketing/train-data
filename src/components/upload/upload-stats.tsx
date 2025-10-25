'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { 
  FileText, 
  Clock, 
  Loader2, 
  CheckCircle, 
  XCircle 
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Skeleton } from '../ui/skeleton';
import { cn } from '../ui/utils';

interface UploadStatsData {
  total: number;
  queued: number;
  processing: number;
  completed: number;
  errors: number;
}

interface UploadStatsProps {
  /** Auto-refresh interval in ms (default: 5000, set to 0 to disable) */
  refreshInterval?: number;
  /** Custom className */
  className?: string;
}

/**
 * UploadStats Component
 * 
 * Displays aggregate statistics about uploaded documents
 * Features:
 * - Total files count
 * - Queued (uploaded) count
 * - Processing count
 * - Completed count
 * - Error count
 * - Auto-refresh every 5 seconds
 */
export function UploadStats({ 
  refreshInterval = 5000,
  className 
}: UploadStatsProps) {
  const [stats, setStats] = useState<UploadStatsData>({
    total: 0,
    queued: 0,
    processing: 0,
    completed: 0,
    errors: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch statistics from database
   */
  const fetchStats = async () => {
    try {
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Not authenticated');
        setIsLoading(false);
        return;
      }

      // Get all user's documents
      const { data: documents, error: queryError } = await supabase
        .from('documents')
        .select('status')
        .eq('author_id', session.user.id);

      if (queryError) {
        throw new Error(queryError.message);
      }

      if (!documents) {
        setStats({ total: 0, queued: 0, processing: 0, completed: 0, errors: 0 });
        return;
      }

      // Calculate statistics
      const statsData: UploadStatsData = {
        total: documents.length,
        queued: documents.filter(d => d.status === 'uploaded').length,
        processing: documents.filter(d => d.status === 'processing').length,
        completed: documents.filter(d => d.status === 'completed').length,
        errors: documents.filter(d => d.status === 'error').length
      };

      setStats(statsData);
      setError(null);

    } catch (err) {
      console.error('[UploadStats] Error fetching stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to load statistics');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchStats();
  }, []);

  // Auto-refresh
  useEffect(() => {
    if (refreshInterval <= 0) return;

    const interval = setInterval(fetchStats, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  // Error state
  if (error && !isLoading) {
    return (
      <div className={cn('text-sm text-red-600 dark:text-red-400', className)}>
        Failed to load statistics: {error}
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className={cn('grid grid-cols-2 md:grid-cols-5 gap-4', className)}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-8 w-12 mb-1" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Stat cards configuration
  const statCards = [
    {
      label: 'Total Files',
      value: stats.total,
      icon: FileText,
      color: 'text-gray-600 dark:text-gray-400',
      bgColor: 'bg-gray-100 dark:bg-gray-800'
    },
    {
      label: 'Queued',
      value: stats.queued,
      icon: Clock,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/20'
    },
    {
      label: 'Processing',
      value: stats.processing,
      icon: Loader2,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      animated: true
    },
    {
      label: 'Completed',
      value: stats.completed,
      icon: CheckCircle,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-100 dark:bg-green-900/20'
    },
    {
      label: 'Errors',
      value: stats.errors,
      icon: XCircle,
      color: 'text-red-600 dark:text-red-400',
      bgColor: 'bg-red-100 dark:bg-red-900/20'
    }
  ];

  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-5 gap-4', className)}>
      {statCards.map((stat) => {
        const Icon = stat.icon;
        
        return (
          <Card key={stat.label} className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold tracking-tight">
                    {stat.value}
                  </p>
                </div>
                <div className={cn(
                  'p-2 rounded-lg',
                  stat.bgColor
                )}>
                  <Icon 
                    className={cn(
                      'w-5 h-5',
                      stat.color,
                      stat.animated && 'animate-spin'
                    )} 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

