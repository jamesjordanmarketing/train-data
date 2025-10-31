'use client';

import { WifiOff } from 'lucide-react';

export function OfflineBanner({ isOnline }: { isOnline: boolean }) {
  if (isOnline) return null;
  
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-destructive text-destructive-foreground px-4 py-2 text-center text-sm shadow-lg">
      <div className="flex items-center justify-center gap-2">
        <WifiOff className="h-4 w-4" />
        <span>You are currently offline. Some features may be unavailable.</span>
      </div>
    </div>
  );
}

