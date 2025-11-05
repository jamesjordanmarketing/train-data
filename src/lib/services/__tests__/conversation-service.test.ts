/**
 * Conversation Service Unit Tests
 * 
 * Tests for conversationService with full CRUD operations,
 * transaction support, and filtering capabilities
 */

import { conversationService } from '../conversation-service';
import { supabase } from '../../supabase';
import type { Conversation, ConversationTurn } from '../../../../@/lib/types';

// Mock Supabase
jest.mock('../../supabase');

describe('conversationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create conversation with turns in transaction', async () => {
      const mockConversation = {
        id: 'conv-123',
        title: 'Test Conversation',
        persona: 'Anxious Investor',
        emotion: 'Worried',
        tier: 'template' as const,
        status: 'generated' as const,
        turn_count: 2,
        total_tokens: 200,
        created_at: new Date().toISOString(),
      };

      const mockTurns: ConversationTurn[] = [
        { role: 'user', content: 'Hello', tokenCount: 50, timestamp: new Date().toISOString() },
        { role: 'assistant', content: 'Hi there!', tokenCount: 150, timestamp: new Date().toISOString() },
      ];

      // Mock the insert chain for conversation
      const mockSelectSingle = jest.fn().mockResolvedValue({ 
        data: mockConversation, 
        error: null 
      });
      const mockSelect = jest.fn().mockReturnValue({ single: mockSelectSingle });
      const mockInsertConv = jest.fn().mockReturnValue({ select: mockSelect });

      // Mock the insert for turns
      const mockInsertTurns = jest.fn().mockResolvedValue({ error: null });

      (supabase.from as jest.Mock)
        .mockReturnValueOnce({ insert: mockInsertConv }) // First call for conversation
        .mockReturnValueOnce({ insert: mockInsertTurns }); // Second call for turns

      const result = await conversationService.create(
        {
          persona: 'Anxious Investor',
          emotion: 'Worried',
          tier: 'template',
          status: 'generated',
          createdBy: 'user-123',
        },
        mockTurns
      );

      expect(result).toBeDefined();
      expect(result.id).toBe('conv-123');
      expect(supabase.from).toHaveBeenCalledWith('conversations');
      expect(supabase.from).toHaveBeenCalledWith('conversation_turns');
      expect(mockInsertConv).toHaveBeenCalled();
      expect(mockInsertTurns).toHaveBeenCalled();
    });

    it('should rollback conversation if turns insertion fails', async () => {
      const mockConversation = {
        id: 'conv-123',
        title: 'Test Conversation',
      };

      const mockTurns: ConversationTurn[] = [
        { role: 'user', content: 'Hello', tokenCount: 50, timestamp: new Date().toISOString() },
      ];

      const mockSelectSingle = jest.fn().mockResolvedValue({ 
        data: mockConversation, 
        error: null 
      });
      const mockSelect = jest.fn().mockReturnValue({ single: mockSelectSingle });
      const mockInsertConv = jest.fn().mockReturnValue({ select: mockSelect });

      // Mock turns insertion to fail
      const mockInsertTurns = jest.fn().mockResolvedValue({ 
        error: new Error('Turns insertion failed') 
      });

      // Mock delete for rollback
      const mockDelete = jest.fn().mockResolvedValue({ error: null });
      const mockEq = jest.fn().mockReturnValue({});
      const mockDeleteChain = jest.fn().mockReturnValue({ eq: mockEq });

      (supabase.from as jest.Mock)
        .mockReturnValueOnce({ insert: mockInsertConv })
        .mockReturnValueOnce({ insert: mockInsertTurns })
        .mockReturnValueOnce({ delete: mockDeleteChain });

      await expect(
        conversationService.create(
          {
            persona: 'Test',
            emotion: 'Test',
            tier: 'template',
          },
          mockTurns
        )
      ).rejects.toThrow();

      // Verify rollback was attempted
      expect(supabase.from).toHaveBeenCalledWith('conversations');
      expect(supabase.from).toHaveBeenCalledWith('conversation_turns');
    });

    it('should calculate metrics from turns correctly', async () => {
      const mockTurns: ConversationTurn[] = [
        { role: 'user', content: 'Hello', tokenCount: 50, timestamp: new Date().toISOString() },
        { role: 'assistant', content: 'Hi!', tokenCount: 30, timestamp: new Date().toISOString() },
        { role: 'user', content: 'How are you?', tokenCount: 20, timestamp: new Date().toISOString() },
      ];

      const mockConversation = {
        id: 'conv-123',
        turn_count: 3,
        total_tokens: 100,
      };

      const insertSpy = jest.fn();
      const mockSelectSingle = jest.fn().mockResolvedValue({ 
        data: mockConversation, 
        error: null 
      });
      const mockSelect = jest.fn().mockReturnValue({ single: mockSelectSingle });
      const mockInsertConv = jest.fn((data: any) => {
        insertSpy(data);
        return { select: mockSelect };
      });

      const mockInsertTurns = jest.fn().mockResolvedValue({ error: null });

      (supabase.from as jest.Mock)
        .mockReturnValueOnce({ insert: mockInsertConv })
        .mockReturnValueOnce({ insert: mockInsertTurns });

      await conversationService.create(
        { persona: 'Test', emotion: 'Test', tier: 'template' },
        mockTurns
      );

      // Verify metrics were calculated correctly
      expect(insertSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          turn_count: 3,
          total_tokens: 100,
        })
      );
    });
  });

  describe('getAll', () => {
    it('should fetch all conversations without filters', async () => {
      const mockConversations = [
        { id: 'conv-1', title: 'Conv 1', tier: 'template' },
        { id: 'conv-2', title: 'Conv 2', tier: 'scenario' },
      ];

      const mockData = jest.fn().mockResolvedValue({ 
        data: mockConversations, 
        error: null 
      });
      const mockRange = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockReturnThis();
      const mockSelect = jest.fn().mockReturnValue({ 
        order: mockOrder,
        range: mockRange,
        then: mockData().then.bind(mockData()),
      });

      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      const result = await conversationService.getAll({});

      expect(result).toEqual(mockConversations);
      expect(supabase.from).toHaveBeenCalledWith('conversations');
    });

    it('should filter conversations by tier and status', async () => {
      const mockConversations = [
        { id: 'conv-1', tier: 'template', status: 'approved' },
      ];

      const mockEq = jest.fn().mockReturnThis();
      const mockIn = jest.fn().mockReturnThis();
      const mockRange = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockReturnThis();

      const mockSelect = jest.fn().mockReturnValue({
        in: mockIn,
        eq: mockEq,
        order: mockOrder,
        range: mockRange,
      });

      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });
      (mockRange as any).mockResolvedValue({ data: mockConversations, error: null });

      const result = await conversationService.getAll({
        tier: ['template'],
        status: ['approved'],
      });

      expect(mockIn).toHaveBeenCalledWith('tier', ['template']);
      expect(mockIn).toHaveBeenCalledWith('status', ['approved']);
    });

    it('should filter by date range', async () => {
      const startDate = '2025-01-01';
      const endDate = '2025-12-31';

      const mockGte = jest.fn().mockReturnThis();
      const mockLte = jest.fn().mockReturnThis();
      const mockRange = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockReturnThis();

      const mockSelect = jest.fn().mockReturnValue({
        gte: mockGte,
        lte: mockLte,
        order: mockOrder,
        range: mockRange,
      });

      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });
      (mockRange as any).mockResolvedValue({ data: [], error: null });

      await conversationService.getAll({
        startDate,
        endDate,
      });

      expect(mockGte).toHaveBeenCalledWith('created_at', startDate);
      expect(mockLte).toHaveBeenCalledWith('created_at', endDate);
    });

    it('should apply pagination', async () => {
      const mockRange = jest.fn().mockReturnThis();
      const mockOrder = jest.fn().mockReturnThis();
      const mockSelect = jest.fn().mockReturnValue({
        order: mockOrder,
        range: mockRange,
      });

      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });
      (mockRange as any).mockResolvedValue({ data: [], error: null });

      await conversationService.getAll({
        page: 2,
        limit: 20,
      });

      expect(mockRange).toHaveBeenCalledWith(20, 39); // page 2, items 20-39
    });
  });

  describe('getById', () => {
    it('should fetch conversation with turns', async () => {
      const mockConversation = {
        id: 'conv-123',
        title: 'Test',
        turns: [
          { id: 'turn-1', content: 'Hello' },
          { id: 'turn-2', content: 'Hi' },
        ],
      };

      const mockSingle = jest.fn().mockResolvedValue({ 
        data: mockConversation, 
        error: null 
      });
      const mockEq = jest.fn().mockReturnThis();
      const mockSelect = jest.fn().mockReturnValue({
        eq: mockEq,
        single: mockSingle,
      });

      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      const result = await conversationService.getById('conv-123');

      expect(result).toEqual(mockConversation);
      expect(mockEq).toHaveBeenCalledWith('id', 'conv-123');
    });

    it('should throw error if conversation not found', async () => {
      const mockSingle = jest.fn().mockResolvedValue({ 
        data: null, 
        error: { message: 'Not found' } 
      });
      const mockEq = jest.fn().mockReturnThis();
      const mockSelect = jest.fn().mockReturnValue({
        eq: mockEq,
        single: mockSingle,
      });

      (supabase.from as jest.Mock).mockReturnValue({ select: mockSelect });

      await expect(conversationService.getById('invalid-id')).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update conversation', async () => {
      const updates = {
        status: 'approved' as const,
        quality_score: 85,
      };

      const mockSingle = jest.fn().mockResolvedValue({ 
        data: { id: 'conv-123', ...updates }, 
        error: null 
      });
      const mockSelect = jest.fn().mockReturnValue({ single: mockSingle });
      const mockEq = jest.fn().mockReturnValue({ select: mockSelect });
      const mockUpdate = jest.fn().mockReturnValue({ eq: mockEq });

      (supabase.from as jest.Mock).mockReturnValue({ update: mockUpdate });

      const result = await conversationService.update('conv-123', updates);

      expect(result.status).toBe('approved');
      expect(result.quality_score).toBe(85);
      expect(mockUpdate).toHaveBeenCalledWith(updates);
      expect(mockEq).toHaveBeenCalledWith('id', 'conv-123');
    });
  });

  describe('delete', () => {
    it('should delete conversation', async () => {
      const mockEq = jest.fn().mockResolvedValue({ error: null });
      const mockDelete = jest.fn().mockReturnValue({ eq: mockEq });

      (supabase.from as jest.Mock).mockReturnValue({ delete: mockDelete });

      await conversationService.delete('conv-123');

      expect(mockDelete).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith('id', 'conv-123');
    });
  });

  describe('bulkAction', () => {
    it('should perform bulk status update', async () => {
      const conversationIds = ['conv-1', 'conv-2', 'conv-3'];
      const updates = { status: 'approved' as const };

      const mockIn = jest.fn().mockResolvedValue({ 
        data: conversationIds.map(id => ({ id, ...updates })), 
        error: null 
      });
      const mockUpdate = jest.fn().mockReturnValue({ in: mockIn });

      (supabase.from as jest.Mock).mockReturnValue({ update: mockUpdate });

      const result = await conversationService.bulkAction(conversationIds, 'approve', updates);

      expect(result).toBe(3);
      expect(mockIn).toHaveBeenCalledWith('id', conversationIds);
    });

    it('should perform bulk delete', async () => {
      const conversationIds = ['conv-1', 'conv-2'];

      const mockIn = jest.fn().mockResolvedValue({ 
        data: conversationIds.map(id => ({ id })), 
        error: null 
      });
      const mockDelete = jest.fn().mockReturnValue({ in: mockIn });

      (supabase.from as jest.Mock).mockReturnValue({ delete: mockDelete });

      const result = await conversationService.bulkAction(conversationIds, 'delete');

      expect(result).toBe(2);
      expect(mockIn).toHaveBeenCalledWith('id', conversationIds);
    });
  });

  describe('getStats', () => {
    it('should return conversation statistics', async () => {
      const mockStats = {
        total: 100,
        by_tier: { template: 50, scenario: 30, edge_case: 20 },
        by_status: { approved: 60, pending_review: 30, generated: 10 },
        avg_quality_score: 78.5,
        total_tokens: 50000,
      };

      (supabase.rpc as jest.Mock).mockResolvedValue({ 
        data: mockStats, 
        error: null 
      });

      const result = await conversationService.getStats();

      expect(result).toEqual(mockStats);
      expect(supabase.rpc).toHaveBeenCalledWith('get_conversation_stats');
    });
  });
});

