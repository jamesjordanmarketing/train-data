/**
 * Quality Recommendations Generator
 * 
 * Generates specific, actionable recommendations based on quality score breakdown
 */

import { QualityScore, QualityBreakdown } from './types';

export class RecommendationGenerator {
  /**
   * Generate recommendations based on quality score breakdown
   */
  generateRecommendations(score: QualityScore): string[] {
    const recommendations: string[] = [];
    const { breakdown, overall } = score;

    // High-level recommendation based on overall score
    if (overall < 6) {
      recommendations.push(
        '🚨 **Critical**: This conversation requires revision before use in training data'
      );
    } else if (overall < 8) {
      recommendations.push(
        '⚠️ Consider reviewing and improving this conversation for better training quality'
      );
    }

    // Turn count recommendations
    recommendations.push(...this.getTurnCountRecommendations(breakdown));

    // Length recommendations
    recommendations.push(...this.getLengthRecommendations(breakdown));

    // Structure recommendations
    recommendations.push(...this.getStructureRecommendations(breakdown));

    // Confidence recommendations
    recommendations.push(...this.getConfidenceRecommendations(breakdown));

    // General best practices if score is good but not excellent
    if (overall >= 7 && overall < 9) {
      recommendations.push(
        '💡 **Tip**: Small improvements in conversation flow could push this to excellent quality'
      );
    }

    return recommendations;
  }

  /**
   * Generate turn count specific recommendations
   */
  private getTurnCountRecommendations(breakdown: QualityBreakdown): string[] {
    const { turnCount } = breakdown;
    const recommendations: string[] = [];

    if (turnCount.score < 7) {
      const [optimalRange] = turnCount.target.split(' (optimal)');
      
      if (turnCount.status === 'poor') {
        if (turnCount.actual < 6) {
          recommendations.push(
            `📊 **Turn Count**: Current conversation has only ${turnCount.actual} turns. ` +
            `Aim for ${optimalRange} turns for better context coverage. ` +
            `Consider adding follow-up questions or expanding topics.`
          );
        } else {
          recommendations.push(
            `📊 **Turn Count**: Conversation has ${turnCount.actual} turns, which is excessive. ` +
            `Target ${optimalRange} turns by removing redundant exchanges or consolidating responses.`
          );
        }
      } else {
        recommendations.push(
          `📊 **Turn Count**: ${turnCount.message}. ` +
          `Optimal range is ${optimalRange} turns.`
        );
      }
    }

    return recommendations;
  }

  /**
   * Generate length specific recommendations
   */
  private getLengthRecommendations(breakdown: QualityBreakdown): string[] {
    const { length } = breakdown;
    const recommendations: string[] = [];

    if (length.score < 7) {
      if (length.status === 'poor') {
        if (length.avgTurnLength < 50) {
          recommendations.push(
            `📝 **Turn Length**: Average turn length is ${length.avgTurnLength} characters, which is too short. ` +
            `Responses should provide more detail and context. Aim for ${length.target}.`
          );
        } else if (length.avgTurnLength > 600) {
          recommendations.push(
            `📝 **Turn Length**: Average turn length is ${length.avgTurnLength} characters, which is too long. ` +
            `Consider making responses more concise and focused. Target ${length.target}.`
          );
        } else {
          recommendations.push(
            `📝 **Turn Length**: Overall conversation length (${length.actual} chars) is insufficient. ` +
            `Develop topics more thoroughly to provide better training examples.`
          );
        }
      } else {
        recommendations.push(
          `📝 **Turn Length**: ${length.message}. Target ${length.target}.`
        );
      }
    }

    return recommendations;
  }

