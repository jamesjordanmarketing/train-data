/**
 * Failed Generations Page
 * 
 * Displays list of failed conversation generations with filtering,
 * detailed error reports, and RAW file download capabilities.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Download, Eye, Filter, ArrowLeft, RefreshCw } from 'lucide-react';
import { ErrorReportModal } from '@/components/failed-generations/error-report-modal';

/**
 * Failed generation record structure
 */
interface FailedGeneration {
  id: string;
  conversation_id: string | null;
  run_id: string | null;
  prompt: string;
  prompt_length: number;
  model: string;
  max_tokens: number;
  temperature: number | null;
  structured_outputs_enabled: boolean;
  raw_response: unknown;
  response_content: string | null;
  stop_reason: string | null;
  input_tokens: number | null;
  output_tokens: number | null;
  failure_type: 'truncation' | 'parse_error' | 'api_error' | 'validation_error';
  truncation_pattern: string | null;
  truncation_details: string | null;
  error_message: string | null;
  error_stack: string | null;
  raw_file_path: string | null;
  created_at: string;
  created_by: string;
  persona_id: string | null;
  emotional_arc_id: string | null;
  training_topic_id: string | null;
  template_id: string | null;
}

export default function FailedGenerationsPage() {
  const router = useRouter();
  const [failures, setFailures] = useState<FailedGeneration[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [selectedFailure, setSelectedFailure] = useState<FailedGeneration | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filters
  const [failureTypeFilter, setFailureTypeFilter] = useState<string>('all');
  const [stopReasonFilter, setStopReasonFilter] = useState<string>('all');
  const [patternFilter, setPatternFilter] = useState<string>('all');

  const limit = 25;

  const loadFailures = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (failureTypeFilter !== 'all') {
        params.append('failure_type', failureTypeFilter);
      }
      if (stopReasonFilter !== 'all') {
        params.append('stop_reason', stopReasonFilter);
      }
      if (patternFilter !== 'all') {
        params.append('truncation_pattern', patternFilter);
      }

      const response = await fetch(`/api/failed-generations?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch failed generations');
      }
      const data = await response.json();

      setFailures(data.failures);
      setTotalCount(data.total);
    } catch (error) {
      console.error('Error loading failed generations:', error);
    } finally {
      setLoading(false);
    }
  }, [page, failureTypeFilter, stopReasonFilter, patternFilter]);

  useEffect(() => {
    loadFailures();
  }, [loadFailures]);

  async function handleDownloadRawReport(failure: FailedGeneration) {
    try {
      const response = await fetch(`/api/failed-generations/${failure.id}/download`);
      if (!response.ok) {
        throw new Error('Failed to download error report');
      }
      const report = await response.json();

      // Create download
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `failed-generation-${failure.id}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Failed to download error report');
    }
  }

  function handleViewDetails(failure: FailedGeneration) {
    setSelectedFailure(failure);
    setIsModalOpen(true);
  }

  function getFailureTypeBadgeVariant(type: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      truncation: 'destructive',
      parse_error: 'secondary',
      api_error: 'outline',
      validation_error: 'default',
    };
    return variants[type] || 'default';
  }

  function getStopReasonBadge(stopReason: string | null) {
    if (!stopReason) return <Badge variant="outline">NULL</Badge>;
    if (stopReason === 'end_turn') return <Badge variant="default">end_turn</Badge>;
    if (stopReason === 'max_tokens') return <Badge variant="destructive">max_tokens</Badge>;
    return <Badge variant="secondary">{stopReason}</Badge>;
  }

  function handleClearFilters() {
    setFailureTypeFilter('all');
    setStopReasonFilter('all');
    setPatternFilter('all');
    setPage(1);
  }

  const totalPages = Math.ceil(totalCount / limit);
  const hasActiveFilters = failureTypeFilter !== 'all' || stopReasonFilter !== 'all' || patternFilter !== 'all';

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.push('/conversations')}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
          </div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <AlertCircle className="h-8 w-8 text-destructive" />
            Failed Generations
          </h1>
          <p className="text-muted-foreground">
            Diagnostic view of failed conversation generations ({totalCount} total failures)
          </p>
        </div>
        <Button
          variant="outline"
          onClick={loadFailures}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Failure Records</CardTitle>
          <CardDescription>
            Click &quot;View&quot; for detailed diagnostics or &quot;RAW&quot; to download the full error report
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Filters */}
          <div className="mb-6 flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>

            <Select value={failureTypeFilter} onValueChange={(value) => { setFailureTypeFilter(value); setPage(1); }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Failure Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="truncation">Truncation</SelectItem>
                <SelectItem value="parse_error">Parse Error</SelectItem>
                <SelectItem value="api_error">API Error</SelectItem>
                <SelectItem value="validation_error">Validation Error</SelectItem>
              </SelectContent>
            </Select>

            <Select value={stopReasonFilter} onValueChange={(value) => { setStopReasonFilter(value); setPage(1); }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Stop Reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stop Reasons</SelectItem>
                <SelectItem value="end_turn">end_turn</SelectItem>
                <SelectItem value="max_tokens">max_tokens</SelectItem>
                <SelectItem value="stop_sequence">stop_sequence</SelectItem>
                <SelectItem value="tool_use">tool_use</SelectItem>
              </SelectContent>
            </Select>

            <Select value={patternFilter} onValueChange={(value) => { setPatternFilter(value); setPage(1); }}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Truncation Pattern" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Patterns</SelectItem>
                <SelectItem value="lone_backslash">Lone Backslash</SelectItem>
                <SelectItem value="escaped_quote">Escaped Quote</SelectItem>
                <SelectItem value="mid_word">Mid-Word</SelectItem>
                <SelectItem value="trailing_comma">Trailing Comma</SelectItem>
                <SelectItem value="no_punctuation">No Punctuation</SelectItem>
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
              >
                Clear Filters
              </Button>
            )}
          </div>

          {/* Table */}
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
              Loading failed generations...
            </div>
          ) : failures.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No failed generations found</p>
              <p className="text-sm mt-1">
                {hasActiveFilters 
                  ? 'Try adjusting your filters to see more results.' 
                  : 'Great news! No failures have been recorded yet.'}
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Failure Type</TableHead>
                      <TableHead>Stop Reason</TableHead>
                      <TableHead>Pattern</TableHead>
                      <TableHead>Tokens</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {failures.map((failure) => (
                      <TableRow 
                        key={failure.id} 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleViewDetails(failure)}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleViewDetails(failure);
                          }
                        }}
                      >
                        <TableCell className="font-mono text-sm">
                          {new Date(failure.created_at).toLocaleDateString()}{' '}
                          <span className="text-muted-foreground">
                            {new Date(failure.created_at).toLocaleTimeString()}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getFailureTypeBadgeVariant(failure.failure_type)}>
                            {failure.failure_type.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {getStopReasonBadge(failure.stop_reason)}
                        </TableCell>
                        <TableCell>
                          {failure.truncation_pattern ? (
                            <Badge variant="outline">{failure.truncation_pattern.replace('_', ' ')}</Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">—</span>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          <span className="text-foreground">{failure.output_tokens || 0}</span>
                          <span className="text-muted-foreground"> / {failure.max_tokens}</span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {failure.model.replace('claude-', '').replace('-latest', '')}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end" onClick={(e) => e.stopPropagation()}>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetails(failure)}
                              title="View diagnostic details"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadRawReport(failure)}
                              title="Download RAW error report JSON"
                            >
                              <Download className="h-4 w-4 mr-1" />
                              RAW
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {(page - 1) * limit + 1} to {Math.min(page * limit, totalCount)} of {totalCount} failures
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <span className="flex items-center px-3 text-sm">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Error Report Modal */}
      <ErrorReportModal
        failure={selectedFailure}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  );
}

