import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { HelpCircle, RotateCcw } from 'lucide-react';

export interface ExportOptions {
  includeMetadata: boolean;
  includeQualityScores: boolean;
  includeTimestamps: boolean;
  includeApprovalHistory: boolean;
  includeParentReferences: boolean;
  includeFullContent: boolean;
}

interface ExportOptionsPanelProps {
  config: ExportOptions;
  onChange: (config: ExportOptions) => void;
}

export function ExportOptionsPanel({ config, onChange }: ExportOptionsPanelProps) {
  const defaultConfig: ExportOptions = {
    includeMetadata: true,
    includeQualityScores: true,
    includeTimestamps: true,
    includeApprovalHistory: false,
    includeParentReferences: false,
    includeFullContent: true,
  };

  const handleReset = () => {
    onChange(defaultConfig);
  };

  const handleToggle = (key: keyof ExportOptions) => {
    onChange({
      ...config,
      [key]: !config[key],
    });
  };

  const options = [
    {
      key: 'includeMetadata' as keyof ExportOptions,
      label: 'Include Metadata',
      description: 'Include conversation metadata such as title, persona, emotion, category, tier, status, and creation info',
      tooltip: 'Adds fields like title, persona, emotion, category, tier, status, createdAt, createdBy',
      recommended: true,
    },
    {
      key: 'includeQualityScores' as keyof ExportOptions,
      label: 'Include Quality Scores',
      description: 'Include quality metrics and detailed scoring breakdown',
      tooltip: 'Adds overall quality score and detailed metrics: relevance, accuracy, naturalness, methodology, coherence, uniqueness',
      recommended: true,
    },
    {
      key: 'includeTimestamps' as keyof ExportOptions,
      label: 'Include Timestamps',
      description: 'Include creation and modification timestamps for tracking',
      tooltip: 'Adds createdAt, updatedAt timestamps for each conversation and turn',
      recommended: true,
    },
    {
      key: 'includeApprovalHistory' as keyof ExportOptions,
      label: 'Include Approval History',
      description: 'Include complete review and approval history with comments',
      tooltip: 'Adds full reviewHistory array with actions, timestamps, performers, and comments',
      recommended: false,
    },
    {
      key: 'includeParentReferences' as keyof ExportOptions,
      label: 'Include Parent References',
      description: 'Include references to parent templates and scenarios',
      tooltip: 'Adds parentId and parentType fields linking conversations to their source templates/scenarios',
      recommended: false,
    },
    {
      key: 'includeFullContent' as keyof ExportOptions,
      label: 'Include Full Content',
      description: 'Include complete conversation content with all turns and messages',
      tooltip: 'Includes full turns array with all messages. Disable for metadata-only exports.',
      recommended: true,
    },
  ];

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="options" className="border rounded-lg px-4">
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center justify-between w-full pr-2">
            <span className="text-sm font-semibold">Advanced Export Options</span>
            <span className="text-xs text-muted-foreground mr-2">
              {Object.values(config).filter(Boolean).length} / {options.length} enabled
            </span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="pt-4 pb-2">
          <div className="space-y-4">
            <div className="space-y-3">
              {options.map((option) => (
                <div
                  key={option.key}
                  className="flex items-start space-x-3 py-2 px-3 rounded-md hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    id={option.key}
                    checked={config[option.key]}
                    onCheckedChange={() => handleToggle(option.key)}
                    className="mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Label
                        htmlFor={option.key}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {option.label}
                      </Label>
                      {option.recommended && (
                        <span className="text-[10px] text-primary font-medium px-1.5 py-0.5 bg-primary/10 rounded">
                          Recommended
                        </span>
                      )}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent side="right" className="max-w-xs">
                            <p className="text-xs">{option.tooltip}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="w-full gap-2"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset to Defaults
              </Button>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

