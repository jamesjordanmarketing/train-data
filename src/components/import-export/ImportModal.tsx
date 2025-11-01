import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Alert, AlertDescription } from '../ui/alert';
import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { Upload, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent } from '../ui/card';

interface ImportModalProps {
  open: boolean;
  onClose: () => void;
  onImportComplete?: () => void;
  entityType: 'templates' | 'scenarios' | 'edge-cases';
}

interface ValidationResult {
  valid: any[];
  invalid: any[];
  summary: {
    total: number;
    validCount: number;
    invalidCount: number;
    duplicates: number;
  };
}

export function ImportModal({ open, onClose, onImportComplete, entityType }: ImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [overwriteExisting, setOverwriteExisting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [importResult, setImportResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setValidationResult(null);
      setImportResult(null);
    }
  };
  
  const handleValidate = async () => {
    if (!file) return;
    
    setIsValidating(true);
    try {
      const content = await file.text();
      let data;
      
      // Parse file based on type
      if (file.name.endsWith('.json')) {
        data = JSON.parse(content);
      } else if (file.name.endsWith('.jsonl')) {
        data = content.split('\n').filter(line => line.trim()).map(line => JSON.parse(line));
      } else {
        throw new Error('Unsupported file format. Please use JSON or JSONL.');
      }
      
      // Normalize data structure
      const items = Array.isArray(data) ? data : (data.data || []);
      const entityKey = entityType === 'edge-cases' ? 'edgeCases' : entityType;
      
      // Validate via API
      const response = await fetch(`/api/import/${entityType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [entityKey]: items,
          validateOnly: true,
        }),
      });
      
      const result = await response.json();
      setValidationResult(result);
      
      if (result.summary.validCount > 0) {
        toast.success(`Validation complete: ${result.summary.validCount} valid items`);
      } else {
        toast.error('No valid items found');
      }
    } catch (error: any) {
      console.error('Validation error:', error);
      toast.error(`Validation failed: ${error.message}`);
    } finally {
      setIsValidating(false);
    }
  };
  
  const handleImport = async () => {
    if (!file || !validationResult) return;
    
    setIsImporting(true);
    try {
      const content = await file.text();
      let data;
      
      // Parse file based on type
      if (file.name.endsWith('.json')) {
        data = JSON.parse(content);
      } else if (file.name.endsWith('.jsonl')) {
        data = content.split('\n').filter(line => line.trim()).map(line => JSON.parse(line));
      }
      
      // Normalize data structure
      const items = Array.isArray(data) ? data : (data.data || []);
      const entityKey = entityType === 'edge-cases' ? 'edgeCases' : entityType;
      
      // Import via API
      const response = await fetch(`/api/import/${entityType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [entityKey]: validationResult.valid,
          overwriteExisting,
          validateOnly: false,
        }),
      });
      
      const result = await response.json();
      setImportResult(result);
      
      if (result.success) {
        toast.success(`Successfully imported ${result.imported} ${entityType}`);
        if (onImportComplete) {
          onImportComplete();
        }
        // Close modal after 2 seconds
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        toast.error('Import failed');
      }
    } catch (error: any) {
      console.error('Import error:', error);
      toast.error(`Import failed: ${error.message}`);
    } finally {
      setIsImporting(false);
    }
  };
  
  const handleReset = () => {
    setFile(null);
    setValidationResult(null);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import {entityType}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* File Upload */}
          <div>
            <Label>Select File</Label>
            <div className="mt-2 flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.jsonl"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                {file ? file.name : 'Choose file...'}
              </Button>
              {file && (
                <Button variant="ghost" size="sm" onClick={handleReset}>
                  Clear
                </Button>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Supported formats: JSON, JSONL
            </p>
          </div>
          
          {/* Options */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="overwrite"
              checked={overwriteExisting}
              onCheckedChange={(checked) => setOverwriteExisting(checked as boolean)}
            />
            <Label htmlFor="overwrite" className="cursor-pointer">
              Overwrite existing {entityType}
            </Label>
          </div>
          
          {/* Validation Results */}
          {validationResult && (
            <Card>
              <CardContent className="pt-4">
                <h3 className="font-semibold mb-2">Validation Results</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">
                      Valid: {validationResult.summary.validCount}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm">
                      Invalid: {validationResult.summary.invalidCount}
                    </span>
                  </div>
                  {validationResult.summary.duplicates > 0 && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Found {validationResult.summary.duplicates} duplicate entries
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {validationResult.invalid.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-red-600 mb-1">
                        Invalid Items:
                      </p>
                      <div className="bg-red-50 border border-red-200 rounded p-2 max-h-32 overflow-y-auto">
                        {validationResult.invalid.slice(0, 5).map((item: any, index: number) => (
                          <div key={index} className="text-xs text-red-700 mb-1">
                            <span className="font-medium">{item.template || item.scenario || item.edgeCase}:</span>{' '}
                            {item.errors.join(', ')}
                          </div>
                        ))}
                        {validationResult.invalid.length > 5 && (
                          <p className="text-xs text-red-600 mt-1">
                            ... and {validationResult.invalid.length - 5} more
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Import Results */}
          {importResult && (
            <Card>
              <CardContent className="pt-4">
                <h3 className="font-semibold mb-2">Import Results</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">
                      Imported: {importResult.imported}
                    </span>
                  </div>
                  {importResult.failed > 0 && (
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <span className="text-sm">
                        Failed: {importResult.failed}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              {importResult?.success ? 'Close' : 'Cancel'}
            </Button>
            
            {!validationResult && (
              <Button
                onClick={handleValidate}
                disabled={!file || isValidating}
              >
                {isValidating ? 'Validating...' : 'Validate'}
              </Button>
            )}
            
            {validationResult && !importResult && (
              <Button
                onClick={handleImport}
                disabled={
                  validationResult.summary.validCount === 0 || isImporting
                }
              >
                {isImporting ? 'Importing...' : `Import ${validationResult.summary.validCount} items`}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

