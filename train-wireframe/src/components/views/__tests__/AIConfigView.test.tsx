import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AIConfigView } from '../AIConfigView';
import { useAppStore } from '../../../stores/useAppStore';

// Mock Zustand store
vi.mock('../../../stores/useAppStore', () => ({
  useAppStore: vi.fn(),
}));

describe('AIConfigView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
   
    vi.mocked(useAppStore).mockReturnValue({
      preferences: {
        theme: 'system',
        sidebarCollapsed: false,
        tableDensity: 'comfortable',
        rowsPerPage: 25,
        enableAnimations: true,
        notifications: {
          emailDigest: true,
          generationComplete: true,
          qualityAlerts: true,
          weeklyReport: false,
        },
        defaultFilters: {
          autoApply: false,
          tier: [],
          status: [],
          qualityRange: [0, 100],
        },
      },
    } as any);
  });
 
  it('renders AI configuration sections', () => {
    render(<AIConfigView />);
   
    // Check for AI config title
    expect(screen.getByText('AI Configuration')).toBeInTheDocument();
  });
 
  it('displays model configuration options', () => {
    render(<AIConfigView />);
   
    // Check for model-related text
    const modelElements = screen.queryAllByText(/model/i);
    expect(modelElements.length).toBeGreaterThan(0);
  });
 
  it('displays cost tracking information', () => {
    render(<AIConfigView />);
   
    // Check for cost-related elements
    const costElements = screen.queryAllByText(/cost|usage/i);
    expect(costElements.length).toBeGreaterThan(0);
  });
});

