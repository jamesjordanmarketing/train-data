/**
 * Quality Details Modal
 * 
 * Displays comprehensive quality score breakdown with detailed metrics,
 * progress bars, and actionable recommendations
 */

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  Info,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '../../lib/utils';

export interface QualityBreakdown {
  turnCount: {
    score: number;
    weight: number;
    actual: number;
    target: string;
    status: 'optimal' | 'acceptable' | 'poor';
    message: string;
  };
  length: {
    score: number;
    weight: number;
    actual: number;
    target: string;
    avgTurnLength: number;
    status: 'optimal' | 'acceptable' | 'poor';
    message: string;
  };
  structure: {
    score: number;
    weight: number;
    valid: boolean;
    issues: string[];
    status: 'valid' | 'has_issues';
    message: string;
  };
  confidence: {
    score: number;
    weight: number;
    level: 'high' | 'medium' | 'low';
    factors: Array<{
      name: string;
      impact: 'positive' | 'negative';
      description: string;
    }>;
    message: string;
  };
}

export interface QualityScore {
  overall: number;
  breakdown: QualityBreakdown;
  recommendations: string[];
  autoFlagged: boolean;
  calculatedAt: string;
}

interface QualityDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  qualityScore: QualityScore | null;
  conversationTitle?: string;
}

