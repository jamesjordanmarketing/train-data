'use client';

import React from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Loader2, 
  AlertCircle,
  FileText 
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { cn } from '../ui/utils';

export type DocumentStatusType = 
  | 'uploaded' 
  | 'processing' 
  | 'completed' 
  | 'error' 
  | 'pending' 
  | 'categorizing';

interface DocumentStatusBadgeProps {
  /** Current document status */
  status: DocumentStatusType;
  /** Processing progress (0-100), shown for 'processing' status */
  progress?: number;
  /** Whether to show progress percentage inline */
  showProgress?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Custom className */
  className?: string;
}

/**
 * DocumentStatusBadge Component
 * 
 * Visual status indicator with icon, color, and optional progress
 * 
 * Status Colors:
 * - uploaded: Gray (queued)
 * - processing: Blue (in progress)
 * - completed: Green (success)
 * - error: Red (failed)
 * - pending: Gray (waiting)
 * - categorizing: Purple (workflow active)
 */
export function DocumentStatusBadge({ 
  status, 
  progress = 0,
  showProgress = false,
  size = 'md',
  className 
}: DocumentStatusBadgeProps) {
  // Get status configuration
  const config = getStatusConfig(status, progress);

  // Size classes
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const Icon = config.icon;

  return (
    <Badge 
      variant={config.variant}
      className={cn(
        'inline-flex items-center gap-1.5 font-medium',
        sizeClasses[size],
        config.className,
        className
      )}
    >
      <Icon 
        className={cn(
          iconSizeClasses[size],
          config.animated && 'animate-spin'
        )} 
      />
      <span>{config.label}</span>
      {showProgress && status === 'processing' && (
        <span className="font-normal opacity-90">
          {progress}%
        </span>
      )}
    </Badge>
  );
}

/**
 * Get status configuration (icon, color, label)
 */
function getStatusConfig(status: DocumentStatusType, progress: number) {
  switch (status) {
    case 'uploaded':
      return {
        icon: Clock,
        label: 'Queued',
        variant: 'secondary' as const,
        className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
        animated: false
      };

    case 'processing':
      return {
        icon: Loader2,
        label: progress > 0 ? `Processing` : 'Processing',
        variant: 'default' as const,
        className: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
        animated: true
      };

    case 'completed':
      return {
        icon: CheckCircle,
        label: 'Completed',
        variant: 'default' as const,
        className: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
        animated: false
      };

    case 'error':
      return {
        icon: XCircle,
        label: 'Error',
        variant: 'destructive' as const,
        className: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
        animated: false
      };

    case 'pending':
      return {
        icon: FileText,
        label: 'Pending',
        variant: 'secondary' as const,
        className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
        animated: false
      };

    case 'categorizing':
      return {
        icon: Loader2,
        label: 'Categorizing',
        variant: 'default' as const,
        className: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
        animated: true
      };

    default:
      return {
        icon: AlertCircle,
        label: 'Unknown',
        variant: 'secondary' as const,
        className: '',
        animated: false
      };
  }
}

/**
 * Get status display text (for use outside badge)
 */
export function getStatusText(status: DocumentStatusType): string {
  const config = getStatusConfig(status, 0);
  return config.label;
}

/**
 * Check if status is terminal (won't change without user action)
 */
export function isTerminalStatus(status: DocumentStatusType): boolean {
  return status === 'completed' || status === 'error';
}

/**
 * Check if status is active (currently being processed)
 */
export function isActiveStatus(status: DocumentStatusType): boolean {
  return status === 'processing' || status === 'categorizing';
}

