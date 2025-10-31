import { useQuery, useMutation, useQueryClient, QueryClient } from '@tanstack/react-query';
import type { 
  Conversation, 
  FilterConfig,
  PaginatedConversations,
  PaginationConfig,
  ConversationStats 
} from '@/lib/types/conversations';

// ============================================================================
// Query Key Factory
// ============================================================================

/**
 * Query key factory for consistent cache management
 * Follows the pattern: [scope, entity, ...filters]
 */
export const conversationKeys = {
  all: ['conversations'] as const,
  lists: () => [...conversationKeys.all, 'list'] as const,
  list: (filters: FilterConfig) => [...conversationKeys.lists(), filters] as const,
  details: () => [...conversationKeys.all, 'detail'] as const,
  detail: (id: string) => [...conversationKeys.details(), id] as const,
  stats: () => [...conversationKeys.all, 'stats'] as const,
};

// ============================================================================
// API Client Functions
// ============================================================================

/**
 * Fetch conversations with filters
 */
async function fetchConversations(
  filters: FilterConfig,
  pagination?: PaginationConfig
): Promise<Conversation[]> {
  const params = new URLSearchParams();
  
  // Apply tier filters
  if (filters.tierTypes && filters.tierTypes.length > 0) {
    params.append('tier', filters.tierTypes.join(','));
  }
  
  // Apply status filters
  if (filters.statuses && filters.statuses.length > 0) {
    params.append('status', filters.statuses.join(','));
  }
  
  // Apply quality range filter
  if (filters.qualityRange) {
    params.append('qualityMin', String(filters.qualityRange.min));
    params.append('qualityMax', String(filters.qualityRange.max));
  }
  
  // Apply date range filter
  if (filters.dateRange) {
    params.append('dateFrom', filters.dateRange.from);
    params.append('dateTo', filters.dateRange.to);
  }
  
  // Apply category filter
  if (filters.categories && filters.categories.length > 0) {
    params.append('categories', filters.categories.join(','));
  }
  
  // Apply persona filter
  if (filters.personas && filters.personas.length > 0) {
    params.append('personas', filters.personas.join(','));
  }
  
  // Apply emotion filter
  if (filters.emotions && filters.emotions.length > 0) {
    params.append('emotions', filters.emotions.join(','));
  }
  
  // Apply search query
  if (filters.searchQuery) {
    params.append('search', filters.searchQuery);
  }
  
  // Apply parent filter
  if (filters.parentId) {
    params.append('parentId', filters.parentId);
  }
  
  // Apply creator filter
  if (filters.createdBy) {
    params.append('createdBy', filters.createdBy);
  }
  
  // Apply pagination
  if (pagination) {
    params.append('page', String(pagination.page));
    params.append('limit', String(pagination.limit));
    if (pagination.sortBy) {
      params.append('sortBy', pagination.sortBy);
    }
    if (pagination.sortDirection) {
      params.append('sortDirection', pagination.sortDirection);
    }
  }
  
  const response = await fetch(`/api/conversations?${params}`);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch conversations' }));
    throw new Error(error.error || 'Failed to fetch conversations');
  }
  
  const data = await response.json();
  return data.data || [];
}

/**
 * Fetch a single conversation by ID
 */
async function fetchConversationById(id: string): Promise<Conversation> {
  const response = await fetch(`/api/conversations/${id}?includeTurns=true`);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Conversation not found' }));
    throw new Error(error.error || 'Conversation not found');
  }
  
  return response.json();
}

/**
 * Update a conversation
 */
async function updateConversation(
  id: string, 
  updates: Partial<Conversation>
): Promise<Conversation> {
  const response = await fetch(`/api/conversations/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to update conversation' }));
    throw new Error(error.error || 'Failed to update conversation');
  }
  
  return response.json();
}

/**
 * Delete a conversation
 */
async function deleteConversation(id: string): Promise<void> {
  const response = await fetch(`/api/conversations/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to delete conversation' }));
    throw new Error(error.error || 'Failed to delete conversation');
  }
}

/**
 * Bulk update conversations
 */
async function bulkUpdateConversations(
  ids: string[], 
  updates: Partial<Conversation>
): Promise<{ updated: number; failed: number; errors?: string[] }> {
  const response = await fetch('/api/conversations/bulk-update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids, updates }),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Bulk update failed' }));
    throw new Error(error.error || 'Bulk update failed');
  }
  
  return response.json();
}

/**
 * Bulk delete conversations
 */
async function bulkDeleteConversations(ids: string[]): Promise<{ deleted: number; failed: number }> {
  const response = await fetch('/api/conversations/bulk-delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Bulk delete failed' }));
    throw new Error(error.error || 'Bulk delete failed');
  }
  
  return response.json();
}

/**
 * Fetch conversation statistics
 */