export function QualityDetailsModal({
  open,
  onOpenChange,
  qualityScore,
  conversationTitle,
}: QualityDetailsModalProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['recommendations'])
  );

  // Reset expanded sections when modal opens
  useEffect(() => {
    if (open) {
      setExpandedSections(new Set(['recommendations']));
    }
  }, [open]);

  if (!qualityScore) return null;

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const getScoreColor = (score: number): string => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number): string => {
    if (score >= 8) return 'bg-green-50 border-green-200';
    if (score >= 6) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'optimal':
      case 'valid':
      case 'high':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'acceptable':
      case 'medium':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      default:
        return <XCircle className="h-5 w-5 text-red-600" />;
    }
  };

  const getProgressColor = (score: number): string => {
    if (score >= 8) return 'bg-green-600';
    if (score >= 6) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span>Quality Score Breakdown</span>
            <Badge
              className={cn(
                'text-lg font-bold',
                getScoreBgColor(qualityScore.overall)
              )}
            >
              {qualityScore.overall.toFixed(1)}/10
            </Badge>
          </DialogTitle>
          {conversationTitle && (
            <DialogDescription>{conversationTitle}</DialogDescription>
          )}
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-8rem)] pr-4">
          <div className="space-y-6">
            {/* Overall Status */}
            <div
              className={cn(
                'p-4 rounded-lg border-2',
                getScoreBgColor(qualityScore.overall)
              )}
            >
              <div className="flex items-start gap-3">
                {qualityScore.autoFlagged ? (
                  <XCircle className="h-6 w-6 text-red-600 mt-0.5" />
                ) : qualityScore.overall >= 8 ? (
                  <CheckCircle2 className="h-6 w-6 text-green-600 mt-0.5" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-yellow-600 mt-0.5" />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">
                    {qualityScore.autoFlagged
                      ? 'Flagged for Revision'
                      : qualityScore.overall >= 8
                      ? 'Excellent Quality'
                      : qualityScore.overall >= 6
                      ? 'Acceptable Quality'
                      : 'Needs Improvement'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {qualityScore.autoFlagged
                      ? 'This conversation has been automatically flagged due to low quality score and requires revision.'
                      : qualityScore.overall >= 8
                      ? 'This conversation meets high quality standards and is suitable for training data.'
                      : qualityScore.overall >= 6
                      ? 'This conversation meets minimum quality standards but could be improved.'
                      : 'This conversation does not meet quality standards and should be revised before use.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Component Scores */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Info className="h-4 w-4" />
                Quality Components
              </h3>

              {/* Turn Count */}
              <ComponentScore
                title="Turn Count"
                score={qualityScore.breakdown.turnCount.score}
                weight={qualityScore.breakdown.turnCount.weight}
                status={qualityScore.breakdown.turnCount.status}
                message={qualityScore.breakdown.turnCount.message}
                details={[
                  {
                    label: 'Actual',
                    value: `${qualityScore.breakdown.turnCount.actual} turns`,
                  },
                  {
                    label: 'Target',
                    value: qualityScore.breakdown.turnCount.target,
                  },
                ]}
                icon={getStatusIcon(qualityScore.breakdown.turnCount.status)}
                progressColor={getProgressColor(
                  qualityScore.breakdown.turnCount.score
                )}
              />

              {/* Length */}
              <ComponentScore
                title="Turn Length"
                score={qualityScore.breakdown.length.score}
                weight={qualityScore.breakdown.length.weight}
                status={qualityScore.breakdown.length.status}
                message={qualityScore.breakdown.length.message}
                details={[
                  {
                    label: 'Average',
                    value: `${qualityScore.breakdown.length.avgTurnLength} chars/turn`,
                  },
                  {
                    label: 'Total',
                    value: `${qualityScore.breakdown.length.actual.toLocaleString()} chars`,
                  },
                  { label: 'Target', value: qualityScore.breakdown.length.target },
                ]}
                icon={getStatusIcon(qualityScore.breakdown.length.status)}
                progressColor={getProgressColor(
                  qualityScore.breakdown.length.score
                )}
              />

              {/* Structure */}
              <ComponentScore
                title="Structure"
                score={qualityScore.breakdown.structure.score}
                weight={qualityScore.breakdown.structure.weight}
                status={qualityScore.breakdown.structure.status}
                message={qualityScore.breakdown.structure.message}
                details={
                  qualityScore.breakdown.structure.issues.length > 0
                    ? qualityScore.breakdown.structure.issues.map((issue) => ({
                        label: '⚠️',
                        value: issue,
                      }))
                    : [{ label: '✓', value: 'All structural checks passed' }]
                }
                icon={getStatusIcon(qualityScore.breakdown.structure.status)}
                progressColor={getProgressColor(
                  qualityScore.breakdown.structure.score
                )}
              />

              {/* Confidence */}
              <ComponentScore
                title="Confidence"
                score={qualityScore.breakdown.confidence.score}
                weight={qualityScore.breakdown.confidence.weight}
                status={qualityScore.breakdown.confidence.level}
                message={qualityScore.breakdown.confidence.message}
                details={qualityScore.breakdown.confidence.factors.map(
                  (factor) => ({
                    label:
                      factor.impact === 'positive'
                        ? <TrendingUp className="h-4 w-4 text-green-600" />
                        : <TrendingDown className="h-4 w-4 text-red-600" />,
                    value: `${factor.name}: ${factor.description}`,
                  })
                )}
                icon={getStatusIcon(qualityScore.breakdown.confidence.level)}
                progressColor={getProgressColor(
                  qualityScore.breakdown.confidence.score
                )}
              />
            </div>

            {/* Recommendations */}
            {qualityScore.recommendations.length > 0 && (
              <div className="space-y-3">
                <button
                  onClick={() => toggleSection('recommendations')}
                  className="w-full flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <h3 className="font-semibold flex items-center gap-2">
                    <Info className="h-4 w-4 text-blue-600" />
                    Recommendations ({qualityScore.recommendations.length})
                  </h3>
                  {expandedSections.has('recommendations') ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>

                {expandedSections.has('recommendations') && (
                  <div className="space-y-2 pl-3">
                    {qualityScore.recommendations.map((rec, index) => (
                      <div
                        key={index}
                        className="p-3 bg-white border border-gray-200 rounded-md text-sm"
                      >
                        {rec}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Metadata */}
            <div className="text-xs text-gray-500 border-t pt-3">
              <p>
                Calculated at:{' '}
                {new Date(qualityScore.calculatedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface ComponentScoreProps {
  title: string;
  score: number;
  weight: number;
  status: string;
  message: string;
  details: Array<{ label: string | React.ReactNode; value: string }>;
  icon: React.ReactNode;
  progressColor: string;
}

function ComponentScore({
  title,
  score,
  weight,
  status,
  message,
  details,
  icon,
  progressColor,
}: ComponentScoreProps) {
  return (
    <div className="p-4 border rounded-lg bg-white">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon}
          <div>
            <h4 className="font-medium">{title}</h4>
            <p className="text-xs text-gray-500">
              Weight: {(weight * 100).toFixed(0)}%
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">{score.toFixed(1)}</div>
          <div className="text-xs text-gray-500">/ 10</div>
        </div>
      </div>

      <div className="mb-3">
        <Progress value={score * 10} className="h-2">
          <div
            className={cn('h-full rounded-full transition-all', progressColor)}
            style={{ width: `${score * 10}%` }}
          />
        </Progress>
      </div>

      <p className="text-sm text-gray-600 mb-3">{message}</p>

      <div className="space-y-1">
        {details.map((detail, index) => (
          <div
            key={index}
            className="flex items-start gap-2 text-sm text-gray-700"
          >
            <span className="font-medium min-w-[80px] flex items-center gap-1">
              {detail.label}
            </span>
            <span className="text-gray-600">{detail.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

