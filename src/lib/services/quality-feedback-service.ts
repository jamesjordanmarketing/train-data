/**
 * Quality Feedback Service Layer
 * Business logic for aggregating and analyzing template performance
 * Provides insights into approval rates, quality trends, and identifies low-performing templates
 */

import { supabase } from '../supabase';
import type {
  AggregateFeedbackParams,
  TemplateFeedbackAggregate,
  TemplateFeedback,
  OverallFeedbackStats,
  FeedbackTrends,
  TimeWindow,
} from '../types/review.types';
import { calculatePerformance, timeWindowToInterval } from '../types/review.types';
import type { Template } from '../../../train-wireframe/src/lib/types';

// ============================================================================
// Template Feedback Aggregation
// ============================================================================

/**
 * Aggregate feedback by template with performance metrics
 * 
 * @param params - Time window and minimum usage filters
 * @returns Aggregated template feedback with overall statistics
 * 
 * @example
 * ```typescript
 * const feedback = await aggregateFeedbackByTemplate({
 *   timeWindow: '30d',
 *   minUsageCount: 5
 * });
 * console.log(feedback.templates); // Template performance data
 * console.log(feedback.overall_stats); // Overall statistics
 * ```
 */
export async function aggregateFeedbackByTemplate(
  params: AggregateFeedbackParams
): Promise<TemplateFeedbackAggregate> {
  const { timeWindow = '30d', minUsageCount = 5 } = params;

  try {
    // Calculate date threshold based on time window
    const interval = timeWindowToInterval(timeWindow);
    const dateThreshold = calculateDateThreshold(timeWindow);

    // Build the aggregation query
    // Note: This uses a raw SQL query via RPC for complex aggregation
    const { data, error } = await supabase.rpc('aggregate_template_feedback', {
      p_time_window: interval,
      p_min_usage_count: minUsageCount,
    });

    if (error) {
      console.error('RPC error, falling back to client-side aggregation:', error);
      // Fallback to client-side aggregation if RPC function doesn't exist
      return await aggregateFeedbackClientSide(timeWindow, minUsageCount);
    }

    // Process the aggregated data
    const templates: TemplateFeedback[] = (data || []).map((row: any) => {
      const approvalRate = row.approval_rate || 0;
      const avgQuality = row.avg_quality || 0;

      return {
        template_id: row.template_id,
        template_name: row.template_name,
        tier: row.tier,
        usage_count: row.usage_count,
        avg_quality: Math.round(avgQuality * 10) / 10,
        approved_count: row.approved_count,
        rejected_count: row.rejected_count,
        approval_rate: Math.round(approvalRate * 10) / 10,
        performance: calculatePerformance(approvalRate, avgQuality),
      };
    });

    // Calculate overall statistics
    const overall_stats = calculateOverallStats(templates);

    return {
      templates,
      overall_stats,
    };
  } catch (error) {
    console.error('Error in aggregateFeedbackByTemplate:', error);
    throw error;
  }
}

/**
 * Client-side aggregation fallback when database function is unavailable
 */
async function aggregateFeedbackClientSide(
  timeWindow: TimeWindow,
  minUsageCount: number
): Promise<TemplateFeedbackAggregate> {
  try {
    // Calculate date threshold
    const dateThreshold = calculateDateThreshold(timeWindow);

    // Fetch all templates
    const { data: templates, error: templatesError } = await supabase
      .from('templates')
      .select('id, name, tier');

    if (templatesError) throw templatesError;

    // Fetch conversations for the time window
    let conversationsQuery = supabase
      .from('conversations')
      .select('parent_id, status, quality_score, created_at');

    if (dateThreshold) {
      conversationsQuery = conversationsQuery.gte('created_at', dateThreshold);
    }

    const { data: conversations, error: conversationsError } =
      await conversationsQuery;

    if (conversationsError) throw conversationsError;

    // Group conversations by parent template ID
    const conversationsByTemplate = new Map<string, any[]>();
    (conversations || []).forEach((conv) => {
      if (conv.parent_id) {
        if (!conversationsByTemplate.has(conv.parent_id)) {
          conversationsByTemplate.set(conv.parent_id, []);
        }
        conversationsByTemplate.get(conv.parent_id)!.push(conv);
      }
    });

    // Calculate metrics for each template
    const templateFeedback: TemplateFeedback[] = [];

    (templates || []).forEach((template) => {
      const convs = conversationsByTemplate.get(template.id) || [];
      const usageCount = convs.length;

      // Skip if below minimum usage threshold
      if (usageCount < minUsageCount) return;

      const approvedCount = convs.filter((c) => c.status === 'approved').length;
      const rejectedCount = convs.filter((c) => c.status === 'rejected').length;
      const approvalRate =
        usageCount > 0 ? (approvedCount / usageCount) * 100 : 0;

      const qualityScores = convs
        .map((c) => c.quality_score)
        .filter((score): score is number => score !== null && score !== undefined);
      const avgQuality =
        qualityScores.length > 0
          ? qualityScores.reduce((sum, score) => sum + score, 0) /
            qualityScores.length
          : 0;

      templateFeedback.push({
        template_id: template.id,
        template_name: template.name,
        tier: template.tier,
        usage_count: usageCount,
        avg_quality: Math.round(avgQuality * 10) / 10,
        approved_count: approvedCount,
        rejected_count: rejectedCount,
        approval_rate: Math.round(approvalRate * 10) / 10,
        performance: calculatePerformance(approvalRate, avgQuality),
      });
    });

    // Sort by approval rate and avg quality (lowest first to identify problems)
    templateFeedback.sort((a, b) => {
      if (a.approval_rate !== b.approval_rate) {
        return a.approval_rate - b.approval_rate;
      }
      return a.avg_quality - b.avg_quality;
    });

    const overall_stats = calculateOverallStats(templateFeedback);

    return {
      templates: templateFeedback,
      overall_stats,
    };
  } catch (error) {
    console.error('Error in aggregateFeedbackClientSide:', error);
    throw error;
  }
}

