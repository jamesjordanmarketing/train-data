'use client';

import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Circle, Loader2 } from 'lucide-react';

interface GenerationProgressProps {
  status: 'starting' | 'generating' | 'validating' | 'saving' | 'complete';
  progress: number;
  estimatedTimeRemaining?: number;
}

const STEPS = [
  { key: 'starting', label: 'Template resolved', progress: 10 },
  { key: 'generating', label: 'Generating conversation', progress: 80 },
  { key: 'validating', label: 'Quality scoring', progress: 90 },
  { key: 'saving', label: 'Saving to database', progress: 95 },
  { key: 'complete', label: 'Complete', progress: 100 },
];

export function GenerationProgress({
  status,
  progress,
  estimatedTimeRemaining
}: GenerationProgressProps) {
  const currentStepIndex = STEPS.findIndex(step => step.key === status);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <h3 className="text-lg font-semibold">Generating Conversation...</h3>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground text-right">
              {progress}%
            </p>
          </div>

          {/* Status */}
          <div className="space-y-1">
            <p className="text-sm font-medium">
              Status: {STEPS[currentStepIndex]?.label}
            </p>
            {estimatedTimeRemaining !== undefined && (
              <p className="text-sm text-muted-foreground">
                Estimated time remaining: {estimatedTimeRemaining} seconds
              </p>
            )}
          </div>

          {/* Step Indicators */}
          <div className="space-y-3">
            <p className="text-sm font-medium">Steps:</p>
            {STEPS.map((step, index) => {
              const isComplete = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const isPending = index > currentStepIndex;

              return (
                <div key={step.key} className="flex items-center gap-3">
                  {isComplete && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  {isCurrent && (
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  )}
                  {isPending && (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                  <span className={`text-sm ${
                    isComplete ? 'text-foreground' :
                    isCurrent ? 'text-primary font-medium' :
                    'text-muted-foreground'
                  }`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

