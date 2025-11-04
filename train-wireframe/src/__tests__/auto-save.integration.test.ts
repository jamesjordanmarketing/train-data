import { renderHook, act, waitFor } from '@testing-library/react';
import { useAutoSave } from '../hooks/useAutoSave';
import { draftStorage } from '../lib/auto-save/storage';
import {
  checkForRecoverableDrafts,
  detectConflict,
  resolveConflict,
  saveDraft,
  loadDraft,
  ConflictResolution,
} from '../lib/auto-save/recovery';

// Mock only the error logger to avoid console noise
jest.mock('../lib/errors/error-logger', () => ({
  errorLogger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock withRetry to just call the function
jest.mock('../lib/api/retry', () => ({
  withRetry: jest.fn((fn) => fn()),
}));

describe('Auto-Save Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });
  
  afterEach(() => {
    jest.useRealTimers();
  });
  
  describe('end-to-end auto-save flow', () => {
    it('should save draft after debounce delay', async () => {
      const mockSave = jest.fn().mockResolvedValue(undefined);
      
      const { result, rerender } = renderHook(
        ({ data }) => useAutoSave(data, mockSave, { debounceDelay: 1000, interval: 999999 }),
        { initialProps: { data: { content: 'test1' } } }
      );
      
      // Change data
      rerender({ data: { content: 'test2' } });
      
      // Should be idle initially
      expect(result.current.status).toBe('idle');
      expect(mockSave).not.toHaveBeenCalled();
      
      // Wait for debounce
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      // Should have saved
      await waitFor(() => {
        expect(mockSave).toHaveBeenCalledWith({ content: 'test2' });
        expect(result.current.status).toBe('saved');
      });
    });
    
    it('should save draft at interval', async () => {
      const mockSave = jest.fn().mockResolvedValue(undefined);
      
      const { result, rerender } = renderHook(
        ({ data }) => useAutoSave(data, mockSave, { interval: 30000, debounceDelay: 1000 }),
        { initialProps: { data: { content: 'test1' } } }
      );
      
      // Wait for initial debounce
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      await waitFor(() => {
        expect(mockSave).toHaveBeenCalledTimes(1);
      });
      
      // Change data
      rerender({ data: { content: 'test2' } });
      
      // Wait for interval (not debounce)
      act(() => {
        jest.advanceTimersByTime(30000);
      });
      
      await waitFor(() => {
        expect(mockSave).toHaveBeenCalledTimes(2);
      });
    });
    
    it('should manually save and cancel debounce', async () => {
      const mockSave = jest.fn().mockResolvedValue(undefined);
      
      const { result, rerender } = renderHook(
        ({ data }) => useAutoSave(data, mockSave, { debounceDelay: 2000, interval: 999999 }),
        { initialProps: { data: { content: 'test1' } } }
      );
      
      // Change data to trigger debounce
      rerender({ data: { content: 'test2' } });
      
      // Wait half the debounce time
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      // Manually save
      await act(async () => {
        await result.current.saveDraft();
      });
      
      expect(mockSave).toHaveBeenCalledTimes(1);
      
      // Wait remaining debounce time
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      // Should not have saved again
      await waitFor(() => {
        expect(mockSave).toHaveBeenCalledTimes(1);
      });
    });
  });
  
  describe('draft storage integration', () => {
    beforeEach(async () => {
      await draftStorage.clear();
    });
    
    it('should save and load draft from storage', async () => {
      const data = { content: 'test content', turnCount: 5 };
      
      await saveDraft('conversation', '123', data);
      
      const loaded = await loadDraft<typeof data>('conversation', '123');
      
      expect(loaded).toEqual(data);
    });
    
    it('should list saved drafts', async () => {
      await saveDraft('conversation', '123', { content: 'draft1' });
      await saveDraft('batch', '456', { content: 'draft2' });
      await saveDraft('template', '789', { content: 'draft3' });
      
      const items = await checkForRecoverableDrafts();
      
      expect(items).toHaveLength(3);
      expect(items.map(i => i.type)).toContain('conversation');
      expect(items.map(i => i.type)).toContain('batch');
      expect(items.map(i => i.type)).toContain('template');
    });
    
    it('should not list expired drafts', async () => {
      // Save with very short expiration
      await draftStorage.save('test_draft', { content: 'test' }, -1);
      
      const items = await checkForRecoverableDrafts();
      
      expect(items).toHaveLength(0);
    });
  });
  
  describe('conflict detection and resolution', () => {
    beforeEach(async () => {
      await draftStorage.clear();
    });
    
    it('should detect conflict when server is newer', async () => {
      const draftData = { content: 'draft', version: 1 };
      const serverData = { content: 'server', version: 2 };
      
      // Save draft
      await saveDraft('conversation', '123', draftData);
      
      // Wait a bit to ensure timestamps differ
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Server was updated after draft
      const serverUpdatedAt = new Date();
      
      const conflict = await detectConflict(
        'conversation_123',
        serverData,
        serverUpdatedAt
      );
      
      expect(conflict).toBeTruthy();
      expect(conflict!.draftData).toEqual(draftData);
      expect(conflict!.serverData).toEqual(serverData);
    });
    
    it('should not detect conflict when draft is newer', async () => {
      const draftData = { content: 'draft', version: 2 };
      const serverData = { content: 'server', version: 1 };
      
      // Server was updated first
      const serverUpdatedAt = new Date();
      
      // Wait to ensure draft is newer
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Save draft
      await saveDraft('conversation', '123', draftData);
      
      const conflict = await detectConflict(
        'conversation_123',
        serverData,
        serverUpdatedAt
      );
      
      expect(conflict).toBeNull();
    });
    
    it('should resolve conflict using draft', async () => {
      const conflict = {
        draftData: { content: 'draft' },
        serverData: { content: 'server' },
        draftSavedAt: new Date('2024-01-01T10:00:00Z'),
        serverUpdatedAt: new Date('2024-01-01T11:00:00Z'),
      };
      
      const resolved = resolveConflict(conflict, ConflictResolution.USE_DRAFT);
      
      expect(resolved).toEqual(conflict.draftData);
    });
    
    it('should resolve conflict using server', async () => {
      const conflict = {
        draftData: { content: 'draft' },
        serverData: { content: 'server' },
        draftSavedAt: new Date('2024-01-01T10:00:00Z'),
        serverUpdatedAt: new Date('2024-01-01T11:00:00Z'),
      };
      
      const resolved = resolveConflict(conflict, ConflictResolution.USE_SERVER);
      
      expect(resolved).toEqual(conflict.serverData);
    });
  });
  
  describe('complete user workflow', () => {
    beforeEach(async () => {
      await draftStorage.clear();
    });
    
    it('should handle full workflow: edit -> auto-save -> recover', async () => {
      // Step 1: User edits content with auto-save
      const onSave = jest.fn(async (data: any) => {
        await saveDraft('conversation', '123', data);
      });
      
      const { result, rerender } = renderHook(
        ({ data }) => useAutoSave(data, onSave, { debounceDelay: 1000, interval: 999999 }),
        { initialProps: { data: { content: 'initial' } } }
      );
      
      // Step 2: User types
      rerender({ data: { content: 'updated' } });
      
      // Step 3: Wait for auto-save
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      await waitFor(() => {
        expect(result.current.status).toBe('saved');
      });
      
      // Step 4: Simulate browser close/refresh
      // (draft is now in storage)
      
      // Step 5: User returns and recovers
      const items = await checkForRecoverableDrafts();
      expect(items).toHaveLength(1);
      expect(items[0].type).toBe('conversation');
      
      // Step 6: Load recovered data
      const recovered = await loadDraft<{ content: string }>('conversation', '123');
      expect(recovered).toEqual({ content: 'updated' });
    });
    
    it('should handle concurrent edits with conflict resolution', async () => {
      // Step 1: Save initial draft
      await saveDraft('conversation', '123', { content: 'draft v1' });
      
      // Step 2: Server is updated (simulating another user or device)
      const serverData = { content: 'server v1' };
      const serverUpdatedAt = new Date();
      
      // Wait to ensure server update is after draft
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Step 3: Detect conflict
      const conflict = await detectConflict(
        'conversation_123',
        serverData,
        serverUpdatedAt
      );
      
      expect(conflict).toBeTruthy();
      
      // Step 4: User chooses to use server version
      const resolved = resolveConflict(conflict!, ConflictResolution.USE_SERVER);
      
      expect(resolved).toEqual(serverData);
    });
    
    it('should handle save failures with retry', async () => {
      let attemptCount = 0;
      const onSave = jest.fn(async (data: any) => {
        attemptCount++;
        if (attemptCount < 3) {
          throw new Error('Network error');
        }
        await saveDraft('conversation', '123', data);
      });
      
      // Mock withRetry to actually retry
      const { withRetry } = require('../lib/api/retry');
      (withRetry as jest.Mock).mockImplementation(async (fn, config) => {
        let lastError;
        for (let i = 0; i < config.maxAttempts; i++) {
          try {
            return await fn();
          } catch (error) {
            lastError = error;
            if (i < config.maxAttempts - 1) {
              await new Promise(resolve => setTimeout(resolve, config.initialDelay));
            }
          }
        }
        throw lastError;
      });
      
      const { result } = renderHook(() =>
        useAutoSave({ content: 'test' }, onSave, { enabled: false, maxRetries: 3 })
      );
      
      await act(async () => {
        await result.current.saveDraft();
      });
      
      // Should have retried and eventually succeeded
      expect(attemptCount).toBe(3);
      expect(result.current.status).toBe('saved');
      
      // Verify data was saved
      const recovered = await loadDraft<{ content: string }>('conversation', '123');
      expect(recovered).toEqual({ content: 'test' });
    });
  });
  
  describe('cleanup and expiration', () => {
    beforeEach(async () => {
      await draftStorage.clear();
    });
    
    it('should clean up expired drafts', async () => {
      // Save drafts with different expirations
      await draftStorage.save('valid1', { content: 'valid1' }, 24);
      await draftStorage.save('valid2', { content: 'valid2' }, 48);
      await draftStorage.save('expired1', { content: 'expired1' }, -1);
      await draftStorage.save('expired2', { content: 'expired2' }, -1);
      
      // Run cleanup
      await draftStorage.cleanup();
      
      // Only valid drafts should remain
      const items = await checkForRecoverableDrafts();
      expect(items).toHaveLength(2);
      expect(items.map(i => i.id)).toContain('valid1');
      expect(items.map(i => i.id)).toContain('valid2');
    });
  });
  
  describe('performance and edge cases', () => {
    it('should handle rapid data changes efficiently', async () => {
      const mockSave = jest.fn().mockResolvedValue(undefined);
      
      const { rerender } = renderHook(
        ({ data }) => useAutoSave(data, mockSave, { debounceDelay: 500, interval: 999999 }),
        { initialProps: { data: { content: 'v1' } } }
      );
      
      // Rapid changes
      for (let i = 2; i <= 10; i++) {
        rerender({ data: { content: `v${i}` } });
        act(() => {
          jest.advanceTimersByTime(100);
        });
      }
      
      // Should not have saved yet
      expect(mockSave).not.toHaveBeenCalled();
      
      // Wait for debounce
      act(() => {
        jest.advanceTimersByTime(500);
      });
      
      // Should have saved only once with latest data
      await waitFor(() => {
        expect(mockSave).toHaveBeenCalledTimes(1);
        expect(mockSave).toHaveBeenCalledWith({ content: 'v10' });
      });
    });
    
    it('should handle large data payloads', async () => {
      const largeData = {
        content: 'x'.repeat(10000),
        turns: Array(100).fill({ text: 'turn content', tokens: 50 }),
        metadata: { deep: { nested: { structure: 'test' } } },
      };
      
      await saveDraft('conversation', '123', largeData);
      
      const loaded = await loadDraft<typeof largeData>('conversation', '123');
      
      expect(loaded).toEqual(largeData);
    });
  });
});

