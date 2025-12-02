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
 */
const TRUNCATION_PATTERNS = [
  {
    pattern: /\\"\s*$/,
    name: 'escaped_quote',
    desc: 'Ends with escaped quote (incomplete string literal)',
    confidence: 'high' as const,
  },
  {
    pattern: /\\\s*$/,
    name: 'lone_backslash',
    desc: 'Ends with lone backslash (incomplete escape sequence)',
    confidence: 'high' as const,
  },
  {
    pattern: /[a-zA-Z][-a-zA-Z]*[a-z]\s*$/,
    name: 'mid_word',
    desc: 'Ends mid-word without punctuation',
    confidence: 'medium' as const,
  },
  {
    pattern: /,\s*$/,
    name: 'trailing_comma',
    desc: 'Ends with comma (incomplete list/object)',
    confidence: 'medium' as const,
  },
  {
    pattern: /:\s*$/,
    name: 'trailing_colon',
    desc: 'Ends after property colon (incomplete JSON key-value)',
    confidence: 'high' as const,
  },
  {
    pattern: /\(\s*$/,
    name: 'open_paren',
    desc: 'Ends with unclosed parenthesis',
    confidence: 'medium' as const,
  },
  {
    pattern: /\[\s*$/,
    name: 'open_bracket',
    desc: 'Ends with unclosed bracket',
    confidence: 'medium' as const,
  },
  {
    pattern: /\{\s*$/,
    name: 'open_brace',
    desc: 'Ends with unclosed brace',
    confidence: 'medium' as const,
  },
  {
    pattern: /"[^"]{50,}\s*$/,
    name: 'long_unclosed_string',
    desc: 'Ends with long unclosed string (>50 chars without closing quote)',
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

  // Check if ends with proper punctuation (NOT truncated)
  if (PROPER_ENDINGS.test(trimmed)) {
    return {
      isTruncated: false,
      pattern: null,
      details: 'Content appears complete (ends with proper punctuation)',
      confidence: 'high',
    };
  }

  // Long content without proper ending is suspicious
  if (trimmed.length > 100) {
    return {
      isTruncated: true,
      pattern: 'no_punctuation',
      details: 'Long content does not end with expected punctuation',
      confidence: 'low',
    };
  }

  // Short content without clear pattern
  return {
    isTruncated: false,
    pattern: null,
    details: 'Content appears complete (no truncation patterns detected)',
    confidence: 'medium',
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

