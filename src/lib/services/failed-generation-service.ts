/**
 * Failed Generation Service
 * 
 * Manages storage and retrieval of failed conversation generations
 * for diagnostic analysis and pattern identification.
 * 
 * Features:
 * - Store failed generations with full diagnostic context
 * - Query failures by type, stop_reason, pattern
 * - Generate RAW Error File Report JSON
 * - Supabase Storage integration for error files
 * 
 * @module failed-generation-service
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

/**
 * Failed generation record matching database schema
 */
export interface FailedGeneration {
  id: string;
  conversation_id: string | null;
  run_id: string | null;
  
  // Request context
  prompt: string;
  prompt_length: number;
  model: string;
  max_tokens: number;
  temperature: number | null;
  structured_outputs_enabled: boolean;
  
  // Response data
  raw_response: any; // JSONB
  response_content: string | null;
  
  // Diagnostics
  stop_reason: string | null;
  input_tokens: number | null;
  output_tokens: number | null;
  
  // Failure analysis
  failure_type: 'truncation' | 'parse_error' | 'api_error' | 'validation_error';
  truncation_pattern: string | null;
  truncation_details: string | null;
  
  // Error context
  error_message: string | null;
  error_stack: string | null;
  
  // Storage
  raw_file_path: string | null;
  
  // Metadata
  created_at: string;
  created_by: string;
  
  // Scaffolding
  persona_id: string | null;
  emotional_arc_id: string | null;
  training_topic_id: string | null;
  template_id: string | null;
}

/**
 * Input for creating a failed generation record
 */
export interface CreateFailedGenerationInput {
  conversation_id?: string;
  run_id?: string;
  
  // Request context
  prompt: string;
  model: string;
  max_tokens: number;
  temperature?: number;
  structured_outputs_enabled?: boolean;
  
  // Response data (from Claude API)
  raw_response: any;
  response_content: string;
  
  // Diagnostics
  stop_reason?: string;
  input_tokens?: number;
  output_tokens?: number;
  
  // Failure analysis
  failure_type: FailedGeneration['failure_type'];
  truncation_pattern?: string;
  truncation_details?: string;
  
  // Error context
  error_message?: string;
  error_stack?: string;
  
  // Metadata
  created_by: string;
  
  // Scaffolding
  persona_id?: string;
  emotional_arc_id?: string;
  training_topic_id?: string;
  template_id?: string;
}

/**
 * RAW Error File Report structure
 */
export interface ErrorFileReport {
  error_report: {
    failure_type: string;
    stop_reason: string | null;
    stop_reason_analysis: string;
    truncation_pattern: string | null;
    truncation_details: string | null;
    timestamp: string;
    analysis: {
      input_tokens: number;
      output_tokens: number;
      max_tokens_configured: number;
      tokens_remaining: number;
      conclusion: string;
    };
  };
  request_context: {
    model: string;
    temperature: number;
    max_tokens: number;
    structured_outputs_enabled: boolean;
    prompt_length: number;
  };
  raw_response: any;
  extracted_content: string;
  scaffolding_context?: {
    persona_id?: string;
    emotional_arc_id?: string;
    training_topic_id?: string;
    template_id?: string;
  };
}

/**
 * Custom error classes
 */
export class FailedGenerationNotFoundError extends Error {
  constructor(id: string) {
    super(`Failed generation not found: ${id}`);
    this.name = 'FailedGenerationNotFoundError';
  }
}

/**
 * Failed Generation Service
 */
export class FailedGenerationService {
  private supabase: SupabaseClient;

  constructor(supabaseClient?: SupabaseClient) {
    if (supabaseClient) {
      this.supabase = supabaseClient;
    } else {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      this.supabase = createClient(supabaseUrl, supabaseKey);
    }
  }