/**
 * Calculate date threshold based on time window
 */
function calculateDateThreshold(timeWindow: TimeWindow): string | null {
  if (timeWindow === 'all') return null;

  const now = new Date();
  const days = timeWindow === '7d' ? 7 : 30;
  const threshold = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  return threshold.toISOString();
}

/**
 * Calculate overall statistics from template feedback
 */
function calculateOverallStats(
  templates: TemplateFeedback[]
): OverallFeedbackStats {
  const totalTemplates = templates.length;
  const lowPerformingCount = templates.filter(
    (t) => t.performance === 'low'
  ).length;

  const totalApprovals = templates.reduce(
    (sum, t) => sum + t.approved_count,
    0
  );
  const totalUsage = templates.reduce((sum, t) => sum + t.usage_count, 0);
  const avgApprovalRate =
    totalUsage > 0 ? (totalApprovals / totalUsage) * 100 : 0;

  return {
    total_templates: totalTemplates,
    low_performing_count: lowPerformingCount,
    avg_approval_rate: Math.round(avgApprovalRate * 10) / 10,
  };
}

// ============================================================================
// Low-Performing Template Identification
// ============================================================================

/**
 * Identify templates that are performing below threshold
 * 
 * @param threshold - Approval rate threshold (0-100)
 * @returns Array of low-performing templates
 * 
 * @example
 * ```typescript
 * const lowPerformers = await identifyLowPerformingTemplates(70);
 * console.log(`Found ${lowPerformers.length} templates below 70% approval rate`);
 * ```
 */
export async function identifyLowPerformingTemplates(
  threshold: number = 70
): Promise<TemplateFeedback[]> {
  try {
    // Get all template feedback
    const feedback = await aggregateFeedbackByTemplate({
      timeWindow: '30d',
      minUsageCount: 5,
    });

    // Filter for low performers
    const lowPerformers = feedback.templates.filter(
      (t) => t.approval_rate < threshold || t.avg_quality < 6
    );

    return lowPerformers;
  } catch (error) {
    console.error('Error in identifyLowPerformingTemplates:', error);
    throw error;
  }
}

// ============================================================================
// Feedback Trends Analysis
// ============================================================================

/**
 * Get feedback trends over time
 * Analyzes how template performance changes over time
 * 
 * @returns Trend data including daily metrics and template-specific trends
 */
