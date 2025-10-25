// Server-side only - never expose to client
export const AI_CONFIG = {
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    baseUrl: process.env.ANTHROPIC_API_BASE_URL || 'https://api.anthropic.com/v1',
    model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-5-20250929',
    maxTokens: 4096,
    temperature: 0.7,
  };
  
  // Validate configuration on import
  if (!AI_CONFIG.apiKey && process.env.NODE_ENV !== 'development') {
    console.warn('⚠️  ANTHROPIC_API_KEY not configured');
  }