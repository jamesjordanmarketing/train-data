/**
 * Conversation Chunks API Endpoint Tests
 * 
 * Tests for chunk-related API endpoints including:
 * - Link conversation to chunk
 * - Unlink conversation from chunk
 * - Get orphaned conversations
 * - Error handling and validation
 */

import { NextRequest } from 'next/server';
import { POST as linkChunk } from '@/app/api/conversations/[id]/link-chunk/route';
import { DELETE as unlinkChunk } from '@/app/api/conversations/[id]/unlink-chunk/route';
import { GET as getOrphaned } from '@/app/api/conversations/orphaned/route';
import { conversationService } from '@/lib/database';
import { chunksService } from '@/lib/generation/chunks-integration';

// Mock dependencies
jest.mock('@/lib/database', () => ({
  conversationService: {
    linkConversationToChunk: jest.fn(),
    unlinkConversationFromChunk: jest.fn(),
    getOrphanedConversations: jest.fn(),
  },
}));

jest.mock('@/lib/generation/chunks-integration', () => ({
  chunksService: {
    getChunkById: jest.fn(),
    getDimensionsForChunk: jest.fn(),
  },
}));

describe('Conversations Chunks API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/conversations/[id]/link-chunk', () => {
    it('should link conversation to chunk successfully', async () => {
      const mockChunk = {
        id: 'chunk-123',
        title: 'Test Chunk',
        content: 'Test chunk content for validation',
        documentId: 'doc-456',
        documentTitle: 'Test Document',
      };

      const mockDimensions = {
        confidence: 0.85,
        generatedAt: '2024-01-01T00:00:00Z',
        semanticDimensions: {
          domain: ['software'],
          audience: 'developers',
          intent: 'educate',
        },
      };

      (chunksService.getChunkById as jest.Mock).mockResolvedValue(mockChunk);
      (chunksService.getDimensionsForChunk as jest.Mock).mockResolvedValue(mockDimensions);
      (conversationService.linkConversationToChunk as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost/api/conversations/conv-1/link-chunk', {
        method: 'POST',
        body: JSON.stringify({ chunkId: 'chunk-123' }),
      });

      const response = await linkChunk(request, { params: { id: 'conv-1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(conversationService.linkConversationToChunk).toHaveBeenCalledWith(
        'conv-1',
        'chunk-123',
        expect.any(String),
        expect.objectContaining({
          chunkId: 'chunk-123',
          confidence: 0.85,
          semanticDimensions: mockDimensions.semanticDimensions,
        })
      );
    });

    it('should return 400 when chunkId is missing', async () => {
      const request = new NextRequest('http://localhost/api/conversations/conv-1/link-chunk', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await linkChunk(request, { params: { id: 'conv-1' } });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Chunk ID is required');
    });

    it('should return 404 when chunk does not exist', async () => {
      (chunksService.getChunkById as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/conversations/conv-1/link-chunk', {
        method: 'POST',
        body: JSON.stringify({ chunkId: 'nonexistent-chunk' }),
      });

      const response = await linkChunk(request, { params: { id: 'conv-1' } });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Chunk not found');
    });

    it('should link without dimensions if not available', async () => {
      const mockChunk = {
        id: 'chunk-123',
        title: 'Test Chunk',
        content: 'Test content',
        documentId: 'doc-456',
      };

      (chunksService.getChunkById as jest.Mock).mockResolvedValue(mockChunk);
      (chunksService.getDimensionsForChunk as jest.Mock).mockResolvedValue(null);
      (conversationService.linkConversationToChunk as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost/api/conversations/conv-1/link-chunk', {
        method: 'POST',
        body: JSON.stringify({ chunkId: 'chunk-123' }),
      });

      const response = await linkChunk(request, { params: { id: 'conv-1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(conversationService.linkConversationToChunk).toHaveBeenCalledWith(
        'conv-1',
        'chunk-123',
        expect.any(String),
        undefined
      );
    });

    it('should handle database errors gracefully', async () => {
      const mockChunk = {
        id: 'chunk-123',
        title: 'Test Chunk',
        content: 'Test content',
        documentId: 'doc-456',
      };

      (chunksService.getChunkById as jest.Mock).mockResolvedValue(mockChunk);
      (chunksService.getDimensionsForChunk as jest.Mock).mockResolvedValue(null);
      (conversationService.linkConversationToChunk as jest.Mock).mockRejectedValue(
        new Error('Database connection failed')
      );

      const request = new NextRequest('http://localhost/api/conversations/conv-1/link-chunk', {
        method: 'POST',
        body: JSON.stringify({ chunkId: 'chunk-123' }),
      });

      const response = await linkChunk(request, { params: { id: 'conv-1' } });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
      expect(data.details).toBe('Database connection failed');
    });

    it('should truncate very long chunk content', async () => {
      const longContent = 'A'.repeat(10000);
      const mockChunk = {
        id: 'chunk-123',
        title: 'Test Chunk',
        content: longContent,
        documentId: 'doc-456',
      };

      (chunksService.getChunkById as jest.Mock).mockResolvedValue(mockChunk);
      (chunksService.getDimensionsForChunk as jest.Mock).mockResolvedValue(null);
      (conversationService.linkConversationToChunk as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost/api/conversations/conv-1/link-chunk', {
        method: 'POST',
        body: JSON.stringify({ chunkId: 'chunk-123' }),
      });

      const response = await linkChunk(request, { params: { id: 'conv-1' } });

      expect(response.status).toBe(200);
      
      // Verify content was truncated to 5000 chars
      const linkCall = (conversationService.linkConversationToChunk as jest.Mock).mock.calls[0];
      expect(linkCall[2].length).toBe(5000);
    });

    it('should handle malformed JSON body', async () => {
      const request = new NextRequest('http://localhost/api/conversations/conv-1/link-chunk', {
        method: 'POST',
        body: 'invalid json',
      });

      const response = await linkChunk(request, { params: { id: 'conv-1' } });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });

    it('should pass dimensions with correct structure', async () => {
      const mockChunk = {
        id: 'chunk-123',
        title: 'Test Chunk',
        content: 'Test content',
        documentId: 'doc-456',
      };

      const mockDimensions = {
        confidence: 0.92,
        generatedAt: '2024-01-15T00:00:00Z',
        semanticDimensions: {
          domain: ['api-documentation'],
          audience: 'backend developers',
          intent: 'reference',
          persona: ['technical-writer'],
          emotion: ['neutral'],
          complexity: 0.65,
        },
      };

      (chunksService.getChunkById as jest.Mock).mockResolvedValue(mockChunk);
      (chunksService.getDimensionsForChunk as jest.Mock).mockResolvedValue(mockDimensions);
      (conversationService.linkConversationToChunk as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost/api/conversations/conv-1/link-chunk', {
        method: 'POST',
        body: JSON.stringify({ chunkId: 'chunk-123' }),
      });

      const response = await linkChunk(request, { params: { id: 'conv-1' } });

      expect(response.status).toBe(200);

      const linkCall = (conversationService.linkConversationToChunk as jest.Mock).mock.calls[0];
      expect(linkCall[3]).toMatchObject({
        chunkId: 'chunk-123',
        confidence: 0.92,
        semanticDimensions: mockDimensions.semanticDimensions,
      });
    });
  });

  describe('DELETE /api/conversations/[id]/unlink-chunk', () => {
    it('should unlink chunk from conversation successfully', async () => {
      (conversationService.unlinkConversationFromChunk as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost/api/conversations/conv-1/unlink-chunk', {
        method: 'DELETE',
      });

      const response = await unlinkChunk(request, { params: { id: 'conv-1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(conversationService.unlinkConversationFromChunk).toHaveBeenCalledWith('conv-1');
    });

    it('should handle database errors gracefully', async () => {
      (conversationService.unlinkConversationFromChunk as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const request = new NextRequest('http://localhost/api/conversations/conv-1/unlink-chunk', {
        method: 'DELETE',
      });

      const response = await unlinkChunk(request, { params: { id: 'conv-1' } });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
      expect(data.details).toBe('Database error');
    });

    it('should work even if conversation has no linked chunk', async () => {
      (conversationService.unlinkConversationFromChunk as jest.Mock).mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost/api/conversations/conv-1/unlink-chunk', {
        method: 'DELETE',
      });

      const response = await unlinkChunk(request, { params: { id: 'conv-1' } });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should handle non-existent conversation ID', async () => {
      (conversationService.unlinkConversationFromChunk as jest.Mock).mockRejectedValue(
        new Error('Conversation not found')
      );

      const request = new NextRequest('http://localhost/api/conversations/nonexistent/unlink-chunk', {
        method: 'DELETE',
      });

      const response = await unlinkChunk(request, { params: { id: 'nonexistent' } });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.details).toBe('Conversation not found');
    });

    it('should handle unknown errors', async () => {
      (conversationService.unlinkConversationFromChunk as jest.Mock).mockRejectedValue(
        'Unknown error object'
      );

      const request = new NextRequest('http://localhost/api/conversations/conv-1/unlink-chunk', {
        method: 'DELETE',
      });

      const response = await unlinkChunk(request, { params: { id: 'conv-1' } });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.details).toBe('Unknown error');
    });
  });

  describe('GET /api/conversations/orphaned', () => {
    it('should return orphaned conversations', async () => {
      const mockOrphanedConversations = [
        {
          id: 'conv-1',
          title: 'Orphaned Conversation 1',
          created_at: '2024-01-01T00:00:00Z',
          status: 'draft',
        },
        {
          id: 'conv-2',
          title: 'Orphaned Conversation 2',
          created_at: '2024-01-02T00:00:00Z',
          status: 'draft',
        },
      ];

      (conversationService.getOrphanedConversations as jest.Mock).mockResolvedValue(
        mockOrphanedConversations
      );

      const request = new NextRequest('http://localhost/api/conversations/orphaned', {
        method: 'GET',
      });

      const response = await getOrphaned(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockOrphanedConversations);
      expect(conversationService.getOrphanedConversations).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no orphaned conversations', async () => {
      (conversationService.getOrphanedConversations as jest.Mock).mockResolvedValue([]);

      const request = new NextRequest('http://localhost/api/conversations/orphaned', {
        method: 'GET',
      });

      const response = await getOrphaned(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
    });

    it('should handle database errors', async () => {
      (conversationService.getOrphanedConversations as jest.Mock).mockRejectedValue(
        new Error('Database query failed')
      );

      const request = new NextRequest('http://localhost/api/conversations/orphaned', {
        method: 'GET',
      });

      const response = await getOrphaned(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
      expect(data.details).toBe('Database query failed');
    });

    it('should return large result sets correctly', async () => {
      const largeResultSet = Array.from({ length: 100 }, (_, i) => ({
        id: `conv-${i}`,
        title: `Orphaned Conversation ${i}`,
        created_at: '2024-01-01T00:00:00Z',
        status: 'draft',
      }));

      (conversationService.getOrphanedConversations as jest.Mock).mockResolvedValue(largeResultSet);

      const request = new NextRequest('http://localhost/api/conversations/orphaned', {
        method: 'GET',
      });

      const response = await getOrphaned(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(100);
    });

    it('should handle unknown errors', async () => {
      (conversationService.getOrphanedConversations as jest.Mock).mockRejectedValue(
        'Non-Error object'
      );

      const request = new NextRequest('http://localhost/api/conversations/orphaned', {
        method: 'GET',
      });

      const response = await getOrphaned(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.details).toBe('Unknown error');
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle link -> unlink workflow', async () => {
      const mockChunk = {
        id: 'chunk-123',
        title: 'Test Chunk',
        content: 'Test content',
        documentId: 'doc-456',
      };

      (chunksService.getChunkById as jest.Mock).mockResolvedValue(mockChunk);
      (chunksService.getDimensionsForChunk as jest.Mock).mockResolvedValue(null);
      (conversationService.linkConversationToChunk as jest.Mock).mockResolvedValue(undefined);
      (conversationService.unlinkConversationFromChunk as jest.Mock).mockResolvedValue(undefined);

      // Link
      const linkRequest = new NextRequest('http://localhost/api/conversations/conv-1/link-chunk', {
        method: 'POST',
        body: JSON.stringify({ chunkId: 'chunk-123' }),
      });

      const linkResponse = await linkChunk(linkRequest, { params: { id: 'conv-1' } });
      expect(linkResponse.status).toBe(200);

      // Unlink
      const unlinkRequest = new NextRequest('http://localhost/api/conversations/conv-1/unlink-chunk', {
        method: 'DELETE',
      });

      const unlinkResponse = await unlinkChunk(unlinkRequest, { params: { id: 'conv-1' } });
      expect(unlinkResponse.status).toBe(200);

      expect(conversationService.linkConversationToChunk).toHaveBeenCalled();
      expect(conversationService.unlinkConversationFromChunk).toHaveBeenCalled();
    });

    it('should handle orphaned query after unlink', async () => {
      (conversationService.unlinkConversationFromChunk as jest.Mock).mockResolvedValue(undefined);
      (conversationService.getOrphanedConversations as jest.Mock).mockResolvedValue([
        { id: 'conv-1', title: 'Now Orphaned' }
      ]);

      // Unlink
      const unlinkRequest = new NextRequest('http://localhost/api/conversations/conv-1/unlink-chunk', {
        method: 'DELETE',
      });

      await unlinkChunk(unlinkRequest, { params: { id: 'conv-1' } });

      // Query orphaned
      const orphanedRequest = new NextRequest('http://localhost/api/conversations/orphaned', {
        method: 'GET',
      });

      const orphanedResponse = await getOrphaned(orphanedRequest);
      const data = await orphanedResponse.json();

      expect(data).toContainEqual(
        expect.objectContaining({ id: 'conv-1' })
      );
    });
  });
});

