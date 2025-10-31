import { useState } from 'react';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { Copy, Check, Eye, EyeOff, ChevronDown, ChevronRight } from 'lucide-react';
import { Conversation } from '../../lib/types';
import { ExportFormat } from './ExportFormatSelector';
import { ExportOptions } from './ExportOptionsPanel';
import { toast } from 'sonner';

interface ExportPreviewProps {
  conversations: Conversation[];
  format: ExportFormat;
  options: ExportOptions;
}

export function ExportPreview({ conversations, format, options }: ExportPreviewProps) {
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['0']));

  const previewConversations = conversations.slice(0, 3);

  const toggleSection = (id: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedSections(newExpanded);
  };

  const prepareExportData = (conversation: Conversation) => {
    const data: any = {
      id: conversation.id,
    };

    if (options.includeFullContent) {
      data.turns = conversation.turns;
      data.totalTurns = conversation.totalTurns;
      data.totalTokens = conversation.totalTokens;
    }

    if (options.includeMetadata) {
      data.title = conversation.title;
      data.persona = conversation.persona;
      data.emotion = conversation.emotion;
      data.tier = conversation.tier;
      data.category = conversation.category;
      data.status = conversation.status;
      data.createdBy = conversation.createdBy;
    }

    if (options.includeQualityScores) {
      data.qualityScore = conversation.qualityScore;
      data.qualityMetrics = conversation.qualityMetrics;
    }

    if (options.includeTimestamps) {
      data.createdAt = conversation.createdAt;
      data.updatedAt = conversation.updatedAt;
    }

    if (options.includeApprovalHistory) {
      data.reviewHistory = conversation.reviewHistory;
    }

    if (options.includeParentReferences) {
      data.parentId = conversation.parentId;
      data.parentType = conversation.parentType;
    }

    return data;
  };

  const generatePreviewContent = () => {
    const exportData = previewConversations.map(prepareExportData);

    switch (format) {
      case 'jsonl':
        return exportData.map((data) => JSON.stringify(data)).join('\n');
      
      case 'json':
        return JSON.stringify(exportData, null, 2);
      
      case 'csv':
        return generateCsvPreview(exportData);
      
      case 'markdown':
        return generateMarkdownPreview(previewConversations);
      
      default:
        return '';
    }
  };

  const generateCsvPreview = (data: any[]) => {
    if (data.length === 0) return '';

    // Get all unique keys
    const allKeys = new Set<string>();
    data.forEach((item) => {
      Object.keys(item).forEach((key) => {
        if (typeof item[key] !== 'object' || item[key] === null) {
          allKeys.add(key);
        }
      });
    });

    const headers = Array.from(allKeys);
    const rows = data.map((item) =>
      headers.map((header) => {
        const value = item[header];
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value);
      })
    );

    return [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')),
    ].join('\n');
  };

  const generateMarkdownPreview = (conversations: Conversation[]) => {
    return conversations
      .map((conv, idx) => {
        let md = `# Conversation ${idx + 1}: ${conv.title}\n\n`;
        
        if (options.includeMetadata) {
          md += `**Metadata:**\n`;
          md += `- **ID:** ${conv.id}\n`;
          md += `- **Persona:** ${conv.persona}\n`;
          md += `- **Emotion:** ${conv.emotion}\n`;
          md += `- **Tier:** ${conv.tier}\n`;
          md += `- **Status:** ${conv.status}\n`;
          md += `- **Category:** ${conv.category.join(', ')}\n\n`;
        }

        if (options.includeQualityScores) {
          md += `**Quality Score:** ${conv.qualityScore}/100\n\n`;
        }

        if (options.includeFullContent) {
          md += `## Conversation\n\n`;
          conv.turns.forEach((turn, turnIdx) => {
            md += `### Turn ${turnIdx + 1} (${turn.role})\n\n`;
            md += `${turn.content}\n\n`;
            md += `*Tokens: ${turn.tokenCount}*\n\n`;
          });
        }

        md += `---\n\n`;
        return md;
      })
      .join('\n');
  };

  const handleCopy = async () => {
    try {
      const content = generatePreviewContent();
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success('Preview copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const renderJsonPreview = (content: string) => {
    try {
      const parsed = JSON.parse(content);
      return (
        <div className="space-y-1 font-mono text-xs">
          {Array.isArray(parsed) ? (
            parsed.map((item, idx) => (
              <div key={idx} className="border-l-2 border-primary/30 pl-3">
                <div
                  className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 rounded px-2 py-1"
                  onClick={() => toggleSection(idx.toString())}
                >
                  {expandedSections.has(idx.toString()) ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                  <span className="text-blue-600">Conversation {idx + 1}</span>
                  <Badge variant="outline" className="text-[10px] h-4">
                    {Object.keys(item).length} fields
                  </Badge>
                </div>
                {expandedSections.has(idx.toString()) && (
                  <pre className="mt-1 pl-4 text-[10px] overflow-x-auto">
                    {JSON.stringify(item, null, 2)}
                  </pre>
                )}
              </div>
            ))
          ) : (
            <pre className="overflow-x-auto">{JSON.stringify(parsed, null, 2)}</pre>
          )}
        </div>
      );
    } catch {
      return <pre className="font-mono text-xs overflow-x-auto whitespace-pre">{content}</pre>;
    }
  };

  const renderJsonlPreview = (content: string) => {
    const lines = content.split('\n').filter((line) => line.trim());
    return (
      <div className="space-y-2 font-mono text-xs">
        {lines.map((line, idx) => (
          <div key={idx} className="border-l-2 border-primary/30 pl-3">
            <div
              className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 rounded px-2 py-1"
              onClick={() => toggleSection(`line-${idx}`)}
            >
              {expandedSections.has(`line-${idx}`) ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
              <span className="text-green-600">Line {idx + 1}</span>
              <Badge variant="outline" className="text-[10px] h-4">
                {line.length} chars
              </Badge>
            </div>
            {expandedSections.has(`line-${idx}`) && (
              <pre className="mt-1 pl-4 text-[10px] overflow-x-auto">
                {JSON.stringify(JSON.parse(line), null, 2)}
              </pre>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderCsvPreview = (content: string) => {
    const lines = content.split('\n').slice(0, 10);
    const headers = lines[0]?.split(',').map((h) => h.replace(/"/g, '')) || [];
    const rows = lines.slice(1);

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-muted">
              {headers.map((header, idx) => (
                <th key={idx} className="border px-2 py-1 text-left font-semibold">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIdx) => {
              const cells = row.split(',').map((c) => c.replace(/^"|"$/g, ''));
              return (
                <tr key={rowIdx} className="hover:bg-muted/50">
                  {cells.map((cell, cellIdx) => (
                    <td key={cellIdx} className="border px-2 py-1 max-w-xs truncate">
                      {cell}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
        {content.split('\n').length > 10 && (
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Showing first 10 rows of {content.split('\n').length - 1}
          </p>
        )}
      </div>
    );
  };

  const renderMarkdownPreview = (content: string) => {
    // Simple markdown rendering for preview
    return (
      <div className="prose prose-sm max-w-none">
        {content.split('\n').map((line, idx) => {
          if (line.startsWith('# ')) {
            return (
              <h1 key={idx} className="text-lg font-bold mt-4 mb-2">
                {line.substring(2)}
              </h1>
            );
          } else if (line.startsWith('## ')) {
            return (
              <h2 key={idx} className="text-base font-semibold mt-3 mb-1">
                {line.substring(3)}
              </h2>
            );
          } else if (line.startsWith('### ')) {
            return (
              <h3 key={idx} className="text-sm font-medium mt-2 mb-1">
                {line.substring(4)}
              </h3>
            );
          } else if (line.startsWith('- **')) {
            const match = line.match(/- \*\*(.+?):\*\* (.+)/);
            if (match) {
              return (
                <div key={idx} className="text-xs ml-2">
                  <strong>{match[1]}:</strong> {match[2]}
                </div>
              );
            }
          } else if (line === '---') {
            return <hr key={idx} className="my-4 border-t" />;
          } else if (line.trim()) {
            return (
              <p key={idx} className="text-xs my-1">
                {line}
              </p>
            );
          }
          return <div key={idx} className="h-2" />;
        })}
      </div>
    );
  };

  const content = generatePreviewContent();

  if (previewConversations.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-sm text-muted-foreground">
          No conversations to preview. Select conversations or adjust filters to see a preview.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">Export Preview</span>
          <Badge variant="secondary" className="text-xs">
            First {previewConversations.length} of {conversations.length}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            className="gap-2"
          >
            {showPreview ? (
              <>
                <EyeOff className="h-3.5 w-3.5" />
                Hide Preview
              </>
            ) : (
              <>
                <Eye className="h-3.5 w-3.5" />
                Show Preview
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            disabled={copied}
            className="gap-2"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-green-600" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copy
              </>
            )}
          </Button>
        </div>
      </div>

      {showPreview && (
        <div className="rounded-lg border bg-muted/30">
          <ScrollArea className="h-[300px] w-full">
            <div className="p-4">
              {format === 'json' && renderJsonPreview(content)}
              {format === 'jsonl' && renderJsonlPreview(content)}
              {format === 'csv' && renderCsvPreview(content)}
              {format === 'markdown' && renderMarkdownPreview(content)}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}

