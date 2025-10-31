import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '../ui/dropdown-menu';
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
  Play,
  Info,
  RefreshCw
} from 'lucide-react';
import { Conversation } from '../../lib/types';
import { useAppStore } from '../../stores/useAppStore';
import { cn } from '../../lib/utils';
import { toast } from 'sonner@2.0.3';
import { QualityDetailsModal, QualityScore } from './QualityDetailsModal';
import { SingleGenerationForm } from '../generation/SingleGenerationForm';

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

interface ConversationTableProps {
  conversations: Conversation[];
  onViewConversation?: (id: string) => void;
}

export function ConversationTable({ conversations, onViewConversation }: ConversationTableProps) {
  const { 
    selectedConversationIds, 
    toggleConversationSelection,
    selectAllConversations,
    clearSelection,
    showConfirm,
    updateConversation,
    deleteConversation
  } = useAppStore();
  
  const [sortColumn, setSortColumn] = useState<keyof Conversation>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [qualityModalOpen, setQualityModalOpen] = useState(false);
  const [selectedQualityScore, setSelectedQualityScore] = useState<QualityScore | null>(null);
  const [selectedConversationTitle, setSelectedConversationTitle] = useState<string>('');
  const [regenerateConversationId, setRegenerateConversationId] = useState<string | null>(null);
  
  // Sorting logic
  const sortedConversations = useMemo(() => {
    return [...conversations].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [conversations, sortColumn, sortDirection]);
  
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
  
  const handleDelete = (id: string, title: string) => {
    showConfirm({
      title: 'Confirm Deletion',
      message: `You are about to delete "${title}". This cannot be undone.`,
      onConfirm: () => {
        deleteConversation(id);
        toast.success('Conversation deleted successfully');
      },
    });
  };
  
  const handleDuplicate = (conversation: Conversation) => {
    const newConversation: Conversation = {
      ...conversation,
      id: `conv-${Date.now()}`,
      title: `${conversation.title} (Copy)`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // In a real app, this would call an API
    toast.success('Conversation duplicated successfully');
  };
  
  const handleMoveToReview = (id: string) => {
    updateConversation(id, { status: 'pending_review' });
    toast.success('Moved to review queue');
  };

  const handleRegenerateClick = (id: string) => {
    setRegenerateConversationId(id);
  };

  const handleRegenerateClose = () => {
    setRegenerateConversationId(null);
  };
  
  const getQualityScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getQualityBadgeColor = (score: number) => {
    if (score >= 8) return 'bg-green-100 text-green-700 hover:bg-green-200';
    if (score >= 6) return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200';
    return 'bg-red-100 text-red-700 hover:bg-red-200';
  };

  const handleQualityClick = (conversation: Conversation) => {
    if (conversation.qualityMetrics) {
      // Convert qualityMetrics to QualityScore format
      const qualityScore: QualityScore = {
        overall: conversation.qualityScore || 0,
        breakdown: {
          turnCount: {
            score: 8,
            weight: 0.30,
            actual: conversation.totalTurns || 0,
            target: '8-16 (optimal)',
            status: 'optimal',
            message: 'Turn count is within optimal range',
          },
          length: {
            score: 8,
            weight: 0.25,
            actual: conversation.totalTokens || 0,
            target: '100-400 chars/turn (optimal)',
            avgTurnLength: 200,
            status: 'optimal',
            message: 'Turn length is within optimal range',
          },
          structure: {
            score: 8,
            weight: 0.25,
            valid: true,
            issues: [],
            status: 'valid',
            message: 'Conversation structure is valid',
          },
          confidence: {
            score: conversation.qualityMetrics.confidence === 'high' ? 8 : conversation.qualityMetrics.confidence === 'medium' ? 6 : 4,
            weight: 0.20,
            level: conversation.qualityMetrics.confidence,
            factors: [],
            message: `Confidence level is ${conversation.qualityMetrics.confidence}`,
          },
        },
        recommendations: [],
        autoFlagged: (conversation.qualityScore || 0) < 6,
        calculatedAt: conversation.updatedAt,
      };

      setSelectedQualityScore(qualityScore);
      setSelectedConversationTitle(conversation.title);
      setQualityModalOpen(true);
    } else {
      toast.info('Quality score not available for this conversation');
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };
  
  return (
    <div className="border rounded-lg bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox 
                checked={allSelected}
                indeterminate={someSelected}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort('id')}>
              <div className="flex items-center gap-2">
                ID
                {getSortIcon('id')}
              </div>
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort('title')}>
              <div className="flex items-center gap-2">
                Title
                {getSortIcon('title')}
              </div>
            </TableHead>
            <TableHead>Persona</TableHead>
            <TableHead>Emotion</TableHead>
            <TableHead>Tier</TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort('createdAt')}>
              <div className="flex items-center gap-2">
                Created
                {getSortIcon('createdAt')}
              </div>
            </TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort('qualityScore')}>
              <div className="flex items-center gap-2">
                Quality
                {getSortIcon('qualityScore')}
              </div>
            </TableHead>
            <TableHead className="w-32">Generate</TableHead>
            <TableHead className="w-12">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedConversations.length === 0 ? (
            <TableRow>
              <TableCell colSpan={11} className="h-24 text-center text-gray-500">
                No conversations found
              </TableCell>
            </TableRow>
          ) : (
            sortedConversations.map((conversation) => (
              <TableRow 
                key={conversation.id}
                className={cn(
                  "cursor-pointer hover:bg-gray-50",
                  selectedConversationIds.includes(conversation.id) && "bg-blue-50"
                )}
                onClick={(e) => {
                  if ((e.target as HTMLElement).closest('button, input')) return;
                  onViewConversation?.(conversation.id);
                }}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedConversationIds.includes(conversation.id)}
                    onCheckedChange={() => toggleConversationSelection(conversation.id)}
                  />
                </TableCell>
                <TableCell className="text-gray-500 text-sm">
                  {conversation.id.split('-')[1]}
                </TableCell>
                <TableCell>
                  <div className="max-w-md truncate" title={conversation.title}>
                    {conversation.title}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="max-w-xs truncate text-sm" title={conversation.persona}>
                    {conversation.persona}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="max-w-xs truncate text-sm" title={conversation.emotion}>
                    {conversation.emotion}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={tierColors[conversation.tier]}>
                    {conversation.tier === 'edge_case' ? 'Edge Case' : conversation.tier.charAt(0).toUpperCase() + conversation.tier.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-600" title={new Date(conversation.createdAt).toLocaleString()}>
                    {formatDate(conversation.createdAt)}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge className={statusColors[conversation.status]}>
                    {conversation.status === 'none' ? 'None' : conversation.status === 'failed' ? 'Failed' : conversation.status.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  {conversation.qualityScore !== undefined && conversation.qualityScore > 0 ? (
                    <button
                      onClick={() => handleQualityClick(conversation)}
                      className={cn(
                        'px-3 py-1 rounded-md font-semibold text-sm transition-colors flex items-center gap-1.5',
                        getQualityBadgeColor(conversation.qualityScore)
                      )}
                    >
                      {conversation.qualityScore.toFixed(1)}
                      <Info className="h-3 w-3" />
                    </button>
                  ) : (
                    <span className="text-gray-400 text-sm">N/A</span>
                  )}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="gap-2"
                    onClick={() => toast.info('Generate functionality coming soon')}
                  >
                    <Play className="h-3 w-3" />
                    Generate
                  </Button>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onViewConversation?.(conversation.id)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toast.info('Edit functionality coming soon')}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(conversation)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleRegenerateClick(conversation.id)}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Regenerate
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
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        onClick={() => handleDelete(conversation.id, conversation.title)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <QualityDetailsModal
        open={qualityModalOpen}
        onOpenChange={setQualityModalOpen}
        qualityScore={selectedQualityScore}
        conversationTitle={selectedConversationTitle}
      />

      {regenerateConversationId && (
        <SingleGenerationForm
          conversationId={regenerateConversationId}
          onClose={handleRegenerateClose}
        />
      )}
    </div>
  );
}
