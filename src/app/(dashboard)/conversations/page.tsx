'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConversationTable } from '@/components/conversations/ConversationTable';
import type { StorageConversation, Conversation, ConversationStatus } from '@/lib/types/conversations';

/**
 * Transform StorageConversation (snake_case from API) to Conversation (camelCase for component)
 */
function transformStorageToConversation(storage: StorageConversation): Conversation & Partial<Pick<StorageConversation, 'enrichment_status' | 'raw_response_path' | 'enriched_file_path'>> {
  // Map StorageConversation status to ConversationStatus
  const statusMap: Record<StorageConversation['status'], ConversationStatus> = {
    'pending_review': 'pending_review',
    'approved': 'approved',
    'rejected': 'rejected',
    'archived': 'none',
  };

  return {
    id: storage.id,
    conversationId: storage.conversation_id,
    title: storage.conversation_name || undefined,
    persona: storage.persona_key || '',
    emotion: storage.starting_emotion || '',
    tier: storage.tier,
    status: statusMap[storage.status],
    category: storage.category ? [storage.category] : [],
    qualityScore: storage.quality_score || undefined,
    turnCount: storage.turn_count,
    totalTokens: 0, // Not stored in StorageConversation
    parameters: {},
    reviewHistory: [],
    retryCount: 0,
    createdAt: storage.created_at,
    updatedAt: storage.updated_at,
    createdBy: storage.created_by || '',
    // Add enrichment fields for ConversationActions component
    enrichment_status: storage.enrichment_status,
    raw_response_path: storage.raw_response_path,
    enriched_file_path: storage.enriched_file_path,
  };
}

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<StorageConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    tier: 'all',
    quality_min: 'all'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total: 0
  });

  useEffect(() => {
    loadConversations();
  }, [filters, pagination.page]);

  async function loadConversations() {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.tier !== 'all' && { tier: filters.tier }),
        ...(filters.quality_min !== 'all' && { quality_min: filters.quality_min })
      });

      const response = await fetch(`/api/conversations?${params}`);
      const data = await response.json();

      setConversations(data.conversations);
      setPagination(prev => ({ ...prev, total: data.total }));
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  }

  // Transform conversations for the table component
  const transformedConversations = conversations.map(transformStorageToConversation);

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Conversations</h1>
          <p className="text-muted-foreground">Manage generated training conversations with enrichment pipeline</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => window.location.href = '/training-files'}
            variant="outline"
            className="bg-green-50 hover:bg-green-100 border-green-200"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Training Files
          </Button>
          <Button 
            onClick={() => window.location.href = '/bulk-generator'}
            variant="outline"
            className="bg-blue-50 hover:bg-blue-100 border-blue-200"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h16M4 17h16" />
            </svg>
            Bulk Generator
          </Button>
          <Button 
            onClick={() => window.location.href = '/conversations/generate'}
            className="bg-green-600 hover:bg-green-700"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Generate New
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <Select value={filters.status} onValueChange={value => setFilters(prev => ({ ...prev, status: value }))}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending_review">Pending Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.tier} onValueChange={value => setFilters(prev => ({ ...prev, tier: value }))}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by tier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tiers</SelectItem>
            <SelectItem value="template">Template</SelectItem>
            <SelectItem value="scenario">Scenario</SelectItem>
            <SelectItem value="edge_case">Edge Case</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.quality_min} onValueChange={value => setFilters(prev => ({ ...prev, quality_min: value }))}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Min quality score" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any Quality</SelectItem>
            <SelectItem value="8.0">8.0+ (Excellent)</SelectItem>
            <SelectItem value="7.0">7.0+ (Good)</SelectItem>
            <SelectItem value="6.0">6.0+ (Fair)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Conversation Table with Enrichment Features */}
      <ConversationTable 
        conversations={transformedConversations}
        isLoading={loading}
        compactActions={false}
      />

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} conversations
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={pagination.page === 1}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            disabled={pagination.page * pagination.limit >= pagination.total}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