  /**
   * Store a failed generation with full diagnostic context
   * Also creates RAW Error File Report and uploads to storage
   */
  async storeFailedGeneration(input: CreateFailedGenerationInput): Promise<FailedGeneration> {
    const failureId = randomUUID();
    console.log(`[FailedGenerationService] Storing failed generation ${failureId}`);

    try {
      // Step 1: Create RAW Error File Report
      const errorReport = this.createErrorReport(input, failureId);

      // Step 2: Upload error report to storage
      const filePath = await this.uploadErrorReport(errorReport, failureId);

      // Step 3: Insert failed generation record
      const record = {
        id: failureId,
        conversation_id: input.conversation_id || null,
        run_id: input.run_id || null,
        
        prompt: input.prompt,
        prompt_length: input.prompt.length,
        model: input.model,
        max_tokens: input.max_tokens,
        temperature: input.temperature || null,
        structured_outputs_enabled: input.structured_outputs_enabled !== false,
        
        raw_response: input.raw_response,
        response_content: input.response_content,
        
        stop_reason: input.stop_reason || null,
        input_tokens: input.input_tokens || null,
        output_tokens: input.output_tokens || null,
        
        failure_type: input.failure_type,
        truncation_pattern: input.truncation_pattern || null,
        truncation_details: input.truncation_details || null,
        
        error_message: input.error_message || null,
        error_stack: input.error_stack || null,
        
        raw_file_path: filePath,
        
        created_by: input.created_by,
        
        persona_id: input.persona_id || null,
        emotional_arc_id: input.emotional_arc_id || null,
        training_topic_id: input.training_topic_id || null,
        template_id: input.template_id || null,
      };

      const { data, error } = await this.supabase
        .from('failed_generations')
        .insert(record)
        .select()
        .single();

      if (error) {
        console.error('[FailedGenerationService] Error inserting record:', error);
        throw new Error(`Failed to store failed generation: ${error.message}`);
      }

      console.log(`[FailedGenerationService] ✅ Stored failed generation ${failureId}`);
      return data as FailedGeneration;
    } catch (error) {
      console.error('[FailedGenerationService] Error storing failed generation:', error);
      throw error;
    }
  }

  /**
   * Get failed generation by ID
   */
  async getFailedGeneration(id: string): Promise<FailedGeneration | null> {
    try {
      const { data, error } = await this.supabase
        .from('failed_generations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw error;
      }

      return data as FailedGeneration;
    } catch (error) {
      console.error('[FailedGenerationService] Error fetching failed generation:', error);
      throw error;
    }
  }

