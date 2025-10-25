'use client'

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Download, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { ChunkDimensions } from '../../types/chunks';

interface RunComparisonProps {
  runs: ChunkDimensions[];  // 2-5 runs to compare
  runNames?: Record<string, string>;  // Optional run_id -> name mapping
}

interface ComparisonResult {
  fields: string[];
  stats: {
    totalFields: number;
    changedFields: number;
    improvedFields: number;
    degradedFields: number;
    neutralChanges: number;
  };
  differences: Map<string, DifferenceInfo[]>;
}

interface DifferenceInfo {
  runIndex: number;
  value: any;
  changeType: 'improved' | 'degraded' | 'neutral' | 'unchanged';
  comparedTo?: any;  // Previous value
}

export function RunComparison({ runs, runNames = {} }: RunComparisonProps) {
  const [activeView, setActiveView] = useState<'all' | 'changes-only'>('all');

  // Compare runs and generate comparison result
  const comparison = useMemo(() => compareRuns(runs), [runs]);

  // Format run name
  const formatRunName = (runId: string, index: number): string => {
    return runNames[runId] || `Run ${index + 1}`;
  };

  // Get background color for cell based on change type
  const getCellBackgroundClass = (changeType: string): string => {
    switch (changeType) {
      case 'improved':
        return 'bg-green-100';
      case 'degraded':
        return 'bg-red-100';
      case 'neutral':
        return 'bg-yellow-100';
      default:
        return '';
    }
  };

  // Get icon for change type
  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'improved':
        return <TrendingUp className="h-3 w-3 text-green-600 inline ml-1" />;
      case 'degraded':
        return <TrendingDown className="h-3 w-3 text-red-600 inline ml-1" />;
      case 'neutral':
        return <Minus className="h-3 w-3 text-yellow-600 inline ml-1" />;
      default:
        return null;
    }
  };

  // Export comparison to CSV
  const handleExport = () => {
    const headers = ['Field', ...runs.map((r, i) => formatRunName(r.run_id, i))];
    const rows = comparison.fields.map(field => {
      const diffs = comparison.differences.get(field) || [];
      return [
        formatFieldName(field),
        ...diffs.map(diff => formatValueForExport(diff.value))
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `run-comparison-${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Filter fields based on active view
  const visibleFields = activeView === 'changes-only'
    ? comparison.fields.filter(field => {
        const diffs = comparison.differences.get(field) || [];
        return diffs.some(d => d.changeType !== 'unchanged');
      })
    : comparison.fields;

  if (runs.length < 2) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground text-center">
            Select at least 2 runs to compare
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Statistics Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Comparison Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded">
              <div className="text-2xl font-medium text-blue-600">
                {comparison.stats.totalFields}
              </div>
              <div className="text-sm text-blue-800">Total Fields</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded">
              <div className="text-2xl font-medium text-purple-600">
                {comparison.stats.changedFields}
              </div>
              <div className="text-sm text-purple-800">Changed</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded">
              <div className="text-2xl font-medium text-green-600">
                {comparison.stats.improvedFields}
              </div>
              <div className="text-sm text-green-800">Improved</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded">
              <div className="text-2xl font-medium text-red-600">
                {comparison.stats.degradedFields}
              </div>
              <div className="text-sm text-red-800">Degraded</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded">
              <div className="text-2xl font-medium text-yellow-600">
                {comparison.stats.neutralChanges}
              </div>
              <div className="text-sm text-yellow-800">Neutral</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant={activeView === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveView('all')}
          >
            All Fields
          </Button>
          <Button
            variant={activeView === 'changes-only' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveView('changes-only')}
          >
            Changes Only
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Export Comparison
        </Button>
      </div>

      {/* Comparison Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-auto max-h-[600px]">
            <Table>
              <TableHeader className="sticky top-0 bg-background">
                <TableRow>
                  <TableHead className="w-48 font-semibold">Field</TableHead>
                  {runs.map((run, index) => (
                    <TableHead key={run.id} className="min-w-[200px]">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {formatRunName(run.run_id, index)}
                        </Badge>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleFields.map(field => {
                  const diffs = comparison.differences.get(field) || [];
                  
                  return (
                    <TableRow key={field}>
                      <TableCell className="font-medium">
                        {formatFieldName(field)}
                      </TableCell>
                      {diffs.map((diff, index) => (
                        <TableCell
                          key={index}
                          className={getCellBackgroundClass(diff.changeType)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="flex-1">
                              {formatCellValue(diff.value)}
                            </span>
                            {getChangeIcon(diff.changeType)}
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 rounded border" />
              <span>Improved</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 rounded border" />
              <span>Degraded</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-100 rounded border" />
              <span>Changed (Neutral)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-white rounded border" />
              <span>Unchanged</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Compare dimension values across runs
 * Calculates improvement/degradation and returns differences with statistics
 */
function compareRuns(runs: ChunkDimensions[]): ComparisonResult {
  if (runs.length < 2) {
    return {
      fields: [],
      stats: {
        totalFields: 0,
        changedFields: 0,
        improvedFields: 0,
        degradedFields: 0,
        neutralChanges: 0,
      },
      differences: new Map(),
    };
  }

  // Get all dimension fields to compare
  const allFields = getAllDimensionFields();
  const differences = new Map<string, DifferenceInfo[]>();
  
  let changedFields = 0;
  let improvedFields = 0;
  let degradedFields = 0;
  let neutralChanges = 0;

  // Compare each field across all runs
  allFields.forEach(field => {
    const fieldDiffs: DifferenceInfo[] = [];
    let hasChanged = false;

    runs.forEach((run, index) => {
      const currentValue = run[field as keyof ChunkDimensions];
      const previousValue = index > 0 ? runs[index - 1][field as keyof ChunkDimensions] : undefined;
      
      let changeType: 'improved' | 'degraded' | 'neutral' | 'unchanged' = 'unchanged';
      
      if (index > 0) {
        changeType = getDifferenceColor(previousValue, currentValue, field);
        if (changeType !== 'unchanged') {
          hasChanged = true;
        }
      }

      fieldDiffs.push({
        runIndex: index,
        value: currentValue,
        changeType,
        comparedTo: previousValue,
      });
    });

    differences.set(field, fieldDiffs);

    // Count statistics (based on last run compared to first)
    if (hasChanged) {
      changedFields++;
      const lastChange = fieldDiffs[fieldDiffs.length - 1].changeType;
      if (lastChange === 'improved') improvedFields++;
      else if (lastChange === 'degraded') degradedFields++;
      else if (lastChange === 'neutral') neutralChanges++;
    }
  });

  return {
    fields: allFields,
    stats: {
      totalFields: allFields.length,
      changedFields,
      improvedFields,
      degradedFields,
      neutralChanges,
    },
    differences,
  };
}

/**
 * Determine if change is positive, negative, or neutral
 * Returns appropriate color class for background
 */
function getDifferenceColor(
  oldValue: any,
  newValue: any,
  field: string
): 'improved' | 'degraded' | 'neutral' | 'unchanged' {
  // No change
  if (oldValue === newValue) return 'unchanged';
  if (JSON.stringify(oldValue) === JSON.stringify(newValue)) return 'unchanged';

  // Null to value is always improvement
  if ((oldValue === null || oldValue === undefined) && newValue !== null && newValue !== undefined) {
    return 'improved';
  }

  // Value to null is always degradation
  if (oldValue !== null && oldValue !== undefined && (newValue === null || newValue === undefined)) {
    return 'degraded';
  }

  // Special logic for specific fields
  // Confidence scores: higher is better
  if (field.includes('confidence') || field.includes('factual_confidence')) {
    const oldNum = Number(oldValue) || 0;
    const newNum = Number(newValue) || 0;
    if (newNum > oldNum) return 'improved';
    if (newNum < oldNum) return 'degraded';
    return 'unchanged';
  }

  // Cost: lower is better
  if (field.includes('cost')) {
    const oldNum = Number(oldValue) || 0;
    const newNum = Number(newValue) || 0;
    if (newNum < oldNum) return 'improved';
    if (newNum > oldNum) return 'degraded';
    return 'unchanged';
  }

  // Duration: lower is better
  if (field.includes('duration')) {
    const oldNum = Number(oldValue) || 0;
    const newNum = Number(newValue) || 0;
    if (newNum < oldNum) return 'improved';
    if (newNum > oldNum) return 'degraded';
    return 'unchanged';
  }

  // For content fields: any change is neutral unless it's null transitions
  return 'neutral';
}

/**
 * Get all dimension fields for comparison
 */
function getAllDimensionFields(): string[] {
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
    // Risk dimensions
    'safety_tags',
    'coverage_tag',
    'novelty_tag',
    'ip_sensitivity',
    'pii_flag',
    // Meta dimensions
    'generation_confidence_precision',
    'generation_confidence_accuracy',
    'generation_cost_usd',
    'generation_duration_ms',
    'review_status',
  ];
}

/**
 * Format field name for display
 */
function formatFieldName(fieldName: string): string {
  return fieldName
    .replace(/_/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Format cell value for display
 */
function formatCellValue(value: any): React.ReactNode {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground">—</span>;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-muted-foreground">—</span>;
    return <span className="text-xs">{value.join(', ')}</span>;
  }
  if (typeof value === 'boolean') {
    return value ? '✓' : '✗';
  }
  if (typeof value === 'number') {
    // Format based on magnitude
    if (value < 0.01) return value.toFixed(6);
    if (value < 1) return value.toFixed(4);
    if (value < 100) return value.toFixed(2);
    return Math.round(value).toLocaleString();
  }
  
  const strValue = String(value);
  if (strValue.length > 80) {
    return (
      <span title={strValue} className="text-xs">
        {strValue.substring(0, 80)}...
      </span>
    );
  }
  return <span className="text-xs">{strValue}</span>;
}

/**
 * Format value for CSV export
 */
function formatValueForExport(value: any): string {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) return value.join('; ');
  return String(value);
}

