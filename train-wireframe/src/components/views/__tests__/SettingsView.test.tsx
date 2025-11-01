import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SettingsView } from '../SettingsView';
import { useAppStore } from '../../../stores/useAppStore';

// Mock Zustand store
vi.mock('../../../stores/useAppStore', () => ({
  useAppStore: vi.fn(),
}));

describe('SettingsView', () => {
  const mockUpdatePreferences = vi.fn();
  const mockResetPreferences = vi.fn();
 
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
      updatePreferences: mockUpdatePreferences,
      resetPreferences: mockResetPreferences,
    } as any);
  });
 
  it('renders settings sections', () => {
    render(<SettingsView />);
   
    expect(screen.getByText('Settings')).toBeInTheDocument();
    // Check for main settings sections
    const themeElements = screen.getAllByText(/theme/i);
    expect(themeElements.length).toBeGreaterThan(0);
  });
 
  it('displays current theme preference', () => {
    render(<SettingsView />);
   
    // The component should display theme-related controls
    const systemText = screen.queryByText(/system/i);
    expect(systemText).toBeTruthy();
  });
 
  it('displays rows per page preference', () => {
    render(<SettingsView />);
   
    // Check if the page displays pagination preferences
    const rowsText = screen.queryByText(/rows/i);
    expect(rowsText).toBeTruthy();
  });
});

