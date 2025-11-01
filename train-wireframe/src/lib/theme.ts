/**
 * Theme Application Utility
 *
 * Handles theme application based on user preferences:
 * - 'light': Force light theme
 * - 'dark': Force dark theme  
 * - 'system': Follow system preference
 */

export type Theme = 'light' | 'dark' | 'system';

/**
 * Apply theme to document root
 *
 * @param theme - User's theme preference
 */
export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
 
  if (theme === 'system') {
    // Follow system preference
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (systemPrefersDark) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  } else {
    // Apply explicit theme
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }
}

/**
 * Initialize theme application with system preference listener
 *
 * @param theme - User's theme preference
 * @returns Cleanup function to remove listener
 */
export function initializeTheme(theme: Theme): () => void {
  // Apply initial theme
  applyTheme(theme);
 
  // If system theme, listen for system preference changes
  if (theme === 'system') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme('system');
   
    mediaQuery.addEventListener('change', handler);
   
    // Return cleanup function
    return () => {
      mediaQuery.removeEventListener('change', handler);
    };
  }
 
  // No cleanup needed for explicit themes
  return () => {};
}

