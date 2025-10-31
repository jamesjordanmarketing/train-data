'use client';

import { useOnlineStatus } from '@/hooks/use-online-status';
import { OfflineBanner } from '@/components/offline-banner';

export function OnlineStatusProvider({ children }: { children: React.ReactNode }) {
  const isOnline = useOnlineStatus();
  
  return (
    <>
      <OfflineBanner isOnline={isOnline} />
      {children}
    </>
  );
}

