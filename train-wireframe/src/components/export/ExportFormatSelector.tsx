import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { FileJson, FileText, FileSpreadsheet, FileCode } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

export type ExportFormat = 'jsonl' | 'json' | 'csv' | 'markdown';

interface ExportFormatSelectorProps {
  value: ExportFormat;
  onChange: (value: ExportFormat) => void;
}

export function ExportFormatSelector({ value, onChange }: ExportFormatSelectorProps) {
  const formatOptions = [
    {
      id: 'jsonl',
      value: 'jsonl' as ExportFormat,
      icon: FileCode,
      emoji: '📄',
      label: 'JSONL',
      subtitle: 'LoRA Training',
      description: 'Line-delimited JSON format, ideal for machine learning training pipelines and streaming data processing',
      recommended: true,
      features: ['One conversation per line', 'Easy to stream', 'Training-ready'],
    },
    {
      id: 'json',
      value: 'json' as ExportFormat,
      icon: FileJson,
      emoji: '🔧',
      label: 'JSON',
      subtitle: 'Structured Data',
      description: 'Standard JSON format with proper nesting, perfect for programmatic access and API integrations',
      recommended: false,
      features: ['Pretty-printed', 'Nested structure', 'Developer-friendly'],
    },
    {
      id: 'csv',
      value: 'csv' as ExportFormat,
      icon: FileSpreadsheet,
      emoji: '📊',
      label: 'CSV',
      subtitle: 'Analysis & Reporting',
      description: 'Comma-separated values for spreadsheet applications, data analysis, and business intelligence tools',
      recommended: false,
      features: ['Excel compatible', 'Flat structure', 'Easy analysis'],
    },
    {
      id: 'markdown',
      value: 'markdown' as ExportFormat,
      icon: FileText,
      emoji: '📝',
      label: 'Markdown',
      subtitle: 'Human Review',
      description: 'Human-readable markdown format with formatting, ideal for documentation and manual review',
      recommended: false,
      features: ['Readable format', 'Documentation-ready', 'GitHub compatible'],
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold">Export Format</Label>
        <span className="text-xs text-muted-foreground">
          Choose output file format
        </span>
      </div>

      <RadioGroup 
        value={value} 
        onValueChange={onChange}
        className="space-y-2"
      >
        {formatOptions.map((option) => {
          const Icon = option.icon;
          return (
            <TooltipProvider key={option.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={`
                      relative flex items-start space-x-3 rounded-lg border p-4 
                      transition-all duration-200
                      ${value === option.value 
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20' 
                        : 'border-border bg-background hover:border-muted-foreground/50'
                      }
                      cursor-pointer
                    `}
                  >
                    <RadioGroupItem
                      value={option.value}
                      id={option.id}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <Label
                        htmlFor={option.id}
                        className="flex items-center gap-2 text-sm font-medium cursor-pointer"
                      >
                        <span className="text-lg">{option.emoji}</span>
                        <span>{option.label}</span>
                        <span className="text-muted-foreground font-normal">
                          - {option.subtitle}
                        </span>
                        {option.recommended && (
                          <Badge variant="default" className="ml-auto">
                            Recommended
                          </Badge>
                        )}
                      </Label>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-xs">
                  <div className="space-y-2">
                    <p className="font-semibold">{option.label} Format</p>
                    <p className="text-xs">{option.description}</p>
                    <div className="pt-2 border-t">
                      <p className="text-xs font-semibold mb-1">Key Features:</p>
                      <ul className="text-xs space-y-1">
                        {option.features.map((feature, idx) => (
                          <li key={idx}>• {feature}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </RadioGroup>
    </div>
  );
}

