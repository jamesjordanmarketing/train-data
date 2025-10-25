'use client'

import { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  ArrowUpDown, Search, Download, Loader2, CheckCircle, AlertCircle
} from 'lucide-react';
import { DimensionRow } from '../../lib/dimension-service';
import { toast } from 'sonner';

interface DimensionValidationSheetProps {
  dimensionRows: DimensionRow[];
  documentName: string;
  chunkName: string;
  runTimestamp: string;
}

type ColumnSize = 'small' | 'medium' | 'large';

export function DimensionValidationSheet({
  dimensionRows,
  documentName,
  chunkName,
  runTimestamp
}: DimensionValidationSheetProps) {
  // State management
  const [sortField, setSortField] = useState<keyof DimensionRow>('displayOrder');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterText, setFilterText] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterConfidence, setFilterConfidence] = useState<string>('all');
  const [columnSize, setColumnSize] = useState<ColumnSize>('medium');
  const [exporting, setExporting] = useState(false);

  // Column width presets
  const columnWidths = {
    small: { name: 'w-32', value: 'w-48', other: 'w-24' },
    medium: { name: 'w-48', value: 'w-64', other: 'w-32' },
    large: { name: 'w-64', value: 'w-96', other: 'w-40' }
  };

  const widths = columnWidths[columnSize];

  // Value formatting functions
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return '-';
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  const formatValueForCSV = (value: any): string => {
    const formatted = formatValue(value);
    // Escape quotes and wrap in quotes if contains comma
    return formatted.replace(/"/g, '""');
  };

  // Get confidence color class
  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 8.0) return 'text-green-600 bg-green-50';
    if (confidence >= 6.0) return 'text-yellow-600 bg-yellow-50';
    return 'text-orange-600 bg-orange-50';
  };

  // Get generation type badge color
  const getTypeColor = (type: string): string => {
    if (type === 'AI Generated') return 'bg-purple-100 text-purple-800';
    if (type === 'Mechanically Generated') return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  // Get shortened type label
  const getTypeLabel = (type: string): string => {
    if (type === 'AI Generated') return 'AI';
    if (type === 'Mechanically Generated') return 'Mechanical';
    return 'Prior';
  };

  // Filtering and sorting logic
  const filteredAndSortedRows = useMemo(() => {
    let filtered = [...dimensionRows];

    // Text filter - search across field name, description, and value
    if (filterText) {
      const searchText = filterText.toLowerCase();
      filtered = filtered.filter(row => {
        const fieldMatch = row.fieldName.toLowerCase().includes(searchText);
        const descMatch = row.description.toLowerCase().includes(searchText);
        const valueMatch = formatValue(row.value).toLowerCase().includes(searchText);
        return fieldMatch || descMatch || valueMatch;
      });
    }

    // Generation type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(row => row.generationType === filterType);
    }

    // Confidence level filter
    if (filterConfidence !== 'all') {
      filtered = filtered.filter(row => {
        const avgConf = (row.precisionConfidence + row.accuracyConfidence) / 2;
        if (filterConfidence === 'high') return avgConf >= 8.0;
        if (filterConfidence === 'low') return avgConf < 8.0;
        return true;
      });
    }

    // Sorting
    filtered.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      
      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [dimensionRows, filterText, filterType, filterConfidence, sortField, sortDirection]);

  // Handle sorting
  const handleSort = (field: keyof DimensionRow) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Handle CSV export
  const handleExport = async () => {
    try {
      setExporting(true);
      toast.info('Preparing export...');

      const documentNameFormatted = `${documentName} - ${chunkName} - ${runTimestamp}`;
      
      // CSV headers
      const headers = [
        'Chunk Dimension',
        `Document Name (last run)`,
        'Generated Value',
        'What Generated TYPE',
        'Precision Confidence Level',
        'Accuracy Confidence Level',
        'Description',
        'Type',
        'Allowed Values Format'
      ];

      // CSV rows
      const rows = filteredAndSortedRows.map(row => [
        row.fieldName,
        documentNameFormatted,
        formatValueForCSV(row.value),
        row.generationType,
        row.precisionConfidence.toFixed(1),
        row.accuracyConfidence.toFixed(1),
        row.description,
        row.dataType,
        row.allowedValuesFormat || ''
      ]);

      // Create CSV content
      const csvContent = [
        headers.map(h => `"${h}"`).join(','),
        ...rows.map(row => row.map(cell => `"${String(cell)}"`).join(','))
      ].join('\n');

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      a.download = `${chunkName}_dimensions_${timestamp}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success('CSV exported successfully!');
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error(`Export failed: ${error.message}`);
    } finally {
      setExporting(false);
    }
  };

  // Calculate summary statistics
  const populatedCount = filteredAndSortedRows.filter(row => 
    row.value !== null && row.value !== undefined && row.value !== ''
  ).length;
  
  const highConfidenceCount = filteredAndSortedRows.filter(row => {
    const avgConf = (row.precisionConfidence + row.accuracyConfidence) / 2;
    return avgConf >= 8.0;
  }).length;

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-muted/30 rounded-lg border">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search dimensions, values, descriptions..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="AI Generated">AI Generated</SelectItem>
            <SelectItem value="Mechanically Generated">Mechanically Generated</SelectItem>
            <SelectItem value="Prior Generated">Prior Generated</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterConfidence} onValueChange={setFilterConfidence}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Confidence" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Confidence</SelectItem>
            <SelectItem value="high">High (≥8.0)</SelectItem>
            <SelectItem value="low">Low (&lt;8.0)</SelectItem>
          </SelectContent>
        </Select>

        <Select value={columnSize} onValueChange={(value) => setColumnSize(value as ColumnSize)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Column Size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="small">Small</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="large">Large</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          disabled={exporting}
        >
          {exporting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </>
          )}
        </Button>
      </div>

      {/* Dimension Table */}
      <div className="border rounded-lg overflow-auto max-h-[calc(100vh-300px)]">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              <TableHead 
                className={`cursor-pointer hover:bg-muted/50 ${widths.name}`}
                onClick={() => handleSort('fieldName')}
              >
                <div className="flex items-center gap-2">
                  Chunk Dimension
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead className={widths.value}>
                Generated Value
              </TableHead>
              <TableHead 
                className={`cursor-pointer hover:bg-muted/50 ${widths.other}`}
                onClick={() => handleSort('generationType')}
              >
                <div className="flex items-center gap-2">
                  Type
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead 
                className={`cursor-pointer hover:bg-muted/50 ${widths.other}`}
                onClick={() => handleSort('precisionConfidence')}
              >
                <div className="flex items-center gap-2">
                  Precision
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead 
                className={`cursor-pointer hover:bg-muted/50 ${widths.other}`}
                onClick={() => handleSort('accuracyConfidence')}
              >
                <div className="flex items-center gap-2">
                  Accuracy
                  <ArrowUpDown className="h-3 w-3" />
                </div>
              </TableHead>
              <TableHead className={widths.value}>
                Description
              </TableHead>
              <TableHead className={widths.other}>
                Data Type
              </TableHead>
              <TableHead className={widths.other}>
                Allowed Format
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  No dimensions found matching your filters
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedRows.map((row) => {
                const formattedValue = formatValue(row.value);
                const isValueEmpty = formattedValue === '-';
                const avgConfidence = (row.precisionConfidence + row.accuracyConfidence) / 2;
                
                return (
                  <TableRow key={row.fieldName} className="text-sm">
                    <TableCell className="font-medium py-2">
                      {row.fieldName}
                    </TableCell>
                    <TableCell className={`py-2 ${isValueEmpty ? 'text-muted-foreground' : ''}`}>
                      {formattedValue.length > 100 ? (
                        <span title={formattedValue}>
                          {formattedValue.substring(0, 100)}...
                        </span>
                      ) : (
                        formattedValue
                      )}
                    </TableCell>
                    <TableCell className="py-2">
                      <Badge className={getTypeColor(row.generationType)}>
                        {getTypeLabel(row.generationType)}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-2">
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded ${getConfidenceColor(row.precisionConfidence)}`}>
                        {row.precisionConfidence >= 8.0 && (
                          <CheckCircle className="h-3 w-3" />
                        )}
                        {row.precisionConfidence < 8.0 && (
                          <AlertCircle className="h-3 w-3" />
                        )}
                        <span className="font-medium">{row.precisionConfidence.toFixed(1)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-2">
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded ${getConfidenceColor(row.accuracyConfidence)}`}>
                        {row.accuracyConfidence >= 8.0 && (
                          <CheckCircle className="h-3 w-3" />
                        )}
                        {row.accuracyConfidence < 8.0 && (
                          <AlertCircle className="h-3 w-3" />
                        )}
                        <span className="font-medium">{row.accuracyConfidence.toFixed(1)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-2 text-xs text-muted-foreground">
                      {row.description.length > 80 ? (
                        <span title={row.description}>
                          {row.description.substring(0, 80)}...
                        </span>
                      ) : (
                        row.description
                      )}
                    </TableCell>
                    <TableCell className="py-2">
                      <code className="text-xs bg-muted px-1 py-0.5 rounded">
                        {row.dataType}
                      </code>
                    </TableCell>
                    <TableCell className="py-2 text-xs text-muted-foreground">
                      {row.allowedValuesFormat || '-'}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Summary Footer */}
      <div className="flex items-center justify-between text-sm text-muted-foreground px-2">
        <div className="flex items-center gap-4">
          <span>
            Showing <strong>{filteredAndSortedRows.length}</strong> of <strong>{dimensionRows.length}</strong> dimensions
          </span>
          <span>•</span>
          <span>
            Populated: <strong>{populatedCount}/{dimensionRows.length}</strong>
          </span>
          <span>•</span>
          <span>
            High Confidence (≥8.0): <strong>{highConfidenceCount}</strong>
          </span>
        </div>
      </div>
    </div>
  );
}

