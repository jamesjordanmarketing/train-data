/**
 * Error Report Modal
 * 
 * Displays comprehensive diagnostic information for a failed generation
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Download, Copy, Check, RefreshCw } from 'lucide-react';

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

/**
 * RAW Error File Report structure
 */
interface ErrorFileReport {
  error_report: {
    failure_type: string;
    stop_reason: string | null;
    stop_reason_analysis: string;
    truncation_pattern: string | null;
    truncation_details: string | null;
    timestamp: string;
    analysis: {
      input_tokens: number;
      output_tokens: number;
      max_tokens_configured: number;
      tokens_remaining: number;
      conclusion: string;
    };
  };
  request_context: {
    model: string;
    temperature: number;
    max_tokens: number;
    structured_outputs_enabled: boolean;
    prompt_length: number;
  };
  raw_response: unknown;
  extracted_content: string;
  scaffolding_context?: {
    persona_id?: string;
    emotional_arc_id?: string;
    training_topic_id?: string;
    template_id?: string;
  };
}

interface ErrorReportModalProps {
  failure: FailedGeneration | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ErrorReportModal({ failure, open, onOpenChange }: ErrorReportModalProps) {
  const [report, setReport] = useState<ErrorFileReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadReport = useCallback(async () => {
    if (!failure) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/failed-generations/${failure.id}/download`);
      if (response.ok) {
        const data = await response.json();
        setReport(data);
      }
    } catch (error) {
      console.error('Error loading report:', error);
    } finally {
      setLoading(false);
    }
  }, [failure]);

  useEffect(() => {
    if (open && failure) {
      loadReport();
    } else {
      setReport(null);
    }
  }, [open, failure, loadReport]);

  function handleCopyContent() {
    if (!failure) return;
    navigator.clipboard.writeText(failure.response_content || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownloadFull() {
    if (!report || !failure) return;

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `failed-generation-${failure.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function getFailureTypeColor(type: string): string {
    const colors: Record<string, string> = {
      truncation: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      parse_error: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      api_error: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      validation_error: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  }

  if (!failure) return null;

  const tokenUtilization = failure.max_tokens > 0 
    ? ((failure.output_tokens || 0) / failure.max_tokens * 100).toFixed(1)
    : '0.0';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Failed Generation Diagnostic Report
          </DialogTitle>
          <DialogDescription>
            Complete error analysis and raw response data for ID: <code className="text-xs bg-muted px-1 rounded">{failure.id}</code>
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading report...</span>
          </div>
        )}

        {!loading && (
          <div className="space-y-6">
            {/* Summary Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                Summary
              </h3>
              <div className="grid grid-cols-2 gap-4 bg-muted/50 p-4 rounded-lg">
                <div className="space-y-1">
                  <span className="text-sm font-medium text-muted-foreground">Failure Type</span>
                  <div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getFailureTypeColor(failure.failure_type)}`}>
                      {failure.failure_type.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-medium text-muted-foreground">Stop Reason</span>
                  <div>
                    <Badge variant={failure.stop_reason === 'max_tokens' ? 'destructive' : 'secondary'}>
                      {failure.stop_reason || 'NULL'}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-medium text-muted-foreground">Truncation Pattern</span>
                  <div>
                    <Badge variant="outline">{failure.truncation_pattern?.replace('_', ' ') || 'N/A'}</Badge>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-medium text-muted-foreground">Model</span>
                  <div>
                    <code className="text-sm font-mono bg-background px-2 py-0.5 rounded border">{failure.model}</code>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-medium text-muted-foreground">Timestamp</span>
                  <div className="text-sm">{new Date(failure.created_at).toLocaleString()}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-sm font-medium text-muted-foreground">Structured Outputs</span>
                  <div className="text-sm">{failure.structured_outputs_enabled ? 'Enabled' : 'Disabled'}</div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Token Analysis */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Token Analysis
              </h3>
              <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Input Tokens</span>
                    <code className="text-sm font-mono">{failure.input_tokens?.toLocaleString() || 0}</code>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Output Tokens</span>
                    <code className="text-sm font-mono">{failure.output_tokens?.toLocaleString() || 0}</code>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Max Tokens Configured</span>
                    <code className="text-sm font-mono">{failure.max_tokens.toLocaleString()}</code>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Tokens Remaining</span>
                    <code className="text-sm font-mono">{(failure.max_tokens - (failure.output_tokens || 0)).toLocaleString()}</code>
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold">Token Utilization</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${parseFloat(tokenUtilization) > 90 ? 'bg-destructive' : 'bg-primary'}`}
                        style={{ width: `${Math.min(parseFloat(tokenUtilization), 100)}%` }}
                      />
                    </div>
                    <code className="text-sm font-mono font-semibold">{tokenUtilization}%</code>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Error Details */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-destructive" />
                Error Details
              </h3>
              <div className="space-y-3">
                {failure.truncation_details && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Truncation Details</span>
                    <p className="text-sm mt-1 p-3 bg-muted/50 rounded-md">{failure.truncation_details}</p>
                  </div>
                )}
                {failure.error_message && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Error Message</span>
                    <p className="text-sm mt-1 p-3 bg-destructive/10 text-destructive rounded-md font-mono break-all">
                      {failure.error_message}
                    </p>
                  </div>
                )}
                {!failure.truncation_details && !failure.error_message && (
                  <p className="text-sm text-muted-foreground italic">No additional error details available.</p>
                )}
              </div>
            </div>

            <Separator />

            {/* Response Content Preview */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500" />
                  Response Content Preview
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyContent}
                  disabled={!failure.response_content}
                >
                  {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                  {copied ? 'Copied!' : 'Copy Content'}
                </Button>
              </div>
              <div className="bg-muted/50 p-4 rounded-lg">
                {failure.response_content ? (
                  <pre className="text-xs font-mono whitespace-pre-wrap break-words max-h-64 overflow-y-auto">
                    {failure.response_content.length > 3000 
                      ? failure.response_content.substring(0, 3000) + '\n\n... [truncated - download full report for complete content]'
                      : failure.response_content}
                  </pre>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No response content available</p>
                )}
              </div>
              {failure.response_content && failure.response_content.length > 3000 && (
                <p className="text-xs text-muted-foreground mt-2">
                  Showing preview only ({failure.response_content.length.toLocaleString()} characters total). Download full RAW report for complete content.
                </p>
              )}
            </div>

            <Separator />

            {/* Analysis Section */}
            {report && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  Automated Analysis
                </h3>
                <div className="bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 p-4 rounded-lg space-y-3">
                  <div>
                    <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Stop Reason Analysis</span>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      {report.error_report.stop_reason_analysis}
                    </p>
                  </div>
                  <Separator className="bg-blue-200 dark:bg-blue-800" />
                  <div>
                    <span className="text-sm font-bold text-blue-900 dark:text-blue-100">Conclusion</span>
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mt-1">
                      {report.error_report.analysis.conclusion}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Scaffolding Context */}
            {(failure.persona_id || failure.emotional_arc_id || failure.training_topic_id || failure.template_id) && (
              <>
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    Scaffolding Context
                  </h3>
                  <div className="grid grid-cols-2 gap-2 bg-muted/50 p-4 rounded-lg">
                    {failure.persona_id && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Persona ID:</span>{' '}
                        <code className="text-xs bg-background px-1 rounded">{failure.persona_id}</code>
                      </div>
                    )}
                    {failure.emotional_arc_id && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Emotional Arc:</span>{' '}
                        <code className="text-xs bg-background px-1 rounded">{failure.emotional_arc_id}</code>
                      </div>
                    )}
                    {failure.training_topic_id && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Training Topic:</span>{' '}
                        <code className="text-xs bg-background px-1 rounded">{failure.training_topic_id}</code>
                      </div>
                    )}
                    {failure.template_id && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Template ID:</span>{' '}
                        <code className="text-xs bg-background px-1 rounded">{failure.template_id}</code>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
              <Button onClick={handleDownloadFull} disabled={!report}>
                <Download className="h-4 w-4 mr-2" />
                Download Full RAW Report
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

