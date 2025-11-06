/**
 * Template Analytics Service Helpers
 *
 * Provides performance metrics computation for templates.
 */

export async function getTemplatePerformanceMetrics(
  templateId: string,
  supabase: any
): Promise<{
  totalTests: number;
  successfulTests: number;
  failedTests: number;
  avgQualityScore: number;
  qualityTrend: Array<{ date: string; avgScore: number; count: number }>;
  parameterUsage: Record<string, number>;
}> {
  try {
    const { data: conversations } = await supabase
      .from('conversations')
      .select('id, status, quality_score, quality_metrics, created_at, parameters')
      .eq('parent_id', templateId)
      .eq('parent_type', 'template')
      .order('created_at', { ascending: true });

    if (!conversations) {
      return {
        totalTests: 0,
        successfulTests: 0,
        failedTests: 0,
        avgQualityScore: 0,
        qualityTrend: [],
        parameterUsage: {},
      };
    }

    const totalTests = conversations.length;
    const successfulTests = conversations.filter((c: any) =>
      c.status === 'approved' || c.status === 'generated'
    ).length;
    const failedTests = conversations.filter((c: any) =>
      c.status === 'rejected' || c.status === 'failed'
    ).length;

    const qualityScores = conversations
      .filter((c: any) => c.quality_score !== null && c.quality_score !== undefined)
      .map((c: any) => c.quality_score);

    const avgQualityScore = qualityScores.length > 0
      ? qualityScores.reduce((sum: number, score: number) => sum + score, 0) / qualityScores.length
      : 0;

    // Build quality trend (group by week)
    const qualityTrend: Array<{ date: string; avgScore: number; count: number }> = [];
    const weeklyGroups = new Map<string, number[]>();

    conversations.forEach((conv: any) => {
      if (conv.quality_score !== null && conv.quality_score !== undefined) {
        const date = new Date(conv.created_at);
        const weekStart = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay());
        const weekKey = weekStart.toISOString().split('T')[0];

        if (!weeklyGroups.has(weekKey)) {
          weeklyGroups.set(weekKey, []);
        }
        weeklyGroups.get(weekKey)!.push(conv.quality_score);
      }
    });

    weeklyGroups.forEach((scores, date) => {
      const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      qualityTrend.push({
        date,
        avgScore: Math.round(avgScore * 100) / 100,
        count: scores.length,
      });
    });

    // Calculate parameter usage
    const parameterUsage: Record<string, number> = {};
    conversations.forEach((conv: any) => {
      if (conv.parameters && typeof conv.parameters === 'object') {
        Object.keys(conv.parameters).forEach((paramName) => {
          parameterUsage[paramName] = (parameterUsage[paramName] || 0) + 1;
        });
      }
    });

    return {
      totalTests,
      successfulTests,
      failedTests,
      avgQualityScore: Math.round(avgQualityScore * 100) / 100,
      qualityTrend: qualityTrend.sort((a, b) => a.date.localeCompare(b.date)),
      parameterUsage,
    };
  } catch (error) {
    console.error('Error calculating performance metrics:', error);
    throw error;
  }
}