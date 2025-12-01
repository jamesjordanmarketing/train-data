'use client';

import { useFilteredConversations, useComputedConversationStats } from '@/hooks/use-filtered-conversations';
import { useConversationStore, useSelectedConversationIds } from '@/stores/conversation-store';
import { useUpdateConversation, useDeleteConversation } from '@/hooks/use-conversations';
import type { ConversationStatus } from '@/lib/types/conversations';

/**
 * Example Component: Conversation List
 * 
 * Demonstrates the complete state management architecture:
 * - Server state with React Query (data fetching)
 * - Client state with Zustand (UI state)
 * - Optimistic updates
 * - Loading and error states
 * - Selections and bulk operations
 * 
 * This is a reference implementation showing best practices.
 */
export function ConversationListExample() {
  // ============================================================================
  // Server State (React Query)
  // ============================================================================
  
  const { 
    conversations, 
    isLoading, 
    error,
    refetch 
  } = useFilteredConversations();
  
  const stats = useComputedConversationStats();
  
  // ============================================================================
  // Client State (Zustand)
  // ============================================================================
  
  const selectedIds = useSelectedConversationIds();
  const setFilterConfig = useConversationStore((state) => state.setFilterConfig);
  const toggleSelection = useConversationStore((state) => state.toggleConversationSelection);
  const clearSelection = useConversationStore((state) => state.clearSelection);
  const openConversationDetail = useConversationStore((state) => state.openConversationDetail);
  const showConfirm = useConversationStore((state) => state.showConfirm);
  
  // ============================================================================
  // Mutations
  // ============================================================================
  
  const updateMutation = useUpdateConversation();
  const deleteMutation = useDeleteConversation();
  
  // ============================================================================
  // Event Handlers
  // ============================================================================
  
  const handleStatusChange = async (id: string, status: ConversationStatus) => {
    try {
      await updateMutation.mutateAsync({
        id,
        updates: { status }
      });
      // UI updates automatically via optimistic update
    } catch (error) {
      console.error('Failed to update status:', error);
      // Rollback happens automatically
    }
  };
  
  const handleDelete = (id: string) => {
    showConfirm(
      'Delete Conversation',
      'Are you sure you want to delete this conversation? This action cannot be undone.',
      async () => {
        try {
          await deleteMutation.mutateAsync(id);
          // UI updates automatically
        } catch (error) {
          console.error('Failed to delete:', error);
        }
      }
    );
  };
  
  const handleSearch = (query: string) => {
    setFilterConfig({ searchQuery: query });
    // React Query automatically refetches with new filters
  };
  
  const handleFilterByStatus = (statuses: ConversationStatus[]) => {
    setFilterConfig({ statuses });
  };
  
  // ============================================================================
  // Render States
  // ============================================================================
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <span className="ml-2">Loading conversations...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-red-800 font-semibold">Error Loading Conversations</h3>
        <p className="text-red-600 mt-1">{error.message}</p>
        <button 
          onClick={() => refetch()}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }
  
  if (conversations.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No conversations found</p>
        <p className="text-gray-400 mt-2">Try adjusting your filters or create a new conversation</p>
      </div>
    );
  }
  
  // ============================================================================
  // Main Render
  // ============================================================================
  
  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard title="Total" value={stats.total} />
        <StatCard title="Avg Quality" value={stats.avgQualityScore.toFixed(2)} />
        <StatCard title="Approval Rate" value={`${stats.approvalRate.toFixed(1)}%`} />
        <StatCard title="Pending Review" value={stats.pendingReview} />
      </div>
      
      {/* Toolbar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Search conversations..."
            onChange={(e) => handleSearch(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <select 
            onChange={(e) => handleFilterByStatus([e.target.value as ConversationStatus])}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="generated">Generated</option>
            <option value="pending_review">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        
        {selectedIds.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">{selectedIds.length} selected</span>
            <button 
              onClick={clearSelection}
              className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
            >
              Clear
            </button>
          </div>
        )}
      </div>
      
      {/* Conversation List */}
      <div className="space-y-4">
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            className={`bg-white rounded-lg shadow p-6 transition-all ${
              selectedIds.includes(conversation.conversationId) 
                ? 'ring-2 ring-blue-500' 
                : 'hover:shadow-md'
            }`}
          >
            <div className="flex items-start justify-between">
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={selectedIds.includes(conversation.conversationId)}
                onChange={() => toggleSelection(conversation.conversationId)}
                className="mt-1 h-4 w-4 text-blue-600 rounded"
              />
              
              {/* Content */}
              <div className="flex-1 ml-4">
                <div className="flex items-center justify-between">
                  <h3 
                    className="text-lg font-semibold text-gray-900 cursor-pointer hover:text-blue-600"
                    onClick={() => openConversationDetail(conversation.id)}
                  >
                    {conversation.title || conversation.conversationId}
                  </h3>
                  
                  <StatusBadge status={conversation.status} />
                </div>
                
                <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                  <span>Persona: {conversation.persona}</span>
                  <span>•</span>
                  <span>Emotion: {conversation.emotion}</span>
                  <span>•</span>
                  <span>Tier: {conversation.tier}</span>
                  <span>•</span>
                  <span>Quality: {conversation.qualityScore?.toFixed(1) || 'N/A'}</span>
                </div>
                
                <div className="mt-3 flex items-center space-x-2">
                  <button
                    onClick={() => handleStatusChange(conversation.id, 'approved')}
                    disabled={updateMutation.isPending}
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    Approve
                  </button>
                  
                  <button
                    onClick={() => handleStatusChange(conversation.id, 'rejected')}
                    disabled={updateMutation.isPending}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                  >
                    Reject
                  </button>
                  
                  <button
                    onClick={() => handleDelete(conversation.id)}
                    disabled={deleteMutation.isPending}
                    className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// Helper Components
// ============================================================================

function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <p className="text-sm text-gray-600">{title}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: ConversationStatus }) {
  const colors = {
    draft: 'bg-gray-100 text-gray-800',
    generated: 'bg-blue-100 text-blue-800',
    pending_review: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    needs_revision: 'bg-orange-100 text-orange-800',
    failed: 'bg-red-100 text-red-800',
    none: 'bg-gray-100 text-gray-800',
  };
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors[status]}`}>
      {status.replace('_', ' ').toUpperCase()}
    </span>
  );
}

