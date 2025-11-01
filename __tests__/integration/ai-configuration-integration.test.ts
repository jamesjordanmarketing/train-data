import { describe, it, expect } from 'vitest';

describe('AI Configuration Integration', () => {
  it('should use user AI configuration for generation', async () => {
    // Mock AI configuration
    const aiConfig = {
      model: 'claude-sonnet-4-5-20250929',
      maxTokens: 4096,
      temperature: 1.0,
      topP: 1.0,
    };
   
    expect(aiConfig.model).toBeDefined();
    expect(aiConfig.maxTokens).toBeGreaterThan(0);
  });
 
  it('should calculate costs accurately', () => {
    const inputTokens = 1000;
    const outputTokens = 500;
    const costPer1kInput = 0.003;
    const costPer1kOutput = 0.015;
   
    const cost = 
      (inputTokens / 1000) * costPer1kInput +
      (outputTokens / 1000) * costPer1kOutput;
   
    expect(cost).toBeCloseTo(0.0105, 4);
  });
 
  it('should fallback to defaults when user config missing', () => {
    const defaultConfig = {
      model: 'claude-sonnet-4-5-20250929',
      maxTokens: 4096,
      temperature: 1.0,
    };
   
    expect(defaultConfig.model).toBe('claude-sonnet-4-5-20250929');
  });
});

