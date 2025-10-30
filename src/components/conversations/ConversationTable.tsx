/**
 * Conversation Table Component
 * 
 * Displays conversations in a sortable table with selection and inline actions
 */

'use client';

import { useState } from 'react';
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import {
  MoreVertical,
  Eye,
  ThumbsUp,
  ThumbsDown,
  Trash2,
  Download,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { Conversation } from '@/lib/types/conversations';
import { ConversationPreviewModal } from './ConversationPreviewModal';
import { 
  getTierVariant, 
  getStatusVariant, 
  formatDate,
  getQualityColor 
} from '@/lib/utils/query-params';
import { toast } from 'sonner';

interface ConversationTableProps {
  conversations: Conversation[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

type SortKey = keyof Conversation;
type SortDirection = 'asc' | 'desc';

interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

export function ConversationTable({
  conversations,
  selectedIds,
  onSelectionChange,
  onRefresh,
  isLoading = false,
}: ConversationTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: 'createdAt',
    direction: 'desc',
  });
  const [previewConversationId, setPreviewConversationId] = useState<string | null>(null);

  // Handle selection
  const handleSelectAll = () => {
    if (selectedIds.length === conversations.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(conversations.map((c) => c.id));
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((sid) => sid !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  // Handle sorting
  const handleSort = (key: SortKey) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const getSortIcon = (key: SortKey) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="h-4 w-4 ml-1 opacity-40" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ArrowUp className="h-4 w-4 ml-1" />
    ) : (
      <ArrowDown className="h-4 w-4 ml-1" />
    );
  };

  // Sort conversations
  const sortedConversations = [...conversations].sort((a, b) => {
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue === undefined || aValue === null) return 1;
    if (bValue === undefined || bValue === null) return -1;

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortConfig.direction === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
    }

    return 0;
  });

  // Inline actions
  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`/api/conversations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      });

      if (!response.ok) throw new Error('Failed to approve');

      toast.success('Conversation approved');
      onRefresh();
    } catch (error) {
      console.error('Error approving conversation:', error);
      toast.error('Failed to approve conversation');
    }
  };

  const handleReject = async (id: string) => {
    try {
      const response = await fetch(`/api/conversations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected' }),
      });

      if (!response.ok) throw new Error('Failed to reject');

      toast.success('Conversation rejected');
      onRefresh();
    } catch (error) {
      console.error('Error rejecting conversation:', error);
      toast.error('Failed to reject conversation');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this conversation? This cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/conversations/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');

      toast.success('Conversation deleted');
      onRefresh();
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast.error('Failed to delete conversation');
    }
  };

  const handleExportSingle = async (id: string) => {
    try {
      const response = await fetch(`/api/conversations/${id}?includeTurns=true`);
      if (!response.ok) throw new Error('Failed to export');

      const conversation = await response.json();
      const blob = new Blob([JSON.stringify(conversation, null, 2)], {
        type: 'application/json',
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `conversation-${id}.json`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success('Conversation exported');
    } catch (error) {
      console.error('Error exporting conversation:', error);
      toast.error('Failed to export conversation');
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Skeleton className="h-4 w-4" />
              </TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Persona</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Quality</TableHead>
              <TableHead>Turns</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-8 w-8" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  // Empty state
  if (conversations.length === 0) {
    return (
      <div className="rounded-md border">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-lg text-muted-foreground mb-2">No conversations found</p>
          <p className="text-sm text-muted-foreground mb-4">
            Try adjusting your filters or create new conversations
          </p>
          <Button>Generate Conversations</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    conversations.length > 0 && selectedIds.length === conversations.length
                  }
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('title')}
                  className="h-8 p-0 hover:bg-transparent"
                >
                  Title
                  {getSortIcon('title')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('persona')}
                  className="h-8 p-0 hover:bg-transparent"
                >
                  Persona
                  {getSortIcon('persona')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('tier')}
                  className="h-8 p-0 hover:bg-transparent"
                >
                  Tier
                  {getSortIcon('tier')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('status')}
                  className="h-8 p-0 hover:bg-transparent"
                >
                  Status
                  {getSortIcon('status')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('qualityScore')}
                  className="h-8 p-0 hover:bg-transparent"
                >
                  Quality
                  {getSortIcon('qualityScore')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('turnCount')}
                  className="h-8 p-0 hover:bg-transparent"
                >
                  Turns
                  {getSortIcon('turnCount')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort('createdAt')}
                  className="h-8 p-0 hover:bg-transparent"
                >
                  Created
                  {getSortIcon('createdAt')}
                </Button>
              </TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedConversations.map((conversation) => (
              <TableRow key={conversation.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedIds.includes(conversation.id)}
                    onCheckedChange={() => handleSelectOne(conversation.id)}
                    aria-label={`Select ${conversation.title || 'conversation'}`}
                  />
                </TableCell>
                <TableCell className="font-medium max-w-xs truncate">
                  {conversation.title || 'Untitled'}
                </TableCell>
                <TableCell className="max-w-xs truncate">
                  {conversation.persona}
                </TableCell>
                <TableCell>
                  <Badge variant={getTierVariant(conversation.tier)}>
                    {conversation.tier}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(conversation.status)}>
                    {conversation.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {conversation.qualityScore ? (
                    <Badge
                      variant="outline"
                      className={`text-${getQualityColor(conversation.qualityScore)}-600 border-${getQualityColor(conversation.qualityScore)}-600`}
                    >
                      {conversation.qualityScore.toFixed(1)}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>{conversation.turnCount}</TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {formatDate(conversation.createdAt)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => setPreviewConversationId(conversation.id)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Preview
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleApprove(conversation.id)}>
                        <ThumbsUp className="mr-2 h-4 w-4" />
                        Approve
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleReject(conversation.id)}>
                        <ThumbsDown className="mr-2 h-4 w-4" />
                        Reject
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleExportSingle(conversation.id)}>
                        <Download className="mr-2 h-4 w-4" />
                        Export
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(conversation.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Preview Modal */}
      {previewConversationId && (
        <ConversationPreviewModal
          conversationId={previewConversationId}
          onClose={() => setPreviewConversationId(null)}
          onApprove={() => {
            handleApprove(previewConversationId);
            setPreviewConversationId(null);
          }}
          onReject={() => {
            handleReject(previewConversationId);
            setPreviewConversationId(null);
          }}
        />
      )}
    </>
  );
}

