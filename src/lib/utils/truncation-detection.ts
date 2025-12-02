/**
 * Truncation Detection Utility
 * 
 * Detects if generated content appears to be truncated mid-generation.
 * Uses pattern matching to identify common truncation indicators.
 * 
 * @module truncation-detection
 */

/**
 * Truncation detection result
 */
export interface TruncationDetectionResult {
  isTruncated: boolean;
  pattern: string | null;
  details: string;
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Truncation patterns to detect
 * 
 * IMPORTANT: Reduced to single reliable pattern after BUG-1 analysis (2025-12-02)
 * The previous patterns (long_unclosed_string, mid_word, etc.) caused 100% false 
 * positive rate on valid Claude structured output responses.
 * 
 * The escaped quote pattern is THE key indicator of truncation in structured outputs:
 * - When Claude is mid-sentence and gets truncated, it often was typing a quote
 * - JSON escaping makes this appear as \\" at the end of content
 * - Normal content NEVER ends with an escaped quote followed by nothing
 */
const TRUNCATION_PATTERNS = [
  {
    // Matches content ending with escaped quote (\\")
    // This indicates Claude was mid-escape-sequence when truncated
    // Example: "She said \"hello" becomes truncated "She said \\"
    pattern: /\\"\s*$/,
    name: 'truncated_escape_sequence',
    desc: 'Content ends with escaped quote indicating mid-sentence truncation',
    confidence: 'high' as const,
  },
];

/**
 * Proper ending patterns (indicate complete content)
 */
const PROPER_ENDINGS = /[.!?'")\]}\n]\s*$/;

/**
 * Detect if content appears to be truncated
 * 
 * @param content - The generated content to analyze
 * @returns Truncation detection result with pattern and confidence
 * 
 * @example
 * ```typescript
 * const result = detectTruncatedContent('This is a test \\');
 * if (result.isTruncated) {
 *   console.log(`Truncated: ${result.pattern} - ${result.details}`);
 * }
 * ```
 */
export function detectTruncatedContent(content: string): TruncationDetectionResult {
  if (!content || content.trim().length === 0) {
    return {
      isTruncated: false,
      pattern: null,
      details: 'Empty content',
      confidence: 'low',
    };
  }

  const trimmed = content.trim();

  // Check against known truncation patterns
  for (const { pattern, name, desc, confidence } of TRUNCATION_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        isTruncated: true,
        pattern: name,
        details: desc,
        confidence,
      };
    }
  }

  // No truncation patterns matched - content is complete
  // NOTE: Removed the "long content without proper ending" check as it caused
  // false positives. With structured outputs, Claude guarantees valid JSON,
  // so we only need to check for the specific escape sequence pattern above.
  return {
    isTruncated: false,
    pattern: null,
    details: 'Content appears complete (no truncation patterns detected)',
    confidence: 'high',
  };
}

/**
 * Analyze assistant responses in a conversation for truncation
 * User responses are not checked (assumed complete input)
 * 
 * @param turns - Array of conversation turns
 * @returns Array of truncation results for assistant turns only
 */
export function detectTruncatedTurns(turns: Array<{ role: 'user' | 'assistant'; content: string }>): Array<{
  turnIndex: number;
  role: 'assistant';
  result: TruncationDetectionResult;
}> {
  const results: Array<{ turnIndex: number; role: 'assistant'; result: TruncationDetectionResult }> = [];

  turns.forEach((turn, index) => {
    // Only check assistant turns (user input is assumed complete)
    if (turn.role === 'assistant') {
      const result = detectTruncatedContent(turn.content);
      if (result.isTruncated) {
        results.push({
          turnIndex: index,
          role: 'assistant',
          result,
        });
      }
    }
  });

  return results;
}

/**
 * Get human-readable summary of truncation detection
 */
export function getTruncationSummary(result: TruncationDetectionResult): string {
  if (!result.isTruncated) {
    return '✓ Content appears complete';
  }

  const emoji = result.confidence === 'high' ? '⚠️' : '⚡';
  return `${emoji} Truncated: ${result.details} (${result.confidence} confidence)`;
}

