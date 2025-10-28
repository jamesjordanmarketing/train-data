import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Checkbox } from '../ui/checkbox';
import { useAppStore } from '../../stores/useAppStore';
import { Download } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function ExportModal() {
  const { 
    showExportModal, 
    closeExportModal,
    selectedConversationIds,
    conversations,
    filters
  } = useAppStore();
  
  const [scope, setScope] = useState<'selected' | 'filtered' | 'all'>('all');
  const [format, setFormat] = useState<'json' | 'jsonl' | 'csv' | 'markdown'>('jsonl');
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [includeQuality, setIncludeQuality] = useState(true);
  const [includeHistory, setIncludeHistory] = useState(false);
  
  const getExportCount = () => {
    if (scope === 'selected') return selectedConversationIds.length;
    if (scope === 'filtered') {
      // Would filter based on active filters - simplified for demo
      return conversations.length;
    }
    return conversations.length;
  };
  
  const handleExport = () => {
    const count = getExportCount();
    
    // Simulate export
    setTimeout(() => {
      toast.success(`Exported ${count} conversations as ${format.toUpperCase()}`);
      closeExportModal();
    }, 500);
  };
  
  return (
    <Dialog open={showExportModal} onOpenChange={closeExportModal}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Export Conversations</DialogTitle>
          <DialogDescription>
            Configure your export settings and download your data
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Export Scope */}
          <div className="space-y-3">
            <Label>Export Scope</Label>
            <RadioGroup value={scope} onValueChange={(val) => setScope(val as any)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="selected" id="selected" disabled={selectedConversationIds.length === 0} />
                <Label htmlFor="selected" className={selectedConversationIds.length === 0 ? 'text-gray-400' : ''}>
                  Selected conversations only ({selectedConversationIds.length} selected)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="filtered" id="filtered" />
                <Label htmlFor="filtered">
                  All conversations matching current filters ({conversations.length})
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all">
                  Entire dataset ({conversations.length} total)
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          {/* Format Selection */}
          <div className="space-y-3">
            <Label>Export Format</Label>
            <RadioGroup value={format} onValueChange={(val) => setFormat(val as any)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="json" id="json" />
                <Label htmlFor="json">
                  <div>
                    <div>JSON</div>
                    <div className="text-xs text-gray-500">Structured data for programmatic access</div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="jsonl" id="jsonl" />
                <Label htmlFor="jsonl">
                  <div>
                    <div>JSONL</div>
                    <div className="text-xs text-gray-500">Line-delimited JSON, ideal for training pipelines</div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv">
                  <div>
                    <div>CSV</div>
                    <div className="text-xs text-gray-500">Spreadsheet-compatible, metadata only</div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="markdown" id="markdown" />
                <Label htmlFor="markdown">
                  <div>
                    <div>Markdown</div>
                    <div className="text-xs text-gray-500">Human-readable formatted text</div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          {/* Export Options */}
          <div className="space-y-3">
            <Label>Export Options</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="metadata" 
                  checked={includeMetadata}
                  onCheckedChange={(checked) => setIncludeMetadata(checked as boolean)}
                />
                <Label htmlFor="metadata">Include metadata (tags, status, dates)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="quality" 
                  checked={includeQuality}
                  onCheckedChange={(checked) => setIncludeQuality(checked as boolean)}
                />
                <Label htmlFor="quality">Include quality scores and metrics</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="history" 
                  checked={includeHistory}
                  onCheckedChange={(checked) => setIncludeHistory(checked as boolean)}
                />
                <Label htmlFor="history">Include approval history and comments</Label>
              </div>
            </div>
          </div>
          
          {/* Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm space-y-1">
              <div><strong>Export Summary:</strong></div>
              <div>• {getExportCount()} conversations</div>
              <div>• Format: {format.toUpperCase()}</div>
              <div>• File name: conversations-export-{new Date().toISOString().split('T')[0]}.{format}</div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <Button variant="outline" onClick={closeExportModal} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleExport} className="flex-1 gap-2">
              <Download className="h-4 w-4" />
              Download Export
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
