import { useMemo, useState } from 'react';
import { ConversationTable } from './ConversationTable';
import { FilterBar } from './FilterBar';
import { FeedbackWidget } from './FeedbackWidget';
import { useAppStore } from '../../stores/useAppStore';
import { Card } from '../ui/card';
import { ArrowUpRight, ArrowDownRight, FileText, GitBranch, AlertTriangle, CheckCircle } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { Button } from '../ui/button';
import { Pagination } from './Pagination';

export function DashboardView() {
  const { 
    conversations, 
    filters, 
    searchQuery,
    openGenerationModal 
  } = useAppStore();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  
  // Filter conversations based on active filters and search
  const filteredConversations = useMemo(() => {
    let result = [...conversations];
    
    // Search filter
    if (searchQuery) {
      result = result.filter(c => 
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category.some(cat => cat.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Tier filter
    if (filters.tier && filters.tier.length > 0) {
      result = result.filter(c => filters.tier!.includes(c.tier));
    }
    
    // Status filter
    if (filters.status && filters.status.length > 0) {
      result = result.filter(c => filters.status!.includes(c.status));
    }
    
    // Quality score filter
    if (filters.qualityScoreMin !== undefined) {
      result = result.filter(c => c.qualityScore >= filters.qualityScoreMin!);
    }
    
    return result;
  }, [conversations, filters, searchQuery]);
  
  // Pagination
  const totalPages = Math.ceil(filteredConversations.length / rowsPerPage);
  const paginatedConversations = filteredConversations.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );
  
  // Stats calculations
  const totalConversations = conversations.length;
  const approvedConversations = conversations.filter(c => c.status === 'approved').length;
  const approvalRate = totalConversations > 0 
    ? Math.round((approvedConversations / totalConversations) * 100) 
    : 0;
  const avgQualityScore = totalConversations > 0
    ? conversations.reduce((sum, c) => sum + c.qualityScore, 0) / totalConversations
    : 0;
  const pendingReview = conversations.filter(c => c.status === 'pending_review').length;
  
  // Empty state
  if (conversations.length === 0) {
    return (
      <div className="p-8">
        <div className="max-w-2xl mx-auto text-center py-12">
          <div className="mb-6">
            <FileText className="h-24 w-24 mx-auto text-gray-300" />
          </div>
          <h2 className="text-2xl mb-2">No Conversations Yet</h2>
          <p className="text-gray-600 mb-6">
            Get started by generating your first training conversation
          </p>
          <Button onClick={openGenerationModal} size="lg">
            Generate Conversation
          </Button>
          <div className="mt-8">
            <Button variant="link">Learn How</Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-8 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl mb-2">Training Data Generator</h1>
        <p className="text-gray-600">
          Manage and review your training conversation data
        </p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Conversations</p>
              <p className="text-3xl mt-1">{totalConversations}</p>
              <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
                <ArrowUpRight className="h-3 w-3" />
                <span>+12 this week</span>
              </div>
            </div>
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Approval Rate</p>
              <p className="text-3xl mt-1">{approvalRate}%</p>
              <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
                <ArrowUpRight className="h-3 w-3" />
                <span>+3% from last month</span>
              </div>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Quality Score</p>
              <p className="text-3xl mt-1">{avgQualityScore.toFixed(1)}</p>
              <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
                <ArrowUpRight className="h-3 w-3" />
                <span>+0.4 improvement</span>
              </div>
            </div>
            <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-700">
              ★
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Review</p>
              <p className="text-3xl mt-1">{pendingReview}</p>
              <div className="flex items-center gap-1 mt-2 text-xs text-gray-600">
                <span>Awaiting review</span>
              </div>
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
          </div>
        </Card>
      </div>
      
      {/* Quality Feedback Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <FeedbackWidget />
        </div>
      </div>
      
      {/* Filter Bar */}
      <FilterBar />
      
      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {paginatedConversations.length} of {filteredConversations.length} conversations
          {filteredConversations.length !== totalConversations && ` (filtered from ${totalConversations} total)`}
        </p>
        
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Rows per page:</label>
          <select 
            value={rowsPerPage} 
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>
      
      {/* Conversation Table */}
      <ConversationTable conversations={paginatedConversations} />
      
      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
}
