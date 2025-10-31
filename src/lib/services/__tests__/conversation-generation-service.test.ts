/**
 * Conversation Generation Service Unit Tests
 * 
 * Tests for conversation generation with Claude API integration,
 * template resolution, and quality validation
 */

import { getConversationGenerationService } from '../conversation-generation-service';
import { supabase } from '../../supabase';
import Anthropic from '@anthropic-ai/sdk';

jest.mock('../../supabase');
jest.mock('@anthropic-ai/sdk');

describe('conversationGenerationService', () => {
  let service: ReturnType<typeof getConversationGenerationService>;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ANTHROPIC_API_KEY = 'test-api-key';
    service = getConversationGenerationService();
  });

  describe('generateSingleConversation', () => {
    it('should generate conversation with valid parameters', async () => {
      const params = {
        templateId: 'template-123',
        parameters: {
          persona: 'Anxious Investor',
          emotion: 'Worried',
          topic: 'Market Volatility',
        },
        tier: 'template' as const,
        userId: 'user-123',
      };

      // Mock template fetch
      const mockTemplate = {
        id: 'template-123',
        content: 'User: {{persona}} feeling {{emotion}} about {{topic}}',
        system_prompt: 'You are a helpful assistant',
      };

      const mockSingle = jest.fn().mockResolvedValue({
        data: mockTemplate,
        error: null,
      });
      const mockEq = jest.fn().mockReturnThis();
      const mockSelect = jest.fn().mockReturnValue({
        eq: mockEq,
        single: mockSingle,
      });

      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      // Mock Claude API response
      const mockClaudeResponse = {
        id: 'msg-123',
        type: 'message',
        role: 'assistant',
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              turns: [
                { role: 'user', content: 'I am worried about market volatility' },
                { role: 'assistant', content: 'I understand your concerns about the market.' },
              ],
            }),
          },
        ],
        model: 'claude-3-5-sonnet-20241022',
        stop_reason: 'end_turn',
        usage: {
          input_tokens: 100,
          output_tokens: 50,
        },
      };

      const mockCreate = jest.fn().mockResolvedValue(mockClaudeResponse);
      (Anthropic as jest.MockedClass<typeof Anthropic>).mockImplementation(
        () =>
          ({
            messages: { create: mockCreate },
          } as any)
      );

      // Mock conversation insert
      const mockConvData = {
        id: 'conv-123',
        title: 'Test Conversation',
      };
      const mockInsertSingle = jest.fn().mockResolvedValue({
        data: mockConvData,
        error: null,
      });
      const mockInsertSelect = jest.fn().mockReturnValue({ single: mockInsertSingle });
      const mockInsert = jest.fn().mockReturnValue({ select: mockInsertSelect });

      (supabase.from as jest.Mock)
        .mockReturnValueOnce({ select: mockSelect }) // Template fetch
        .mockReturnValueOnce({ insert: mockInsert }) // Conversation insert
        .mockReturnValueOnce({ insert: jest.fn().mockResolvedValue({ error: null }) }); // Turns insert

      const result = await service.generateSingleConversation(params);

      expect(result.success).toBe(true);
      expect(result.conversation).toBeDefined();
      expect(result.conversation?.id).toBe('conv-123');
      expect(mockCreate).toHaveBeenCalled();
    });

    it('should handle missing template', async () => {
      const params = {
        templateId: 'invalid-template',
        parameters: {},
        tier: 'template' as const,
        userId: 'user-123',
      };

      const mockSingle = jest.fn().mockResolvedValue({
        data: null,
        error: { message: 'Template not found' },
      });
      const mockEq = jest.fn().mockReturnThis();
      const mockSelect = jest.fn().mockReturnValue({
        eq: mockEq,
        single: mockSingle,
      });

      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      const result = await service.generateSingleConversation(params);

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Template not found');
    });

    it('should handle Claude API errors', async () => {
      const params = {
        templateId: 'template-123',
        parameters: { persona: 'Test' },
        tier: 'template' as const,
        userId: 'user-123',
      };

      // Mock template fetch
      const mockTemplate = {
        id: 'template-123',
        content: 'Test template',
        system_prompt: 'Test prompt',
      };

      const mockSingle = jest.fn().mockResolvedValue({
        data: mockTemplate,
        error: null,
      });
      const mockEq = jest.fn().mockReturnThis();
      const mockSelect = jest.fn().mockReturnValue({
        eq: mockEq,
        single: mockSingle,
      });

      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      // Mock Claude API to throw error
      const mockCreate = jest.fn().mockRejectedValue(new Error('API rate limit exceeded'));
      (Anthropic as jest.MockedClass<typeof Anthropic>).mockImplementation(
        () =>
          ({
            messages: { create: mockCreate },
          } as any)
      );

      const result = await service.generateSingleConversation(params);

      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('API rate limit exceeded');
    });

    it('should resolve template placeholders', async () => {
      const params = {
        templateId: 'template-123',
        parameters: {
          persona: 'Anxious Investor',
          emotion: 'Worried',
          topic: 'Market Volatility',
        },
        tier: 'template' as const,
        userId: 'user-123',
      };

      const mockTemplate = {
        id: 'template-123',
        content: 'User is {{persona}} feeling {{emotion}} about {{topic}}',
        system_prompt: 'System prompt',
      };

      const mockSingle = jest.fn().mockResolvedValue({
        data: mockTemplate,
        error: null,
      });
      const mockEq = jest.fn().mockReturnThis();
      const mockSelect = jest.fn().mockReturnValue({
        eq: mockEq,
        single: mockSingle,
      });

      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      const mockCreate = jest.fn();
      (Anthropic as jest.MockedClass<typeof Anthropic>).mockImplementation(
        () =>
          ({
            messages: {
              create: mockCreate.mockResolvedValue({
                content: [{ type: 'text', text: JSON.stringify({ turns: [] }) }],
                usage: { input_tokens: 100, output_tokens: 50 },
              }),
            },
          } as any)
      );

      // Mock inserts
      (supabase.from as jest.Mock)
        .mockReturnValueOnce({ select: mockSelect })
        .mockReturnValueOnce({
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: { id: 'conv-123' }, error: null }),
            }),
          }),
        })
        .mockReturnValueOnce({ insert: jest.fn().mockResolvedValue({ error: null }) });

      await service.generateSingleConversation(params);

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          messages: expect.arrayContaining([
            expect.objectContaining({
              content: expect.stringContaining('Anxious Investor'),
            }),
          ]),
        })
      );
    });

    it('should calculate quality metrics', async () => {
      const params = {
        templateId: 'template-123',
        parameters: {},
        tier: 'template' as const,
        userId: 'user-123',
      };

      // Mock template
      const mockSingle = jest.fn().mockResolvedValue({
        data: { id: 'template-123', content: 'Test', system_prompt: 'Test' },
        error: null,
      });
      const mockEq = jest.fn().mockReturnThis();
      const mockSelect = jest.fn().mockReturnValue({
        eq: mockEq,
        single: mockSingle,
      });

      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      // Mock Claude response with specific metrics
      const mockClaudeResponse = {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              turns: [
                { role: 'user', content: 'Hello there!' },
                { role: 'assistant', content: 'Hi! How can I help you today?' },
                { role: 'user', content: 'I need some advice.' },
                { role: 'assistant', content: 'Of course! What would you like advice on?' },
              ],
            }),
          },
        ],
        usage: {
          input_tokens: 150,
          output_tokens: 200,
        },
      };

      const mockCreate = jest.fn().mockResolvedValue(mockClaudeResponse);
      (Anthropic as jest.MockedClass<typeof Anthropic>).mockImplementation(
        () =>
          ({
            messages: { create: mockCreate },
          } as any)
      );

      let capturedQualityScore: number | undefined;
      const mockInsert = jest.fn((data: any) => {
        capturedQualityScore = data.quality_score;
        return {
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: 'conv-123', quality_score: data.quality_score },
              error: null,
            }),
          }),
        };
      });

      (supabase.from as jest.Mock)
        .mockReturnValueOnce({ select: mockSelect })
        .mockReturnValueOnce({ insert: mockInsert })
        .mockReturnValueOnce({ insert: jest.fn().mockResolvedValue({ error: null }) });

      const result = await service.generateSingleConversation(params);

      expect(result.success).toBe(true);
      expect(capturedQualityScore).toBeGreaterThan(0);
      expect(capturedQualityScore).toBeLessThanOrEqual(100);
    });

    it('should apply temperature and maxTokens parameters', async () => {
      const params = {
        templateId: 'template-123',
        parameters: {},
        tier: 'template' as const,
        userId: 'user-123',
        temperature: 0.8,
        maxTokens: 2000,
      };

      // Mock template
      const mockSingle = jest.fn().mockResolvedValue({
        data: { id: 'template-123', content: 'Test', system_prompt: 'Test' },
        error: null,
      });
      const mockEq = jest.fn().mockReturnThis();
      const mockSelect = jest.fn().mockReturnValue({
        eq: mockEq,
        single: mockSingle,
      });

      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      const mockCreate = jest.fn().mockResolvedValue({
        content: [{ type: 'text', text: JSON.stringify({ turns: [] }) }],
        usage: { input_tokens: 100, output_tokens: 50 },
      });

      (Anthropic as jest.MockedClass<typeof Anthropic>).mockImplementation(
        () =>
          ({
            messages: { create: mockCreate },
          } as any)
      );

      // Mock inserts
      (supabase.from as jest.Mock)
        .mockReturnValueOnce({ select: mockSelect })
        .mockReturnValueOnce({
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: { id: 'conv-123' }, error: null }),
            }),
          }),
        })
        .mockReturnValueOnce({ insert: jest.fn().mockResolvedValue({ error: null }) });

      await service.generateSingleConversation(params);

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          temperature: 0.8,
          max_tokens: 2000,
        })
      );
    });
  });

  describe('estimateCost', () => {
    it('should estimate cost for template tier', () => {
      const estimate = service.estimateCost('template');

      expect(estimate.costUsd).toBeGreaterThan(0);
      expect(estimate.estimatedTokens).toBeGreaterThan(0);
      expect(estimate.estimatedDurationMs).toBeGreaterThan(0);
    });

    it('should estimate higher cost for edge cases', () => {
      const templateCost = service.estimateCost('template');
      const edgeCaseCost = service.estimateCost('edge_case');

      expect(edgeCaseCost.costUsd).toBeGreaterThan(templateCost.costUsd);
      expect(edgeCaseCost.estimatedTokens).toBeGreaterThan(templateCost.estimatedTokens);
    });

    it('should provide cost breakdown', () => {
      const estimate = service.estimateCost('scenario');

      expect(estimate.breakdown).toBeDefined();
      expect(estimate.breakdown.inputTokens).toBeGreaterThan(0);
      expect(estimate.breakdown.outputTokens).toBeGreaterThan(0);
    });
  });
});

