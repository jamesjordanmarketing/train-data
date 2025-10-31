'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);
  
  useEffect(() => {
    // Check initial status
    setIsOnline(navigator.onLine);
    
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Connection restored', {
        id: 'online-status'
      });
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast.error('You are offline. Some features may be unavailable.', {
        duration: Infinity,
        id: 'offline-toast'
      });
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      toast.dismiss('offline-toast');
    };
  }, []);
  
  return isOnline;
}

