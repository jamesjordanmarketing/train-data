/**
 * User Preferences Service
 * 
 * Service layer for managing user preferences in Supabase.
 * Handles CRUD operations, validation, and debounced updates.
 */

import { supabase } from '../../utils/supabase/client';
import { 
  UserPreferences, 
  UserPreferencesRecord,
  DEFAULT_USER_PREFERENCES, 
  validateUserPreferences 
} from '../types/user-preferences';

/**
 * Result type for service operations
 */
export interface ServiceResult<T = void> {
  success: boolean;
  data?: T;
  errors?: string[];
}

/**
 * User Preferences Service Class
 */
class UserPreferencesService {
  private updateTimeouts = new Map<string, NodeJS.Timeout>();
  
  /**
   * Get user preferences with fallback to defaults
   * 
   * @param userId - The user's ID
   * @returns User preferences or defaults if not found
   */
  async getPreferences(userId: string): Promise<UserPreferences> {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('preferences')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        console.warn('Failed to fetch user preferences, using defaults:', error);
        return DEFAULT_USER_PREFERENCES;
      }
      
      if (!data || !data.preferences) {
        return DEFAULT_USER_PREFERENCES;
      }
      
      // Deep merge with defaults to ensure new fields exist
      return this.deepMerge(DEFAULT_USER_PREFERENCES, data.preferences);
    } catch (error) {
      console.error('Error in getPreferences:', error);
      return DEFAULT_USER_PREFERENCES;
    }
  }
  
  /**
   * Update user preferences (partial update with merge)
   * 
   * @param userId - The user's ID
   * @param updates - Partial preferences to update
   * @returns Result with success status and any errors
   */
  async updatePreferences(
    userId: string, 
    updates: Partial<UserPreferences>
  ): Promise<ServiceResult> {
    try {
      // Validate updates
      const validationErrors = validateUserPreferences(updates);
      if (validationErrors.length > 0) {
        return { success: false, errors: validationErrors };
      }
      
      // Get current preferences
      const currentPreferences = await this.getPreferences(userId);
      
      // Deep merge updates with current preferences
      const updatedPreferences = this.deepMerge(currentPreferences, updates);
      
      // Update in database using upsert to handle both insert and update
      const { error } = await supabase
        .from('user_preferences')
        .upsert(
          { 
            user_id: userId, 
            preferences: updatedPreferences,
            updated_at: new Date().toISOString()
          },
          { 
            onConflict: 'user_id' 
          }
        );
      
      if (error) {
        console.error('Failed to update user preferences:', error);
        return { success: false, errors: [error.message] };
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error in updatePreferences:', error);
      return { 
        success: false, 
        errors: [error instanceof Error ? error.message : 'Unknown error'] 
      };
    }
  }
  
  /**
   * Reset to default preferences
   * 
   * @param userId - The user's ID
   * @returns Result with success status and any errors
   */
  async resetToDefaults(userId: string): Promise<ServiceResult> {
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert(
          { 
            user_id: userId, 
            preferences: DEFAULT_USER_PREFERENCES,
            updated_at: new Date().toISOString()
          },
          { 
            onConflict: 'user_id' 
          }
        );
      
      if (error) {
        console.error('Failed to reset preferences:', error);
        return { success: false, errors: [error.message] };
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error in resetToDefaults:', error);
      return { 
        success: false, 
        errors: [error instanceof Error ? error.message : 'Unknown error'] 
      };
    }
  }
  
  /**
   * Initialize preferences for a new user
   * 
   * @param userId - The user's ID
   * @returns Result with success status and any errors
   */
  async initializePreferences(userId: string): Promise<ServiceResult> {
    try {
      const { error } = await supabase
        .from('user_preferences')
        .insert({ 
          user_id: userId, 
          preferences: DEFAULT_USER_PREFERENCES 
        });
      
      if (error) {
        // Ignore duplicate key errors (user preferences already exist)
        if (error.code === '23505') {
          return { success: true };
        }
        console.error('Failed to initialize preferences:', error);
        return { success: false, errors: [error.message] };
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error in initializePreferences:', error);
      return { 
        success: false, 
        errors: [error instanceof Error ? error.message : 'Unknown error'] 
      };
    }
  }
  
  /**
   * Debounced update wrapper for auto-save
   * This prevents rapid-fire database updates when users are actively changing settings
   * 
   * @param userId - The user's ID
   * @param updates - Partial preferences to update
   * @param delay - Debounce delay in milliseconds (default: 300ms)
   */
  updatePreferencesDebounced(
    userId: string,
    updates: Partial<UserPreferences>,
    delay: number = 300
  ): void {
    // Clear existing timeout for this user
    const existingTimeout = this.updateTimeouts.get(userId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }
    
    // Set new timeout
    const timeout = setTimeout(async () => {
      await this.updatePreferences(userId, updates);
      this.updateTimeouts.delete(userId);
    }, delay);
    
    this.updateTimeouts.set(userId, timeout);
  }
  
  /**
   * Deep merge objects (handles nested preferences)
   * 
   * @param target - Target object
   * @param source - Source object with updates
   * @returns Merged object
   */
  private deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
    const output = { ...target };
    
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        const sourceValue = source[key];
        const targetValue = target[key];
        
        // Handle nested objects (but not arrays or null values)
        if (
          sourceValue && 
          typeof sourceValue === 'object' && 
          !Array.isArray(sourceValue) &&
          targetValue &&
          typeof targetValue === 'object' &&
          !Array.isArray(targetValue)
        ) {
          output[key] = this.deepMerge(targetValue, sourceValue as any);
        } else {
          output[key] = sourceValue as any;
        }
      }
    }
    
    return output;
  }
  
  /**
   * Subscribe to preference changes (real-time updates)
   * 
   * @param userId - The user's ID
   * @param callback - Callback function to invoke on changes
   * @returns Unsubscribe function
   */
  subscribeToPreferences(
    userId: string,
    callback: (preferences: UserPreferences) => void
  ): () => void {
    const channel = supabase
      .channel(`user_preferences:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_preferences',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.new && 'preferences' in payload.new) {
            const record = payload.new as UserPreferencesRecord;
            callback(record.preferences);
          }
        }
      )
      .subscribe();
    
    // Return unsubscribe function
    return () => {
      supabase.removeChannel(channel);
    };
  }
}

// Export singleton instance
export const userPreferencesService = new UserPreferencesService();

// Export class for testing
export { UserPreferencesService };

