/**
 * Feedback API
 * Mock API functions for fetching template performance and feedback analytics
 */

import { 
  TemplatePerformance, 
  FeedbackSummary, 
  FeedbackRecommendation,
  PerformanceLevel,
  TierType 
} from '../types';

// Mock data generator
function generateMockTemplatePerformance(timeWindow: string): TemplatePerformance[] {
  const templates = [
    {
      template_id: 'template-1',
      template_name: 'Customer Support Best Practices',
      tier: 'template' as TierType,
      usage_count: 156,
      avg_quality: 8.7,
      approval_rate: 92.3,
      rejection_rate: 4.5,
      revision_rate: 3.2,
    },
    {
      template_id: 'template-2',
      template_name: 'Technical Troubleshooting',
      tier: 'template' as TierType,
      usage_count: 203,
      avg_quality: 8.9,
      approval_rate: 94.1,
      rejection_rate: 3.4,
      revision_rate: 2.5,
    },
    {
      template_id: 'template-3',
      template_name: 'Product Feature Explanation',
      tier: 'scenario' as TierType,
      usage_count: 89,
      avg_quality: 7.2,
      approval_rate: 78.5,
      rejection_rate: 12.4,
      revision_rate: 9.1,
    },
    {
      template_id: 'template-4',
      template_name: 'Onboarding Guidance',
      tier: 'template' as TierType,
      usage_count: 134,
      avg_quality: 8.4,
      approval_rate: 88.8,
      rejection_rate: 6.7,
      revision_rate: 4.5,
    },
    {
      template_id: 'template-5',
      template_name: 'Error Recovery Strategies',
      tier: 'edge_case' as TierType,
      usage_count: 67,
      avg_quality: 6.8,
      approval_rate: 65.7,
      rejection_rate: 20.9,
      revision_rate: 13.4,
    },
    {
      template_id: 'template-6',
      template_name: 'Data Privacy Inquiry',
      tier: 'scenario' as TierType,
      usage_count: 98,
      avg_quality: 8.1,
      approval_rate: 85.7,
      rejection_rate: 8.2,
      revision_rate: 6.1,
    },
    {
      template_id: 'template-7',
      template_name: 'Account Migration',
      tier: 'edge_case' as TierType,
      usage_count: 45,
      avg_quality: 7.5,
      approval_rate: 80.0,
      rejection_rate: 11.1,
      revision_rate: 8.9,
    },
    {
      template_id: 'template-8',
      template_name: 'Billing Dispute Resolution',
      tier: 'template' as TierType,
      usage_count: 112,
      avg_quality: 8.2,
      approval_rate: 86.6,
      rejection_rate: 7.1,
      revision_rate: 6.3,
    },
  ];

  return templates.map(t => ({
    ...t,
    performance: (t.approval_rate >= 85 ? 'high' : t.approval_rate >= 70 ? 'medium' : 'low') as PerformanceLevel,
    trend: (t.avg_quality >= 8.5 ? 'improving' : t.avg_quality >= 7.5 ? 'stable' : 'declining') as 'improving' | 'stable' | 'declining',
    feedback_categories: {
      content_accuracy: Math.floor(Math.random() * 20) + 5,
      emotional_intelligence: Math.floor(Math.random() * 15) + 3,
      turn_quality: Math.floor(Math.random() * 18) + 4,
      format_issues: Math.floor(Math.random() * 12) + 2,
    },
    last_used: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
  }));
}

function generateMockFeedbackSummary(timeWindow: string): FeedbackSummary {
  return {
    total_reviews: 904,
    overall_approval_rate: 86.5,
    avg_quality_score: 8.1,
    templates_flagged: 2,
    quality_trend: 'up',
    time_window: timeWindow,
  };
}

function generateMockRecommendations(): FeedbackRecommendation[] {
  return [
    {
      template_id: 'template-5',
      template_name: 'Error Recovery Strategies',
      issue: 'Low approval rate (65.7%)',
      recommendation: 'Review error handling flow - conversations lack clear recovery steps. Consider adding more structured diagnostic questions.',
      priority: 'high',
      evidence: [
        '21% rejection rate (highest across all templates)',
        'Users report unclear guidance in 15 conversations',
        'Missing standardized error categorization',
      ],
    },
    {
      template_id: 'template-3',
      template_name: 'Product Feature Explanation',
      issue: 'Below target approval rate (78.5%)',
      recommendation: 'Simplify technical explanations and add more real-world examples. Users reported complexity issues in feedback.',
      priority: 'high',
      evidence: [
        'Approval rate below 80% threshold',
        '12.4% rejection rate',
        '23 instances flagged for "too technical"',
      ],
    },
    {
      template_id: 'template-7',
      template_name: 'Account Migration',
      issue: 'Moderate approval rate (80.0%)',
      recommendation: 'Add step-by-step migration checklist and address edge cases for data loss concerns.',
      priority: 'medium',
      evidence: [
        'Borderline performance (80% vs 85% target)',
        '8 revisions requested for completeness',
        'Users want more reassurance about data safety',
      ],
    },
  ];
}

/**
 * Fetch template performance metrics for a given time window
 */
export async function fetchTemplateFeedback(timeWindow: string = '30d'): Promise<TemplatePerformance[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  return generateMockTemplatePerformance(timeWindow);
}

/**
 * Fetch feedback summary statistics
 */
export async function fetchFeedbackSummary(timeWindow: string = '30d'): Promise<FeedbackSummary> {
  await new Promise(resolve => setTimeout(resolve, 200));
  return generateMockFeedbackSummary(timeWindow);
}

/**
 * Fetch actionable recommendations for low-performing templates
 */
export async function fetchFeedbackRecommendations(): Promise<FeedbackRecommendation[]> {
  await new Promise(resolve => setTimeout(resolve, 250));
  return generateMockRecommendations();
}

/**
 * Fetch feedback for a specific template
 */
export async function fetchTemplateDetailedFeedback(templateId: string): Promise<TemplatePerformance | null> {
  const allTemplates = await fetchTemplateFeedback('all');
  return allTemplates.find(t => t.template_id === templateId) || null;
}

