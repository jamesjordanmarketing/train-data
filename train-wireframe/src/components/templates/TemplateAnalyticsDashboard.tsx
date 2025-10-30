/**
 * Template Analytics Dashboard
 * 
 * Displays comprehensive analytics for template performance:
 * - Usage statistics table
 * - Quality trend charts
 * - Side-by-side comparison view
 * - Top performer recommendations
 * - CSV export functionality
 */

import React, { useState, useEffect } from 'react';
import { 
  TemplateAnalytics, 
  AnalyticsSummary, 
  TierType 
} from '../../lib/types';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface TemplateAnalyticsDashboardProps {
  onClose?: () => void;
}

const COLORS = {
  template: '#3b82f6',
  scenario: '#10b981',
  edge_case: '#f59e0b',
};

export const TemplateAnalyticsDashboard: React.FC<TemplateAnalyticsDashboardProps> = ({
  onClose,
}) => {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [analytics, setAnalytics] = useState<TemplateAnalytics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<TierType | 'all'>('all');
  const [sortBy, setSortBy] = useState<'usageCount' | 'avgQualityScore' | 'approvalRate'>('usageCount');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch analytics data
  useEffect(() => {
    fetchAnalytics();
  }, [selectedTier]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const tierParam = selectedTier !== 'all' ? `?tier=${selectedTier}` : '';
      const response = await fetch(`/api/templates/analytics${tierParam}`);

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      setSummary(data.summary);
      setAnalytics(data.analytics || []);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and sort analytics
  const filteredAnalytics = analytics
    .filter(a => {
      if (searchQuery) {
        return a.templateName.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    })
    .sort((a, b) => {
      const multiplier = sortOrder === 'asc' ? 1 : -1;
      return (a[sortBy] - b[sortBy]) * multiplier;
    });

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'Template Name',
      'Tier',
      'Usage Count',
      'Avg Quality Score',
      'Approval Rate (%)',
      'Success Rate (%)',
      'Trend',
      'Last Used',
    ];

    const rows = filteredAnalytics.map(a => [
      a.templateName,
      a.tier,
      a.usageCount,
      a.avgQualityScore.toFixed(2),
      a.approvalRate.toFixed(1),
      a.successRate.toFixed(1),
      a.trend,
      new Date(a.lastUsed).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `template-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Prepare chart data
  const usageByTierData = summary ? [
    { name: 'Templates', value: summary.usageByTier.template, color: COLORS.template },
    { name: 'Scenarios', value: summary.usageByTier.scenario, color: COLORS.scenario },
    { name: 'Edge Cases', value: summary.usageByTier.edge_case, color: COLORS.edge_case },
  ] : [];

  const qualityByTierData = summary ? [
    { name: 'Templates', quality: summary.qualityByTier.template * 100 },
    { name: 'Scenarios', quality: summary.qualityByTier.scenario * 100 },
    { name: 'Edge Cases', quality: summary.qualityByTier.edge_case * 100 },
  ] : [];

  // Render trend indicator
  const renderTrendIndicator = (trend: 'improving' | 'stable' | 'declining') => {
    const icons = {
      improving: { icon: '📈', color: 'text-green-600', bg: 'bg-green-50' },
      stable: { icon: '➡️', color: 'text-gray-600', bg: 'bg-gray-50' },
      declining: { icon: '📉', color: 'text-red-600', bg: 'bg-red-50' },
    };

    const config = icons[trend];
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color} ${config.bg}`}>
        {config.icon} {trend}
      </span>
    );
  };

  if (isLoading && !summary) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Template Analytics</h1>
            <p className="text-gray-600 mt-1">Performance insights and usage statistics</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExportCSV}
              disabled={filteredAnalytics.length === 0}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export CSV
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">❌ {error}</p>
        </div>
      )}

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Total Templates</p>
            <p className="text-3xl font-bold text-gray-900">{summary.totalTemplates}</p>
            <p className="text-xs text-gray-500 mt-1">{summary.activeTemplates} active</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Total Usage</p>
            <p className="text-3xl font-bold text-gray-900">{summary.totalUsage.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">conversations generated</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Avg Quality Score</p>
            <p className="text-3xl font-bold text-gray-900">
              {(summary.avgQualityScore * 100).toFixed(0)}%
            </p>
            <p className="text-xs text-gray-500 mt-1">across all templates</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm text-gray-600 mb-1">Best Performer</p>
            <p className="text-lg font-bold text-gray-900 truncate">
              {summary.topPerformers[0]?.templateName || 'N/A'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {summary.topPerformers[0] ? `${(summary.topPerformers[0].avgQualityScore * 100).toFixed(0)}% quality` : ''}
            </p>
          </div>
        </div>
      )}

      {/* Charts */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Usage by Tier */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage by Tier</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={usageByTierData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {usageByTierData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Quality by Tier */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quality by Tier</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={qualityByTierData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                <Bar dataKey="quality" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Top Performers */}
      {summary && summary.topPerformers.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🏆 Top Performers</h3>
          <div className="space-y-3">
            {summary.topPerformers.map((template, index) => (
              <div key={template.templateId} className="flex items-center gap-4 p-3 bg-gradient-to-r from-yellow-50 to-transparent rounded-lg">
                <div className="text-2xl font-bold text-yellow-600 w-8">#{index + 1}</div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{template.templateName}</p>
                  <p className="text-xs text-gray-600">
                    {template.tier} • {template.usageCount} uses
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">
                    {(template.avgQualityScore * 100).toFixed(0)}%
                  </p>
                  <p className="text-xs text-gray-600">quality</p>
                </div>
                {renderTrendIndicator(template.trend)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search */}
          <div className="flex-1 min-w-64">
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Tier Filter */}
          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value as TierType | 'all')}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Tiers</option>
            <option value="template">Templates</option>
            <option value="scenario">Scenarios</option>
            <option value="edge_case">Edge Cases</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="usageCount">Usage Count</option>
            <option value="avgQualityScore">Quality Score</option>
            <option value="approvalRate">Approval Rate</option>
          </select>

          {/* Sort Order */}
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
          </button>

          {/* Refresh */}
          <button
            onClick={fetchAnalytics}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Analytics Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Template Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tier
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usage
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Quality
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Approval Rate
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trend
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Used
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAnalytics.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No templates found matching your filters
                  </td>
                </tr>
              ) : (
                filteredAnalytics.map((template) => (
                  <tr key={template.templateId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{template.templateName}</div>
                      {template.topParameters && template.topParameters.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          Top params: {template.topParameters.map(p => p.name).join(', ')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        template.tier === 'template' ? 'bg-blue-100 text-blue-800' :
                        template.tier === 'scenario' ? 'bg-green-100 text-green-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {template.tier}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="text-sm font-semibold text-gray-900">{template.usageCount}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className={`text-sm font-semibold ${
                        template.avgQualityScore >= 0.8 ? 'text-green-600' :
                        template.avgQualityScore >= 0.6 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {(template.avgQualityScore * 100).toFixed(0)}%
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="text-sm text-gray-900">{template.approvalRate.toFixed(1)}%</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {renderTrendIndicator(template.trend)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {new Date(template.lastUsed).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(template.lastUsed).toLocaleTimeString()}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="mt-4 text-sm text-gray-600 text-center">
        Showing {filteredAnalytics.length} of {analytics.length} templates
      </div>
    </div>
  );
};

