/**
 * AI Configuration Service
 * 
 * Service layer for managing AI configurations with hierarchical fallback chain:
 * User DB → Organization DB → Environment Variables → Defaults
 * 
 * Features:
 * - Configuration CRUD operations
 * - Cache management with TTL
 * - API key rotation
 * - Validation and merging
 * - Fallback chain resolution
 */

import { supabase } from '../supabase';
import {
  AIConfiguration,
  DEFAULT_AI_CONFIGURATION,
  validateAIConfiguration,
  AIConfigurationRecord,
} from '../types/ai-config';

class AIConfigService {
  private configCache = new Map<string, AIConfiguration>();
  private cacheExpiry = new Map<string, number>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  
  /**
   * Get effective AI configuration for user with fallback chain
   * Priority: User DB → Org DB → Environment → Defaults
   */
  async getEffectiveConfiguration(userId: string): Promise<AIConfiguration> {
    const cacheKey = `user:${userId}`;
    
    // Check cache
    const cached = this.getCached(cacheKey);
    if (cached) return cached;
    
    // Try database-based resolution
    try {
      const { data, error } = await supabase
        .rpc('get_effective_ai_config', { p_user_id: userId });
      
      if (!error && data) {
        const config = this.mergeWithDefaults(data as Partial<AIConfiguration>);
        this.setCache(cacheKey, config);
        return config;
      }
      
      if (error) {
        console.warn('Database config lookup failed, falling back to environment:', error);
      }
    } catch (err) {
      console.warn('Database config lookup error, falling back to environment:', err);
    }
    
    // Fallback to environment-based configuration
    const envConfig = this.getEnvironmentConfiguration();
    this.setCache(cacheKey, envConfig);
    return envConfig;
  }
  
  /**
   * Get configuration from environment variables
   */
  private getEnvironmentConfiguration(): AIConfiguration {
    return {
      ...DEFAULT_AI_CONFIGURATION,
      model: {
        ...DEFAULT_AI_CONFIGURATION.model,
        model: process.env.ANTHROPIC_MODEL || DEFAULT_AI_CONFIGURATION.model.model,
        temperature: parseFloat(process.env.ANTHROPIC_TEMPERATURE || '0.7'),
        maxTokens: parseInt(process.env.ANTHROPIC_MAX_TOKENS || '4096', 10),
      },
      apiKeys: {
        primaryKey: process.env.ANTHROPIC_API_KEY || '',
        keyVersion: 1,
        rotationSchedule: 'manual',
      },
    };
  }
  
  /**
   * Create or update user AI configuration
   */
  async updateConfiguration(
    userId: string,
    configName: string,
    updates: Partial<AIConfiguration>
  ): Promise<{ success: boolean; errors?: string[] }> {
    // Validate configuration
    const validationErrors = validateAIConfiguration(updates);
    if (validationErrors.length > 0) {
      return { success: false, errors: validationErrors };
    }
    
    // Get current configuration
    const currentConfig = await this.getEffectiveConfiguration(userId);
    
    // Merge updates
    const updatedConfig = this.deepMerge(currentConfig, updates);
    
    try {
      // Upsert configuration
      const { error } = await supabase
        .from('ai_configurations')
        .upsert({
          user_id: userId,
          config_name: configName,
          configuration: updatedConfig,
          is_active: true,
          priority: 0,
          created_by: userId,
        }, {
          onConflict: 'user_id,config_name',
        });
      
      if (error) {
        console.error('Failed to update AI configuration:', error);
        return { success: false, errors: [error.message] };
      }
      
      // Invalidate cache
      this.invalidateCache(`user:${userId}`);
      
      return { success: true };
    } catch (err) {
      console.error('Error updating AI configuration:', err);
      return { success: false, errors: ['Failed to update configuration'] };
    }
  }
  
  /**
   * Delete user AI configuration (revert to organization/environment defaults)
   */
  async deleteConfiguration(userId: string, configName: string): Promise<{ success: boolean }> {
    try {
      const { error } = await supabase
        .from('ai_configurations')
        .delete()
        .eq('user_id', userId)
        .eq('config_name', configName);
      
      if (error) {
        console.error('Failed to delete AI configuration:', error);
        return { success: false };
      }
      
      // Invalidate cache
      this.invalidateCache(`user:${userId}`);
      
      return { success: true };
    } catch (err) {
      console.error('Error deleting AI configuration:', err);
      return { success: false };
    }
  }
  
  /**
   * Get all configurations for user (for UI display)
   */
  async getUserConfigurations(userId: string): Promise<AIConfigurationRecord[]> {
    try {
      const { data, error } = await supabase
        .from('ai_configurations')
        .select('*')
        .eq('user_id', userId)
        .order('priority', { ascending: false });
      
      if (error) {
        console.error('Failed to fetch user configurations:', error);
        return [];
      }
      
      return data as AIConfigurationRecord[];
    } catch (err) {
      console.error('Error fetching user configurations:', err);
      return [];
    }
  }
  
  /**
   * Activate/deactivate configuration
   */
  async toggleConfiguration(configId: string, isActive: boolean): Promise<{ success: boolean }> {
    try {
      const { error } = await supabase
        .from('ai_configurations')
        .update({ is_active: isActive })
        .eq('id', configId);
      
      if (error) {
        console.error('Failed to toggle configuration:', error);
        return { success: false };
      }
      
      return { success: true };
    } catch (err) {
      console.error('Error toggling configuration:', err);
      return { success: false };
    }
  }
  
  /**
   * API key rotation
   */
  async rotateAPIKey(userId: string, newPrimaryKey: string): Promise<{ success: boolean; errors?: string[] }> {
    // Get current configuration
    const currentConfig = await this.getEffectiveConfiguration(userId);
    
    // Move current primary to secondary
    const updatedKeys = {
      primaryKey: newPrimaryKey,
      secondaryKey: currentConfig.apiKeys.primaryKey,
      keyVersion: currentConfig.apiKeys.keyVersion + 1,
    };
    
    // Update configuration
    return await this.updateConfiguration(userId, 'default', {
      apiKeys: {
        ...currentConfig.apiKeys,
        ...updatedKeys,
      },
    });
  }
  
  /**
   * Merge configuration with defaults (handles nested objects)
   */
  private mergeWithDefaults(config: Partial<AIConfiguration>): AIConfiguration {
    return this.deepMerge(DEFAULT_AI_CONFIGURATION, config);
  }
  
  /**
   * Deep merge two objects (handles nested objects)
   */
  private deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
    const output = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        output[key] = this.deepMerge(target[key] || {}, source[key] as any);
      } else if (source[key] !== undefined) {
        output[key] = source[key] as any;
      }
    }
    
    return output;
  }
  
  /**
   * Cache management
   */
  private getCached(key: string): AIConfiguration | null {
    const expiry = this.cacheExpiry.get(key);
    if (!expiry || Date.now() > expiry) {
      this.configCache.delete(key);
      this.cacheExpiry.delete(key);
      return null;
    }
    return this.configCache.get(key) || null;
  }
  
  private setCache(key: string, config: AIConfiguration): void {
    this.configCache.set(key, config);
    this.cacheExpiry.set(key, Date.now() + this.CACHE_TTL);
  }
  
  private invalidateCache(key: string): void {
    this.configCache.delete(key);
    this.cacheExpiry.delete(key);
  }
  
  /**
   * Clear all cached configurations
   */
  clearCache(): void {
    this.configCache.clear();
    this.cacheExpiry.clear();
  }
}

// Export singleton instance
export const aiConfigService = new AIConfigService();

