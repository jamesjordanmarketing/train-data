/**
 * Dashboard View Component
 * 
 * Main client component for conversation dashboard with state management and API integration
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Plus, PlayCircle, RefreshCw } from 'lucide-react';
import { ConversationTable } from './ConversationTable';
import { FilterBar } from './FilterBar';
import { Pagination } from './Pagination';
import { StatsCards } from './StatsCards';
import {
  Conversation,
  ConversationStats,
  FilterConfig,
  PaginationConfig,
  PaginatedConversations,
} from '@/lib/types/conversations';
import { buildQueryString, parseFilters, parsePagination } from '@/lib/utils/query-params';
import { toast } from 'sonner';

interface DashboardViewProps {
  initialConversations: Conversation[];
  initialPagination: PaginationConfig & { total: number; totalPages: number };
  initialStats: ConversationStats;
  initialFilters: Partial<FilterConfig>;
}

export function DashboardView({
  initialConversations,
  initialPagination,
  initialStats,
  initialFilters,
}: DashboardViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [pagination, setPagination] = useState(initialPagination);
  const [stats, setStats] = useState<ConversationStats>(initialStats);
  const [filters, setFilters] = useState<Partial<FilterConfig>>(initialFilters);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch conversations when filters/pagination change
  const fetchConversations = useCallback(async () => {
    setIsLoading(true);
    try {
      const queryString = buildQueryString(filters, {
        page: pagination.page,
        limit: pagination.limit,
        sortBy: pagination.sortBy,
        sortDirection: pagination.sortDirection,
      });

      const response = await fetch(`/api/conversations?${queryString}`);

      if (!response.ok) {
        throw new Error('Failed to fetch conversations');
      }

      const data: PaginatedConversations = await response.json();
      setConversations(data.data);
      setPagination({
        ...pagination,
        total: data.pagination.total,
        totalPages: data.pagination.totalPages,
      });

      // Update URL with filter state
      updateURL();
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  }, [filters, pagination.page, pagination.limit, pagination.sortBy, pagination.sortDirection]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('/api/conversations/stats');

      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }

      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, []);

  // Re-fetch when filters or pagination change
  useEffect(() => {
    fetchConversations();
  }, [filters, pagination.page, pagination.limit]);

  // Update URL with current filter and pagination state
  const updateURL = () => {
    const params = new URLSearchParams();

    // Add filters
    if (filters.statuses && filters.statuses.length > 0) {
      params.set('status', filters.statuses.join(','));
    }
    if (filters.tierTypes && filters.tierTypes.length > 0) {
      params.set('tier', filters.tierTypes.join(','));
    }
    if (filters.personas && filters.personas.length > 0) {
      params.set('personas', filters.personas.join(','));
    }
    if (filters.emotions && filters.emotions.length > 0) {
      params.set('emotions', filters.emotions.join(','));
    }
    if (filters.categories && filters.categories.length > 0) {
      params.set('categories', filters.categories.join(','));
    }
    if (filters.qualityRange) {
      params.set('qualityMin', filters.qualityRange.min.toString());
      params.set('qualityMax', filters.qualityRange.max.toString());
    }
    if (filters.searchQuery) {
      params.set('search', filters.searchQuery);
    }

    // Add pagination
    params.set('page', pagination.page.toString());
    params.set('limit', pagination.limit.toString());

    // Update URL without page reload
    const newUrl = `/conversations${params.toString() ? `?${params.toString()}` : ''}`;
    router.push(newUrl, { scroll: false });
  };

  // Bulk actions
  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) {
      toast.error('No conversations selected');
      return;
    }

    try {
      const response = await fetch('/api/conversations/bulk-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve',
          conversationIds: selectedIds,
        }),
      });

      if (!response.ok) throw new Error('Bulk approve failed');

      const result = await response.json();
      toast.success(`${result.updated} conversations approved`);

      // Refresh data
      await fetchConversations();
      await fetchStats();
      setSelectedIds([]);
    } catch (error) {
      console.error('Error approving conversations:', error);
      toast.error('Failed to approve conversations');
    }
  };

  const handleBulkReject = async () => {
    if (selectedIds.length === 0) {
      toast.error('No conversations selected');
      return;
    }

    const reason = prompt('Reason for rejection (optional):');

    try {
      const response = await fetch('/api/conversations/bulk-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reject',
          conversationIds: selectedIds,
          reason: reason || 'Bulk rejection',
        }),
      });

      if (!response.ok) throw new Error('Bulk reject failed');

      const result = await response.json();
      toast.success(`${result.updated} conversations rejected`);

      // Refresh data
      await fetchConversations();
      await fetchStats();
      setSelectedIds([]);
    } catch (error) {
      console.error('Error rejecting conversations:', error);
      toast.error('Failed to reject conversations');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      toast.error('No conversations selected');
      return;
    }

    if (
      !confirm(
        `Delete ${selectedIds.length} conversation${selectedIds.length !== 1 ? 's' : ''}? This cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const response = await fetch('/api/conversations/bulk-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          conversationIds: selectedIds,
        }),
      });

      if (!response.ok) throw new Error('Bulk delete failed');

      const result = await response.json();
      toast.success(`${result.deleted} conversations deleted`);

      // Refresh data
      await fetchConversations();
      await fetchStats();
      setSelectedIds([]);
    } catch (error) {
      console.error('Error deleting conversations:', error);
      toast.error('Failed to delete conversations');
    }
  };

  // Filter changes
  const handleFilterChange = (newFilters: Partial<FilterConfig>) => {
    setFilters(newFilters);
    setPagination({ ...pagination, page: 1 }); // Reset to page 1 when filters change
  };

  // Pagination changes
  const handlePageChange = (page: number) => {
    setPagination({ ...pagination, page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLimitChange = (limit: number) => {
    setPagination({ ...pagination, limit, page: 1 });
  };

  // Export functionality
  const handleExport = async () => {
    try {
      const queryString = buildQueryString(filters, pagination);
      const response = await fetch(`/api/conversations?${queryString}`);

      if (!response.ok) throw new Error('Failed to export');

      const data: PaginatedConversations = await response.json();
      const blob = new Blob([JSON.stringify(data.data, null, 2)], {
        type: 'application/json',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `conversations-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success('Conversations exported');
    } catch (error) {
      console.error('Error exporting conversations:', error);
      toast.error('Failed to export conversations');
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Conversation Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage and review AI-generated training conversations
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchConversations();
              fetchStats();
            }}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push('/conversations/generate')}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Generate Single
          </Button>
          <Button
            onClick={() => router.push('/conversations/generate-batch')}
            className="gap-2"
          >
            <PlayCircle className="h-4 w-4" />
            Generate Batch
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Filters */}
      <FilterBar
        filters={filters}
        stats={stats}
        onChange={handleFilterChange}
        onExport={handleExport}
      />

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <span className="font-medium">
            {selectedIds.length} conversation{selectedIds.length !== 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-2 ml-auto">
            <Button size="sm" onClick={handleBulkApprove}>
              Approve Selected
            </Button>
            <Button size="sm" variant="outline" onClick={handleBulkReject}>
              Reject Selected
            </Button>
            <Button size="sm" variant="destructive" onClick={handleBulkDelete}>
              Delete Selected
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedIds([])}
            >
              Clear Selection
            </Button>
          </div>
        </div>
      )}

      {/* Conversation Table */}
      <ConversationTable
        conversations={conversations}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onRefresh={async () => {
          await fetchConversations();
          await fetchStats();
        }}
        isLoading={isLoading}
      />

      {/* Pagination */}
      <Pagination
        pagination={pagination}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
      />
    </div>
  );
}

