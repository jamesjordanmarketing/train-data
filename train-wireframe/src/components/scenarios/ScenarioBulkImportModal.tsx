import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Template, Scenario } from '../../lib/types';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Papa from 'papaparse';
import { Upload, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

interface ScenarioBulkImportModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (scenarios: Scenario[]) => void;
}

interface CSVRow {
  name: string;
  template_id: string;
  topic: string;
  persona: string;
  emotional_arc: string;
  description?: string;
  context?: string;
  status?: string;
  [key: string]: any; // For dynamic variable columns
}

interface ValidationResult {
  row: number;
  data: CSVRow;
  valid: boolean;
  errors: string[];
  warnings: string[];
}

const REQUIRED_COLUMNS = ['name', 'template_id', 'topic', 'persona', 'emotional_arc'];
const MAX_ROWS = 100;

export function ScenarioBulkImportModal({ open, onClose, onSuccess }: ScenarioBulkImportModalProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<CSVRow[]>([]);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);

  useEffect(() => {
    if (open) {
      fetchTemplates();
    }
  }, [open]);

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/templates');
      const data = await response.json();
      setTemplates(data.data || data.templates || []);
    } catch (error) {
      toast.error('Failed to load templates');
      console.error(error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      toast.error('Please select a CSV file');
      return;
    }

    setFile(selectedFile);
    parseCSV(selectedFile);
  };

  const parseCSV = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as CSVRow[];
        
        if (data.length === 0) {
          toast.error('CSV file is empty');
          return;
        }

        if (data.length > MAX_ROWS) {
          toast.error(`CSV contains ${data.length} rows. Maximum is ${MAX_ROWS}.`);
          return;
        }

        setParsedData(data);
        validateCSVData(data);
      },
      error: (error) => {
        toast.error(`CSV parsing failed: ${error.message}`);
        console.error(error);
      },
    });
  };

  const validateCSVData = async (data: CSVRow[]) => {
    setIsValidating(true);
    const results: ValidationResult[] = [];

    // Check if required columns exist
    if (data.length > 0) {
      const columns = Object.keys(data[0]);
      const missingColumns = REQUIRED_COLUMNS.filter(col => !columns.includes(col));
      
      if (missingColumns.length > 0) {
        toast.error(`Missing required columns: ${missingColumns.join(', ')}`);
        setIsValidating(false);
        return;
      }
    }

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const errors: string[] = [];
      const warnings: string[] = [];

      // Validate required fields
      REQUIRED_COLUMNS.forEach(col => {
        if (!row[col] || row[col].toString().trim() === '') {
          errors.push(`Missing required field: ${col}`);
        }
      });

      // Validate template exists
      const template = templates.find(t => t.id === row.template_id);
      if (!template && row.template_id) {
        errors.push(`Template ID "${row.template_id}" not found`);
      }

      // Validate status if provided
      if (row.status && !['draft', 'active', 'archived'].includes(row.status)) {
        errors.push(`Invalid status: ${row.status}`);
      }

      // Check template variables if template exists
      if (template) {
        template.variables.forEach(variable => {
          const varKey = `var_${variable.name}`;
          if (!row[varKey]) {
            errors.push(`Missing template variable: ${variable.name}`);
          }
        });
      }

      // Check for duplicate names (warning only)
      const duplicates = data.filter((r, idx) => idx !== i && r.name === row.name);
      if (duplicates.length > 0) {
        warnings.push('Duplicate name in CSV');
      }

      results.push({
        row: i + 1,
        data: row,
        valid: errors.length === 0,
        errors,
        warnings,
      });
    }

    setValidationResults(results);
    setIsValidating(false);

    const validCount = results.filter(r => r.valid).length;
    const invalidCount = results.length - validCount;

    if (invalidCount > 0) {
      toast.warning(`${validCount} valid rows, ${invalidCount} invalid rows`);
    } else {
      toast.success(`All ${validCount} rows are valid`);
    }
  };

  const handleImport = async () => {
    const validRows = validationResults.filter(r => r.valid);
    
    if (validRows.length === 0) {
      toast.error('No valid rows to import');
      return;
    }

    if (!confirm(`Import ${validRows.length} scenarios? This will create new records in the database.`)) {
      return;
    }

    setIsImporting(true);
    setImportProgress(0);

    const scenarios: any[] = [];
    
    for (let i = 0; i < validRows.length; i++) {
      const result = validRows[i];
      const row = result.data;
      const template = templates.find(t => t.id === row.template_id);
      
      if (!template) continue;

      // Extract parameter values from var_* columns
      const parameterValues: Record<string, any> = {};
      template.variables.forEach(variable => {
        const varKey = `var_${variable.name}`;
        if (row[varKey]) {
          parameterValues[variable.name] = row[varKey];
        }
      });

      const scenarioData = {
        name: row.name,
        description: row.description || '',
        parent_template_id: row.template_id,
        parent_template_name: template.name,
        context: row.context || '',
        parameter_values: parameterValues,
        topic: row.topic,
        persona: row.persona,
        emotional_arc: row.emotional_arc,
        status: row.status || 'draft',
        generation_status: 'not_generated',
      };

      scenarios.push(scenarioData);
      setImportProgress(Math.round(((i + 1) / validRows.length) * 50));
    }

    // Bulk create scenarios
    try {
      const response = await fetch('/api/scenarios/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarios }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to import scenarios');
      }

      setImportProgress(100);
      toast.success(`Successfully imported ${scenarios.length} scenarios`);
      onSuccess(result.data || []);
      
      // Reset state
      setTimeout(() => {
        handleClose();
      }, 1000);
    } catch (error: any) {
      console.error('Error importing scenarios:', error);
      toast.error(error.message);
    } finally {
      setIsImporting(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setParsedData([]);
    setValidationResults([]);
    setImportProgress(0);
    onClose();
  };

  const getRowStatusIcon = (result: ValidationResult) => {
    if (result.valid && result.warnings.length === 0) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    } else if (result.valid && result.warnings.length > 0) {
      return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    } else {
      return <XCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const validCount = validationResults.filter(r => r.valid).length;
  const invalidCount = validationResults.length - validCount;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Import Scenarios from CSV</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Upload */}
          <div>
            <Label htmlFor="csv-file">CSV File</Label>
            <div className="mt-2 flex items-center gap-4">
              <input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-lg file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100
                  cursor-pointer"
              />
              {file && (
                <Badge variant="outline" className="gap-1">
                  <Upload className="h-3 w-3" />
                  {file.name}
                </Badge>
              )}
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Required columns: name, template_id, topic, persona, emotional_arc
              <br />
              Optional columns: description, context, status, var_* (template variables)
              <br />
              Maximum {MAX_ROWS} rows per import
            </p>
          </div>

          {/* CSV Format Help */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>CSV Format:</strong> Each row represents one scenario. Use <code className="bg-gray-100 px-1 rounded">var_variablename</code> columns for template variables.
              Example: <code className="bg-gray-100 px-1 rounded">var_product_name</code>, <code className="bg-gray-100 px-1 rounded">var_issue_type</code>
            </AlertDescription>
          </Alert>

          {/* Validation Summary */}
          {validationResults.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              <div className="border rounded-lg p-4 bg-green-50">
                <div className="flex items-center gap-2 text-green-700 font-semibold">
                  <CheckCircle className="h-5 w-5" />
                  Valid Rows
                </div>
                <div className="text-2xl font-bold text-green-900 mt-2">{validCount}</div>
              </div>
              <div className="border rounded-lg p-4 bg-red-50">
                <div className="flex items-center gap-2 text-red-700 font-semibold">
                  <XCircle className="h-5 w-5" />
                  Invalid Rows
                </div>
                <div className="text-2xl font-bold text-red-900 mt-2">{invalidCount}</div>
              </div>
              <div className="border rounded-lg p-4 bg-blue-50">
                <div className="flex items-center gap-2 text-blue-700 font-semibold">
                  <Upload className="h-5 w-5" />
                  Total Rows
                </div>
                <div className="text-2xl font-bold text-blue-900 mt-2">{validationResults.length}</div>
              </div>
            </div>
          )}

          {/* Validation Results Table */}
          {validationResults.length > 0 && (
            <div className="border rounded-lg bg-white max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Status</TableHead>
                    <TableHead className="w-12">Row</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Template</TableHead>
                    <TableHead>Persona</TableHead>
                    <TableHead>Issues</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {validationResults.map((result) => {
                    const template = templates.find(t => t.id === result.data.template_id);
                    return (
                      <TableRow 
                        key={result.row}
                        className={!result.valid ? 'bg-red-50' : result.warnings.length > 0 ? 'bg-yellow-50' : ''}
                      >
                        <TableCell>{getRowStatusIcon(result)}</TableCell>
                        <TableCell className="font-mono text-xs">{result.row}</TableCell>
                        <TableCell className="font-medium">{result.data.name}</TableCell>
                        <TableCell>
                          {template ? (
                            <Badge variant="outline">{template.name}</Badge>
                          ) : (
                            <span className="text-xs text-red-600">Not found</span>
                          )}
                        </TableCell>
                        <TableCell>{result.data.persona}</TableCell>
                        <TableCell>
                          {result.errors.length > 0 && (
                            <div className="text-xs space-y-1">
                              {result.errors.map((error, idx) => (
                                <div key={idx} className="text-red-600">{error}</div>
                              ))}
                            </div>
                          )}
                          {result.warnings.length > 0 && (
                            <div className="text-xs space-y-1">
                              {result.warnings.map((warning, idx) => (
                                <div key={idx} className="text-yellow-600">{warning}</div>
                              ))}
                            </div>
                          )}
                          {result.valid && result.warnings.length === 0 && (
                            <span className="text-xs text-green-600">Valid</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Import Progress */}
          {isImporting && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Importing scenarios...</span>
                <span className="font-semibold">{importProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${importProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isImporting}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleImport}
              disabled={validCount === 0 || isImporting || isValidating}
            >
              {isImporting ? 'Importing...' : `Import ${validCount} Scenarios`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

