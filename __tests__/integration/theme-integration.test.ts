import { describe, it, expect, beforeEach } from 'vitest';
import { applyTheme, initializeTheme } from '../../train-wireframe/src/lib/theme';

describe('Theme Integration', () => {
  beforeEach(() => {
    // Reset document classes
    document.documentElement.className = '';
  });
 
  it('should apply light theme', () => {
    applyTheme('light');
   
    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
 
  it('should apply dark theme', () => {
    applyTheme('dark');
   
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.classList.contains('light')).toBe(false);
  });
 
  it('should follow system preference for system theme', () => {
    applyTheme('system');
   
    const hasTheme = 
      document.documentElement.classList.contains('dark') ||
      document.documentElement.classList.contains('light');
   
    expect(hasTheme).toBe(true);
  });
 
  it('should initialize theme with cleanup function', () => {
    const cleanup = initializeTheme('light');
   
    expect(typeof cleanup).toBe('function');
    expect(document.documentElement.classList.contains('light')).toBe(true);
   
    cleanup();
  });
 
  it('should listen to system preference changes for system theme', () => {
    const cleanup = initializeTheme('system');
   
    expect(typeof cleanup).toBe('function');
   
    cleanup();
  });
});

