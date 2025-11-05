/**
 * User Preferences Type Definitions
 * 
 * Comprehensive type system for managing user preferences across the Train platform.
 * Includes display settings, notifications, filters, export options, keyboard shortcuts,
 * and quality thresholds.
 */

/**
 * Notification preferences for the user
 */
export interface NotificationPreferences {
  /** Enable toast notifications */
  toast: boolean;
  /** Enable email notifications */
  email: boolean;
  /** Enable in-app notifications */
  inApp: boolean;
  /** Frequency of notification batching */
  frequency: 'immediate' | 'daily' | 'weekly';
  /** Granular control over notification categories */
  categories: {
    generationComplete: boolean;
    approvalRequired: boolean;
    errors: boolean;
    systemAlerts: boolean;
  };
}

/**
 * Default filter preferences that auto-apply when loading the dashboard
 */
export interface DefaultFilterPreferences {
  /** Filter by tier (null = all) */
  tier: string[] | null;
  /** Filter by status (null = all) */
  status: string[] | null;
  /** Quality score range [min, max] from 0-10 */
  qualityRange: [number, number];
  /** Auto-apply these filters on dashboard load */
  autoApply: boolean;
}

/**
 * Export preferences for conversation data
 */
export interface ExportPreferences {
  /** Default export format */
  defaultFormat: 'json' | 'jsonl' | 'csv' | 'markdown';
  /** Include metadata in exports */
  includeMetadata: boolean;
  /** Include quality scores in exports */
  includeQualityScores: boolean;
  /** Include timestamps in exports */
  includeTimestamps: boolean;
  /** Include approval history in exports */
  includeApprovalHistory: boolean;
  /** Enable automatic compression for large exports */
  autoCompression: boolean;
  /** Minimum conversation count to trigger auto-compression */
  autoCompressionThreshold: number;
}

/**
 * Keyboard shortcut configuration
 */
export interface KeyboardShortcuts {
  /** Enable keyboard shortcuts globally */
  enabled: boolean;
  /** Custom key bindings (action name -> key combination) */
  customBindings: Record<string, string>;
}

/**
 * Quality thresholds for automatic actions
 */
export interface QualityThresholds {
  /** Quality score threshold for automatic approval (0-10) */
  autoApproval: number;
  /** Quality score threshold for flagging for review (0-10) */
  flagging: number;
  /** Minimum acceptable quality score for inclusion (0-10) */
  minimumAcceptable: number;
}

/**
 * Retry configuration for API failures
 */
export interface RetryConfig {
  /** Retry strategy */
  strategy: 'exponential' | 'linear' | 'fixed';
  /** Maximum number of retry attempts */
  maxAttempts: number;
  /** Base delay in milliseconds */
  baseDelayMs: number;
  /** Maximum delay in milliseconds */
  maxDelayMs: number;
  /** Continue processing on error or stop */
  continueOnError: boolean;
}

/**
 * Complete user preferences interface
 */
export interface UserPreferences {
  // Display Preferences
  /** UI theme preference */
  theme: 'light' | 'dark' | 'system';
  /** Whether the sidebar is collapsed */
  sidebarCollapsed: boolean;
  /** Table row density */
  tableDensity: 'compact' | 'comfortable' | 'spacious';
  /** Number of rows to display per page */
  rowsPerPage: 10 | 25 | 50 | 100;
  /** Enable UI animations and transitions */
  enableAnimations: boolean;
  
  // Notification Preferences
  /** Notification configuration */
  notifications: NotificationPreferences;
  
  // Default Filter Preferences
  /** Default filters to apply on load */
  defaultFilters: DefaultFilterPreferences;
  
  // Export Preferences
  /** Export configuration */
  exportPreferences: ExportPreferences;
  
  // Keyboard Shortcuts
  /** Keyboard shortcut configuration */
  keyboardShortcuts: KeyboardShortcuts;
  
  // Quality Thresholds
  /** Quality threshold settings */
  qualityThresholds: QualityThresholds;
  
  // Retry Configuration (legacy field from existing implementation)
  /** Retry configuration for API failures */
  retryConfig?: RetryConfig;
}

/**
 * Default user preferences with sensible defaults
 */
