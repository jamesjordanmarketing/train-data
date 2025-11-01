/**
 * Quality Feedback View
 * 
 * Main dashboard view for template performance analytics:
 * - Time window selector (7d, 30d, all)
 * - Summary statistics cards
 * - Template performance table
 * - Low-performing templates alert
 * - Actionable recommendations section
 */

import { useState, useEffect } from 'react';
import { TemplatePerformance, FeedbackSummary, FeedbackRecommendation } from '../../lib/types';
import { TemplatePerformanceTable } from '../feedback/TemplatePerformanceTable';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  Download,
  Lightbulb,
  BarChart3,
  Clock
} from 'lucide-react';
import { 
  fetchTemplateFeedback, 
  fetchFeedbackSummary, 
  fetchFeedbackRecommendations 
} from '../../lib/api/feedbackApi';

type TimeWindow = '7d' | '30d' | 'all';

export function QualityFeedbackView() {
  const [timeWindow, setTimeWindow] = useState<TimeWindow>('30d');
  const [templates, setTemplates] = useState<TemplatePerformance[]>([]);
  const [summary, setSummary] = useState<FeedbackSummary | null>(null);
  const [recommendations, setRecommendations] = useState<FeedbackRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    loadFeedbackData();
  }, [timeWindow]);

  const loadFeedbackData = async () => {
    setIsLoading(true);
    try {
      const [templatesData, summaryData, recommendationsData] = await Promise.all([
        fetchTemplateFeedback(timeWindow),
        fetchFeedbackSummary(timeWindow),
        fetchFeedbackRecommendations(),
      ]);
      
      setTemplates(templatesData);
      setSummary(summaryData);
      setRecommendations(recommendationsData);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error loading feedback data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    loadFeedbackData();
  };

  const handleExport = () => {
    const csvData = [
      ['Template', 'Tier', 'Usage', 'Avg Quality', 'Approval Rate', 'Performance', 'Trend'],
      ...templates.map(t => [
        t.template_name,
        t.tier,
        t.usage_count,
        t.avg_quality.toFixed(2),
        t.approval_rate.toFixed(1) + '%',
        t.performance,
        t.trend,
      ]),
    ];

    const csv = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `template-feedback-${timeWindow}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const lowPerformingTemplates = templates.filter(t => t.approval_rate < 70);

  if (isLoading && !summary) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600 text-lg">Loading feedback analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Quality Feedback Dashboard</h1>
          <p className="text-gray-600">
            Track template performance and identify areas for improvement
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-500 flex items-center gap-1">
            <Clock className="h-4 w-4" />
            Last updated: {lastRefresh.toLocaleTimeString()}
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Time Window Selector */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-gray-600" />
            <span className="font-medium">Time Period:</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant={timeWindow === '7d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeWindow('7d')}
            >
              Last 7 Days
            </Button>
            <Button
              variant={timeWindow === '30d' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeWindow('30d')}
            >
              Last 30 Days
            </Button>
            <Button
              variant={timeWindow === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeWindow('all')}
            >
              All Time
            </Button>
          </div>
        </div>
      </Card>

      {/* Summary Statistics Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Reviews</p>
                <p className="text-3xl font-bold">{summary.total_reviews.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-2">in {timeWindow}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Approval Rate</p>
                <p className="text-3xl font-bold">{summary.overall_approval_rate.toFixed(1)}%</p>
                <div className={`flex items-center gap-1 mt-2 text-xs ${
                  summary.quality_trend === 'up' ? 'text-green-600' : 
                  summary.quality_trend === 'down' ? 'text-red-600' : 
                  'text-gray-600'
                }`}>
                  {summary.quality_trend === 'up' ? (
                    <><TrendingUp className="h-3 w-3" /> Improving</>
                  ) : summary.quality_trend === 'down' ? (
                    <><TrendingDown className="h-3 w-3" /> Declining</>
                  ) : (
                    <>Stable</>
                  )}
                </div>
              </div>
              {summary.overall_approval_rate >= 85 ? (
                <CheckCircle className="h-8 w-8 text-green-600" />
              ) : (
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
              )}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Avg Quality Score</p>
                <p className="text-3xl font-bold">{summary.avg_quality_score.toFixed(1)}</p>
                <p className="text-xs text-gray-500 mt-2">out of 10</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-700 text-xl">
                ★
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Templates Flagged</p>
                <p className="text-3xl font-bold">{summary.templates_flagged}</p>
                <p className="text-xs text-gray-500 mt-2">require attention</p>
              </div>
              {summary.templates_flagged > 0 ? (
                <AlertTriangle className="h-8 w-8 text-red-600" />
              ) : (
                <CheckCircle className="h-8 w-8 text-green-600" />
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Low-Performing Templates Alert */}
      {lowPerformingTemplates.length > 0 && (
        <Card className="p-6 bg-red-50 border-red-200">
          <div className="flex items-start gap-4">
            <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 mb-2">
                Low-Performing Templates Detected
              </h3>
              <p className="text-sm text-red-800 mb-3">
                {lowPerformingTemplates.length} template{lowPerformingTemplates.length !== 1 ? 's have' : ' has'} an 
                approval rate below 70%. These templates should be reviewed and improved.
              </p>
              <div className="flex flex-wrap gap-2">
                {lowPerformingTemplates.map(t => (
                  <Badge key={t.template_id} variant="destructive">
                    {t.template_name} ({t.approval_rate.toFixed(1)}%)
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Recommendations Section */}
      {recommendations.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="h-6 w-6 text-yellow-600" />
            <h2 className="text-xl font-semibold">Actionable Recommendations</h2>
          </div>
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div 
                key={rec.template_id} 
                className="p-4 border rounded-lg bg-gradient-to-r from-yellow-50 to-transparent"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={
                        rec.priority === 'high' ? 'destructive' :
                        rec.priority === 'medium' ? 'default' :
                        'secondary'
                      }>
                        {rec.priority} priority
                      </Badge>
                      <h3 className="font-semibold">{rec.template_name}</h3>
                    </div>
                    <p className="text-sm text-red-600 font-medium mb-2">{rec.issue}</p>
                    <p className="text-sm text-gray-700 mb-3">{rec.recommendation}</p>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-600">Evidence:</p>
                      <ul className="text-xs text-gray-600 space-y-1 ml-4">
                        {rec.evidence.map((evidence, i) => (
                          <li key={i} className="list-disc">{evidence}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Template Performance Table */}
      <Card className="p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-1">Template Performance</h2>
          <p className="text-sm text-gray-600">
            Showing {templates.length} template{templates.length !== 1 ? 's' : ''} for {timeWindow}
          </p>
        </div>
        <TemplatePerformanceTable templates={templates} />
      </Card>

      {/* Footer Info */}
      <Card className="p-4 bg-gray-50">
        <div className="flex items-start gap-3">
          <div className="text-sm text-gray-600">
            <p className="font-medium mb-1">📊 Performance Thresholds:</p>
            <ul className="space-y-1 ml-4">
              <li>• <strong>High Performance:</strong> Approval rate ≥ 85%</li>
              <li>• <strong>Medium Performance:</strong> Approval rate 70-84%</li>
              <li>• <strong>Low Performance:</strong> Approval rate &lt; 70% (flagged for review)</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}