export async function getFeedbackTrends(): Promise<FeedbackTrends> {
  try {
    // Get conversations from the last 30 days grouped by date
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: conversations, error } = await supabase
      .from('conversations')
      .select('created_at, status, quality_score, parent_id')
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Group by date
    const dailyMetrics = new Map<string, any>();
    const templateMetrics = new Map<string, any>();

    (conversations || []).forEach((conv) => {
      const date = conv.created_at.split('T')[0]; // Get date part only
      
      // Daily aggregation
      if (!dailyMetrics.has(date)) {
        dailyMetrics.set(date, {
          date,
          total: 0,
          approved: 0,
          qualitySum: 0,
          qualityCount: 0,
        });
      }

      const dayData = dailyMetrics.get(date)!;
      dayData.total += 1;
      if (conv.status === 'approved') dayData.approved += 1;
      if (conv.quality_score !== null && conv.quality_score !== undefined) {
        dayData.qualitySum += conv.quality_score;
        dayData.qualityCount += 1;
      }

      // Template-specific aggregation
      if (conv.parent_id) {
        if (!templateMetrics.has(conv.parent_id)) {
          templateMetrics.set(conv.parent_id, {
            total: 0,
            approved: 0,
            recent: { total: 0, approved: 0 },
            historical: { total: 0, approved: 0 },
          });
        }

        const templateData = templateMetrics.get(conv.parent_id)!;
        templateData.total += 1;
        if (conv.status === 'approved') templateData.approved += 1;

        // Split into recent (last 7 days) vs historical
        const convDate = new Date(conv.created_at);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        if (convDate >= sevenDaysAgo) {
          templateData.recent.total += 1;
          if (conv.status === 'approved') templateData.recent.approved += 1;
        } else {
          templateData.historical.total += 1;
          if (conv.status === 'approved') templateData.historical.approved += 1;
        }
      }
    });

    // Format daily trends
    const daily = Array.from(dailyMetrics.values()).map((day) => ({
      date: day.date,
      approvalRate: day.total > 0 ? (day.approved / day.total) * 100 : 0,
      avgQuality:
        day.qualityCount > 0 ? day.qualitySum / day.qualityCount : 0,
      count: day.total,
    }));

    // Format template trends
    const byTemplate: Record<string, any> = {};
    templateMetrics.forEach((data, templateId) => {
      const recentRate =
        data.recent.total > 0
          ? (data.recent.approved / data.recent.total) * 100
          : 0;
      const historicalRate =
        data.historical.total > 0
          ? (data.historical.approved / data.historical.total) * 100
          : 0;

      let trend: 'improving' | 'stable' | 'declining' = 'stable';
      const diff = recentRate - historicalRate;
      if (diff > 5) trend = 'improving';
      else if (diff < -5) trend = 'declining';

      byTemplate[templateId] = {
        trend,
        recentApprovalRate: Math.round(recentRate * 10) / 10,
        historicalApprovalRate: Math.round(historicalRate * 10) / 10,
      };
    });

    return {
      daily,
      byTemplate,
    };
  } catch (error) {
    console.error('Error in getFeedbackTrends:', error);
    throw error;
  }
}

// ============================================================================
// Template Performance Comparison
// ============================================================================

/**
 * Compare performance between two templates
 * 
 * @param templateId1 - First template ID
 * @param templateId2 - Second template ID
 * @returns Comparison metrics
 */
export async function compareTemplatePerformance(
  templateId1: string,
  templateId2: string
): Promise<{
  template1: TemplateFeedback | null;
  template2: TemplateFeedback | null;
  comparison: {
    betterPerformer: string | null;
    approvalRateDiff: number;
    qualityDiff: number;
  };
}> {
  try {
    const feedback = await aggregateFeedbackByTemplate({
      timeWindow: '30d',
      minUsageCount: 1,
    });

    const template1 = feedback.templates.find(
      (t) => t.template_id === templateId1
    ) || null;
    const template2 = feedback.templates.find(
      (t) => t.template_id === templateId2
    ) || null;

    const approvalRateDiff = template1 && template2
      ? template1.approval_rate - template2.approval_rate
      : 0;
    const qualityDiff = template1 && template2
      ? template1.avg_quality - template2.avg_quality
      : 0;

    let betterPerformer: string | null = null;
    if (template1 && template2) {
      if (approvalRateDiff > 5 || (Math.abs(approvalRateDiff) <= 5 && qualityDiff > 0.5)) {
        betterPerformer = templateId1;
      } else if (approvalRateDiff < -5 || (Math.abs(approvalRateDiff) <= 5 && qualityDiff < -0.5)) {
        betterPerformer = templateId2;
      }
    }

    return {
      template1,
      template2,
      comparison: {
        betterPerformer,
        approvalRateDiff: Math.round(approvalRateDiff * 10) / 10,
        qualityDiff: Math.round(qualityDiff * 10) / 10,
      },
    };
  } catch (error) {
    console.error('Error in compareTemplatePerformance:', error);
    throw error;
  }
}

/**
 * Get quality score distribution for a template
 * 
 * @param templateId - Template ID
 * @returns Distribution of quality scores in buckets
 */
export async function getTemplateQualityDistribution(
  templateId: string
): Promise<Array<{ range: string; count: number; percentage: number }>> {
  try {
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select('quality_score')
      .eq('parent_id', templateId);

    if (error) throw error;

    // Define quality buckets
    const buckets = [
      { range: '0-2', min: 0, max: 2 },
      { range: '2-4', min: 2, max: 4 },
      { range: '4-6', min: 4, max: 6 },
      { range: '6-8', min: 6, max: 8 },
      { range: '8-10', min: 8, max: 10 },
    ];

    const total = (conversations || []).length;
    const distribution = buckets.map((bucket) => {
      const count = (conversations || []).filter(
        (c) =>
          c.quality_score !== null &&
          c.quality_score !== undefined &&
          c.quality_score >= bucket.min &&
          c.quality_score < bucket.max
      ).length;

      return {
        range: bucket.range,
        count,
        percentage: total > 0 ? Math.round((count / total) * 1000) / 10 : 0,
      };
    });

    return distribution;
  } catch (error) {
    console.error('Error in getTemplateQualityDistribution:', error);
    throw error;
  }
}

