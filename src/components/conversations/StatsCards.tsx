/**
 * Stats Cards Component
 * 
 * Displays key metrics and statistics for conversations
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { ConversationStats } from '@/lib/types/conversations';

interface StatsCardsProps {
  stats: ConversationStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: 'Total Conversations',
      value: stats.total.toLocaleString(),
      icon: FileText,
      description: `${stats.byTier.template} templates, ${stats.byTier.scenario} scenarios`,
      trend: null,
    },
    {
      title: 'Approved',
      value: stats.byStatus.approved.toLocaleString(),
      icon: CheckCircle,
      description: `${(stats.approvalRate * 100).toFixed(1)}% approval rate`,
      trend: stats.approvalRate >= 0.8 ? 'up' : stats.approvalRate >= 0.5 ? 'stable' : 'down',
      color: 'text-green-600',
    },
    {
      title: 'Pending Review',
      value: stats.pendingReview.toLocaleString(),
      icon: Clock,
      description: `${stats.byStatus.needs_revision} need revision`,
      trend: null,
      color: 'text-yellow-600',
    },
    {
      title: 'Avg Quality Score',
      value: stats.avgQualityScore.toFixed(1),
      icon: TrendingUp,
      description: 'Average quality across all conversations',
      trend: stats.avgQualityScore >= 7 ? 'up' : stats.avgQualityScore >= 5 ? 'stable' : 'down',
      color: stats.avgQualityScore >= 7 ? 'text-blue-600' : 'text-orange-600',
    },
  ];

  const getTrendIcon = (trend: 'up' | 'down' | 'stable' | null) => {
    if (!trend) return null;
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'stable':
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${card.color || 'text-muted-foreground'}`} />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{card.value}</div>
                {getTrendIcon(card.trend as 'up' | 'down' | 'stable' | null)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {card.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

