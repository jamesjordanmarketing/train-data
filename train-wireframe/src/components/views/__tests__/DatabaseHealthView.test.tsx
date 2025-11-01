import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DatabaseHealthView } from '../DatabaseHealthView';
import { useAppStore } from '../../../stores/useAppStore';

// Mock Zustand store
vi.mock('../../../stores/useAppStore', () => ({
  useAppStore: vi.fn(),
}));

describe('DatabaseHealthView', () => {
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
 
  it('renders database health dashboard', () => {
    render(<DatabaseHealthView />);
   
    // Check for database health title
    expect(screen.getByText('Database Health')).toBeInTheDocument();
  });
 
  it('displays health metrics', () => {
    render(<DatabaseHealthView />);
   
    // Check for metrics-related text
    const metricsElements = screen.queryAllByText(/health|status|metrics/i);
    expect(metricsElements.length).toBeGreaterThan(0);
  });
 
  it('displays maintenance options', () => {
    render(<DatabaseHealthView />);
   
    // Check for maintenance-related elements
    const maintenanceElements = screen.queryAllByText(/maintenance|vacuum|analyze/i);
    expect(maintenanceElements.length).toBeGreaterThan(0);
  });
});

