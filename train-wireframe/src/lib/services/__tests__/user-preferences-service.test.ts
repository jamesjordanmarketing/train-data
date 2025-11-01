import { describe, it, expect, beforeEach, vi } from 'vitest';
import { userPreferencesService } from '../user-preferences-service';
import { DEFAULT_USER_PREFERENCES } from '../../types/user-preferences';

// Mock Supabase client
const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn(() => Promise.resolve({ 
          data: { preferences: DEFAULT_USER_PREFERENCES }, 
          error: null 
        })),
      })),
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => Promise.resolve({ error: null })),
    })),
    insert: vi.fn(() => Promise.resolve({ error: null })),
  })),
};

vi.mock('../../../utils/supabase/client', () => ({
  supabase: mockSupabase,
}));

describe('UserPreferencesService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
 
  describe('getPreferences', () => {
    it('should return user preferences', async () => {
      const prefs = await userPreferencesService.getPreferences('test-user-id');
     
      expect(prefs).toBeDefined();
      expect(prefs.theme).toBe('system');
      expect(prefs.rowsPerPage).toBe(25);
    });
   
    it('should return defaults on error', async () => {
      // Mock error response
      mockSupabase.from = vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ 
              data: null, 
              error: new Error('Database error') 
            })),
          })),
        })),
      }));
     
      const prefs = await userPreferencesService.getPreferences('test-user-id');
     
      expect(prefs).toEqual(DEFAULT_USER_PREFERENCES);
    });
  });
 
  describe('updatePreferences', () => {
    it('should update preferences successfully', async () => {
      const result = await userPreferencesService.updatePreferences('test-user-id', {
        theme: 'dark',
      });
     
      expect(result.success).toBe(true);
      expect(result.errors).toBeUndefined();
    });
   
    it('should validate preferences before update', async () => {
      const result = await userPreferencesService.updatePreferences('test-user-id', {
        rowsPerPage: 30 as any, // Invalid value
      });
     
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
    });
  });
 
  describe('resetToDefaults', () => {
    it('should reset preferences to defaults', async () => {
      const result = await userPreferencesService.resetToDefaults('test-user-id');
     
      expect(result.success).toBe(true);
    });
  });
});

