/**
 * Template Performance Table Component
 * 
 * Displays a sortable table showing template performance metrics including:
 * - Usage count
 * - Average quality score
 * - Approval rate
 * - Performance level
 * - Trend indicators
 */

import { useState, useMemo } from 'react';
import { TemplatePerformance } from '../../lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Badge } from '../ui/badge';
import { ChevronUp, ChevronDown, TrendingUp, TrendingDown, Minus, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/button';

interface TemplatePerformanceTableProps {
  templates: TemplatePerformance[];
}

type SortConfig = {
  key: keyof TemplatePerformance | null;
  direction: 'asc' | 'desc';
};

/**
 * Badge component for quality scores
 */
function QualityBadge({ score }: { score: number }) {
  const getColor = () => {
    if (score >= 8.5) return 'bg-green-100 text-green-800 border-green-300';
    if (score >= 7.0) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  return (
    <Badge variant="outline" className={`${getColor()} font-semibold`}>
      {score.toFixed(1)}
    </Badge>
  );
}

/**
 * Badge component for performance level
 */
function PerformanceBadge({ level }: { level: 'high' | 'medium' | 'low' }) {
  const config = {
    high: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300', label: 'High', icon: '🎯' },
    medium: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300', label: 'Medium', icon: '⚠️' },
    low: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300', label: 'Low', icon: '🔴' },
  };

  const { bg, text, border, label, icon } = config[level];

  return (
    <Badge variant="outline" className={`${bg} ${text} ${border} font-medium`}>
      {icon} {label}
    </Badge>
  );
}

/**
 * Trend indicator component
 */
function TrendIndicator({ trend }: { trend: 'improving' | 'stable' | 'declining' }) {
  const config = {
    improving: { icon: TrendingUp, color: 'text-green-600', label: 'Improving' },
    stable: { icon: Minus, color: 'text-gray-600', label: 'Stable' },
    declining: { icon: TrendingDown, color: 'text-red-600', label: 'Declining' },
  };

  const { icon: Icon, color, label } = config[trend];

  return (
    <div className={`flex items-center gap-1 ${color}`}>
      <Icon className="h-4 w-4" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

/**
 * Tier badge component
 */
function TierBadge({ tier }: { tier: string }) {
  const getColor = () => {
    switch (tier) {
      case 'template': return 'default';
      case 'scenario': return 'secondary';
      case 'edge_case': return 'destructive';
      default: return 'outline';
    }
  };

  return <Badge variant={getColor()}>{tier}</Badge>;
}

export function TemplatePerformanceTable({ templates }: TemplatePerformanceTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'usage_count', direction: 'desc' });

  // Sort templates
  const sortedTemplates = useMemo(() => {
    if (!sortConfig.key) return templates;

    return [...templates].sort((a, b) => {
      const aVal = a[sortConfig.key!];
      const bVal = b[sortConfig.key!];

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortConfig.direction === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return 0;
    });
  }, [templates, sortConfig]);

  const handleSort = (key: keyof TemplatePerformance) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const SortIcon = ({ column }: { column: keyof TemplatePerformance }) => {
    if (sortConfig.key !== column) {
      return <span className="ml-1 text-gray-400">⇅</span>;
    }
    return sortConfig.direction === 'asc' ? (
      <ChevronUp className="ml-1 h-4 w-4 inline" />
    ) : (
      <ChevronDown className="ml-1 h-4 w-4 inline" />
    );
  };

  if (templates.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 border rounded-lg bg-gray-50">
        <p className="text-lg">No template performance data available</p>
        <p className="text-sm mt-2">Generate conversations to see template analytics</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead
              onClick={() => handleSort('template_name')}
              className="cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center">
                Template
                <SortIcon column="template_name" />
              </div>
            </TableHead>
            <TableHead>
              Tier
            </TableHead>
            <TableHead
              onClick={() => handleSort('usage_count')}
              className="cursor-pointer hover:bg-gray-100 transition-colors text-center"
            >
              <div className="flex items-center justify-center">
                Usage
                <SortIcon column="usage_count" />
              </div>
            </TableHead>
            <TableHead
              onClick={() => handleSort('avg_quality')}
              className="cursor-pointer hover:bg-gray-100 transition-colors text-center"
            >
              <div className="flex items-center justify-center">
                Avg Quality
                <SortIcon column="avg_quality" />
              </div>
            </TableHead>
            <TableHead
              onClick={() => handleSort('approval_rate')}
              className="cursor-pointer hover:bg-gray-100 transition-colors text-center"
            >
              <div className="flex items-center justify-center">
                Approval Rate
                <SortIcon column="approval_rate" />
              </div>
            </TableHead>
            <TableHead
              onClick={() => handleSort('performance')}
              className="cursor-pointer hover:bg-gray-100 transition-colors text-center"
            >
              <div className="flex items-center justify-center">
                Performance
                <SortIcon column="performance" />
              </div>
            </TableHead>
            <TableHead className="text-center">
              Trend
            </TableHead>
            <TableHead className="text-center">
              Issues
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTemplates.map((template) => {
            const isLowPerforming = template.approval_rate < 70;
            
            return (
              <TableRow 
                key={template.template_id} 
                className={`hover:bg-gray-50 ${isLowPerforming ? 'bg-red-50' : ''}`}
              >
                <TableCell className="font-medium max-w-xs">
                  <div className="flex items-center gap-2">
                    {isLowPerforming && (
                      <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
                    )}
                    <div className="truncate" title={template.template_name}>
                      {template.template_name}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <TierBadge tier={template.tier} />
                </TableCell>
                <TableCell className="text-center">
                  <span className="font-mono text-sm font-medium">
                    {template.usage_count}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <QualityBadge score={template.avg_quality} />
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span className={`font-semibold ${
                      template.approval_rate >= 85 ? 'text-green-600' :
                      template.approval_rate >= 70 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {template.approval_rate.toFixed(1)}%
                    </span>
                    <div className="text-xs text-gray-500">
                      {template.rejection_rate.toFixed(1)}% ❌
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <PerformanceBadge level={template.performance} />
                </TableCell>
                <TableCell className="text-center">
                  <TrendIndicator trend={template.trend} />
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex flex-col gap-1 text-xs">
                    {Object.entries(template.feedback_categories).map(([category, count]) => {
                      if (count > 10) {
                        return (
                          <span key={category} className="text-orange-600 font-medium">
                            {category.replace(/_/g, ' ')}: {count}
                          </span>
                        );
                      }
                      return null;
                    }).filter(Boolean).length > 0 ? (
                      Object.entries(template.feedback_categories).map(([category, count]) => {
                        if (count > 10) {
                          return (
                            <span key={category} className="text-orange-600 font-medium">
                              {category.replace(/_/g, ' ')}: {count}
                            </span>
                          );
                        }
                        return null;
                      })
                    ) : (
                      <span className="text-gray-400">None</span>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

