'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import type { StorageConversation } from '@/lib/types/conversations';

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<StorageConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
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
  const [viewingConversation, setViewingConversation] = useState<StorageConversation | null>(null);

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

  async function updateStatus(conversationId: string, status: string) {
    try {
      await fetch(`/api/conversations/${conversationId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      loadConversations();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  }

  function toggleSelection(id: string) {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }

  function toggleSelectAll() {
    if (selectedIds.length === conversations.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(conversations.map(c => c.id));
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Conversations</h1>
        <p className="text-muted-foreground">Manage generated training conversations</p>
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

        {selectedIds.length > 0 && (
          <Button variant="outline">
            Export Selected ({selectedIds.length})
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox 
                  checked={selectedIds.length === conversations.length && conversations.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>Conversation</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead>Quality</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Turns</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : conversations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  No conversations found
                </TableCell>
              </TableRow>
            ) : (
              conversations.map(conversation => (
                <TableRow key={conversation.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(conversation.id)}
                      onCheckedChange={() => toggleSelection(conversation.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{conversation.conversation_name || 'Untitled'}</div>
                    <div className="text-sm text-muted-foreground">{conversation.conversation_id}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{conversation.tier}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{conversation.quality_score?.toFixed(1) || 'N/A'}</span>
                      <span className="text-xs text-muted-foreground">/10.0</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        conversation.status === 'approved' ? 'default' :
                        conversation.status === 'rejected' ? 'destructive' :
                        'secondary'
                      }
                    >
                      {conversation.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>{conversation.turn_count}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(conversation.created_at).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setViewingConversation(conversation)}
                      >
                        View
                      </Button>
                      {conversation.status === 'pending_review' && (
                        <>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => updateStatus(conversation.conversation_id, 'approved')}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateStatus(conversation.conversation_id, 'rejected')}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

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

      {/* View Conversation Dialog */}
      {viewingConversation && (
        <Dialog open={!!viewingConversation} onOpenChange={() => setViewingConversation(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{viewingConversation.conversation_name || 'Conversation Details'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">ID:</span> {viewingConversation.conversation_id}
                </div>
                <div>
                  <span className="font-medium">Tier:</span> {viewingConversation.tier}
                </div>
                <div>
                  <span className="font-medium">Quality Score:</span> {viewingConversation.quality_score?.toFixed(1) || 'N/A'}/10.0
                </div>
                <div>
                  <span className="font-medium">Turn Count:</span> {viewingConversation.turn_count}
                </div>
                <div>
                  <span className="font-medium">Starting Emotion:</span> {viewingConversation.starting_emotion || 'N/A'}
                </div>
                <div>
                  <span className="font-medium">Ending Emotion:</span> {viewingConversation.ending_emotion || 'N/A'}
                </div>
                <div>
                  <span className="font-medium">Persona:</span> {viewingConversation.persona_key || 'N/A'}
                </div>
                <div>
                  <span className="font-medium">Status:</span> {viewingConversation.status}
                </div>
                <div>
                  <span className="font-medium">Processing Status:</span> {viewingConversation.processing_status}
                </div>
                <div>
                  <span className="font-medium">Created:</span> {new Date(viewingConversation.created_at).toLocaleString()}
                </div>
                {viewingConversation.reviewed_by && (
                  <>
                    <div>
                      <span className="font-medium">Reviewed By:</span> {viewingConversation.reviewed_by}
                    </div>
                    <div>
                      <span className="font-medium">Reviewed At:</span> {viewingConversation.reviewed_at ? new Date(viewingConversation.reviewed_at).toLocaleString() : 'N/A'}
                    </div>
                  </>
                )}
              </div>

              {viewingConversation.review_notes && (
                <div>
                  <span className="font-medium">Review Notes:</span>
                  <p className="mt-1 text-sm text-muted-foreground">{viewingConversation.review_notes}</p>
                </div>
              )}

              {viewingConversation.description && (
                <div>
                  <span className="font-medium">Description:</span>
                  <p className="mt-1 text-sm text-muted-foreground">{viewingConversation.description}</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => viewingConversation.file_url && window.open(viewingConversation.file_url, '_blank')}
                  disabled={!viewingConversation.file_url}
                >
                  Download JSON File
                </Button>
                {viewingConversation.status === 'pending_review' && (
                  <>
                    <Button
                      variant="default"
                      onClick={() => {
                        updateStatus(viewingConversation.conversation_id, 'approved');
                        setViewingConversation(null);
                      }}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        updateStatus(viewingConversation.conversation_id, 'rejected');
                        setViewingConversation(null);
                      }}
                    >
                      Reject
                    </Button>
                  </>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
