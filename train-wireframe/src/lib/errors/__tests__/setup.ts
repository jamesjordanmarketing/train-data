/**
 * Test setup file for Vitest
 * Loaded before all tests run
 */

import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Extend expect matchers if needed
// import matchers from '@testing-library/jest-dom/matchers';
// expect.extend(matchers);

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Mock crypto.randomUUID if not available in test environment
if (typeof crypto === 'undefined' || !crypto.randomUUID) {
  const cryptoMock = {
    randomUUID: () => {
      return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    },
  };
  (global as any).crypto = cryptoMock;
}

// Suppress console logs in tests (optional)
// vi.spyOn(console, 'log').mockImplementation(() => {});
// vi.spyOn(console, 'info').mockImplementation(() => {});
// vi.spyOn(console, 'warn').mockImplementation(() => {});
// vi.spyOn(console, 'error').mockImplementation(() => {});

