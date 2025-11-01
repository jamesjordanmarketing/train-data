import { useEffect } from 'react';

/**
 * Configuration for keyboard shortcuts
 * Maps key strings to handler functions
 */
export interface ShortcutConfig {
  [key: string]: () => void;
}

/**
 * Custom React hook for managing keyboard shortcuts
 * 
 * @param shortcuts - Object mapping keys to handler functions
 * @param enabled - Whether shortcuts are currently active (default: true)
 * 
 * @example
 * ```tsx
 * useKeyboardShortcuts({
 *   'a': handleApprove,
 *   'r': handleReject,
 *   'escape': handleClose
 * }, isModalOpen);
 * ```
 */
export function useKeyboardShortcuts(
  shortcuts: ShortcutConfig,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore keyboard shortcuts when user is typing in input fields
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }
      
      // Normalize key to lowercase for consistent matching
      const key = e.key.toLowerCase();
      
      // Execute shortcut handler if it exists
      if (shortcuts[key]) {
        e.preventDefault();
        shortcuts[key]();
      }
    };
    
    // Add event listener
    document.addEventListener('keydown', handleKeyDown);
    
    // Cleanup on unmount or when dependencies change
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, enabled]);
}

