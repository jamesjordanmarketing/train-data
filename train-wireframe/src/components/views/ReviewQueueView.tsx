import { useState, useEffect, useMemo } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, AlertCircle, CheckSquare, Square } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { useAppStore } from '../../stores/useAppStore';
import { toast } from 'sonner@2.0.3';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Conversation } from '../../lib/types';
import { ReviewQueueHeader, QueueStatistics } from '../review/ReviewQueueHeader';
import { ReviewQueueEmptyState } from '../review/ReviewQueueEmptyState';
import { QualityScoreBadge, PriorityBadge } from '../review/ReviewQueueHelpers';
import { ConversationReviewModal } from '../review/ConversationReviewModal';
import { DashboardLayout } from '../layout/DashboardLayout';
import { cn } from '../../lib/utils';

// API functions
async function fetchReviewQueue(params?: {
  page?: number;
  limit?: number;
  minQuality?: number;
}) {
  const searchParams = new URLSearchParams({
    page: String(params?.page || 1),
    limit: String(params?.limit || 25),
    ...(params?.minQuality && { minQuality: String(params.minQuality) })
  });
  
  const response = await fetch(`/api/review/queue?${searchParams}`);
  if (!response.ok) {
    throw new Error('Failed to fetch review queue');
  }
  
  return response.json();
}

