import { useMemo } from 'react';
import { useConversations, useConversationStats } from './use-conversations';
import { useConversationStore, useFilterConfig, useSelectedConversationIds } from '@/stores/conversation-store';
import type { 
  Conversation, 
  ConversationStatus, 
  TierType,
  QualityMetrics 
} from '@/lib/types/conversations';

// ============================================================================
// Filtered Conversations Hook
// ============================================================================

/**
 * Hook for getting filtered conversations based on current filter config
 * 
 * Combines server-side filtering (React Query) with client-side filtering
 * for instant feedback on certain operations.
 * 
 * @returns Filtered conversations with loading and error states
 */
export function useFilteredConversations() {
  const filterConfig = useFilterConfig();
  const { data: conversations, isLoading, error, refetch } = useConversations(filterConfig);
  
  // Additional client-side filtering for instant feedback
  // (Most filtering happens server-side, this is for refinement)
  const filteredConversations = useMemo(() => {
    if (!conversations) return [];
    
    return conversations.filter((conv) => {
      // Client-side search refinement (case-insensitive)
      if (filterConfig.searchQuery) {
        const query = filterConfig.searchQuery.toLowerCase();
        const searchableText = [
          conv.title,
          conv.persona,
          conv.emotion,
          conv.topic,
          conv.intent,
          conv.conversationId,
          ...(conv.category || []),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        
        if (!searchableText.includes(query)) {
          return false;
        }
      }
      
      return true;
    });
  }, [conversations, filterConfig.searchQuery]);
  
  return { 
    conversations: filteredConversations, 
    isLoading, 
    error,
    refetch,
    total: filteredConversations.length,
  };
}

// ============================================================================
// Selected Conversations Hook
// ============================================================================

/**
 * Hook for getting currently selected conversations
 * 
 * Combines selection state with filtered conversations to return
 * the actual conversation objects for selected IDs.
 * 
 * @returns Array of selected conversation objects
 */
export function useSelectedConversations() {
  const { conversations } = useFilteredConversations();
  const selectedIds = useSelectedConversationIds();
  
  const selectedConversations = useMemo(() => {
    return conversations.filter((conv) => selectedIds.includes(conv.id));
  }, [conversations, selectedIds]);
  
  return selectedConversations;
}

// ============================================================================
// Conversation Statistics Hooks
// ============================================================================

/**
 * Hook for computing statistics from filtered conversations
 * 
 * Calculates real-time statistics including:
 * - Total count
 * - Counts by status
 * - Counts by tier
 * - Average quality score
 * - Total tokens
 * 
 * @returns Computed statistics object
 */
export function useComputedConversationStats() {
  const { conversations } = useFilteredConversations();
  
  return useMemo(() => {
    const total = conversations.length;
    
    // Count by status
    const byStatus = conversations.reduce((acc, conv) => {
      acc[conv.status] = (acc[conv.status] || 0) + 1;
      return acc;
    }, {} as Record<ConversationStatus, number>);
    
    // Count by tier
    const byTier = conversations.reduce((acc, conv) => {
      acc[conv.tier] = (acc[conv.tier] || 0) + 1;
      return acc;
    }, {} as Record<TierType, number>);
    
    // Average quality score
    const avgQualityScore = total > 0
      ? conversations.reduce((sum, conv) => sum + (conv.qualityScore || 0), 0) / total
      : 0;
    
    // Total tokens
    const totalTokens = conversations.reduce((sum, conv) => sum + (conv.totalTokens || 0), 0);
    
    // Total cost
    const totalCost = conversations.reduce(
      (sum, conv) => sum + (conv.actualCostUsd || conv.estimatedCostUsd || 0), 
      0
    );
    
    // Average turns per conversation
    const avgTurnsPerConversation = total > 0
      ? conversations.reduce((sum, conv) => sum + (conv.turnCount || 0), 0) / total
      : 0;
    
    // Approval rate (approved / (approved + rejected))
    const approvedCount = byStatus['approved'] || 0;
    const rejectedCount = byStatus['rejected'] || 0;
    const approvalRate = (approvedCount + rejectedCount) > 0
      ? (approvedCount / (approvedCount + rejectedCount)) * 100
      : 0;
    
    // Pending review count
    const pendingReview = byStatus['pending_review'] || 0;
    
    return {
      total,
      byStatus,
      byTier,
      avgQualityScore,
      totalTokens,
      totalCost,
      avgTurnsPerConversation,
      approvalRate,
      pendingReview,
    };
  }, [conversations]);
}

/**
 * Hook for computing quality distribution
 * 
 * Groups conversations into quality buckets:
 * - Excellent: 8-10
 * - Good: 6-7.9
 * - Fair: 4-5.9
 * - Poor: 0-3.9
 * 
 * @returns Quality distribution object
 */
export function useQualityDistribution() {
  const { conversations } = useFilteredConversations();
  
  return useMemo(() => {
    const distribution = {
      excellent: 0, // 8-10
      good: 0,      // 6-7.9
      fair: 0,      // 4-5.9
      poor: 0,      // 0-3.9
    };
    
    conversations.forEach((conv) => {
      const score = conv.qualityScore || 0;
      if (score >= 8) {
        distribution.excellent++;
      } else if (score >= 6) {
        distribution.good++;
      } else if (score >= 4) {
        distribution.fair++;
      } else {
        distribution.poor++;
      }
    });
    
    return distribution;
  }, [conversations]);
}

// ============================================================================
// Grouping and Categorization Hooks
// ============================================================================

/**
 * Hook for grouping conversations by tier
 * 
 * @returns Object with conversations grouped by tier type
 */
export function useConversationsByTier() {
  const { conversations } = useFilteredConversations();
  
  return useMemo(() => {
    return conversations.reduce((acc, conv) => {
      if (!acc[conv.tier]) {
        acc[conv.tier] = [];
      }
      acc[conv.tier].push(conv);
      return acc;
    }, {} as Record<TierType, Conversation[]>);
  }, [conversations]);
}

/**
 * Hook for grouping conversations by status
 * 
 * @returns Object with conversations grouped by status
 */
export function useConversationsByStatus() {
  const { conversations } = useFilteredConversations();
  
  return useMemo(() => {
    return conversations.reduce((acc, conv) => {
      if (!acc[conv.status]) {
        acc[conv.status] = [];
      }
      acc[conv.status].push(conv);
      return acc;
    }, {} as Record<ConversationStatus, Conversation[]>);
  }, [conversations]);
}

/**
 * Hook for grouping conversations by category
 * 
 * @returns Object with conversations grouped by category
 */
export function useConversationsByCategory() {
  const { conversations } = useFilteredConversations();
  
  return useMemo(() => {
    const grouped: Record<string, Conversation[]> = {};
    
    conversations.forEach((conv) => {
      // A conversation can have multiple categories
      const categories = conv.category || ['uncategorized'];
      categories.forEach((cat) => {
        if (!grouped[cat]) {
          grouped[cat] = [];
        }
        grouped[cat].push(conv);
      });
    });
    
    return grouped;
  }, [conversations]);
}

// ============================================================================
// Search and Filter Helpers
// ============================================================================

/**
 * Hook for getting unique values from conversations
 * Useful for building filter dropdowns
 * 
 * @returns Unique personas, emotions, categories, etc.
 */
export function useConversationFilterOptions() {
  const { conversations } = useFilteredConversations();
  
  return useMemo(() => {
    const personas = new Set<string>();
    const emotions = new Set<string>();
    const categories = new Set<string>();
    const intents = new Set<string>();
    const tones = new Set<string>();
    
    conversations.forEach((conv) => {
      if (conv.persona) personas.add(conv.persona);
      if (conv.emotion) emotions.add(conv.emotion);
      if (conv.intent) intents.add(conv.intent);
      if (conv.tone) tones.add(conv.tone);
      
      (conv.category || []).forEach((cat) => categories.add(cat));
    });
    
    return {
      personas: Array.from(personas).sort(),
      emotions: Array.from(emotions).sort(),
      categories: Array.from(categories).sort(),
      intents: Array.from(intents).sort(),
      tones: Array.from(tones).sort(),
    };
  }, [conversations]);
}

/**
 * Hook for checking if filters are active
 * 
 * @returns Boolean indicating if any filters are applied
 */
export function useHasActiveFilters() {
  const filterConfig = useFilterConfig();
  
  return useMemo(() => {
    return Boolean(
      (filterConfig.tierTypes && filterConfig.tierTypes.length > 0) ||
      (filterConfig.statuses && filterConfig.statuses.length > 0) ||
      (filterConfig.qualityRange && (
        filterConfig.qualityRange.min > 0 || 
        filterConfig.qualityRange.max < 10
      )) ||
      filterConfig.dateRange ||
      (filterConfig.categories && filterConfig.categories.length > 0) ||
      (filterConfig.personas && filterConfig.personas.length > 0) ||
      (filterConfig.emotions && filterConfig.emotions.length > 0) ||
      filterConfig.searchQuery ||
      filterConfig.parentId ||
      filterConfig.createdBy
    );
  }, [filterConfig]);
}

// ============================================================================
// Selection Helpers
// ============================================================================

/**
 * Hook for checking if all conversations are selected
 * 
 * @returns Boolean and functions for select all/none
 */
export function useSelectAll() {
  const { conversations } = useFilteredConversations();
  const selectedIds = useSelectedConversationIds();
  const selectAllConversations = useConversationStore((state) => state.selectAllConversations);
  const clearSelection = useConversationStore((state) => state.clearSelection);
  
  const allSelected = useMemo(() => {
    if (conversations.length === 0) return false;
    return conversations.every((conv) => selectedIds.includes(conv.id));
  }, [conversations, selectedIds]);
  
  const someSelected = useMemo(() => {
    return selectedIds.length > 0 && !allSelected;
  }, [selectedIds, allSelected]);
  
  const handleSelectAll = () => {
    if (allSelected) {
      clearSelection();
    } else {
      selectAllConversations(conversations.map((c) => c.id));
    }
  };
  
  return {
    allSelected,
    someSelected,
    selectedCount: selectedIds.length,
    totalCount: conversations.length,
    handleSelectAll,
  };
}

// ============================================================================
// Sorting Helpers
// ============================================================================

/**
 * Hook for sorting conversations
 * 
 * @param sortBy - Field to sort by
 * @param sortDirection - 'asc' or 'desc'
 * @returns Sorted conversations
 */
export function useSortedConversations(
  sortBy: keyof Conversation = 'createdAt',
  sortDirection: 'asc' | 'desc' = 'desc'
) {
  const { conversations, isLoading, error } = useFilteredConversations();
  
  const sortedConversations = useMemo(() => {
    return [...conversations].sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      
      // Handle null/undefined
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return sortDirection === 'asc' ? -1 : 1;
      if (bVal == null) return sortDirection === 'asc' ? 1 : -1;
      
      // Compare values
      let comparison = 0;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        comparison = aVal.localeCompare(bVal);
      } else if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal;
      } else {
        comparison = String(aVal).localeCompare(String(bVal));
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [conversations, sortBy, sortDirection]);
  
  return { 
    conversations: sortedConversations, 
    isLoading, 
    error,
  };
}

