/**
 * Auto-Flagging System
 * 
 * Automatically flags low-quality conversations and updates their status
 */

import { QualityScore } from './types';
import { ConversationService } from '../conversation-service';

export interface AutoFlagResult {
  conversationId: string;
  wasFlagged: boolean;
  previousStatus: string;
  newStatus: string;
  qualityScore: number;
  reason: string;
  timestamp: string;
}

export interface FlagOptions {
  threshold?: number; // Default: 6.0
  updateStatus?: boolean; // Default: true
  addReviewNote?: boolean; // Default: true
}

export class AutoFlagger {
  private conversationService: ConversationService;
  private readonly DEFAULT_THRESHOLD = 6.0;

  constructor() {
    this.conversationService = new ConversationService();
  }

  /**
   * Evaluate and potentially flag a conversation based on quality score
   */
  async evaluateAndFlag(
    conversationId: string,
    qualityScore: QualityScore,
    options: FlagOptions = {}
  ): Promise<AutoFlagResult> {
    const {
      threshold = this.DEFAULT_THRESHOLD,
      updateStatus = true,
      addReviewNote = true,
    } = options;

    const shouldFlag = qualityScore.overall < threshold;

    // Get current conversation
    const conversation = await this.conversationService.getById(conversationId);
    if (!conversation) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    const result: AutoFlagResult = {
      conversationId,
      wasFlagged: shouldFlag,
      previousStatus: conversation.status,
      newStatus: conversation.status,
      qualityScore: qualityScore.overall,
      reason: shouldFlag
        ? `Automatically flagged due to low quality score (${qualityScore.overall}/10)`
        : 'Quality score meets threshold',
      timestamp: new Date().toISOString(),
    };

    // Only update if flagging is needed and enabled
    if (shouldFlag && updateStatus) {
      await this.flagConversation(conversationId, qualityScore, addReviewNote);
      result.newStatus = 'needs_revision';
      
      console.log(
        `🚩 Auto-flagged conversation ${conversationId}: ` +
        `Score ${qualityScore.overall}/10 (threshold: ${threshold})`
      );
    }

    return result;
  }

  /**
   * Flag a conversation and update its status
   */
  private async flagConversation(
    conversationId: string,
    qualityScore: QualityScore,
    addReviewNote: boolean
  ): Promise<void> {
    const updates: any = {
      status: 'needs_revision',
    };

    // Add review note with details
    if (addReviewNote) {
      const note = this.generateFlagNote(qualityScore);
      
      // Get current conversation to append to review history
      const conversation = await this.conversationService.getById(conversationId);
      const reviewHistory = conversation?.reviewHistory || [];
      
      reviewHistory.push({
        id: `flag-${Date.now()}`,
        action: 'revision_requested',
        performedBy: 'system',
        timestamp: new Date().toISOString(),
        comment: note,
        reasons: this.extractFlagReasons(qualityScore),
      });

      updates.reviewHistory = reviewHistory;
      updates.reviewerNotes = note;
    }

    // Update conversation
    await this.conversationService.update(conversationId, updates);
  }

  /**
   * Generate detailed flag note explaining why conversation was flagged
   */
  private generateFlagNote(qualityScore: QualityScore): string {
    const { overall, breakdown } = qualityScore;
    
    const issues: string[] = [];

    // Identify specific issues
    if (breakdown.turnCount.score < 6) {
      issues.push(`Turn count: ${breakdown.turnCount.message}`);
    }
    if (breakdown.length.score < 6) {
      issues.push(`Length: ${breakdown.length.message}`);
    }
    if (!breakdown.structure.valid) {
      issues.push(`Structure: ${breakdown.structure.issues.join(', ')}`);
    }
    if (breakdown.confidence.level === 'low') {
      issues.push(`Confidence: Low confidence level detected`);
    }

    return (
      `Auto-flagged for revision (Quality Score: ${overall}/10).\n\n` +
      `Issues identified:\n` +
      issues.map((issue, i) => `${i + 1}. ${issue}`).join('\n') +
      `\n\nReview and improve this conversation before including in training data.`
    );
  }

  /**
   * Extract flag reasons as structured array
   */
  private extractFlagReasons(qualityScore: QualityScore): string[] {
    const reasons: string[] = [];
    const { breakdown } = qualityScore;

    if (breakdown.turnCount.score < 6) {
      reasons.push('insufficient_turns');
    }
    if (breakdown.length.score < 6) {
      reasons.push('inadequate_length');
    }
    if (!breakdown.structure.valid) {
      reasons.push('structural_issues');
    }
    if (breakdown.confidence.level === 'low') {
      reasons.push('low_confidence');
    }

    return reasons;
  }

  /**
   * Batch flag multiple conversations
   */
  async batchEvaluateAndFlag(
    evaluations: Array<{ conversationId: string; qualityScore: QualityScore }>,
    options: FlagOptions = {}
  ): Promise<AutoFlagResult[]> {
    const results: AutoFlagResult[] = [];

    for (const { conversationId, qualityScore } of evaluations) {
      try {
        const result = await this.evaluateAndFlag(conversationId, qualityScore, options);
        results.push(result);
      } catch (error) {
        console.error(`Error flagging conversation ${conversationId}:`, error);
        // Continue with other conversations
      }
    }

    const flaggedCount = results.filter((r) => r.wasFlagged).length;
    console.log(
      `🚩 Batch flagging complete: ${flaggedCount}/${evaluations.length} conversations flagged`
    );

    return results;
  }

  /**
   * Get flagging statistics
   */
  async getFlaggingStats(startDate?: Date, endDate?: Date): Promise<{
    totalFlagged: number;
    averageScore: number;
    reasonBreakdown: Record<string, number>;
  }> {
    // This would query the database for flagging statistics
    // For now, return a placeholder implementation
    console.warn('getFlaggingStats: Implementation pending - requires database query');
    
    return {
      totalFlagged: 0,
      averageScore: 0,
      reasonBreakdown: {},
    };
  }

  /**
   * Unflag a conversation (e.g., after improvements)
   */
  async unflagConversation(
    conversationId: string,
    performedBy: string,
    comment?: string
  ): Promise<void> {
    const conversation = await this.conversationService.getById(conversationId);
    if (!conversation) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    // Update status to generated (or appropriate status)
    const reviewHistory = conversation.reviewHistory || [];
    reviewHistory.push({
      id: `unflag-${Date.now()}`,
      action: 'generated',
      performedBy,
      timestamp: new Date().toISOString(),
      comment: comment || 'Unflagged after review',
    });

    await this.conversationService.update(conversationId, {
      status: 'generated',
      reviewHistory,
    });

    console.log(`✅ Unflagged conversation ${conversationId}`);
  }
}

// Export singleton instance
export const autoFlagger = new AutoFlagger();

/**
 * Helper function to quickly evaluate and flag a conversation
 */
export async function evaluateAndFlag(
  conversationId: string,
  qualityScore: QualityScore,
  options?: FlagOptions
): Promise<AutoFlagResult> {
  return autoFlagger.evaluateAndFlag(conversationId, qualityScore, options);
}