async function submitReviewAction(params: {
  conversationId: string;
  action: string;
  comment?: string;
  reasons?: string[];
}) {
  const response = await fetch(`/api/review/${params.conversationId}/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: params.action,
      comment: params.comment || '',
      reasons: params.reasons || []
    })
  });

  if (!response.ok) {
    throw new Error('Failed to submit review action');
  }

  return response.json();
}

// Sort type definition
type SortKey = 'id' | 'title' | 'qualityScore' | 'createdAt' | 'tier';

export function ReviewQueueView() {
  const { conversations, setConversations, updateConversation } = useAppStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortColumn, setSortColumn] = useState<SortKey>('qualityScore');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  
  // Filter conversations to only show pending_review
  const reviewQueue = useMemo(() => {
    return conversations.filter(c => c.status === 'pending_review');
  }, [conversations]);
  
  // Calculate statistics
  const statistics: QueueStatistics = useMemo(() => {
    if (reviewQueue.length === 0) {
      return {
        totalPending: 0,
        averageQuality: 0,
        oldestPendingDate: ''
      };
    }
    
    const totalQuality = reviewQueue.reduce((sum, c) => sum + (c.qualityScore || 0), 0);
    const averageQuality = totalQuality / reviewQueue.length;
    
    const oldestConversation = reviewQueue.reduce((oldest, current) => {
      return new Date(current.createdAt) < new Date(oldest.createdAt) ? current : oldest;
    });
    
    return {
      totalPending: reviewQueue.length,
      averageQuality,
      oldestPendingDate: oldestConversation.createdAt
    };
  }, [reviewQueue]);
  
  // Sort conversations
  const sortedQueue = useMemo(() => {
    return [...reviewQueue].sort((a, b) => {
      let aVal: any = a[sortColumn];
      let bVal: any = b[sortColumn];
      
      // Handle undefined values
      if (aVal === undefined) aVal = sortDirection === 'asc' ? Infinity : -Infinity;
      if (bVal === undefined) bVal = sortDirection === 'asc' ? Infinity : -Infinity;
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [reviewQueue, sortColumn, sortDirection]);
  
  // Fetch review queue data
  const loadReviewQueue = async (showLoadingState = true) => {
    try {
      if (showLoadingState) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }
      setError(null);
      
      // In a real implementation, this would fetch from the API
      // For now, we'll use the data from the store
      // const data = await fetchReviewQueue();
      // setConversations(data.conversations);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load review queue';
      console.error('Failed to fetch review queue:', err);
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };
  
  // Initial load
  useEffect(() => {
    loadReviewQueue();
  }, []);
  
  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadReviewQueue(false);
    }, 30000); // 30 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  // Handle refresh button click
  const handleRefresh = () => {
    loadReviewQueue(false);
  };
  
  // Handle sorting
  const handleSort = (column: SortKey) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };
  
  const getSortIcon = (column: SortKey) => {
    if (sortColumn !== column) return <ArrowUpDown className="h-4 w-4" />;
    return sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };
  
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  
  // Handle opening review modal
  const openReviewModal = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setIsReviewModalOpen(true);
  };
  
  const handleRowClick = (conversation: Conversation) => {
    openReviewModal(conversation.id);
  };
  
  // Navigation functions for review modal
  const handleNavigateNext = () => {
    if (!selectedConversationId) return;
    const currentIndex = sortedQueue.findIndex(c => c.id === selectedConversationId);
    if (currentIndex < sortedQueue.length - 1) {
      setSelectedConversationId(sortedQueue[currentIndex + 1].id);
    }
  };
  
  const handleNavigatePrevious = () => {
    if (!selectedConversationId) return;
    const currentIndex = sortedQueue.findIndex(c => c.id === selectedConversationId);
    if (currentIndex > 0) {
      setSelectedConversationId(sortedQueue[currentIndex - 1].id);
    }
  };
  
  const currentIndex = selectedConversationId 
    ? sortedQueue.findIndex(c => c.id === selectedConversationId) 
    : -1;
  const hasNext = currentIndex >= 0 && currentIndex < sortedQueue.length - 1;
  const hasPrevious = currentIndex > 0;

  // Bulk selection handlers
  const isAllSelected = sortedQueue.length > 0 && selectedIds.length === sortedQueue.length;
  const isSomeSelected = selectedIds.length > 0 && selectedIds.length < sortedQueue.length;

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(sortedQueue.map(c => c.id));
    }
  };

  const handleSelectOne = (conversationId: string) => {
    setSelectedIds(prev => 
      prev.includes(conversationId)
        ? prev.filter(id => id !== conversationId)
        : [...prev, conversationId]
    );
  };

  // Bulk action handlers
  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return;

    const confirmed = confirm(
      `Are you sure you want to approve ${selectedIds.length} conversation${selectedIds.length > 1 ? 's' : ''}?`
    );
    
    if (!confirmed) return;

    setIsBulkProcessing(true);

    try {
      let successCount = 0;
      let failCount = 0;

      // Process all selected conversations
      await Promise.allSettled(
        selectedIds.map(async (id) => {
          try {
            // Optimistically update UI
            updateConversation(id, { status: 'approved' });

            // Submit to API (commented out for mock implementation)
            // await submitReviewAction({ conversationId: id, action: 'approved' });
            
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 100));
            
            successCount++;
          } catch (error) {
            // Rollback on error
            const conv = conversations.find(c => c.id === id);
            if (conv) {
              updateConversation(id, { status: conv.status });
            }
            failCount++;
            console.error(`Failed to approve conversation ${id}:`, error);
          }
        })
      );

      // Show success/failure toast
      if (failCount === 0) {
        toast.success(`${successCount} conversation${successCount > 1 ? 's' : ''} approved successfully`);
      } else {
        toast.warning(`${successCount} approved, ${failCount} failed`);
      }

      // Clear selection
      setSelectedIds([]);
      
      // Refresh queue
      await loadReviewQueue(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Bulk approve failed';
      toast.error(message);
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const handleBulkReject = async () => {
    if (selectedIds.length === 0) return;

    const confirmed = confirm(
      `Are you sure you want to reject ${selectedIds.length} conversation${selectedIds.length > 1 ? 's' : ''}? This action cannot be undone.`
    );
    
    if (!confirmed) return;

    setIsBulkProcessing(true);

    try {
      let successCount = 0;
      let failCount = 0;

      // Process all selected conversations
      await Promise.allSettled(
        selectedIds.map(async (id) => {
          try {
            // Optimistically update UI
            updateConversation(id, { status: 'rejected' });

            // Submit to API (commented out for mock implementation)
            // await submitReviewAction({ 
            //   conversationId: id, 
            //   action: 'rejected',
            //   comment: 'Bulk rejection'
            // });
            
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 100));
            
            successCount++;
          } catch (error) {
            // Rollback on error
            const conv = conversations.find(c => c.id === id);
            if (conv) {
              updateConversation(id, { status: conv.status });
            }
            failCount++;
            console.error(`Failed to reject conversation ${id}:`, error);
          }
        })
      );

      // Show success/failure toast
      if (failCount === 0) {
        toast.success(`${successCount} conversation${successCount > 1 ? 's' : ''} rejected successfully`);
      } else {
        toast.warning(`${successCount} rejected, ${failCount} failed`);
      }

      // Clear selection
      setSelectedIds([]);
      
      // Refresh queue
      await loadReviewQueue(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Bulk reject failed';
      toast.error(message);
    } finally {
      setIsBulkProcessing(false);
    }
  };
  
  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full" />
              <p className="text-sm text-muted-foreground">Loading review queue...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  // Error state
  if (error) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <div className="flex flex-col items-center justify-center py-16">
            <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2 text-gray-900">Error Loading Queue</h2>
            <p className="text-muted-foreground mb-4 text-center max-w-md">{error}</p>
            <Button onClick={() => loadReviewQueue()}>
              Try Again
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  // Empty state
  if (reviewQueue.length === 0) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <ReviewQueueEmptyState />
        </div>
      </DashboardLayout>
    );
  }
  
  // Main view with table
  const tierColors = {
    template: 'bg-purple-100 text-purple-700',
    scenario: 'bg-blue-100 text-blue-700',
    edge_case: 'bg-orange-100 text-orange-700',
  };
  
  return (
    <DashboardLayout>
      <div className="p-8 space-y-6">
        <ReviewQueueHeader 
          statistics={statistics} 
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />

        {/* Bulk Actions Bar */}
        {selectedIds.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckSquare className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">
                  {selectedIds.length} conversation{selectedIds.length > 1 ? 's' : ''} selected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleBulkApprove}
                  disabled={isBulkProcessing}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isBulkProcessing ? 'Processing...' : `Approve ${selectedIds.length}`}
                </Button>
                <Button
                  onClick={handleBulkReject}
                  disabled={isBulkProcessing}
                  variant="destructive"
                >
                  {isBulkProcessing ? 'Processing...' : `Reject ${selectedIds.length}`}
                </Button>
                <Button
                  onClick={() => setSelectedIds([])}
                  disabled={isBulkProcessing}
                  variant="outline"
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </div>
        )}
        
        <div className="border rounded-lg bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all conversations"
                    className={cn(isSomeSelected && "data-[state=checked]:bg-blue-600")}
                  />
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('id')}
                >
                  <div className="flex items-center gap-2">
                    ID
                    {getSortIcon('id')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('title')}
                >
                  <div className="flex items-center gap-2">
                    Title
                    {getSortIcon('title')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('tier')}
                >
                  <div className="flex items-center gap-2">
                    Tier
                    {getSortIcon('tier')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('qualityScore')}
                >
                  <div className="flex items-center gap-2">
                    Quality
                    {getSortIcon('qualityScore')}
                  </div>
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleSort('createdAt')}
                >
                  <div className="flex items-center gap-2">
                    Created
                    {getSortIcon('createdAt')}
                  </div>
                </TableHead>
                <TableHead>Priority</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedQueue.map((conversation) => (
                <TableRow 
                  key={conversation.id}
                  className={cn(
                    "transition-colors",
                    selectedIds.includes(conversation.id) ? "bg-blue-50" : "hover:bg-gray-50"
                  )}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedIds.includes(conversation.id)}
                      onCheckedChange={() => handleSelectOne(conversation.id)}
                      aria-label={`Select conversation ${conversation.id}`}
                    />
                  </TableCell>
                  <TableCell 
                    className="text-gray-500 text-sm font-mono cursor-pointer"
                    onClick={() => handleRowClick(conversation)}
                  >
                    {conversation.id.split('-')[1] || conversation.id.substring(0, 8)}
                  </TableCell>
                  <TableCell 
                    className="cursor-pointer"
                    onClick={() => handleRowClick(conversation)}
                  >
                    <div className="max-w-md truncate font-medium" title={conversation.title}>
                      {conversation.title}
                    </div>
                  </TableCell>
                  <TableCell 
                    className="cursor-pointer"
                    onClick={() => handleRowClick(conversation)}
                  >
                    <Badge className={tierColors[conversation.tier]}>
                      {conversation.tier === 'edge_case' ? 'Edge Case' : 
                       conversation.tier.charAt(0).toUpperCase() + conversation.tier.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell 
                    className="cursor-pointer"
                    onClick={() => handleRowClick(conversation)}
                  >
                    <QualityScoreBadge score={conversation.qualityScore} />
                  </TableCell>
                  <TableCell 
                    className="text-sm text-gray-600 cursor-pointer"
                    onClick={() => handleRowClick(conversation)}
                  >
                    {new Date(conversation.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell 
                    className="cursor-pointer"
                    onClick={() => handleRowClick(conversation)}
                  >
                    <PriorityBadge conversation={conversation} />
                  </TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <Button 
                      size="sm"
                      onClick={() => openReviewModal(conversation.id)}
                    >
                      Review
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Review Modal */}
        {selectedConversationId && (
          <ConversationReviewModal
            conversationId={selectedConversationId}
            open={isReviewModalOpen}
            onOpenChange={setIsReviewModalOpen}
            onNavigateNext={handleNavigateNext}
            onNavigatePrevious={handleNavigatePrevious}
            hasNext={hasNext}
            hasPrevious={hasPrevious}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