async function fetchConversationStats(filters?: FilterConfig): Promise<ConversationStats> {
  const params = new URLSearchParams();
  
  if (filters?.tierTypes && filters.tierTypes.length > 0) {
    params.append('tier', filters.tierTypes.join(','));
  }
  
  if (filters?.statuses && filters.statuses.length > 0) {
    params.append('status', filters.statuses.join(','));
  }
  
  const response = await fetch(`/api/conversations/stats?${params}`);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Failed to fetch stats' }));
    throw new Error(error.error || 'Failed to fetch stats');
  }
  
  return response.json();
}

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Hook for fetching conversations with filters
 * 
 * Features:
 * - Automatic caching
 * - Refetch on window focus
 * - 30 second stale time
 * 
 * @param filters - Filter configuration
 * @param pagination - Optional pagination config
 */
export function useConversations(
  filters: FilterConfig,
  pagination?: PaginationConfig
) {
  return useQuery({
    queryKey: conversationKeys.list(filters),
    queryFn: () => fetchConversations(filters, pagination),
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
    retry: 1,
  });
}

/**
 * Hook for fetching a single conversation by ID
 * 
 * @param id - Conversation ID (null to disable query)
 */
export function useConversation(id: string | null) {
  return useQuery({
    queryKey: conversationKeys.detail(id!),
    queryFn: () => fetchConversationById(id!),
    enabled: !!id,
    staleTime: 60000, // 1 minute
    retry: 1,
  });
}

/**
 * Hook for fetching conversation statistics
 * 
 * @param filters - Optional filter configuration
 */
export function useConversationStats(filters?: FilterConfig) {
  return useQuery({
    queryKey: conversationKeys.stats(),
    queryFn: () => fetchConversationStats(filters),
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false,
  });
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Hook for updating a conversation with optimistic updates
 * 
 * Features:
 * - Optimistic UI updates
 * - Automatic rollback on error
 * - Cache invalidation on success
 */
export function useUpdateConversation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Conversation> }) =>
      updateConversation(id, updates),
    
    onMutate: async ({ id, updates }) => {
      // Cancel outgoing refetches to prevent overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: conversationKeys.lists() });
      
      // Snapshot previous values for rollback
      const previousLists = queryClient.getQueriesData({ 
        queryKey: conversationKeys.lists() 
      });
      
      // Optimistically update all list queries
      queryClient.setQueriesData(
        { queryKey: conversationKeys.lists() },
        (old: Conversation[] | undefined) => {
          if (!old) return old;
          return old.map((conv) =>
            conv.id === id ? { ...conv, ...updates } : conv
          );
        }
      );
      
      // Optimistically update detail query if it exists
      queryClient.setQueryData(
        conversationKeys.detail(id),
        (old: Conversation | undefined) => {
          if (!old) return old;
          return { ...old, ...updates };
        }
      );
      
      return { previousLists };
    },
    
    onError: (err, variables, context) => {
      // Rollback all optimistic updates on error
      if (context?.previousLists) {
        context.previousLists.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: conversationKeys.all });
    },
  });
}

/**
 * Hook for deleting a conversation
 * 
 * Features:
 * - Optimistic removal from lists
 * - Automatic rollback on error
 */
export function useDeleteConversation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteConversation,
    
    onMutate: async (id: string) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: conversationKeys.lists() });
      
      // Snapshot previous values
      const previousLists = queryClient.getQueriesData({ 
        queryKey: conversationKeys.lists() 
      });
      
      // Optimistically remove from all lists
      queryClient.setQueriesData(
        { queryKey: conversationKeys.lists() },
        (old: Conversation[] | undefined) => {
          if (!old) return old;
          return old.filter((conv) => conv.id !== id);
        }
      );
      
      return { previousLists };
    },
    
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousLists) {
        context.previousLists.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    
    onSuccess: () => {
      // Invalidate queries after successful delete
      queryClient.invalidateQueries({ queryKey: conversationKeys.all });
    },
  });
}

/**
 * Hook for bulk updating conversations
 * 
 * Note: Does not perform optimistic updates due to complexity
 */
export function useBulkUpdateConversations() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ ids, updates }: { ids: string[]; updates: Partial<Conversation> }) =>
      bulkUpdateConversations(ids, updates),
    
    onSuccess: () => {
      // Invalidate all conversation queries
      queryClient.invalidateQueries({ queryKey: conversationKeys.all });
    },
  });
}

/**
 * Hook for bulk deleting conversations
 */
export function useBulkDeleteConversations() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: bulkDeleteConversations,
    
    onSuccess: () => {
      // Invalidate all conversation queries
      queryClient.invalidateQueries({ queryKey: conversationKeys.all });
    },
  });
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Prefetch conversations for better UX
 * Call this when you anticipate the user will navigate to a filtered view
 */
export function prefetchConversations(
  queryClient: QueryClient,
  filters: FilterConfig
) {
  return queryClient.prefetchQuery({
    queryKey: conversationKeys.list(filters),
    queryFn: () => fetchConversations(filters),
    staleTime: 30000,
  });
}

/**
 * Invalidate all conversation queries
 * Use this after operations that affect multiple conversations
 */
export function invalidateAllConversations(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: conversationKeys.all });
}

