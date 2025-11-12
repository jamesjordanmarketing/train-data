'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useFilteredConversations, useComputedConversationStats } from '@/hooks/use-filtered-conversations';
import { useConversationStore } from '@/stores/conversation-store';
import { ConversationTable } from './ConversationTable';
import { FilterBar } from './FilterBar';
import { Pagination } from './Pagination';
import { ConversationDetailModal } from './ConversationDetailModal';
import { BulkActionsToolbar } from './BulkActionsToolbar';
import { KeyboardShortcutsHelp } from './KeyboardShortcutsHelp';
import { ConfirmationDialog } from './ConfirmationDialog';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FileText, Plus, ArrowUpRight, CheckCircle, AlertTriangle } from 'lucide-react';
import { DashboardLayout } from './DashboardLayout';
import { DashboardSkeleton, FilterBarSkeleton } from '@/components/ui/skeletons';
import { NoConversationsEmpty, NoSearchResultsEmpty, ErrorStateEmpty } from '@/components/empty-states';
import { Skeleton } from '@/components/ui/skeleton';
import { ExportModal } from '@/components/import-export';

export function ConversationDashboard() {
  const router = useRouter();
  
  // Enable keyboard shortcuts
  useKeyboardShortcuts();
  
  const { conversations, isLoading, error } = useFilteredConversations();
  const stats = useComputedConversationStats();
  const filterConfig = useConversationStore((state) => state.filterConfig);
  const resetFilters = useConversationStore((state) => state.resetFilters);
  const modalState = useConversationStore((state) => state.modalState);
  const closeExportModal = useConversationStore((state) => state.closeExportModal);
  const selectedConversationIds = useConversationStore((state) => state.selectedConversationIds);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;
  
  // Calculate pagination
  const totalPages = Math.ceil(conversations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedConversations = conversations.slice(startIndex, startIndex + itemsPerPage);
  
  // Check if filters are active
  const hasFilters = 
    (filterConfig.tierTypes && filterConfig.tierTypes.length > 0) || 
    (filterConfig.statuses && filterConfig.statuses.length > 0) || 
    (filterConfig.searchQuery && filterConfig.searchQuery.length > 0) ||
    filterConfig.qualityRange;
  
  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <DashboardSkeleton />
      </DashboardLayout>
    );
  }
  
  // Error state
  if (error) {
    return (
      <DashboardLayout>
        <ErrorStateEmpty onRetry={() => window.location.reload()} />
      </DashboardLayout>
    );
  }
  
  // Empty state (no conversations at all)
  if (conversations.length === 0 && !hasFilters) {
    return (
      <DashboardLayout>
        <NoConversationsEmpty onCreate={() => router.push('/conversations/generate')} />
      </DashboardLayout>
    );
  }
  
  // No results from filters
  if (conversations.length === 0 && hasFilters) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Conversations</h1>
          </div>
          
          <FilterBar />
          
          <NoSearchResultsEmpty onClear={resetFilters} />
        </div>
      </DashboardLayout>
    );
  }
  
  // Main content
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Training Data Generator</h1>
            <p className="text-muted-foreground">
              Manage and review your training conversation data
            </p>
          </div>
          
          <Button onClick={() => router.push('/conversations/generate')}>
            <Plus className="h-4 w-4 mr-2" />
            Generate Conversation
          </Button>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Conversations</p>
                <p className="text-3xl font-bold mt-1">{stats.total}</p>
                <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
                  <ArrowUpRight className="h-3 w-3" />
                  <span>Active</span>
                </div>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approval Rate</p>
                <p className="text-3xl font-bold mt-1">{stats.approvalRate.toFixed(0)}%</p>
                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                  <span>{stats.byStatus.approved || 0} approved</span>
                </div>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Quality Score</p>
                <p className="text-3xl font-bold mt-1">{stats.avgQualityScore.toFixed(1)}</p>
                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                  <span>Out of 10</span>
                </div>
              </div>
              <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-700 text-xl">
                ★
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Review</p>
                <p className="text-3xl font-bold mt-1">{stats.pendingReview}</p>
                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                  <span>Awaiting review</span>
                </div>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </Card>
        </div>
        
        {/* Filter Bar */}
        <FilterBar />
        
        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {paginatedConversations.length} of {conversations.length} conversations
            {hasFilters && ` (filtered)`}
          </p>
        </div>
        
        {/* Conversation Table */}
        <ConversationTable 
          conversations={paginatedConversations}
          isLoading={isLoading}
        />
        
        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
      
      {/* Conversation Detail Modal */}
      <ConversationDetailModal />

      {/* Export Modal */}
      <ExportModal
        open={modalState.exportModalOpen}
        onClose={closeExportModal}
        entityType="conversations"
        selectedIds={selectedConversationIds}
      />

      {/* Bulk actions toolbar (appears when items selected) */}
      <BulkActionsToolbar />

      {/* Keyboard shortcuts help (opens with ?) */}
      <KeyboardShortcutsHelp />

      {/* Confirmation dialog */}
      <ConfirmationDialog />
    </DashboardLayout>
  );
}

