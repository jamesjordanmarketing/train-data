'use client';

import React from 'react';
import { SaveStatus } from '../../hooks/useAutoSave';
import { CheckCircle, Loader2, AlertCircle, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SaveStatusIndicatorProps {
  status: SaveStatus;
  lastSaved: Date | null;
  error?: Error | null;
  className?: string;
}

export function SaveStatusIndicator({
  status,
  lastSaved,
  error,
  className,
}: SaveStatusIndicatorProps) {
  const formatLastSaved = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    
    if (diffSecs < 10) return 'Just now';
    if (diffSecs < 60) return `${diffSecs}s ago`;
    if (diffSecs < 3600) return `${Math.floor(diffSecs / 60)}m ago`;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <div className={cn('flex items-center gap-2 text-sm', className)}>
      {status === 'idle' && (
        <>
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            {lastSaved ? `Saved ${formatLastSaved(lastSaved)}` : 'Not saved'}
          </span>
        </>
      )}
      
      {status === 'saving' && (
        <>
          <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
          <span className="text-blue-500">Saving...</span>
        </>
      )}
      
      {status === 'saved' && (
        <>
          <CheckCircle className="h-4 w-4 text-green-500" />
          <span className="text-green-500">
            Saved {lastSaved && formatLastSaved(lastSaved)}
          </span>
        </>
      )}
      
      {status === 'error' && (
        <>
          <AlertCircle className="h-4 w-4 text-destructive" />
          <span className="text-destructive" title={error?.message}>
            Failed to save
          </span>
        </>
      )}
    </div>
  );
}