  /**
   * List failed generations with filters
   */
  async listFailedGenerations(filters?: {
    failure_type?: FailedGeneration['failure_type'];
    stop_reason?: string;
    truncation_pattern?: string;
    run_id?: string;
    created_by?: string;
    date_from?: string;
    date_to?: string;
  }, pagination?: {
    page?: number;
    limit?: number;
  }): Promise<{ failures: FailedGeneration[]; total: number }> {
    try {
      let query = this.supabase
        .from('failed_generations')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters?.failure_type) {
        query = query.eq('failure_type', filters.failure_type);
      }
      if (filters?.stop_reason) {
        query = query.eq('stop_reason', filters.stop_reason);
      }
      if (filters?.truncation_pattern) {
        query = query.eq('truncation_pattern', filters.truncation_pattern);
      }
      if (filters?.run_id) {
        query = query.eq('run_id', filters.run_id);
      }
      if (filters?.created_by) {
        query = query.eq('created_by', filters.created_by);
      }
      if (filters?.date_from) {
        query = query.gte('created_at', filters.date_from);
      }
      if (filters?.date_to) {
        query = query.lte('created_at', filters.date_to);
      }

      // Apply pagination
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 25;
      const offset = (page - 1) * limit;

      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      return {
        failures: (data || []) as FailedGeneration[],
        total: count || 0,
      };
    } catch (error) {
      console.error('[FailedGenerationService] Error listing failed generations:', error);
      throw error;
    }
  }

  /**
   * Get failure statistics
   */
  async getFailureStatistics(filters?: { run_id?: string; date_from?: string; date_to?: string }): Promise<{
    total: number;
    by_type: Record<string, number>;
    by_stop_reason: Record<string, number>;
    by_pattern: Record<string, number>;
  }> {
    try {
      // This would ideally use aggregate queries, but for now we'll fetch and process
      const { failures } = await this.listFailedGenerations(filters, { limit: 1000 });

      const by_type: Record<string, number> = {};
      const by_stop_reason: Record<string, number> = {};
      const by_pattern: Record<string, number> = {};

      for (const failure of failures) {
        // Count by failure_type
        by_type[failure.failure_type] = (by_type[failure.failure_type] || 0) + 1;

        // Count by stop_reason
        if (failure.stop_reason) {
          by_stop_reason[failure.stop_reason] = (by_stop_reason[failure.stop_reason] || 0) + 1;
        }

        // Count by truncation_pattern
        if (failure.truncation_pattern) {
          by_pattern[failure.truncation_pattern] = (by_pattern[failure.truncation_pattern] || 0) + 1;
        }
      }

      return {
        total: failures.length,
        by_type,
        by_stop_reason,
        by_pattern,
      };
    } catch (error) {
      console.error('[FailedGenerationService] Error getting failure statistics:', error);
      throw error;
    }
  }

  /**
   * Create RAW Error File Report
   * @private
   */
  private createErrorReport(input: CreateFailedGenerationInput, failureId: string): ErrorFileReport {
    const inputTokens = input.input_tokens || 0;
    const outputTokens = input.output_tokens || 0;
    const maxTokens = input.max_tokens;
    const tokensRemaining = maxTokens - outputTokens;

    // Analyze stop_reason
    let stopReasonAnalysis = 'Unknown';
    if (input.stop_reason === 'end_turn') {
      stopReasonAnalysis = 'Claude finished naturally, but content appears truncated - unexpected behavior';
    } else if (input.stop_reason === 'max_tokens') {
      stopReasonAnalysis = 'Claude hit max_tokens limit - response was cut off';
    } else if (!input.stop_reason) {
      stopReasonAnalysis = 'stop_reason not available - may indicate API error or missing field';
    }

    // Determine conclusion
    let conclusion = '';
    if (input.stop_reason === 'max_tokens') {
      conclusion = `Truncation caused by max_tokens limit (${maxTokens})`;
    } else if (tokensRemaining > maxTokens * 0.8) {
      conclusion = `Truncation occurred FAR below max_tokens limit (used ${outputTokens}/${maxTokens} tokens) - root cause unknown`;
    } else {
      conclusion = 'Truncation cause unclear - review raw response and stop_reason';
    }

    return {
      error_report: {
        failure_type: input.failure_type,
        stop_reason: input.stop_reason || null,
        stop_reason_analysis: stopReasonAnalysis,
        truncation_pattern: input.truncation_pattern || null,
        truncation_details: input.truncation_details || null,
        timestamp: new Date().toISOString(),
        analysis: {
          input_tokens: inputTokens,
          output_tokens: outputTokens,
          max_tokens_configured: maxTokens,
          tokens_remaining: tokensRemaining,
          conclusion,
        },
      },
      request_context: {
        model: input.model,
        temperature: input.temperature || 0.7,
        max_tokens: maxTokens,
        structured_outputs_enabled: input.structured_outputs_enabled !== false,
        prompt_length: input.prompt.length,
      },
      raw_response: input.raw_response,
      extracted_content: input.response_content,
      scaffolding_context: {
        persona_id: input.persona_id,
        emotional_arc_id: input.emotional_arc_id,
        training_topic_id: input.training_topic_id,
        template_id: input.template_id,
      },
    };
  }

  /**
   * Upload error report to Supabase Storage
   * @private
   */
  private async uploadErrorReport(report: ErrorFileReport, failureId: string): Promise<string> {
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const timestamp = now.toISOString().replace(/[:.]/g, '-');
      const filePath = `${year}/${month}/failed-${failureId}-${timestamp}.json`;

      const fileContent = JSON.stringify(report, null, 2);
      const fileBlob = new Blob([fileContent], { type: 'application/json' });

      const { error } = await this.supabase.storage
        .from('failed-generation-files')
        .upload(filePath, fileBlob, {
          contentType: 'application/json',
          upsert: false,
        });

      if (error) {
        console.error('[FailedGenerationService] Error uploading error report:', error);
        // Don't throw - we'll store the record without the file
        return '';
      }

      console.log(`[FailedGenerationService] ✅ Uploaded error report to ${filePath}`);
      return filePath;
    } catch (error) {
      console.error('[FailedGenerationService] Error in uploadErrorReport:', error);
      return '';
    }
  }

  /**
   * Download error report from storage
   */
  async downloadErrorReport(failureId: string): Promise<ErrorFileReport | null> {
    try {
      const failure = await this.getFailedGeneration(failureId);
      if (!failure || !failure.raw_file_path) {
        return null;
      }

      const { data, error } = await this.supabase.storage
        .from('failed-generation-files')
        .download(failure.raw_file_path);

      if (error) {
        console.error('[FailedGenerationService] Error downloading error report:', error);
        return null;
      }

      const text = await data.text();
      return JSON.parse(text) as ErrorFileReport;
    } catch (error) {
      console.error('[FailedGenerationService] Error in downloadErrorReport:', error);
      return null;
    }
  }
}

/**
 * Export singleton instance
 */
let serviceInstance: FailedGenerationService | null = null;

export function getFailedGenerationService(): FailedGenerationService {
  if (!serviceInstance) {
    serviceInstance = new FailedGenerationService();
  }
  return serviceInstance;
}

export function resetFailedGenerationService(): void {
  serviceInstance = null;
}

