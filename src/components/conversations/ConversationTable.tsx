'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  MoreVertical, 
  Eye, 
  Edit, 
  Copy, 
  Download, 
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Check,
  X
} from 'lucide-react';
import { Conversation, StorageConversation } from '@/lib/types/conversations';
import { useUpdateConversation, useDeleteConversation } from '@/hooks/use-conversations';
import { useConversationStore } from '@/stores/conversation-store';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { TableSkeleton } from '@/components/ui/skeletons';
import { useTableKeyboardNavigation } from './useTableKeyboardNavigation';
import { ConversationActions } from './conversation-actions';

// Type that includes both legacy and storage fields for compatibility
type ConversationWithEnrichment = Conversation & Partial<Pick<StorageConversation, 'enrichment_status' | 'raw_response_path' | 'enriched_file_path'>>;

const statusColors = {
  draft: 'bg-gray-100 text-gray-700',
  generated: 'bg-blue-100 text-blue-700',
  pending_review: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  needs_revision: 'bg-orange-100 text-orange-700',
  none: 'bg-gray-100 text-gray-700',
  failed: 'bg-red-100 text-red-700',
};

const tierColors = {
  template: 'bg-purple-100 text-purple-700',
  scenario: 'bg-blue-100 text-blue-700',
  edge_case: 'bg-orange-100 text-orange-700',
};

const enrichmentStatusColors = {
  not_started: 'bg-gray-100 text-gray-700',
  validation_failed: 'bg-red-100 text-red-700',
  validated: 'bg-blue-100 text-blue-700',
  enrichment_in_progress: 'bg-yellow-100 text-yellow-700',
  enriched: 'bg-green-100 text-green-700',
  normalization_failed: 'bg-orange-100 text-orange-700',
  completed: 'bg-green-100 text-green-700',
};

interface ConversationTableProps {
  conversations: ConversationWithEnrichment[];
  isLoading: boolean;
  compactActions?: boolean; // If true, show actions in dropdown; if false, show full buttons
}