  /**
   * Generate structure specific recommendations
   */
  private getStructureRecommendations(breakdown: QualityBreakdown): string[] {
    const { structure } = breakdown;
    const recommendations: string[] = [];

    if (!structure.valid && structure.issues.length > 0) {
      recommendations.push(
        `🔧 **Structure Issues**: ${structure.issues.length} structural problem(s) detected:`
      );

      structure.issues.forEach((issue, index) => {
        let suggestion = '';
        
        if (issue.includes('does not start with user')) {
          suggestion = 'Ensure conversation begins with a user message';
        } else if (issue.includes('alternation')) {
          suggestion = 'Fix role alternation - user and assistant should take turns';
        } else if (issue.includes('empty turn')) {
          suggestion = 'Remove or populate empty turns with content';
        } else if (issue.includes('very short turn')) {
          suggestion = 'Expand very short turns to provide meaningful content';
        } else if (issue.includes('Imbalanced')) {
          suggestion = 'Balance the number of user and assistant turns';
        }

        recommendations.push(`   ${index + 1}. ${issue}${suggestion ? ' → ' + suggestion : ''}`);
      });
    }

    return recommendations;
  }

  /**
   * Generate confidence specific recommendations
   */
  private getConfidenceRecommendations(breakdown: QualityBreakdown): string[] {
    const { confidence } = breakdown;
    const recommendations: string[] = [];

    if (confidence.level === 'low') {
      recommendations.push(
        `🎯 **Confidence Level**: Low confidence detected. This conversation may have quality issues:`
      );

      const negativeFactors = confidence.factors.filter((f) => f.impact === 'negative');
      negativeFactors.forEach((factor) => {
        let suggestion = '';
        
        if (factor.name.includes('Repetitive')) {
          suggestion = 'Vary responses and avoid repeating similar content';
        } else if (factor.name.includes('Inconsistent Turn Lengths')) {
          suggestion = 'Maintain more consistent response lengths throughout';
        } else if (factor.name.includes('Too Many Questions')) {
          suggestion = 'Balance questions with informative statements';
        }

        recommendations.push(`   • ${factor.name}: ${factor.description}${suggestion ? ' → ' + suggestion : ''}`);
      });
    } else if (confidence.level === 'medium' && confidence.score < 7) {
      recommendations.push(
        `🎯 **Confidence**: Medium confidence. Consider these improvements:`
      );

      const negativeFactors = confidence.factors.filter((f) => f.impact === 'negative');
      if (negativeFactors.length > 0) {
        negativeFactors.forEach((factor) => {
          recommendations.push(`   • ${factor.name}: ${factor.description}`);
        });
      }
    }

    return recommendations;
  }

  /**
   * Generate recommendations for specific improvement areas
   */
  generateTargetedRecommendations(breakdown: QualityBreakdown): Map<string, string[]> {
    const targeted = new Map<string, string[]>();

    // Categorize recommendations by improvement area
    if (breakdown.turnCount.score < 8) {
      targeted.set('turn_count', this.getTurnCountRecommendations(breakdown));
    }

    if (breakdown.length.score < 8) {
      targeted.set('length', this.getLengthRecommendations(breakdown));
    }

    if (breakdown.structure.score < 8) {
      targeted.set('structure', this.getStructureRecommendations(breakdown));
    }

    if (breakdown.confidence.score < 8) {
      targeted.set('confidence', this.getConfidenceRecommendations(breakdown));
    }

    return targeted;
  }

  /**
   * Get priority level for improvements
   */
  getImprovementPriority(breakdown: QualityBreakdown): {
    critical: string[];
    important: string[];
    optional: string[];
  } {
    const critical: string[] = [];
    const important: string[] = [];
    const optional: string[] = [];

    // Structure issues are always critical
    if (!breakdown.structure.valid) {
      critical.push('structure');
    }

    // Low scores in any category are important
    if (breakdown.turnCount.score < 5) critical.push('turn_count');
    else if (breakdown.turnCount.score < 7) important.push('turn_count');
    else if (breakdown.turnCount.score < 9) optional.push('turn_count');

    if (breakdown.length.score < 5) critical.push('length');
    else if (breakdown.length.score < 7) important.push('length');
    else if (breakdown.length.score < 9) optional.push('length');

    if (breakdown.confidence.level === 'low') critical.push('confidence');
    else if (breakdown.confidence.score < 7) important.push('confidence');
    else if (breakdown.confidence.score < 9) optional.push('confidence');

    return { critical, important, optional };
  }
}

// Export singleton instance
export const recommendationGenerator = new RecommendationGenerator();

/**
 * Helper function to generate recommendations from quality score
 */
export function generateRecommendations(score: QualityScore): string[] {
  return recommendationGenerator.generateRecommendations(score);
}

