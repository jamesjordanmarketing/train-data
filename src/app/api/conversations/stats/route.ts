/**
 * API Route: /api/conversations/stats
 * 
 * Provides analytics and statistics for conversations
 */

import { NextRequest, NextResponse } from 'next/server';
import { conversationService } from '@/lib/conversation-service';
import { AppError } from '@/lib/types/errors';

/**
 * GET /api/conversations/stats
 * Get comprehensive conversation statistics
 * 
 * Returns:
 * - total: number
 * - byTier: Record<TierType, number>
 * - byStatus: Record<ConversationStatus, number>
 * - avgQualityScore: number
 * - totalTokens: number
 * - totalCost: number
 * - avgTurnsPerConversation: number
 * - approvalRate: number
 * - pendingReview: number
 * - qualityDistribution: QualityDistribution
 * 
 * Example response:
 * ```json
 * {
 *   "total": 150,
 *   "byTier": {
 *     "template": 40,
 *     "scenario": 35,
 *     "edge_case": 75
 *   },
 *   "byStatus": {
 *     "draft": 10,
 *     "generated": 20,
 *     "pending_review": 30,
 *     "approved": 80,
 *     "rejected": 10,
 *     "needs_revision": 0,
 *     "none": 0,
 *     "failed": 0
 *   },
 *   "avgQualityScore": 7.8,
 *   "totalTokens": 450000,
 *   "totalCost": 135.50,
 *   "avgTurnsPerConversation": 12.3,
 *   "approvalRate": 0.89,
 *   "pendingReview": 30,
 *   "qualityDistribution": {
 *     "excellent": 45,
 *     "good": 80,
 *     "fair": 20,
 *     "poor": 5
 *   }
 * }
 * ```
 */
export async function GET(request: NextRequest) {
  try {
    // Get basic stats
    const stats = await conversationService.getStats();
    
    // Get quality distribution
    const qualityDistribution = await conversationService.getQualityDistribution();

    // Combine results
    const response = {
      ...stats,
      qualityDistribution,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Error in GET /api/conversations/stats:', error);
    
    if (error instanceof AppError) {
      return NextResponse.json(error.toJSON(), { status: error.statusCode });
    }

    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to fetch conversation stats' },
      { status: 500 }
    );
  }
}

