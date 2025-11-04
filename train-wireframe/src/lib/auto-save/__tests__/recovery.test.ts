import {
  checkForRecoverableDrafts,
  recoverDraft,
  discardDraft,
  detectConflict,
  resolveConflict,
  saveDraft,
  loadDraft,
  ConflictResolution,
  RecoveryItem,
} from '../recovery';
import { draftStorage } from '../storage';
import { errorLogger } from '../../errors/error-logger';

// Mock dependencies
jest.mock('../storage');
jest.mock('../../errors/error-logger');

describe('Draft Recovery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('checkForRecoverableDrafts', () => {
    it('should return empty array when no drafts exist', async () => {
      (draftStorage.list as jest.Mock).mockResolvedValue([]);
      
      const items = await checkForRecoverableDrafts();
      
      expect(items).toEqual([]);
    });
    
    it('should parse and format conversation drafts', async () => {
      const mockDrafts = [
        {
          id: 'conversation_abc123',
          data: { persona: 'Assistant', turnCount: 5, content: 'test' },
          savedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          version: 1,
        },
      ];
      
      (draftStorage.list as jest.Mock).mockResolvedValue(mockDrafts);
      
      const items = await checkForRecoverableDrafts();
      
      expect(items).toHaveLength(1);
      expect(items[0].id).toBe('conversation_abc123');
      expect(items[0].type).toBe('conversation');
      expect(items[0].description).toContain('Assistant');
      expect(items[0].description).toContain('5 turns');
    });
    
    it('should parse and format batch drafts', async () => {
      const mockDrafts = [
        {
          id: 'batch_xyz789',
          data: { totalItems: 100, completedItems: 50 },
          savedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          version: 1,
        },
      ];
      
      (draftStorage.list as jest.Mock).mockResolvedValue(mockDrafts);
      
      const items = await checkForRecoverableDrafts();
      
      expect(items).toHaveLength(1);
      expect(items[0].type).toBe('batch');
      expect(items[0].description).toContain('100 items');
      expect(items[0].description).toContain('50 completed');
    });
    
    it('should parse and format template drafts', async () => {
      const mockDrafts = [
        {
          id: 'template_def456',
          data: { name: 'My Template' },
          savedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          version: 1,
        },
      ];
      
      (draftStorage.list as jest.Mock).mockResolvedValue(mockDrafts);
      
      const items = await checkForRecoverableDrafts();
      
      expect(items).toHaveLength(1);
      expect(items[0].type).toBe('template');
      expect(items[0].description).toContain('My Template');
    });
    
    it('should handle unknown draft types', async () => {
      const mockDrafts = [
        {
          id: 'unknown_type_123',
          data: { some: 'data' },
          savedAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          version: 1,
        },
      ];
      
      (draftStorage.list as jest.Mock).mockResolvedValue(mockDrafts);
      
      const items = await checkForRecoverableDrafts();
      
      expect(items).toHaveLength(1);
      expect(items[0].type).toBe('other');
      expect(items[0].description).toBe('Unsaved changes');
    });
    
    it('should handle errors gracefully', async () => {
      (draftStorage.list as jest.Mock).mockRejectedValue(new Error('Storage error'));
      
      const items = await checkForRecoverableDrafts();
      
      expect(items).toEqual([]);
      expect(errorLogger.error).toHaveBeenCalled();
    });
  });
  
  describe('recoverDraft', () => {
    it('should recover draft data', async () => {
      const mockData = { content: 'test content' };
      (draftStorage.load as jest.Mock).mockResolvedValue({
        id: 'test_draft',
        data: mockData,
        savedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        version: 1,
      });
      
      const recovered = await recoverDraft('test_draft');
      
      expect(recovered).toEqual(mockData);
      expect(errorLogger.info).toHaveBeenCalledWith('Draft recovered', { draftId: 'test_draft' });
    });
    
    it('should return null for non-existent draft', async () => {
      (draftStorage.load as jest.Mock).mockResolvedValue(null);
      
      const recovered = await recoverDraft('non_existent');
      
      expect(recovered).toBeNull();
    });
    
    it('should handle errors gracefully', async () => {
      (draftStorage.load as jest.Mock).mockRejectedValue(new Error('Load error'));
      
      const recovered = await recoverDraft('test_draft');
      
      expect(recovered).toBeNull();
      expect(errorLogger.error).toHaveBeenCalled();
    });
  });
  
  describe('discardDraft', () => {
    it('should delete draft', async () => {
      (draftStorage.delete as jest.Mock).mockResolvedValue(undefined);
      
      await discardDraft('test_draft');
      
      expect(draftStorage.delete).toHaveBeenCalledWith('test_draft');
      expect(errorLogger.info).toHaveBeenCalledWith('Draft discarded', { draftId: 'test_draft' });
    });
    
    it('should propagate errors', async () => {
      const error = new Error('Delete error');
      (draftStorage.delete as jest.Mock).mockRejectedValue(error);
      
      await expect(discardDraft('test_draft')).rejects.toThrow('Delete error');
      expect(errorLogger.error).toHaveBeenCalled();
    });
  });
  
  describe('detectConflict', () => {
    it('should return null when no draft exists', async () => {
      (draftStorage.load as jest.Mock).mockResolvedValue(null);
      
      const conflict = await detectConflict(
        'test_draft',
        { content: 'server' },
        new Date()
      );
      
      expect(conflict).toBeNull();
    });
    
    it('should return null when no server data exists', async () => {
      (draftStorage.load as jest.Mock).mockResolvedValue({
        id: 'test_draft',
        data: { content: 'draft' },
        savedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        version: 1,
      });
      
      const conflict = await detectConflict('test_draft', null, null);
      
      expect(conflict).toBeNull();
    });
    
    it('should detect conflict when server is newer', async () => {
      const draftSavedAt = new Date('2024-01-01T10:00:00Z');
      const serverUpdatedAt = new Date('2024-01-01T11:00:00Z');
      
      const draftData = { content: 'draft' };
      const serverData = { content: 'server' };
      
      (draftStorage.load as jest.Mock).mockResolvedValue({
        id: 'test_draft',
        data: draftData,
        savedAt: draftSavedAt.toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        version: 1,
      });
      
      const conflict = await detectConflict('test_draft', serverData, serverUpdatedAt);
      
      expect(conflict).toBeTruthy();
      expect(conflict!.draftData).toEqual(draftData);
      expect(conflict!.serverData).toEqual(serverData);
      expect(conflict!.draftSavedAt).toEqual(draftSavedAt);
      expect(conflict!.serverUpdatedAt).toEqual(serverUpdatedAt);
    });
    
    it('should return null when draft is newer', async () => {
      const draftSavedAt = new Date('2024-01-01T11:00:00Z');
      const serverUpdatedAt = new Date('2024-01-01T10:00:00Z');
      
      (draftStorage.load as jest.Mock).mockResolvedValue({
        id: 'test_draft',
        data: { content: 'draft' },
        savedAt: draftSavedAt.toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        version: 1,
      });
      
      const conflict = await detectConflict(
        'test_draft',
        { content: 'server' },
        serverUpdatedAt
      );
      
      expect(conflict).toBeNull();
    });
    
    it('should handle errors gracefully', async () => {
      (draftStorage.load as jest.Mock).mockRejectedValue(new Error('Load error'));
      
      const conflict = await detectConflict(
        'test_draft',
        { content: 'server' },
        new Date()
      );
      
      expect(conflict).toBeNull();
      expect(errorLogger.error).toHaveBeenCalled();
    });
  });
  
  describe('resolveConflict', () => {
    const mockConflict = {
      draftData: { content: 'draft' },
      serverData: { content: 'server' },
      draftSavedAt: new Date('2024-01-01T10:00:00Z'),
      serverUpdatedAt: new Date('2024-01-01T11:00:00Z'),
    };
    
    it('should use draft when USE_DRAFT strategy', () => {
      const resolved = resolveConflict(mockConflict, ConflictResolution.USE_DRAFT);
      
      expect(resolved).toEqual(mockConflict.draftData);
      expect(errorLogger.info).toHaveBeenCalledWith('Conflict resolved: using draft');
    });
    
    it('should use server when USE_SERVER strategy', () => {
      const resolved = resolveConflict(mockConflict, ConflictResolution.USE_SERVER);
      
      expect(resolved).toEqual(mockConflict.serverData);
      expect(errorLogger.info).toHaveBeenCalledWith('Conflict resolved: using server data');
    });
    
    it('should default to draft for MERGE strategy (not implemented)', () => {
      const resolved = resolveConflict(mockConflict, ConflictResolution.MERGE);
      
      expect(resolved).toEqual(mockConflict.draftData);
      expect(errorLogger.warn).toHaveBeenCalledWith('Merge strategy not implemented, using draft');
    });
    
    it('should default to draft for ASK_USER strategy', () => {
      const resolved = resolveConflict(mockConflict, ConflictResolution.ASK_USER);
      
      expect(resolved).toEqual(mockConflict.draftData);
      expect(errorLogger.warn).toHaveBeenCalledWith('User resolution required, defaulting to draft');
    });
    
    it('should handle unknown strategy', () => {
      const resolved = resolveConflict(mockConflict, 'UNKNOWN' as ConflictResolution);
      
      expect(resolved).toEqual(mockConflict.draftData);
      expect(errorLogger.error).toHaveBeenCalled();
    });
  });
  
  describe('saveDraft helper', () => {
    it('should save with correct draft ID format', async () => {
      (draftStorage.save as jest.Mock).mockResolvedValue(undefined);
      
      await saveDraft('conversation', '123', { content: 'test' });
      
      expect(draftStorage.save).toHaveBeenCalledWith(
        'conversation_123',
        { content: 'test' }
      );
    });
    
    it('should support all draft types', async () => {
      (draftStorage.save as jest.Mock).mockResolvedValue(undefined);
      
      await saveDraft('batch', '456', { data: 'batch' });
      await saveDraft('template', '789', { data: 'template' });
      await saveDraft('other', 'abc', { data: 'other' });
      
      expect(draftStorage.save).toHaveBeenCalledWith('batch_456', { data: 'batch' });
      expect(draftStorage.save).toHaveBeenCalledWith('template_789', { data: 'template' });
      expect(draftStorage.save).toHaveBeenCalledWith('other_abc', { data: 'other' });
    });
  });
  
  describe('loadDraft helper', () => {
    it('should load with correct draft ID format', async () => {
      const mockData = { content: 'test' };
      (draftStorage.load as jest.Mock).mockResolvedValue({
        id: 'conversation_123',
        data: mockData,
        savedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        version: 1,
      });
      
      const loaded = await loadDraft('conversation', '123');
      
      expect(loaded).toEqual(mockData);
    });
    
    it('should return null for non-existent draft', async () => {
      (draftStorage.load as jest.Mock).mockResolvedValue(null);
      
      const loaded = await loadDraft('conversation', '123');
      
      expect(loaded).toBeNull();
    });
  });
});