export const ConversationTable = React.memo(function ConversationTable({ conversations, isLoading, compactActions = true }: ConversationTableProps) {
  const { 
    selectedConversationIds, 
    toggleConversationSelection,
    selectAllConversations,
    clearSelection,
    showConfirm,
    openConversationDetail
  } = useConversationStore();
  
  const [sortColumn, setSortColumn] = useState<keyof Conversation>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  const updateMutation = useUpdateConversation();
  const deleteMutation = useDeleteConversation();
  
  // Memoized sorting logic for performance
  const sortedConversations = useMemo(() => {
    return [...conversations].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];
      
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return sortDirection === 'asc' ? -1 : 1;
      if (bVal == null) return sortDirection === 'asc' ? 1 : -1;
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [conversations, sortColumn, sortDirection]);
  
  // Add keyboard navigation
  const { focusedRowIndex } = useTableKeyboardNavigation(sortedConversations);
  
  const handleSort = (column: keyof Conversation) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };
  
  const getSortIcon = (column: keyof Conversation) => {
    if (sortColumn !== column) return <ArrowUpDown className="h-4 w-4" />;
    return sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };
  
  const allSelected = conversations.length > 0 && conversations.every(c => selectedConversationIds.includes(c.id));
  const someSelected = selectedConversationIds.length > 0 && !allSelected;
  
  const handleSelectAll = () => {
    if (allSelected) {
      clearSelection();
    } else {
      selectAllConversations(conversations.map(c => c.id));
    }
  };
  
  // Memoized action handlers for performance
  const handleApprove = useCallback(async (id: string) => {
    const toastId = toast.loading('Approving conversation...');
    try {
      await updateMutation.mutateAsync({ 
        id, 
        updates: { status: 'approved' } 
      });
      toast.success('Conversation approved', { id: toastId });
    } catch (error: any) {
      toast.error('Failed to approve conversation', {
        id: toastId,
        description: error?.message || 'An error occurred',
        action: {
          label: 'Retry',
          onClick: () => handleApprove(id)
        }
      });
    }
  }, [updateMutation]);
  
  const handleReject = useCallback(async (id: string) => {
    const toastId = toast.loading('Rejecting conversation...');
    try {
      await updateMutation.mutateAsync({ 
        id, 
        updates: { status: 'rejected' } 
      });
      toast.success('Conversation rejected', { id: toastId });
    } catch (error: any) {
      toast.error('Failed to reject conversation', {
        id: toastId,
        description: error?.message || 'An error occurred'
      });
    }
  }, [updateMutation]);
  
  const handleDelete = useCallback((id: string, title?: string) => {
    showConfirm(
      'Delete Conversation',
      `Are you sure you want to delete ${title ? `"${title}"` : 'this conversation'}? This action cannot be undone.`,
      async () => {
        const toastId = toast.loading('Deleting conversation...');
        try {
          await deleteMutation.mutateAsync(id);
          toast.success('Conversation deleted successfully', { id: toastId });
        } catch (error: any) {
          toast.error('Failed to delete conversation', {
            id: toastId,
            description: error?.message || 'An error occurred'
          });
        }
      }
    );
  }, [showConfirm, deleteMutation]);
  
  const handleDuplicate = useCallback((conversation: Conversation) => {
    // In a real app, this would call an API
    toast.info('Duplicate functionality coming soon');
  }, []);
  
  const handleMoveToReview = useCallback(async (id: string) => {
    const toastId = toast.loading('Moving to review queue...');
    try {
      await updateMutation.mutateAsync({ 
        id, 
        updates: { status: 'pending_review' } 
      });
      toast.success('Moved to review queue', { id: toastId });
    } catch (error: any) {
      toast.error('Failed to move conversation', {
        id: toastId,
        description: error?.message || 'An error occurred'
      });
    }
  }, [updateMutation]);
  
  const getQualityScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 font-semibold';
    if (score >= 6) return 'text-yellow-600 font-semibold';
    return 'text-red-600 font-semibold';
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  const getEnrichmentVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'completed':
      case 'enriched':
        return 'default';
      case 'validation_failed':
      case 'normalization_failed':
        return 'destructive';
      case 'enrichment_in_progress':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const formatEnrichmentStatus = (status: string): string => {
    if (!status || status === 'not_started') return 'Pending';
    return status
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };
  
  // Loading skeleton
  if (isLoading) {
    return <TableSkeleton rows={10} />;
  }
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox 
                checked={someSelected ? 'indeterminate' : allSelected}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort('title')}>
              <div className="flex items-center gap-2">
                Conversation
                {getSortIcon('title')}
              </div>
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort('tier')}>
              <div className="flex items-center gap-2">
                Tier
                {getSortIcon('tier')}
              </div>
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort('status')}>
              <div className="flex items-center gap-2">
                Status
                {getSortIcon('status')}
              </div>
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort('qualityScore')}>
              <div className="flex items-center gap-2">
                Quality
                {getSortIcon('qualityScore')}
              </div>
            </TableHead>
            <TableHead>Turns</TableHead>
            <TableHead>Enrichment</TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort('createdAt')}>
              <div className="flex items-center gap-2">
                Created
                {getSortIcon('createdAt')}
              </div>
            </TableHead>
            <TableHead className="w-12">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedConversations.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                No conversations found
              </TableCell>
            </TableRow>
          ) : (
            sortedConversations.map((conversation, index) => (
              <TableRow 
                key={conversation.id}
                data-row-index={index}
                tabIndex={0}
                className={cn(
                  "cursor-pointer hover:bg-muted/50 outline-none",
                  selectedConversationIds.includes(conversation.id) && "bg-muted",
                  focusedRowIndex === index && "ring-2 ring-primary ring-inset"
                )}
                onClick={() => openConversationDetail(conversation.id)}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedConversationIds.includes(conversation.id)}
                    onCheckedChange={() => toggleConversationSelection(conversation.id)}
                  />
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">
                      {conversation.title || 'Untitled Conversation'}
                    </div>
                    <div className="text-xs text-muted-foreground font-mono mt-0.5">
                      {conversation.conversationId}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={tierColors[conversation.tier]}>
                    {conversation.tier === 'edge_case' ? 'Edge Case' : conversation.tier.charAt(0).toUpperCase() + conversation.tier.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={statusColors[conversation.status]}>
                    {conversation.status.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  {conversation.qualityScore !== undefined && conversation.qualityScore > 0 ? (
                    <span className={getQualityScoreColor(conversation.qualityScore)}>
                      {conversation.qualityScore.toFixed(1)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-sm">N/A</span>
                  )}
                </TableCell>
                <TableCell>{conversation.turnCount}</TableCell>
                <TableCell>
                  <Badge 
                    className={enrichmentStatusColors[conversation.enrichment_status || 'not_started']}
                    variant={getEnrichmentVariant(conversation.enrichment_status || 'not_started')}
                  >
                    {formatEnrichmentStatus(conversation.enrichment_status || 'not_started')}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(conversation.createdAt)}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <div className="flex flex-wrap items-center gap-2 justify-end">
                    <ConversationActions
                      conversationId={conversation.conversationId}
                      enrichmentStatus={conversation.enrichment_status || 'not_started'}
                      hasRawResponse={!!conversation.raw_response_path}
                      compact={compactActions}
                    />
                    <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openConversationDetail(conversation.id)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleApprove(conversation.id)}>
                        <Check className="h-4 w-4 mr-2" />
                        Approve
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleReject(conversation.id)}>
                        <X className="h-4 w-4 mr-2" />
                        Reject
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast.info('Edit functionality coming soon')}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(conversation)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      {conversation.status !== 'pending_review' && (
                        <DropdownMenuItem onClick={() => handleMoveToReview(conversation.id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Move to Review
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => toast.info('Export functionality coming soon')}>
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(conversation.id, conversation.title)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
});
