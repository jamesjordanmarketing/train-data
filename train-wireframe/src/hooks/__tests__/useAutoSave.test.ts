import { renderHook, act, waitFor } from '@testing-library/react';
import { useAutoSave, SaveStatus } from '../useAutoSave';
import { errorLogger } from '../../lib/errors/error-logger';
import { withRetry } from '../../lib/api/retry';

// Mock dependencies
jest.mock('../../lib/errors/error-logger');
jest.mock('../../lib/api/retry');

describe('useAutoSave', () => {
  let mockOnSave: jest.Mock;
  
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockOnSave = jest.fn().mockResolvedValue(undefined);
    
    // Mock withRetry to just call the function
    (withRetry as jest.Mock).mockImplementation((fn) => fn());
  });
  
  afterEach(() => {
    jest.useRealTimers();
  });
  
  describe('initialization', () => {
    it('should start with idle status', () => {
      const { result } = renderHook(() =>
        useAutoSave({ test: 'data' }, mockOnSave, { enabled: false })
      );
      
      expect(result.current.status).toBe('idle');
      expect(result.current.lastSaved).toBeNull();
      expect(result.current.error).toBeNull();
    });
  });
  
  describe('debounced save', () => {
    it('should debounce saves when data changes rapidly', async () => {
      const { result, rerender } = renderHook(
        ({ data }) => useAutoSave(data, mockOnSave, { debounceDelay: 1000, interval: 999999 }),
        { initialProps: { data: { test: 'data1' } } }
      );
      
      // Change data multiple times rapidly
      rerender({ data: { test: 'data2' } });
      rerender({ data: { test: 'data3' } });
      rerender({ data: { test: 'data4' } });
      
      // Should not have called save yet
      expect(mockOnSave).not.toHaveBeenCalled();
      
      // Fast-forward past debounce delay
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      // Should have called save once with latest data
      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledTimes(1);
      });
      expect(mockOnSave).toHaveBeenCalledWith({ test: 'data4' });
    });
    
    it('should cancel debounce timer when data changes', async () => {
      const { rerender } = renderHook(
        ({ data }) => useAutoSave(data, mockOnSave, { debounceDelay: 1000, interval: 999999 }),
        { initialProps: { data: { test: 'data1' } } }
      );
      
      // Change data
      rerender({ data: { test: 'data2' } });
      
      // Wait half the debounce time
      act(() => {
        jest.advanceTimersByTime(500);
      });
      
      // Change data again
      rerender({ data: { test: 'data3' } });
      
      // Wait another half debounce time (total 1000ms since last change)
      act(() => {
        jest.advanceTimersByTime(500);
      });
      
      // Should not have saved yet (timer was reset)
      expect(mockOnSave).not.toHaveBeenCalled();
      
      // Wait remaining debounce time
      act(() => {
        jest.advanceTimersByTime(500);
      });
      
      // Now it should have saved
      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledTimes(1);
      });
    });
  });
  
  describe('interval-based auto-save', () => {
    it('should auto-save at configured intervals', async () => {
      const { rerender } = renderHook(
        ({ data }) => useAutoSave(data, mockOnSave, { interval: 30000, debounceDelay: 1000 }),
        { initialProps: { data: { test: 'data1' } } }
      );
      
      // Wait for initial debounce
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledTimes(1);
      });
      
      // Change data
      rerender({ data: { test: 'data2' } });
      
      // Wait for debounce
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledTimes(2);
      });
      
      // Change data again
      rerender({ data: { test: 'data3' } });
      
      // Don't wait for debounce, wait for interval
      act(() => {
        jest.advanceTimersByTime(30000);
      });
      
      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledTimes(3);
      });
    });
    
    it('should not save if no changes since last save', async () => {
      renderHook(() =>
        useAutoSave({ test: 'data' }, mockOnSave, { interval: 30000, debounceDelay: 1000 })
      );
      
      // Wait for initial debounce
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledTimes(1);
      });
      
      // Wait for interval without changing data
      act(() => {
        jest.advanceTimersByTime(30000);
      });
      
      // Should not have saved again
      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledTimes(1);
      });
    });
  });
  
  describe('manual save trigger', () => {
    it('should save immediately when saveDraft is called', async () => {
      const { result } = renderHook(() =>
        useAutoSave({ test: 'data' }, mockOnSave, { enabled: false })
      );
      
      await act(async () => {
        await result.current.saveDraft();
      });
      
      expect(mockOnSave).toHaveBeenCalledTimes(1);
      expect(result.current.status).toBe('saved');
    });
    
    it('should cancel pending debounced save when manual save is triggered', async () => {
      const { result, rerender } = renderHook(
        ({ data }) => useAutoSave(data, mockOnSave, { debounceDelay: 1000, interval: 999999 }),
        { initialProps: { data: { test: 'data1' } } }
      );
      
      // Change data to trigger debounce
      rerender({ data: { test: 'data2' } });
      
      // Wait half the debounce time
      act(() => {
        jest.advanceTimersByTime(500);
      });
      
      // Manually save
      await act(async () => {
        await result.current.saveDraft();
      });
      
      expect(mockOnSave).toHaveBeenCalledTimes(1);
      
      // Wait remaining debounce time
      act(() => {
        jest.advanceTimersByTime(500);
      });
      
      // Should not have saved again
      expect(mockOnSave).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('save status tracking', () => {
    it('should transition through status states correctly', async () => {
      let resolveOnSave: () => void;
      const onSave = jest.fn(() => new Promise<void>(resolve => {
        resolveOnSave = resolve;
      }));
      
      const { result } = renderHook(() =>
        useAutoSave({ test: 'data' }, onSave, { enabled: false })
      );
      
      expect(result.current.status).toBe('idle');
      
      // Trigger save
      act(() => {
        result.current.saveDraft();
      });
      
      // Should transition to saving
      await waitFor(() => {
        expect(result.current.status).toBe('saving');
      });
      
      // Resolve save
      await act(async () => {
        resolveOnSave!();
        await Promise.resolve();
      });
      
      // Should transition to saved
      await waitFor(() => {
        expect(result.current.status).toBe('saved');
      });
    });
    
    it('should set error status on save failure', async () => {
      const error = new Error('Save failed');
      mockOnSave.mockRejectedValue(error);
      
      // Mock withRetry to throw the error
      (withRetry as jest.Mock).mockRejectedValue(error);
      
      const { result } = renderHook(() =>
        useAutoSave({ test: 'data' }, mockOnSave, { enabled: false })
      );
      
      await act(async () => {
        await result.current.saveDraft();
      });
      
      expect(result.current.status).toBe('error');
      expect(result.current.error).toEqual(error);
    });
    
    it('should update lastSaved timestamp on successful save', async () => {
      const { result } = renderHook(() =>
        useAutoSave({ test: 'data' }, mockOnSave, { enabled: false })
      );
      
      const beforeSave = new Date();
      
      await act(async () => {
        await result.current.saveDraft();
      });
      
      expect(result.current.lastSaved).toBeTruthy();
      expect(result.current.lastSaved!.getTime()).toBeGreaterThanOrEqual(beforeSave.getTime());
    });
  });
  
  describe('retry logic', () => {
    it('should use retry logic with correct configuration', async () => {
      const { result } = renderHook(() =>
        useAutoSave({ test: 'data' }, mockOnSave, { enabled: false, maxRetries: 5 })
      );
      
      await act(async () => {
        await result.current.saveDraft();
      });
      
      expect(withRetry).toHaveBeenCalledWith(
        expect.any(Function),
        {
          maxAttempts: 5,
          initialDelay: 1000,
          backoffFactor: 2,
          maxDelay: 8000,
        },
        { component: 'AutoSave' }
      );
    });
  });
  
  describe('clearDraft', () => {
    it('should reset state when clearDraft is called', async () => {
      const { result } = renderHook(() =>
        useAutoSave({ test: 'data' }, mockOnSave, { enabled: false })
      );
      
      // Trigger save to set lastSaved
      await act(async () => {
        await result.current.saveDraft();
      });
      
      expect(result.current.lastSaved).toBeTruthy();
      
      // Clear draft
      await act(async () => {
        await result.current.clearDraft();
      });
      
      expect(result.current.status).toBe('idle');
      expect(result.current.lastSaved).toBeNull();
      expect(result.current.error).toBeNull();
    });
  });
  
  describe('resetError', () => {
    it('should reset error state', async () => {
      mockOnSave.mockRejectedValue(new Error('Save failed'));
      (withRetry as jest.Mock).mockRejectedValue(new Error('Save failed'));
      
      const { result } = renderHook(() =>
        useAutoSave({ test: 'data' }, mockOnSave, { enabled: false })
      );
      
      // Trigger save to get error
      await act(async () => {
        await result.current.saveDraft();
      });
      
      expect(result.current.error).toBeTruthy();
      expect(result.current.status).toBe('error');
      
      // Reset error
      act(() => {
        result.current.resetError();
      });
      
      expect(result.current.error).toBeNull();
      expect(result.current.status).toBe('idle');
    });
  });
  
  describe('save on unmount', () => {
    it('should save on unmount if saveOnUnmount is enabled', () => {
      const { unmount } = renderHook(() =>
        useAutoSave({ test: 'data' }, mockOnSave, { enabled: false, saveOnUnmount: true })
      );
      
      unmount();
      
      expect(mockOnSave).toHaveBeenCalledWith({ test: 'data' });
    });
    
    it('should not save on unmount if saveOnUnmount is disabled', () => {
      const { unmount } = renderHook(() =>
        useAutoSave({ test: 'data' }, mockOnSave, { enabled: false, saveOnUnmount: false })
      );
      
      unmount();
      
      expect(mockOnSave).not.toHaveBeenCalled();
    });
  });
  
  describe('concurrent save prevention', () => {
    it('should not trigger concurrent saves', async () => {
      let resolveOnSave: () => void;
      const onSave = jest.fn(() => new Promise<void>(resolve => {
        resolveOnSave = resolve;
      }));
      
      const { result } = renderHook(() =>
        useAutoSave({ test: 'data' }, onSave, { enabled: false })
      );
      
      // Trigger first save
      act(() => {
        result.current.saveDraft();
      });
      
      // Try to trigger second save while first is in progress
      act(() => {
        result.current.saveDraft();
      });
      
      // Should only have called once
      expect(onSave).toHaveBeenCalledTimes(1);
      
      // Resolve first save
      await act(async () => {
        resolveOnSave!();
        await Promise.resolve();
      });
    });
  });
  
  describe('enabled/disabled configuration', () => {
    it('should not auto-save when disabled', async () => {
      renderHook(() =>
        useAutoSave({ test: 'data' }, mockOnSave, { enabled: false, interval: 1000 })
      );
      
      // Wait for interval
      act(() => {
        jest.advanceTimersByTime(1000);
      });
      
      expect(mockOnSave).not.toHaveBeenCalled();
    });
    
    it('should still allow manual save when disabled', async () => {
      const { result } = renderHook(() =>
        useAutoSave({ test: 'data' }, mockOnSave, { enabled: false })
      );
      
      await act(async () => {
        await result.current.saveDraft();
      });
      
      expect(mockOnSave).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('error logging', () => {
    it('should log successful saves', async () => {
      const { result } = renderHook(() =>
        useAutoSave({ test: 'data' }, mockOnSave, { enabled: false })
      );
      
      await act(async () => {
        await result.current.saveDraft();
      });
      
      expect(errorLogger.debug).toHaveBeenCalledWith(
        'Auto-save successful',
        expect.objectContaining({ component: 'useAutoSave' })
      );
    });
    
    it('should log failed saves', async () => {
      const error = new Error('Save failed');
      mockOnSave.mockRejectedValue(error);
      (withRetry as jest.Mock).mockRejectedValue(error);
      
      const { result } = renderHook(() =>
        useAutoSave({ test: 'data' }, mockOnSave, { enabled: false })
      );
      
      await act(async () => {
        await result.current.saveDraft();
      });
      
      expect(errorLogger.error).toHaveBeenCalledWith(
        'Auto-save failed',
        error,
        expect.objectContaining({ component: 'useAutoSave' })
      );
    });
  });
});

