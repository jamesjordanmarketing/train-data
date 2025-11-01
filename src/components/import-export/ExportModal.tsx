import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Checkbox } from '../ui/checkbox';
import { useState } from 'react';
import { toast } from 'sonner';
import { Download } from 'lucide-react';

interface ExportModalProps {
  open: boolean;
  onClose: () => void;
  entityType: 'templates' | 'scenarios' | 'edge-cases';
  selectedIds?: string[];
}

export function ExportModal({ open, onClose, entityType, selectedIds }: ExportModalProps) {
  const [format, setFormat] = useState<'json' | 'jsonl' | 'csv'>('json');
  const [exportAll, setExportAll] = useState(!selectedIds || selectedIds.length === 0);
  const [isExporting, setIsExporting] = useState(false);
  
  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      const params = new URLSearchParams();
      params.append('format', format);
      
      if (!exportAll && selectedIds && selectedIds.length > 0) {
        params.append('ids', selectedIds.join(','));
      }
      
      const response = await fetch(`/api/export/${entityType}?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Export failed');
      }
      
      // Trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${entityType}-${Date.now()}.${format === 'jsonl' ? 'jsonl' : format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success(`${entityType} exported successfully`);
      onClose();
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error('Failed to export');
    } finally {
      setIsExporting(false);
    }
  };
  
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