export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  theme: 'system',
  sidebarCollapsed: false,
  tableDensity: 'comfortable',
  rowsPerPage: 25,
  enableAnimations: true,
  
  notifications: {
    toast: true,
    email: false,
    inApp: true,
    frequency: 'immediate',
    categories: {
      generationComplete: true,
      approvalRequired: true,
      errors: true,
      systemAlerts: true,
    },
  },
  
  defaultFilters: {
    tier: null,
    status: null,
    qualityRange: [0, 10],
    autoApply: false,
  },
  
  exportPreferences: {
    defaultFormat: 'json',
    includeMetadata: true,
    includeQualityScores: true,
    includeTimestamps: true,
    includeApprovalHistory: false,
    autoCompression: true,
    autoCompressionThreshold: 1000,
  },
  
  keyboardShortcuts: {
    enabled: true,
    customBindings: {
      openSearch: 'Ctrl+K',
      generateAll: 'Ctrl+G',
      export: 'Ctrl+E',
      approve: 'A',
      reject: 'R',
      nextItem: 'ArrowRight',
      previousItem: 'ArrowLeft',
    },
  },
  
  qualityThresholds: {
    autoApproval: 8.0,
    flagging: 6.0,
    minimumAcceptable: 4.0,
  },
  
  retryConfig: {
    strategy: 'exponential',
    maxAttempts: 3,
    baseDelayMs: 1000,
    maxDelayMs: 300000,
    continueOnError: false,
  },
};

/**
 * Validation result type
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate user preferences for correctness
 * 
 * @param preferences - Partial preferences to validate
 * @returns Array of error messages (empty if valid)
 */
export function validateUserPreferences(preferences: Partial<UserPreferences>): string[] {
  const errors: string[] = [];
  
  // Validate rowsPerPage
  if (preferences.rowsPerPage && ![10, 25, 50, 100].includes(preferences.rowsPerPage)) {
    errors.push('rowsPerPage must be 10, 25, 50, or 100');
  }
  
  // Validate quality thresholds
  if (preferences.qualityThresholds) {
    const { autoApproval, flagging, minimumAcceptable } = preferences.qualityThresholds;
    
    if (autoApproval < 0 || autoApproval > 10) {
      errors.push('autoApproval must be between 0 and 10');
    }
    if (flagging < 0 || flagging > 10) {
      errors.push('flagging must be between 0 and 10');
    }
    if (minimumAcceptable < 0 || minimumAcceptable > 10) {
      errors.push('minimumAcceptable must be between 0 and 10');
    }
    
    // Ensure logical ordering
    if (autoApproval < flagging) {
      errors.push('autoApproval must be greater than or equal to flagging threshold');
    }
    if (flagging < minimumAcceptable) {
      errors.push('flagging threshold must be greater than or equal to minimumAcceptable');
    }
  }
  
  // Validate default filter quality range
  if (preferences.defaultFilters?.qualityRange) {
    const [min, max] = preferences.defaultFilters.qualityRange;
    if (min < 0 || min > 10 || max < 0 || max > 10) {
      errors.push('Quality range values must be between 0 and 10');
    }
    if (min > max) {
      errors.push('Quality range minimum must be less than or equal to maximum');
    }
  }
  
  // Validate export preferences
  if (preferences.exportPreferences) {
    const { autoCompressionThreshold } = preferences.exportPreferences;
    if (autoCompressionThreshold && (autoCompressionThreshold < 1 || autoCompressionThreshold > 10000)) {
      errors.push('autoCompressionThreshold must be between 1 and 10000');
    }
  }
  
  // Validate retry config
  if (preferences.retryConfig) {
    const { maxAttempts, baseDelayMs, maxDelayMs } = preferences.retryConfig;
    
    if (maxAttempts < 1 || maxAttempts > 10) {
      errors.push('maxAttempts must be between 1 and 10');
    }
    if (baseDelayMs < 100 || baseDelayMs > 10000) {
      errors.push('baseDelayMs must be between 100 and 10000');
    }
    if (maxDelayMs < 1000 || maxDelayMs > 300000) {
      errors.push('maxDelayMs must be between 1000 and 300000');
    }
    if (baseDelayMs > maxDelayMs) {
      errors.push('baseDelayMs must be less than or equal to maxDelayMs');
    }
  }
  
  return errors;
}

/**
 * Database record type for user_preferences table
 */
export interface UserPreferencesRecord {
  id: string;
  user_id: string;
  preferences: UserPreferences;
  created_at: string;
  updated_at: string;
}

