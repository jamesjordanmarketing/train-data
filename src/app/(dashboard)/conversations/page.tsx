/**
 * Conversations Dashboard Page
 * 
 * Server-side rendered page for conversation management
 */

import { Suspense } from 'react';
import { Metadata } from 'next';
import { ConversationService } from '@/lib/conversation-service';
import { DashboardView } from '@/components/conversations/DashboardView';
import { parseFilters, parsePagination } from '@/lib/utils/query-params';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Conversations | Training Data Generator',
  description: 'Manage and review AI-generated training conversations',
};

// Loading component for the dashboard
function DashboardSkeleton() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <Skeleton className="h-9 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-40" />
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-6">
            <Skeleton className="h-4 w-32 mb-4" />
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-3 w-40" />
          </div>
        ))}
      </div>

      {/* Filter Bar Skeleton */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
        <div className="flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-32" />
          ))}
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="rounded-md border">
        <Skeleton className="h-96 w-full" />
      </div>

      {/* Pagination Skeleton */}
      <div className="flex justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-8 w-64" />
      </div>
    </div>
  );
}

interface ConversationsPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function ConversationsPage({
  searchParams,
}: ConversationsPageProps) {
  // Parse query params for filters and pagination
  const filters = parseFilters(searchParams);
  const pagination = parsePagination(searchParams);

  try {
    // Fetch initial data server-side
    const conversationService = new ConversationService();
    
    // Fetch conversations and stats in parallel
    const [conversationsResult, stats] = await Promise.all([
      conversationService.list(filters, pagination),
      conversationService.getStats(),
    ]);

    return (
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardView
          initialConversations={conversationsResult.data}
          initialPagination={conversationsResult.pagination}
          initialStats={stats}
          initialFilters={filters}
        />
      </Suspense>
    );
  } catch (error) {
    console.error('Error loading conversations page:', error);

    // Error fallback UI
    return (
      <div className="container mx-auto p-6">
        <div className="flex flex-col items-center justify-center h-96 space-y-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-destructive mb-2">
              Failed to Load Conversations
            </h2>
            <p className="text-muted-foreground mb-4">
              {error instanceof Error ? error.message : 'An unexpected error occurred'}
            </p>
            <p className="text-sm text-muted-foreground">
              Please try refreshing the page or contact support if the problem persists.
            </p>
          </div>
          <form action="/conversations">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Retry
            </button>
          </form>
        </div>
      </div>
    );
  }
}

// Enable dynamic rendering for search params
export const dynamic = 'force-dynamic';
export const revalidate = 0;

