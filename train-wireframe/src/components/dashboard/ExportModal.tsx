import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription } from '../ui/alert';
import { useAppStore } from '../../stores/useAppStore';
import { Download, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ExportScopeSelector, ExportScope } from '../export/ExportScopeSelector';
import { ExportFormatSelector, ExportFormat } from '../export/ExportFormatSelector';
import { ExportOptionsPanel, ExportOptions } from '../export/ExportOptionsPanel';
import { ExportPreview } from '../export/ExportPreview';
import { Conversation, ConversationStatus } from '../../lib/types';

export function ExportModal() {
  const { 
    showExportModal, 
    closeExportModal,
    selectedConversationIds,
    conversations,
    filters
  } = useAppStore();
  
  // Export configuration state
  const [scope, setScope] = useState<ExportScope>('all');
  const [format, setFormat] = useState<ExportFormat>('jsonl');
  const [options, setOptions] = useState<ExportOptions>({
    includeMetadata: true,
    includeQualityScores: true,
    includeTimestamps: true,
    includeApprovalHistory: false,
    includeParentReferences: false,
    includeFullContent: true,
  });
  
  // Loading state
  const [isExporting, setIsExporting] = useState(false);
  
  // Calculate filtered conversations based on current filters
  const filteredConversations = useMemo(() => {
    if (!filters || Object.keys(filters).length === 0) {
      return conversations;
    }
    
    return conversations.filter((conv) => {
      // Tier filter
      if (filters.tier && filters.tier.length > 0) {
        if (!filters.tier.includes(conv.tier)) return false;
      }
      
      // Status filter
      if (filters.status && filters.status.length > 0) {
        if (!filters.status.includes(conv.status)) return false;
      }
      
      // Quality score filter
      if (filters.qualityScoreMin !== undefined) {
        if (conv.qualityScore < filters.qualityScoreMin) return false;
      }
      if (filters.qualityScoreMax !== undefined) {
        if (conv.qualityScore > filters.qualityScoreMax) return false;
      }
      
      // Date filter
      if (filters.dateFrom) {
        if (new Date(conv.createdAt) < new Date(filters.dateFrom)) return false;
      }
      if (filters.dateTo) {
        if (new Date(conv.createdAt) > new Date(filters.dateTo)) return false;
      }
      
      // Category filter
      if (filters.categories && filters.categories.length > 0) {
        if (!conv.category.some((cat) => filters.categories!.includes(cat))) return false;
      }
      
      return true;
    });
  }, [conversations, filters]);
  
  // Calculate approved conversations
  const approvedConversations = useMemo(() => {
    return conversations.filter((conv) => conv.status === 'approved');
  }, [conversations]);
  
  // Calculate counts for scope selector
  const counts = useMemo(() => ({
    selected: selectedConversationIds.length,
    filtered: filteredConversations.length,
    approved: approvedConversations.length,
    all: conversations.length,
  }), [selectedConversationIds.length, filteredConversations.length, approvedConversations.length, conversations.length]);
  
  // Get conversations to export based on scope
  const conversationsToExport = useMemo(() => {
    switch (scope) {
      case 'selected':
        return conversations.filter((conv) => selectedConversationIds.includes(conv.id));
      case 'filtered':
        return filteredConversations;
      case 'approved':
        return approvedConversations;
      case 'all':
      default:
        return conversations;
    }
  }, [scope, conversations, selectedConversationIds, filteredConversations, approvedConversations]);
  
  // Handle export submission
  const handleExport = async () => {
    if (conversationsToExport.length === 0) {
      toast.error('No conversations to export');
      return;
    }
    
    setIsExporting(true);
    
    try {
      // Prepare export request
      const exportRequest: any = {
        config: {
          scope: scope === 'selected' ? 'selected' : scope === 'filtered' ? 'filtered' : 'all',
          format,
          includeMetadata: options.includeMetadata,
          includeQualityScores: options.includeQualityScores,
          includeTimestamps: options.includeTimestamps,
          includeApprovalHistory: options.includeApprovalHistory,
          includeParentReferences: options.includeParentReferences,
          includeFullContent: options.includeFullContent,
        },
      };
      
      // Add conversation IDs for selected scope
      if (scope === 'selected') {
        exportRequest.conversationIds = selectedConversationIds;
      }
      
      // Add filters for filtered scope
      if (scope === 'filtered' && filters && Object.keys(filters).length > 0) {
        exportRequest.filters = filters;
      }
      
      // Call export API
      const response = await fetch('/api/export/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(exportRequest),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Export failed');
      }
      
      const result = await response.json();
      
      // Handle response
      if (result.status === 'completed') {
        // Synchronous export - download immediately
        toast.success(
          `Successfully exported ${result.conversation_count} conversations`,
          {
            description: `Format: ${format.toUpperCase()} • Size: ${formatFileSize(result.file_size)}`,
            duration: 5000,
          }
        );
        
        // Trigger download
        if (result.file_url) {
          window.open(result.file_url, '_blank');
        }
        
        closeExportModal();
      } else if (result.status === 'queued') {
        // Background export - show notification
        toast.info(
          'Export queued for background processing',
          {
            description: `Processing ${result.conversation_count} conversations. You'll be notified when ready.`,
            duration: 5000,
          }
        );
        
        closeExportModal();
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error(
        'Failed to export conversations',
        {
          description: error instanceof Error ? error.message : 'Please try again',
        }
      );
    } finally {
      setIsExporting(false);
    }
  };
  
  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  
  return (
    <Dialog open={showExportModal} onOpenChange={closeExportModal}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Export Conversations</DialogTitle>
          <DialogDescription>
            Configure export settings and download your training data
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Export Scope Selector */}
          <ExportScopeSelector
            value={scope}
            onChange={setScope}
            counts={counts}
          />
          
          <Separator />
          
          {/* Export Format Selector */}
          <ExportFormatSelector
            value={format}
            onChange={setFormat}
          />
          
          <Separator />
          
          {/* Export Options Panel */}
          <ExportOptionsPanel
            config={options}
            onChange={setOptions}
          />
          
          <Separator />
          
          {/* Export Preview */}
          <ExportPreview
            conversations={conversationsToExport}
            format={format}
            options={options}
          />
          
          {/* Warning if no conversations */}
          {conversationsToExport.length === 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No conversations match your selection. Please adjust your filters or selection.
              </AlertDescription>
            </Alert>
          )}
          
          {/* Export Summary */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="text-sm space-y-1.5">
              <div className="font-semibold text-primary mb-2">Export Summary</div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-muted-foreground">Conversations:</span>{' '}
                  <span className="font-medium">{conversationsToExport.length.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Format:</span>{' '}
                  <span className="font-medium">{format.toUpperCase()}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Filename:</span>{' '}
                  <span className="font-medium text-xs">
                    conversations-export-{new Date().toISOString().split('T')[0]}.{format}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={closeExportModal}
            disabled={isExporting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleExport}
            disabled={isExporting || conversationsToExport.length === 0}
            className="gap-2"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Export {conversationsToExport.length} Conversations
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
