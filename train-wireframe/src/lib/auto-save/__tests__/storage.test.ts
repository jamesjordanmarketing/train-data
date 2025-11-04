import { draftStorage, Draft } from '../storage';
import { errorLogger } from '../../errors/error-logger';

// Mock errorLogger
jest.mock('../../errors/error-logger');

// Mock IndexedDB
const mockIndexedDB = {
  open: jest.fn(),
  deleteDatabase: jest.fn(),
};

// Mock localStorage
const mockLocalStorage: { [key: string]: string } = {};

describe('Draft Storage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset localStorage mock
    Object.keys(mockLocalStorage).forEach(key => delete mockLocalStorage[key]);
    
    // Mock localStorage methods
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn((key: string) => mockLocalStorage[key] || null),
        setItem: jest.fn((key: string, value: string) => {
          mockLocalStorage[key] = value;
        }),
        removeItem: jest.fn((key: string) => {
          delete mockLocalStorage[key];
        }),
        clear: jest.fn(() => {
          Object.keys(mockLocalStorage).forEach(key => delete mockLocalStorage[key]);
        }),
        key: jest.fn((index: number) => {
          const keys = Object.keys(mockLocalStorage);
          return keys[index] || null;
        }),
        get length() {
          return Object.keys(mockLocalStorage).length;
        },
      },
      writable: true,
    });
  });
  
  describe('save', () => {
    it('should save draft with correct structure', async () => {
      const data = { content: 'test content', id: '123' };
      
      await draftStorage.save('test_draft', data);
      
      const saved = await draftStorage.load<typeof data>('test_draft');
      
      expect(saved).toBeTruthy();
      expect(saved!.id).toBe('test_draft');
      expect(saved!.data).toEqual(data);
      expect(saved!.version).toBe(1);
      expect(saved!.savedAt).toBeTruthy();
      expect(saved!.expiresAt).toBeTruthy();
    });
    
    it('should set expiration date correctly', async () => {
      const data = { content: 'test' };
      const expiresInHours = 48;
      
      await draftStorage.save('test_draft', data, expiresInHours);
      
      const saved = await draftStorage.load<typeof data>('test_draft');
      
      const savedAt = new Date(saved!.savedAt);
      const expiresAt = new Date(saved!.expiresAt);
      const diffHours = (expiresAt.getTime() - savedAt.getTime()) / (1000 * 60 * 60);
      
      expect(diffHours).toBeCloseTo(expiresInHours, 0);
    });
    
    it('should overwrite existing draft with same id', async () => {
      const data1 = { content: 'first' };
      const data2 = { content: 'second' };
      
      await draftStorage.save('test_draft', data1);
      await draftStorage.save('test_draft', data2);
      
      const saved = await draftStorage.load<typeof data2>('test_draft');
      
      expect(saved!.data).toEqual(data2);
    });
  });
  
  describe('load', () => {
    it('should load saved draft', async () => {
      const data = { content: 'test content' };
      
      await draftStorage.save('test_draft', data);
      const loaded = await draftStorage.load<typeof data>('test_draft');
      
      expect(loaded).toBeTruthy();
      expect(loaded!.data).toEqual(data);
    });
    
    it('should return null for non-existent draft', async () => {
      const loaded = await draftStorage.load('non_existent');
      
      expect(loaded).toBeNull();
    });
    
    it('should return null and delete expired draft', async () => {
      const data = { content: 'test' };
      
      // Save with very short expiration (0 hours means it expires immediately)
      await draftStorage.save('test_draft', data, -1); // Negative hours = already expired
      
      // Wait a bit to ensure it's expired
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const loaded = await draftStorage.load('test_draft');
      
      expect(loaded).toBeNull();
    });
  });
  
  describe('delete', () => {
    it('should delete draft', async () => {
      const data = { content: 'test' };
      
      await draftStorage.save('test_draft', data);
      await draftStorage.delete('test_draft');
      
      const loaded = await draftStorage.load('test_draft');
      
      expect(loaded).toBeNull();
    });
    
    it('should not throw error when deleting non-existent draft', async () => {
      await expect(draftStorage.delete('non_existent')).resolves.not.toThrow();
    });
  });
  
  describe('list', () => {
    it('should list all non-expired drafts', async () => {
      const data1 = { content: 'first' };
      const data2 = { content: 'second' };
      const data3 = { content: 'third' };
      
      await draftStorage.save('draft1', data1);
      await draftStorage.save('draft2', data2);
      await draftStorage.save('draft3', data3);
      
      const list = await draftStorage.list();
      
      expect(list.length).toBe(3);
      expect(list.map(d => d.id)).toContain('draft1');
      expect(list.map(d => d.id)).toContain('draft2');
      expect(list.map(d => d.id)).toContain('draft3');
    });
    
    it('should not list expired drafts', async () => {
      const data1 = { content: 'valid' };
      const data2 = { content: 'expired' };
      
      await draftStorage.save('valid_draft', data1, 24);
      await draftStorage.save('expired_draft', data2, -1); // Already expired
      
      const list = await draftStorage.list();
      
      expect(list.length).toBe(1);
      expect(list[0].id).toBe('valid_draft');
    });
    
    it('should return empty array when no drafts exist', async () => {
      const list = await draftStorage.list();
      
      expect(list).toEqual([]);
    });
  });
  
  describe('clear', () => {
    it('should clear all drafts', async () => {
      const data1 = { content: 'first' };
      const data2 = { content: 'second' };
      
      await draftStorage.save('draft1', data1);
      await draftStorage.save('draft2', data2);
      
      await draftStorage.clear();
      
      const list = await draftStorage.list();
      
      expect(list).toEqual([]);
    });
  });
  
  describe('cleanup', () => {
    it('should remove expired drafts', async () => {
      const data1 = { content: 'valid' };
      const data2 = { content: 'expired1' };
      const data3 = { content: 'expired2' };
      
      await draftStorage.save('valid_draft', data1, 24);
      await draftStorage.save('expired_draft1', data2, -1);
      await draftStorage.save('expired_draft2', data3, -1);
      
      await draftStorage.cleanup();
      
      const list = await draftStorage.list();
      
      expect(list.length).toBe(1);
      expect(list[0].id).toBe('valid_draft');
    });
  });
  
  describe('error handling', () => {
    it('should log errors on save failure', async () => {
      // Mock localStorage to throw error
      const originalSetItem = window.localStorage.setItem;
      window.localStorage.setItem = jest.fn(() => {
        throw new Error('Storage quota exceeded');
      });
      
      await expect(draftStorage.save('test', { data: 'x'.repeat(10000000) }))
        .rejects.toThrow();
      
      expect(errorLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('save'),
        expect.any(Error),
        expect.any(Object)
      );
      
      // Restore
      window.localStorage.setItem = originalSetItem;
    });
    
    it('should handle corrupted data gracefully', async () => {
      // Manually insert corrupted data
      mockLocalStorage['draft_corrupted'] = 'invalid json{{{';
      
      const loaded = await draftStorage.load('corrupted');
      
      expect(loaded).toBeNull();
      expect(errorLogger.error).toHaveBeenCalled();
    });
  });
  
  describe('draft structure validation', () => {
    it('should include all required fields', async () => {
      const data = { content: 'test' };
      
      await draftStorage.save('test_draft', data);
      const loaded = await draftStorage.load<typeof data>('test_draft');
      
      expect(loaded).toHaveProperty('id');
      expect(loaded).toHaveProperty('data');
      expect(loaded).toHaveProperty('savedAt');
      expect(loaded).toHaveProperty('expiresAt');
      expect(loaded).toHaveProperty('version');
    });
    
    it('should preserve data structure', async () => {
      const complexData = {
        string: 'test',
        number: 42,
        boolean: true,
        array: [1, 2, 3],
        nested: {
          deep: {
            value: 'nested'
          }
        }
      };
      
      await draftStorage.save('test_draft', complexData);
      const loaded = await draftStorage.load<typeof complexData>('test_draft');
      
      expect(loaded!.data).toEqual(complexData);
    });
  });
});

