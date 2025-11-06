/**
 * Template Analytics API
 * 
 * GET /api/templates/analytics - Get analytics for all templates
 * GET /api/templates/analytics?templateId={id} - Get analytics for specific template
 * 
 * Calculates:
 * - Usage statistics per template
 * - Average quality scores
 * - Approval rates
 * - Time-series trend data
 * - Top performers per tier
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../lib/supabase-server';
import { TemplateService } from '../../../../lib/template-service';

/**
 * Calculate trend based on recent quality scores
 */
function calculateTrend(recentScores: number[]): 'improving' | 'stable' | 'declining' {
  if (recentScores.length < 2) return 'stable';
  
  // Compare first half vs second half
  const midpoint = Math.floor(recentScores.length / 2);
  const firstHalf = recentScores.slice(0, midpoint);
  const secondHalf = recentScores.slice(midpoint);
  
  const firstAvg = firstHalf.reduce((sum, score) => sum + score, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, score) => sum + score, 0) / secondHalf.length;
  
  const change = ((secondAvg - firstAvg) / firstAvg) * 100;
  
  if (change > 5) return 'improving';
  if (change < -5) return 'declining';
  return 'stable';
}

/**
 * GET /api/templates/analytics
 * Get analytics for templates
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get('templateId');
    const tier = searchParams.get('tier');

    const supabase = createServerSupabaseClient();
    const templateService = new TemplateService(supabase);

    // Fetch specific template or all templates
    let templates: any[];
    if (templateId) {
      const template = await templateService.getTemplateById(templateId);
      if (!template) {
        return NextResponse.json(
          { error: 'Template not found' },
          { status: 404 }
        );
      }
      templates = [template];
    } else {
      const filters = tier ? { tier, isActive: true } : { isActive: true };
      templates = await templateService.getAllTemplates(filters);
    }

    // Build analytics for each template
    const analyticsPromises = templates.map(async (template) => {
      // Fetch conversations generated from this template
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select('id, status, quality_score, created_at, parameters, updated_at')
        .eq('parent_id', template.id)
        .eq('parent_type', 'template')
        .order('created_at', { ascending: false });

      if (error) {
        console.error(`Error fetching conversations for template ${template.id}:`, error);
        return null;
      }

      const totalConversations = conversations?.length || 0;
      const approvedConversations = conversations?.filter(c => c.status === 'approved').length || 0;
      const qualityScores = conversations
        ?.filter(c => c.quality_score !== null && c.quality_score !== undefined)
        .map(c => c.quality_score) || [];

      // Calculate metrics
      const avgQualityScore = qualityScores.length > 0
        ? qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length
        : 0;

      const approvalRate = totalConversations > 0
        ? (approvedConversations / totalConversations) * 100
        : 0;

      // Calculate trend from recent scores
      const recentScores = qualityScores.slice(0, Math.min(10, qualityScores.length));
      const trend = calculateTrend(recentScores);

      // Find last used timestamp
      const lastUsed = conversations && conversations.length > 0
        ? conversations[0].created_at
        : template.lastModified || template.createdAt || new Date().toISOString();

      // Calculate parameter usage frequency
      const parameterUsage: Record<string, number> = {};
      conversations?.forEach(conv => {
        if (conv.parameters && typeof conv.parameters === 'object') {
          Object.keys(conv.parameters).forEach(paramName => {
            parameterUsage[paramName] = (parameterUsage[paramName] || 0) + 1;
          });
        }
      });

      // Get top 3 most used parameters
      const topParameters = Object.entries(parameterUsage)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([name, frequency]) => ({ name, frequency }));

      return {
        templateId: template.id,
        templateName: template.name,
        tier: template.tier || 'template',
        usageCount: totalConversations,
        avgQualityScore: Math.round(avgQualityScore * 100) / 100,
        approvalRate: Math.round(approvalRate * 10) / 10,
        avgExecutionTime: 0, // TODO: Track execution time in conversations table
        successRate: approvalRate, // Using approval rate as success rate proxy
        trend,
        lastUsed,
        topParameters: topParameters.length > 0 ? topParameters : undefined,
      };
    });

    const analytics = (await Promise.all(analyticsPromises)).filter(a => a !== null);

    // If requesting single template, return just that template's analytics
    if (templateId) {
      return NextResponse.json(analytics[0] || {});
    }

    // Build summary statistics
    const totalTemplates = analytics.length;
    const totalUsage = analytics.reduce((sum, a) => sum + a.usageCount, 0);
    const avgQualityScore = totalTemplates > 0
      ? analytics.reduce((sum, a) => sum + a.avgQualityScore * a.usageCount, 0) / totalUsage
      : 0;

    // Get top and bottom performers (by quality score)
    const sortedByQuality = [...analytics].sort((a, b) => b.avgQualityScore - a.avgQualityScore);
    const topPerformers = sortedByQuality.slice(0, 5);
    const bottomPerformers = sortedByQuality.slice(-5).reverse();

    // Calculate usage by tier
    const usageByTier = {
      template: 0,
      scenario: 0,
      edge_case: 0,
    };
    const qualityByTier = {
      template: { total: 0, count: 0 },
      scenario: { total: 0, count: 0 },
      edge_case: { total: 0, count: 0 },
    };

    analytics.forEach(a => {
      const tierKey = a.tier as keyof typeof usageByTier;
      usageByTier[tierKey] += a.usageCount;
      qualityByTier[tierKey].total += a.avgQualityScore * a.usageCount;
      qualityByTier[tierKey].count += a.usageCount;
    });

    const qualityByTierFinal = {
      template: qualityByTier.template.count > 0
        ? Math.round((qualityByTier.template.total / qualityByTier.template.count) * 100) / 100
        : 0,
      scenario: qualityByTier.scenario.count > 0
        ? Math.round((qualityByTier.scenario.total / qualityByTier.scenario.count) * 100) / 100
        : 0,
      edge_case: qualityByTier.edge_case.count > 0
        ? Math.round((qualityByTier.edge_case.total / qualityByTier.edge_case.count) * 100) / 100
        : 0,
    };

    const summary = {
      totalTemplates,
      activeTemplates: templates.length,
      totalUsage,
      avgQualityScore: Math.round(avgQualityScore * 100) / 100,
      topPerformers,
      bottomPerformers,
      usageByTier,
      qualityByTier: qualityByTierFinal,
    };

    return NextResponse.json({
      summary,
      analytics,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error fetching template analytics:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to fetch analytics'
      },
      { status: 500 }
    );
  }
}

/**
 * GET performance metrics for a specific template
 */
// Helper moved to '@/lib/services/template-analytics' to keep this route exporting only HTTP handlers

