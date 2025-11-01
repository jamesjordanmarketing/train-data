/**
 * Feedback Widget Component
 * 
 * Dashboard widget showing quality feedback summary:
 * - Overall approval rate
 * - Templates flagged for revision count
 * - Quality trend indicator (up/down/stable)
 * - Quick link to full feedback dashboard
 */

import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertTriangle, 
  ExternalLink,
  RefreshCw,
  CheckCircle
} from 'lucide-react';
import { fetchFeedbackSummary } from '../../lib/api/feedbackApi';
import { FeedbackSummary } from '../../lib/types';
import { useAppStore } from '../../stores/useAppStore';

export function FeedbackWidget() {
  const [summary, setSummary] = useState<FeedbackSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { setCurrentView } = useAppStore();

  useEffect(() => {
    loadSummary();
    
    // Refresh every 5 minutes
    const interval = setInterval(loadSummary, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const loadSummary = async () => {
    try {
      const data = await fetchFeedbackSummary('30d');
      setSummary(data);
    } catch (error) {
      console.error('Error loading feedback summary:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDashboard = () => {
    setCurrentView('feedback');
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Quality Feedback</h3>
          <RefreshCw className="h-4 w-4 text-gray-400 animate-spin" />
        </div>
        <div className="space-y-3">
          <div className="h-8 bg-gray-200 rounded animate-pulse" />
          <div className="h-8 bg-gray-200 rounded animate-pulse" />
          <div className="h-8 bg-gray-200 rounded animate-pulse" />
        </div>
      </Card>
    );
  }

  if (!summary) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Quality Feedback</h3>
        <p className="text-sm text-gray-500">Unable to load feedback data</p>
      </Card>
    );
  }

  const getTrendIcon = () => {
    switch (summary.quality_trend) {
      case 'up':
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-5 w-5 text-red-600" />;
      default:
        return <Minus className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTrendText = () => {
    switch (summary.quality_trend) {
      case 'up':
        return <span className="text-green-600">Improving</span>;
      case 'down':
        return <span className="text-red-600">Declining</span>;
      default:
        return <span className="text-gray-600">Stable</span>;
    }
  };

  const getTrendColor = () => {
    switch (summary.quality_trend) {
      case 'up':
        return 'bg-green-50 border-green-200';
      case 'down':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-blue-600" />
          Quality Feedback
        </h3>
        <Button variant="ghost" size="sm" onClick={loadSummary}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        {/* Approval Rate */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Overall Approval Rate</p>
            <p className="text-2xl font-bold">
              {summary.overall_approval_rate.toFixed(1)}%
            </p>
          </div>
          {summary.overall_approval_rate >= 85 ? (
            <CheckCircle className="h-8 w-8 text-green-600" />
          ) : (
            <AlertTriangle className="h-8 w-8 text-yellow-600" />
          )}
        </div>

        {/* Templates Flagged */}
        <div className={`p-3 rounded-lg border ${
          summary.templates_flagged > 0 
            ? 'bg-red-50 border-red-200' 
            : 'bg-green-50 border-green-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600 mb-1">Templates Flagged</p>
              <p className="text-xl font-bold">
                {summary.templates_flagged}
              </p>
            </div>
            {summary.templates_flagged > 0 ? (
              <AlertTriangle className="h-6 w-6 text-red-600" />
            ) : (
              <CheckCircle className="h-6 w-6 text-green-600" />
            )}
          </div>
          <p className="text-xs text-gray-600 mt-2">
            {summary.templates_flagged > 0 
              ? 'Require immediate attention' 
              : 'All templates performing well'}
          </p>
        </div>

        {/* Quality Trend */}
        <div className={`p-3 rounded-lg border ${getTrendColor()}`}>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-gray-600">Quality Trend</p>
            {getTrendIcon()}
          </div>
          <div className="flex items-center gap-2">
            <p className="text-lg font-semibold">{getTrendText()}</p>
            <Badge variant="outline" className="text-xs">
              Last {summary.time_window}
            </Badge>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t">
          <div>
            <p className="text-xs text-gray-600 mb-1">Total Reviews</p>
            <p className="text-lg font-semibold">
              {summary.total_reviews.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-1">Avg Quality</p>
            <p className="text-lg font-semibold">
              {summary.avg_quality_score.toFixed(1)}/10
            </p>
          </div>
        </div>

        {/* View Dashboard Link */}
        <Button 
          variant="outline" 
          className="w-full justify-between group"
          onClick={handleViewDashboard}
        >
          <span>View Full Dashboard</span>
          <ExternalLink className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>

      {/* Footer Note */}
      {summary.templates_flagged > 0 && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-xs text-gray-500 flex items-start gap-2">
            <AlertTriangle className="h-3 w-3 text-orange-600 mt-0.5 flex-shrink-0" />
            <span>
              Some templates have approval rates below 70% and need improvement.
            </span>
          </p>
        </div>
      )}
    </Card>
  );
}

