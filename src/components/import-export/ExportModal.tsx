// Import section (add store import)
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Checkbox } from '../ui/checkbox';
import { useState } from 'react';
import { toast } from 'sonner';
import { Download } from 'lucide-react';
import { useConversationStore } from '@/stores/conversation-store';

interface ExportModalProps {
  open: boolean;
  onClose: () => void;
  entityType: 'templates' | 'scenarios' | 'edge-cases' | 'conversations';
  selectedIds?: string[];
}

export function ExportModal({ open, onClose, entityType, selectedIds }: ExportModalProps) {
  const [format, setFormat] = useState<'json' | 'jsonl' | 'csv'>('json');
  const [exportAll, setExportAll] = useState(!selectedIds || selectedIds.length === 0);
  const [isExporting, setIsExporting] = useState(false);
  const { filterConfig } = useConversationStore();
  
  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      if (entityType === 'conversations') {
        const hasFilters =
          (filterConfig.tierTypes && filterConfig.tierTypes.length > 0) ||
          (filterConfig.statuses && filterConfig.statuses.length > 0) ||
          (filterConfig.categories && filterConfig.categories.length > 0) ||
          filterConfig.qualityRange ||
          (filterConfig.searchQuery && filterConfig.searchQuery.length > 0);
        
        const scope = exportAll
          ? (hasFilters ? 'filtered' : 'all')
          : 'selected';
        
        // Map UI filterConfig (from conversations types) to server FilterConfig (from lib/types)
        const mapFilters = () => {
          const fc = filterConfig;
          return {
            tier: fc.tierTypes && fc.tierTypes.length > 0 ? fc.tierTypes : undefined,
            status: fc.statuses && fc.statuses.length > 0 ? fc.statuses : undefined,
            qualityScoreMin: fc.qualityRange ? fc.qualityRange.min : undefined,
            qualityScoreMax: fc.qualityRange ? fc.qualityRange.max : undefined,
            dateFrom: fc.dateRange?.from,
            dateTo: fc.dateRange?.to,
            categories: fc.categories && fc.categories.length > 0 ? fc.categories : undefined,
            searchQuery: fc.searchQuery || undefined,
          };
        };
        
        const payload = {
          config: {
            scope,
            format,
            includeMetadata: true,
            includeQualityScores: true,
            includeTimestamps: true,
            includeApprovalHistory: true,
            includeParentReferences: true,
            includeFullContent: true,
          },
          conversationIds: scope === 'selected' ? (selectedIds || []) : undefined,
          filters: scope === 'filtered' ? mapFilters() : undefined,
        };
        
        const res = await fetch('/api/export/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        
        if (!res.ok) throw new Error('Export failed');
        
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const json = await res.json();
          const { export_id, status } = json;
          
          if (status === 'completed') {
            await downloadExport(export_id, format, scope);
          } else if (status === 'queued') {
            toast.info('Export queued. Preparing file...');
            await pollExportStatus(export_id, format, scope);
          } else {
            throw new Error('Unexpected export status');
          }
        } else {
          // Fallback in case server streams file directly (unlikely)
          const blob = await res.blob();
          triggerDownloadBlob(blob, format, scope);
        }
        
        toast.success('Conversations export started');
        onClose();
        return;
      }
      const params = new URLSearchParams();
      params.append('format', format);
      
      if (!exportAll && selectedIds && selectedIds.length > 0) {
        params.append('ids', selectedIds.join(','));
      }
      
      const response = await fetch(`/api/export/${entityType}?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      const blob = await response.blob();
      triggerDownloadBlob(blob, format, entityType);
      
      toast.success(`${entityType} exported successfully`);
      onClose();
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error('Failed to export');
    } finally {
      setIsExporting(false);
    }
  };

  async function pollExportStatus(exportId: string, fmt: typeof format, scopeLabel: string) {
    const maxAttempts = 15;
    const delayMs = 2000;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const statusRes = await fetch(`/api/export/status/${exportId}`);
      if (!statusRes.ok) {
        await new Promise((r) => setTimeout(r, delayMs));
        continue;
      }
      const statusJson = await statusRes.json();
      if (statusJson.status === 'completed') {
        await downloadExport(exportId, fmt, scopeLabel);
        return;
      }
      if (statusJson.status === 'failed') {
        throw new Error(statusJson.error_message || 'Export failed during processing');
      }
      await new Promise((r) => setTimeout(r, delayMs));
    }
    throw new Error('Export timed out. Please check history and try again.');
  }

  async function downloadExport(exportId: string, fmt: typeof format, scopeLabel: string) {
    const dlRes = await fetch(`/api/export/download/${exportId}`);
    if (!dlRes.ok) throw new Error('Failed to download export file');
    const blob = await dlRes.blob();
    triggerDownloadBlob(blob, fmt, scopeLabel);
  }

  function triggerDownloadBlob(blob: Blob, fmt: typeof format, scopeLabel: string) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    const ext = fmt === 'jsonl' ? 'jsonl' : fmt;
    const date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `training-data-${scopeLabel}-${date}.${ext}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Export {entityType}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label>Export Format</Label>
            <RadioGroup value={format} onValueChange={(value: any) => setFormat(value)} className="mt-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="json" id="json" />
                <Label htmlFor="json" className="cursor-pointer">JSON (Structured)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="jsonl" id="jsonl" />
                <Label htmlFor="jsonl" className="cursor-pointer">JSONL (Line-delimited)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv" className="cursor-pointer">CSV (Spreadsheet)</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="exportAll"
              checked={exportAll}
              onCheckedChange={(checked) => setExportAll(checked as boolean)}
            />
            <Label htmlFor="exportAll" className="cursor-pointer">
              Export all {entityType} {!exportAll && selectedIds && `(${selectedIds.length} selected)`}
            </Label>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleExport} disabled={isExporting}>
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? 'Exporting...' : 'Export'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

