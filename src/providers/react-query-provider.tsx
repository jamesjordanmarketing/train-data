'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

/**
 * React Query Provider
 * 
 * Provides React Query client to the application with default configuration:
 * - 60 second stale time for queries
 * - No automatic refetch on window focus
 * - Single retry on failure
 * - DevTools enabled in development
 * 
 * Must be used within a Client Component due to state management.
 */
export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  // Create QueryClient instance with useState to ensure it's stable across renders
  // This is the recommended pattern for Next.js App Router
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Consider data fresh for 60 seconds
            staleTime: 60 * 1000,
            
            // Don't automatically refetch on window focus
            // (User can manually refetch if needed)
            refetchOnWindowFocus: false,
            
            // Retry failed requests once
            retry: 1,
            
            // Retry with exponential backoff
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          },
          mutations: {
            // Retry mutations once on network errors
            retry: 1,
            retryDelay: 1000,
          },
        },
      })
  );
  
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Show DevTools only in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools 
          initialIsOpen={false} 
          position="bottom-right"
          buttonPosition="bottom-right"
        />
      )}
    </QueryClientProvider>
  );
}

