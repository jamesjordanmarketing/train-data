'use client'

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { 
  ArrowUpDown, Search, Filter, Download, Loader2 
} from 'lucide-react';
import { Chunk, ChunkDimensions, ChunkRun } from '../../types/chunks';
import { toast } from 'sonner';

interface ChunkSpreadsheetProps {
  chunk: Chunk;
  dimensions: ChunkDimensions[];
  runs: ChunkRun[];
}

export function ChunkSpreadsheet({ chunk, dimensions, runs }: ChunkSpreadsheetProps) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterText, setFilterText] = useState('');
  const [activeView, setActiveView] = useState<'all' | 'quality' | 'cost' | 'content' | 'risk'>('all');
  const [exporting, setExporting] = useState(false);

  // Define preset views
  const presetViews: Record<string, string[]> = {
    quality: ['generation_confidence_precision', 'generation_confidence_accuracy', 'factual_confidence_0_1', 'review_status'],
    cost: ['generation_cost_usd', 'generation_duration_ms', 'chunk_summary_1s'],
    content: ['chunk_summary_1s', 'key_terms', 'audience', 'intent', 'tone_voice_tags'],
    risk: ['ip_sensitivity', 'pii_flag', 'compliance_flags', 'safety_tags', 'coverage_tag'],
  };

  const getAllDimensionFields = (): string[] => {
    return [
      // Content dimensions
      'chunk_summary_1s',
      'key_terms',
      'audience',
      'intent',
      'tone_voice_tags',
      'brand_persona_tags',
      'domain_tags',
      // Task dimensions
      'task_name',
      'preconditions',
      'expected_output',
      // CER dimensions
      'claim',
      'evidence_snippets',
      'reasoning_sketch',
      // Scenario dimensions
      'scenario_type',
      'problem_context',
      'solution_action',
      // Meta dimensions
      'generation_confidence_precision',
      'generation_confidence_accuracy',
      'generation_cost_usd',
      'generation_duration_ms',
      'review_status',
    ];
  };

  const visibleColumns = activeView === 'all' 
    ? getAllDimensionFields() 
    : presetViews[activeView];

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedDimensions = [...dimensions].sort((a, b) => {
    if (!sortColumn) return 0;
    
    const aVal = a[sortColumn as keyof ChunkDimensions];
    const bVal = b[sortColumn as keyof ChunkDimensions];
    
    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;
    
    const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const filteredDimensions = sortedDimensions.filter(dim => {
    if (!filterText) return true;
    
    const searchText = filterText.toLowerCase();
    return visibleColumns.some(col => {
      const value = dim[col as keyof ChunkDimensions];
      if (value === null || value === undefined) return false;
      return String(value).toLowerCase().includes(searchText);
    });
  });

  const formatRunName = (runId: string): string => {
    const run = runs.find(r => r.run_id === runId);
    return run ? run.run_name : runId.substring(0, 8);
  };

  const formatColumnName = (col: string): string => {
    return col
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatCellValue = (value: any): React.ReactNode => {
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground">—</span>;
    }
    if (Array.isArray(value)) {
      if (value.length === 0) return <span className="text-muted-foreground">—</span>;
      return <Badge variant="secondary">{value.length} items</Badge>;
    }
    if (typeof value === 'boolean') {
      return value ? '✓' : '✗';
    }
    if (typeof value === 'number') {
      return value.toFixed(4);
    }
    
    const strValue = String(value);
    if (strValue.length > 100) {
      return (
        <span title={strValue}>
          {strValue.substring(0, 100)}...
        </span>
      );
    }
    return strValue;
  };

  const handleExport = () => {
    try {
      setExporting(true);
      toast.info('Preparing export...');
      
      // Create CSV content
      const headers = ['Run', ...visibleColumns.map(formatColumnName)];
      const rows = filteredDimensions.map(dim => [
        formatRunName(dim.run_id),
        ...visibleColumns.map(col => {
          const value = dim[col as keyof ChunkDimensions];
          if (Array.isArray(value)) return value.join('; ');
          if (value === null || value === undefined) return '';
          return String(value);
        })
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      ].join('\n');

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chunk-${chunk.chunk_id}-dimensions.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Data exported successfully!');
    } catch (error: any) {
      console.error('Export error:', error);
      toast.error(`Export failed: ${error.message}`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <div className="flex items-center gap-2">
          <Button 
            variant={activeView === 'all' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActiveView('all')}
          >
            All Dimensions
          </Button>
          <Button 
            variant={activeView === 'quality' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActiveView('quality')}
          >
            Quality View
          </Button>
          <Button 
            variant={activeView === 'cost' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActiveView('cost')}
          >
            Cost View
          </Button>
          <Button 
            variant={activeView === 'content' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActiveView('content')}
          >
            Content View
          </Button>
          <Button 
            variant={activeView === 'risk' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActiveView('risk')}
          >
            Risk View
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Input 
            placeholder="Filter..." 
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="w-48"
          />
          <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting}>
            {exporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Spreadsheet Table */}
      <div className="border rounded-lg overflow-auto max-h-[600px]">
        <Table>
          <TableHeader className="sticky top-0 bg-background">
            <TableRow>
              <TableHead className="w-32">Run</TableHead>
              {visibleColumns.map(col => (
                <TableHead 
                  key={col} 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort(col)}
                >
                  <div className="flex items-center gap-2">
                    {formatColumnName(col)}
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDimensions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={visibleColumns.length + 1} className="text-center text-muted-foreground">
                  No dimensions found
                </TableCell>
              </TableRow>
            ) : (
              filteredDimensions.map(dim => (
                <TableRow key={dim.id}>
                  <TableCell className="font-medium">
                    {formatRunName(dim.run_id)}
                  </TableCell>
                  {visibleColumns.map(col => (
                    <TableCell key={col}>
                      {formatCellValue(dim[col as keyof ChunkDimensions])}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Summary */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredDimensions.length} of {dimensions.length} dimension records
      </div>
    </div>
  );
}

